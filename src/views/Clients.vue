<script setup>
import { supabase } from '@/services/supabase';
import { onMounted, ref } from 'vue';

const name = ref("");
const email = ref("");
const address = ref("");

async function addClient() {

  const { data: userData } = await supabase.auth.getUser()

  console.log("USER:", userData.user.id)

  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        user_id: userData.user.id,
        name: name.value,
        email: email.value,
        address: address.value
      }
    ])

  console.log("RESULT:", data, error)
}

</script>

<template>
<h1>Clients</h1>
<form @submit.prevent="addClient">
    <input type="text" v-model="name" placeholder="Client Name">
    <input type="text" v-model="email" placeholder="Email">
    <input type="text" v-model="address" placeholder="Address">
    <button>Add Client</button>
</form>
</template>