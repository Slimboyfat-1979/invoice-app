<template>
  <div class="app">
    <nav class="navbar">
      <span class="brand">InvoiceApp</span>
      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/clients">Clients</RouterLink>
        <RouterLink to="/invoices">Invoices</RouterLink>
        <RouterLink to="/create-invoice">+ New Invoice</RouterLink>
      </div>
    </nav>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  background-color: #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.nav-links a:hover {
  color: #ffffff;
  background-color: #334155;
}

.nav-links a.router-link-active {
  color: #ffffff;
  background-color: #3b82f6;
}

.main-content {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}
</style>
