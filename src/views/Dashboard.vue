<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/services/supabase'

const invoices = ref([])
const clients = ref([])
const invoiceItems = ref([])

function formatCurrency(value) {
  return Number(value ?? 0).toFixed(2)
}

function formatDate(value) {
  if (!value) {
    return 'Recently updated'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function sortByRecent(items) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.created_at ?? left.updated_at ?? 0).getTime()
    const rightDate = new Date(right.created_at ?? right.updated_at ?? 0).getTime()

    return rightDate - leftDate
  })
}

const totalRevenue = computed(() => {
  return invoices.value.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0)
})

const paidRevenue = computed(() => {
  return invoices.value
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0)
})

const outstandingRevenue = computed(() => {
  return invoices.value
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0)
})

const paidInvoices = computed(() => {
  return invoices.value.filter((invoice) => invoice.status === 'paid').length
})

const draftInvoices = computed(() => {
  return invoices.value.filter((invoice) => invoice.status === 'draft').length
})

const averageInvoiceValue = computed(() => {
  if (!invoices.value.length) {
    return 0
  }

  return totalRevenue.value / invoices.value.length
})

const recentInvoices = computed(() => {
  return sortByRecent(invoices.value).slice(0, 5)
})

const recentClients = computed(() => {
  return sortByRecent(clients.value).slice(0, 4)
})

const recentActivity = computed(() => {
  const invoiceActivity = invoices.value.map((invoice) => ({
    id: invoice.id,
    type: 'invoice',
    title: `Invoice #${invoice.id.slice(0, 8)}`,
    subtitle: `${invoice.status} · $${formatCurrency(invoice.total)}`,
    date: invoice.created_at ?? invoice.updated_at,
  }))

  const clientActivity = clients.value.map((client) => ({
    id: client.id,
    type: 'client',
    title: client.name,
    subtitle: client.email || 'Client added',
    date: client.created_at ?? client.updated_at,
  }))

  return sortByRecent([...invoiceActivity, ...clientActivity]).slice(0, 6)
})

async function loadDashboard() {
  const [invoiceResponse, clientResponse, itemResponse] = await Promise.all([
    supabase.from('invoices').select('*'),
    supabase.from('clients').select('*'),
    supabase.from('invoice_items').select('*'),
  ])

  invoices.value = invoiceResponse.data ?? []
  clients.value = clientResponse.data ?? []
  invoiceItems.value = itemResponse.data ?? []
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="dashboard">
    <div class="hero-card">
      <div>
        <p class="eyebrow">Business Overview</p>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">
          Track revenue, invoice progress, client growth, and recent account activity in one place.
        </p>
      </div>

      <div class="hero-metrics">
        <div>
          <span class="hero-label">Total Revenue</span>
          <strong class="hero-value">${{ formatCurrency(totalRevenue) }}</strong>
        </div>
        <div>
          <span class="hero-label">Invoice Items</span>
          <strong class="hero-value">{{ invoiceItems.length }}</strong>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="card stat-card">
        <span class="stat-label">Invoices</span>
        <strong class="stat-value">{{ invoices.length }}</strong>
        <span class="stat-meta">{{ paidInvoices }} paid · {{ draftInvoices }} draft</span>
      </div>

      <div class="card stat-card">
        <span class="stat-label">Clients</span>
        <strong class="stat-value">{{ clients.length }}</strong>
        <span class="stat-meta">Active client records</span>
      </div>

      <div class="card stat-card">
        <span class="stat-label">Outstanding</span>
        <strong class="stat-value">${{ formatCurrency(outstandingRevenue) }}</strong>
        <span class="stat-meta">Unpaid invoice value</span>
      </div>

      <div class="card stat-card">
        <span class="stat-label">Average Invoice</span>
        <strong class="stat-value">${{ formatCurrency(averageInvoiceValue) }}</strong>
        <span class="stat-meta">Across all invoices</span>
      </div>
    </div>

    <div class="content-grid">
      <div class="card revenue-card">
        <div class="section-header">
          <h2 class="card-title">Revenue Snapshot</h2>
          <RouterLink to="/create-invoice" class="text-link">New Invoice</RouterLink>
        </div>

        <div class="revenue-breakdown">
          <div class="breakdown-row">
            <span>Paid Revenue</span>
            <strong>${{ formatCurrency(paidRevenue) }}</strong>
          </div>
          <div class="breakdown-row">
            <span>Outstanding Revenue</span>
            <strong>${{ formatCurrency(outstandingRevenue) }}</strong>
          </div>
          <div class="breakdown-row total-row">
            <span>Total Billed</span>
            <strong>${{ formatCurrency(totalRevenue) }}</strong>
          </div>
        </div>
      </div>

      <div class="card activity-card">
        <div class="section-header">
          <h2 class="card-title">Recent Activity</h2>
          <span class="muted-label">Latest updates</span>
        </div>

        <div v-if="recentActivity.length" class="activity-list">
          <div
            v-for="entry in recentActivity"
            :key="`${entry.type}-${entry.id}`"
            class="activity-item"
          >
            <div class="activity-dot" :class="entry.type"></div>
            <div class="activity-copy">
              <p class="activity-title">{{ entry.title }}</p>
              <p class="activity-subtitle">{{ entry.subtitle }}</p>
            </div>
            <span class="activity-date">{{ formatDate(entry.date) }}</span>
          </div>
        </div>

        <p v-else class="empty-state">No activity yet.</p>
      </div>
    </div>

    <div class="content-grid">
      <div class="card">
        <div class="section-header">
          <h2 class="card-title">Recent Invoices</h2>
          <RouterLink to="/invoices" class="text-link">View All</RouterLink>
        </div>

        <div v-if="recentInvoices.length" class="invoice-list">
          <div v-for="invoice in recentInvoices" :key="invoice.id" class="invoice-row">
            <div>
              <p class="invoice-row-title">Invoice #{{ invoice.id.slice(0, 8) }}</p>
              <p class="invoice-row-subtitle">
                {{ formatDate(invoice.created_at ?? invoice.updated_at) }}
              </p>
            </div>

            <div class="invoice-row-right">
              <span :class="['status-badge', invoice.status]">{{ invoice.status }}</span>
              <strong class="invoice-row-total">${{ formatCurrency(invoice.total) }}</strong>
            </div>
          </div>
        </div>

        <p v-else class="empty-state">No invoices yet.</p>
      </div>

      <div class="card">
        <div class="section-header">
          <h2 class="card-title">Recent Clients</h2>
          <RouterLink to="/clients" class="text-link">Manage Clients</RouterLink>
        </div>

        <div v-if="recentClients.length" class="client-list">
          <div v-for="client in recentClients" :key="client.id" class="client-row">
            <div class="client-avatar">{{ client.name?.charAt(0) || 'C' }}</div>
            <div>
              <p class="client-name">{{ client.name }}</p>
              <p class="client-meta">{{ client.email || 'No email on file' }}</p>
            </div>
          </div>
        </div>

        <p v-else class="empty-state">No clients yet.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 2rem;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
}

.eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #93c5fd;
  margin: 0 0 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
  margin: 0.5rem 0 0;
  max-width: 620px;
  color: #cbd5e1;
  line-height: 1.6;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 1rem;
  width: min(360px, 100%);
}

.hero-metrics > div {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(8px);
}

.hero-label {
  display: block;
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-bottom: 0.35rem;
}

.hero-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-meta {
  color: #64748b;
  font-size: 0.9rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  margin: 0;
  color: #1e293b;
  font-size: 1.05rem;
  font-weight: 600;
}

.text-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

.text-link:hover {
  opacity: 0.88;
}

.muted-label {
  color: #94a3b8;
  font-size: 0.85rem;
}

.revenue-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475569;
  padding: 0.85rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.breakdown-row strong {
  color: #1e293b;
}

.total-row {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-list,
.invoice-list,
.client-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item,
.invoice-row,
.client-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.activity-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.activity-dot.invoice {
  background-color: #3b82f6;
}

.activity-dot.client {
  background-color: #10b981;
}

.activity-copy {
  flex: 1;
  min-width: 0;
}

.activity-title,
.invoice-row-title,
.client-name {
  margin: 0;
  color: #1e293b;
  font-weight: 600;
}

.activity-subtitle,
.invoice-row-subtitle,
.client-meta {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.activity-date {
  color: #94a3b8;
  font-size: 0.85rem;
  white-space: nowrap;
}

.invoice-row-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.invoice-row-total {
  color: #1e293b;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  text-transform: capitalize;
}

.status-badge.draft {
  background-color: #e2e8f0;
  color: #475569;
}

.status-badge.paid {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-badge.pending {
  background-color: #fef9c3;
  color: #ca8a04;
}

.client-row {
  justify-content: flex-start;
}

.client-avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background-color: #dbeafe;
  color: #2563eb;
  font-weight: 700;
  flex-shrink: 0;
}

.empty-state {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem 0;
  margin: 0;
}

@media (max-width: 960px) {
  .hero-card,
  .content-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-metrics {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .stats-grid,
  .hero-metrics {
    grid-template-columns: 1fr;
  }

  .section-header,
  .activity-item,
  .invoice-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .invoice-row-right {
    width: 100%;
    justify-content: space-between;
  }

  .activity-date {
    white-space: normal;
  }
}
</style>
