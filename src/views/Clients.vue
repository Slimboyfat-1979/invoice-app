<script setup>
import { supabase } from '@/services/supabase'
import { onMounted, ref } from 'vue'

const clients = ref([])

const name = ref('')
const email = ref('')
const address = ref('')

async function getClients() {
  const { data, error } = await supabase.from('clients').select('*')
  console.log('CLIENTS:', data, error)
  clients.value = data
}

async function addClient() {
  if (!name.value) {
    alert('Client name required')
    return
  }
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    alert('You must be logged in to add a client')
    return
  }
  console.log('USER:', userData.user.id)
  const { data, error } = await supabase.from('clients').insert([
    {
      user_id: userData.user.id,
      name: name.value,
      email: email.value,
      address: address.value,
    },
  ])

  console.log('RESULT:', data, error)

  await getClients()
  name.value = ''
  email.value = ''
  address.value = ''
}

onMounted(() => {
  getClients()
})
</script>

<template>
  <h1>Clients</h1>
  <form @submit.prevent="addClient">
    <input type="text" v-model="name" placeholder="Client Name" />
    <input type="text" v-model="email" placeholder="Email" />
    <input type="text" v-model="address" placeholder="Address" />
    <button>Add Client</button>
  </form>

  <ul>
    <li v-for="client in clients" :key="client.id">{{ client.name }} {{ client.email }}</li>
  </ul>
</template>
