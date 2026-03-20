<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

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
  const { data: userData } = await supabase.auth.getUser()

  console.log('USER ID:', userData.user.id)
  console.log('CLIENT ID:', selectedClient.value)
  console.log('TOTAL:', calculateTotal())

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

  console.log('Invoice', invoice)
  console.log('Error', error)

  if (!selectedClient.value) {
    alert('Please select a client')
    return
  }

  if (!invoice) {
    console.log('Invoice Faile', error)
    return
  }

  const itemsToInsert = items.value.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemError } = await supabase.from('invoice_items').insert(itemsToInsert)

  console.log('ITEMS ERROR:', itemError)
}

onMounted(() => {
  getClients()
})
</script>
<template>
  <h1>Create Invoice</h1>
  <select v-model="selectedClient">
    <option disabled value="">Select client</option>
    <option v-for="client in clients" :key="client.id" :value="client.id">
      {{ client.name }}
    </option>
  </select>

  <div v-for="(item, index) in items" :key="index">
    <input type="text" v-model="item.description" placeholder="description" />
    <input type="number" v-model="item.price" placeholder="description" />
  </div>
  <button @click="addItem">Add Item</button>
  <button @click="createInvoice">Save Invoice</button>
</template>
