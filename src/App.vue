<template>
  <div class="container">
    <header>
      <div class="logo">
        <i class="fas fa-database"></i>
        <h1>海量数据同步平台</h1>
      </div>
      <nav class="nav-links">
        <router-link to="/monitoring" active-class="active">控制台</router-link>
        <router-link to="/tasks" active-class="active">任务管理</router-link>
        <router-link to="/config" active-class="active">系统配置</router-link>
      </nav>
    </header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <div class="loading-overlay" v-if="loading">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  computed: {
    loading() {
      return this.$store.state.loading
    }
  }
}
</script>

<style scoped>
/* 样式代码与之前相同 */
</style>