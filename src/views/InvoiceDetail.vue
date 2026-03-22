<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const invoice = ref(null)
const items = ref([])

function formatCurrency(value) {
  return Number(value ?? 0).toFixed(2)
}

async function getInvoice() {
  const id = route.params.id

  const { data: invoiceData, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (invoiceError || !invoiceData) {
    invoice.value = null
    items.value = []
    return
  }

  invoice.value = invoiceData

  const { data: itemData, error: itemError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceData.id)
    .order('id', { ascending: true })

  items.value = itemError ? [] : (itemData ?? [])
}

async function markAsPaid() {
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid' })
    .eq('id', invoice.value.id)

  console.log('UPDATE ERROR:', error)

  if (!error) {
    invoice.value.status = 'paid'
  }
}

onMounted(() => {
  getInvoice()
})

watch(
  () => route.params.id,
  () => {
    getInvoice()
  },
)
</script>
<template>
  <div v-if="invoice" class="invoice-detail">
    <div class="page-header">
      <div>
        <h1 class="page-title">Invoice #{{ invoice.id.slice(0, 8) }}</h1>
        <p class="page-subtitle">Review invoice details and line items.</p>
      </div>
      <span :class="['status-badge', invoice.status]">{{ invoice.status }}</span>
    </div>

    <div class="card summary-card">
      <div class="summary-block">
        <span class="summary-label">Invoice ID</span>
        <span class="summary-value invoice-code">{{ invoice.id }}</span>
      </div>
      <div class="summary-block total-block">
        <span class="summary-label">Total</span>
        <span class="summary-total">${{ formatCurrency(invoice.total) }}</span>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <h2 class="card-title">Line Items</h2>
        <span class="item-count"
          >{{ items.length }} item<span v-if="items.length !== 1">s</span></span
        >
      </div>

      <div v-if="items.length" class="items-list">
        <div v-for="item in items" :key="item.id" class="item-card">
          <div class="item-main">
            <p class="item-description">{{ item.description }}</p>
            <p class="item-meta">{{ item.quantity }} x ${{ formatCurrency(item.price) }}</p>
          </div>
          <div class="item-total">${{ formatCurrency(item.quantity * item.price) }}</div>
        </div>
      </div>

      <p v-else class="empty-state">No items found for this invoice.</p>
    </div>

    <button v-if="invoice.status !== 'paid'" class="btn btn-primary" @click="markAsPaid">
      Mark as Paid
    </button>
  </div>
</template>

<style scoped>
.invoice-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.summary-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  color: #1e293b;
  font-weight: 600;
}

.invoice-code {
  font-size: 0.95rem;
  word-break: break-all;
}

.total-block {
  align-items: flex-end;
}

.summary-total {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.item-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.95rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.item-main {
  min-width: 0;
}

.item-description {
  margin: 0;
  color: #1e293b;
  font-weight: 600;
}

.item-meta {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.item-total {
  color: #1e293b;
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
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

.empty-state {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem 0;
  margin: 0;
}

.btn {
  padding: 0.85rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.88;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  width: 100%;
}

@media (max-width: 640px) {
  .page-header,
  .summary-card,
  .section-header,
  .item-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-block {
    align-items: flex-start;
  }

  .item-total {
    font-size: 0.95rem;
  }
}
</style>
