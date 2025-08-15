<template>
  <div class="metric-card">
    <div class="metric-value">{{ formattedValue }}</div>
    <div class="metric-label">{{ title }}</div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'MetricCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      default: 0
    }
  },
  setup(props) {
    const formattedValue = computed(() => {
      const num = Number(props.value);
      if (isNaN(num)) return props.value;
      return num.toLocaleString();
    });

    return {
      formattedValue
    };
  }
}
</script>

<style scoped>
.metric-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>