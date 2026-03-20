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
  <ul>
    <li v-for="invoice in invoices" :key="invoice.id">
      {{ invoice.id }} {{ invoice.total }} - {{ invoice.status }}
      <router-link :to="`/invoices/${invoice.id}`"> View </router-link>
    </li>
  </ul>
</template>
