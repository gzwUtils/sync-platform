<template>
  <div class="status-indicator" :class="statusClass">
    <div class="pulse" v-if="status === 'RUNNING'"></div>
    <span>{{ statusText }}</span>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: 'STOPPED'
    }
  },
  computed: {
    statusClass() {
      return {
        'status-running': this.status === 'RUNNING',
        'status-stopped': this.status === 'STOPPED'
      }
    },
    statusText() {
      return this.status === 'RUNNING' ? '运行中' : '已停止'
    }
  }
}
</script>