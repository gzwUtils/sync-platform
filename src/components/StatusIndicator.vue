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

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --border-color: #475569;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo i {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  cursor: pointer;
}

.nav-links a:hover, .nav-links a.active {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-running {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-stopped {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 20px 0;
}

.metric-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
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
}

.metric-unit {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.progress-section {
  margin: 25px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.progress-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.5s ease;
}

.task-controls {
  display: grid;
  gap: 15px;
  margin-top: 20px;
}

.control-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-warning {
  background: var(--warning-color);
  color: white;
}

.btn-error {
  background: var(--error-color);
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.logs-section {
  margin-top: 30px;
}

.log-entry {
  background: var(--bg-tertiary);
  border-left: 3px solid var(--primary-color);
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 0 6px 6px 0;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.log-time {
  color: var(--text-secondary);
  margin-right: 10px;
}

.log-message {
  color: var(--text-primary);
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.sync-visualization {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
}

.sync-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.sync-node {
  text-align: center;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-width: 120px;
}

.sync-node i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.sync-arrow {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  position: relative;
  margin: 0 20px;
}

.sync-arrow::after {
  content: '';
  position: absolute;
  right: -8px;
  top: -3px;
  width: 0;
  height: 0;
  border-left: 8px solid var(--primary-color);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .container {
    padding: 10px;
  }

  header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

.content {
  display: none;
}

.content.active {
  display: block;
}

.config-advanced {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.target-end-config {
  margin-top: 15px;
}

.task-item {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-details {
  flex: 1;
}

.task-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.task-status {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 10px;
}

.task-controls {
  display: flex;
  gap: 10px;
}

.btn-small {
  padding: 8px 15px;
  font-size: 0.85rem;
}

.shard-progress {
  margin-top: 15px;
}

.shard-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.shard-item {
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
}

.shard-success {
  background: rgba(16, 185, 129, 0.2);
}

.shard-failed {
  background: rgba(239, 68, 68, 0.2);
}

.shard-skipped {
  background: rgba(156, 163, 175, 0.2);
}

.shard-processing {
  background: rgba(59, 130, 246, 0.2);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.error-details {
  margin-top: 20px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.error-item {
  background: rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 0.85rem;
}

.error-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-weight: 600;
}

.error-content {
  font-family: monospace;
  white-space: pre-wrap;
}
</style>