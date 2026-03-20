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
  <h1 class="page-title">Clients</h1>

  <div class="card">
    <h2 class="card-title">Add Client</h2>
    <form @submit.prevent="addClient" class="form">
      <div class="form-group">
        <label>Name</label>
        <input type="text" v-model="name" placeholder="Client Name" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="text" v-model="email" placeholder="you@example.com" />
      </div>
      <div class="form-group">
        <label>Address</label>
        <input type="text" v-model="address" placeholder="123 Main St" />
      </div>
      <button class="btn btn-primary" type="submit">Add Client</button>
    </form>
  </div>

  <div class="card">
    <h2 class="card-title">All Clients</h2>
    <p v-if="clients.length === 0" class="empty-state">No clients yet. Add one above.</p>
    <ul v-else class="client-list">
      <li v-for="client in clients" :key="client.id" class="client-item">
        <div class="client-name">{{ client.name }}</div>
        <div class="client-email">{{ client.email }}</div>
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
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.form-group input {
  padding: 0.65rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.btn {
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  align-self: flex-start;
}

.btn:hover {
  opacity: 0.88;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.client-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.client-name {
  font-weight: 600;
  color: #1e293b;
}

.client-email {
  font-size: 0.875rem;
  color: #64748b;
}

.empty-state {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem 0;
}
</style>
