<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const email = ref('')
const password = ref('')

async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })
  console.log(data, error)
}

async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  const session = await supabase.auth.getSession()
  console.log('SESSION:', session)

  console.log(data, error)
}
</script>

<template>
  <input type="text" v-model="email" placeholder="email" />
  <input type="password" v-model="password" placeholder="password" />

  <button @click="signUp">Sign Up</button>
  <button @click="signIn">Login</button>
</template>
