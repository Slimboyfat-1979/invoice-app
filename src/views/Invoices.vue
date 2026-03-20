<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const invoices = ref([])

async function getInvoices() {
  const { data, error } = await supabase.from('invoices').select('*')

  console.log('Invoices', data, error)
  invoices.value = data
}

onMounted(() => {
  getInvoices()
})
</script>

<template>
  <h1 class="page-title">Invoices</h1>

  <div class="card">
    <p v-if="invoices.length === 0" class="empty-state">No invoices yet.</p>
    <ul v-else class="invoice-list">
      <li v-for="invoice in invoices" :key="invoice.id" class="invoice-item">
        <div class="invoice-info">
          <span class="invoice-id">#{{ invoice.id }}</span>
          <span :class="['status-badge', invoice.status]">{{ invoice.status }}</span>
        </div>
        <div class="invoice-right">
          <span class="invoice-total">${{ invoice.total }}</span>
          <router-link :to="`/invoices/${invoice.id}`" class="btn btn-view">View</router-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.invoice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.invoice-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.invoice-id {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
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

.invoice-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invoice-total {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.btn-view {
  padding: 0.4rem 0.9rem;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-view:hover {
  opacity: 0.88;
}

.empty-state {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem 0;
}
</style>
