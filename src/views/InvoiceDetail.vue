<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const invoice = ref(null)
const items = ref([])

async function getInvoice() {
  const id = route.params.id
  const { data: invoiceData } = await supabase.from('invoices').select('*').eq('id', id).single()

  invoice.value = invoiceData

  const { data: itemData } = await supabase.from('invoice_items').select('*').eq('invoice_id', id)
  items.value = itemData
}

onMounted(() => {
  getInvoice()
})
</script>
<template>
  <div v-if="invoice">
    <h1>Invoice</h1>
    <p>Total ${{ invoice.total }}</p>
    <p>Status ${{ invoice.status }}</p>
    <h2>Items</h2>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.description }} - {{ item.quantity }} x {{ item.price }}
      </li>
    </ul>
  </div>
</template>
