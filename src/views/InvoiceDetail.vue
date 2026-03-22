<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const invoice = ref(null)
const items = ref([])

async function getInvoice() {
  const id = route.params.id

  const { data } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .single()

  if (data) {
    invoice.value = data
    items.value = data.invoice_items ?? []
  }
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
</script>
<template>
  <div v-if="invoice">
    <h1>Invoice</h1>
    <p>Total ${{ invoice.total }}</p>
    <p>Status: <span v-if="invoice.status === 'paid'">Paid</span><span v-else>Unpaid</span></p>
    <h2>Items</h2>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.description }} - {{ item.quantity }} x {{ item.price }}
      </li>
    </ul>
    <button @click="markAsPaid">Mark as Paid</button>
  </div>
</template>
