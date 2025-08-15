<template>
  <div class="log-entry" :class="logLevelClass">
    <div class="log-header">
      <span class="log-time">{{ time }}</span>
      <span class="log-level">{{ logLevel }}</span>
    </div>
    <div class="log-message">{{ message }}</div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'LogEntry',
  props: {
    time: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const logLevel = computed(() => {
      if (props.message.includes('成功') || props.message.includes('启动'))
        return 'INFO';
      if (props.message.includes('失败') || props.message.includes('错误'))
        return 'ERROR';
      if (props.message.includes('停止') || props.message.includes('暂停'))
        return 'WARN';
      return 'INFO';
    });

    const logLevelClass = computed(() => {
      return `log-${logLevel.value.toLowerCase()}`;
    });

    return {
      logLevel,
      logLevelClass
    };
  }
}
</script>

<style scoped>
.log-entry {
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  border-left: 3px solid;
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-weight: 500;
}

.log-time {
  color: var(--text-secondary);
}

.log-level {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.log-message {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

.log-info {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: var(--primary-color);
}

.log-info .log-level {
  background: rgba(59, 130, 246, 0.2);
  color: var(--primary-color);
}

.log-warn {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: var(--warning-color);
}

.log-warn .log-level {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-color);
}

.log-error {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: var(--error-color);
}

.log-error .log-level {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error-color);
}
</style>