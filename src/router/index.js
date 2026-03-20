import Clients from '@/views/Clients.vue'
import CreateInvoice from '@/views/CreateInvoice.vue'
import Dashboard from '@/views/Dashboard.vue'
import Invoices from '@/views/Invoices.vue'
import Login from '@/views/Login.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: "/",
        component: Login
    },
    {
        path: "/dashboard",
        component: Dashboard
    },
    {
        path: "/clients",
        component: Clients
    },
    {
        path: "/invoices",
        component: Invoices
    },
    {
        path: '/create-invoice',
        component: CreateInvoice
    }
  ],
})

export default router
