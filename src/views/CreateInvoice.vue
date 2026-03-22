<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()
const clients = ref([])
const selectedClient = ref('')

const items = ref([
  {
    description: '',
    quantity: 1,
    price: 0,
  },
])

async function getClients() {
  const { data } = await supabase.from('clients').select('*')
  clients.value = data
}

function addItem() {
  items.value.push({
    description: '',
    quantity: 1,
    price: 0,
  })
}

function calculateTotal() {
  return items.value.reduce((sum, item) => {
    return sum + item.quantity * item.price
  }, 0)
}

async function createInvoice() {
  if (!selectedClient.value) {
    alert('Please select a client')
    return
  }

  const { data: userData } = await supabase.auth.getUser()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert([
      {
        user_id: userData.user.id,
        client_id: selectedClient.value,
        total: calculateTotal(),
        status: 'draft',
      },
    ])
    .select()
    .single()

  if (!invoice) {
    console.log('Invoice creation failed', error)
    return
  }

  const itemsToInsert = items.value.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemError } = await supabase.from('invoice_items').insert(itemsToInsert)

  if (!itemError) {
    router.push(`/invoices/${invoice.id}`)
  }
}

onMounted(() => {
  getClients()
})
</script>
<template>
  <h1 class="page-title">Create Invoice</h1>

  <div class="card">
    <h2 class="card-title">Client</h2>
    <div class="form-group">
      <label>Select Client</label>
      <select v-model="selectedClient">
        <option disabled value="">Select client</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.name }}
        </option>
      </select>
    </div>
  </div>

  <div class="card">
    <h2 class="card-title">Line Items</h2>
    <div class="items-header">
      <span>Description</span>
      <span>Qty</span>
      <span>Price</span>
    </div>
    <div v-for="(item, index) in items" :key="index" class="item-row">
      <input type="text" v-model="item.description" placeholder="Item description" />
      <input type="number" v-model.number="item.quantity" min="1" placeholder="1" />
      <input type="number" v-model.number="item.price" min="0" step="0.01" placeholder="0.00" />
    </div>
    <button class="btn btn-secondary" @click="addItem">+ Add Item</button>
  </div>

  <div class="card total-card">
    <span class="total-label">Total</span>
    <span class="total-amount">${{ calculateTotal().toFixed(2) }}</span>
  </div>

  <button class="btn btn-primary" @click="createInvoice">Save Invoice</button>
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
  margin-bottom: 1.25rem;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.form-group select,
select {
  padding: 0.65rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  background: #fff;
  transition: border-color 0.2s;
  width: 100%;
}

.form-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.items-header {
  display: grid;
  grid-template-columns: 1fr 80px 120px;
  gap: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr 80px 120px;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.item-row input {
  padding: 0.65rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.item-row input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.total-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.btn {
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
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
  padding: 0.85rem;
  font-size: 1rem;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #1e293b;
  margin-top: 0.25rem;
}
</style>
