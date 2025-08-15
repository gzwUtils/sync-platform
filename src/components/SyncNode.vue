<template>
  <div class="sync-node">
    <div class="sync-icon">
      <i :class="icon"></i>
    </div>
    <div class="sync-info">
      <div class="sync-title">{{ title }}</div>
      <div class="sync-description">{{ description }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SyncNode',
  props: {
    icon: {
      type: String,
      default: 'fas fa-question-circle'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.sync-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-width: 140px;
  transition: all 0.3s ease;
}

.sync-node:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.sync-icon {
  margin-bottom: 10px;
}

.sync-icon i {
  font-size: 2rem;
  color: var(--primary-color);
}

.sync-info {
  text-align: center;
}

.sync-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.sync-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>