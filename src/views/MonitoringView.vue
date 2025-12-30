<template>
  <div>
    <div v-if="!currentTask" class="empty-state">
      <i class="fas fa-tasks"></i>
      <p>请先选择一个任务</p>
      <router-link to="/tasks" class="btn btn-primary">
        <i class="fas fa-list"></i> 返回任务列表
      </router-link>
    </div>

    <div v-else>
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-chart-line"></i>
            实时同步监控 - {{ currentTask.taskName }}
            <span class="task-id">(ID: {{ currentTask.taskId }})</span>
          </h2>
          <div class="header-actions">
            <div class="status-indicator" :class="taskStats.status || 'STOPPED'">
              <span class="pulse" v-if="taskStats.status === 'RUNNING'"></span>
              <span class="status-text">{{ taskStats.status || 'STOPPED' }}</span>
            </div>
            <router-link to="/tasks" class="btn btn-outline">
              <i class="fas fa-arrow-left"></i> 返回列表
            </router-link>
          </div>
        </div>

        <div class="metrics-grid">
          <MetricCard title="总记录数" :value="taskStats.totalRecords || 0" />
          <MetricCard title="已处理" :value="taskStats.processedRecords || 0" />
          <MetricCard title="已扫描" :value="taskStats.scannedRecords || 0" />
          <MetricCard title="失败分片" :value="taskStats.failedShards || 0" />
        </div>

        <div class="progress-section">
          <div class="progress-info">
            <span>处理进度</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <div class="shard-progress">
          <h3>分片状态</h3>
          <ShardStatus :stats="taskStats" />
        </div>

        <div class="sync-visualization">
          <div class="sync-flow">
            <SyncNode
                icon="fa-database"
                :title="sourceTypeText"
                description="源端"
            />
            <div class="sync-arrow"></div>
            <SyncNode
                :icon="targetIcon"
                :title="targetName"
                :description="targetDescription"
            />
          </div>
        </div>

        <div class="logs-section">
          <h3 style="margin-bottom: 15px;">
            <i class="fas fa-clipboard-list"></i>
            任务日志
          </h3>
          <div id="logContainer" style="max-height: 300px; overflow-y: auto;">
            <LogEntry
                v-for="(log, index) in logs"
                :key="index"
                :time="log.time"
                :message="log.message"
            />
          </div>
        </div>

        <div v-if="taskStats.failedBatches && taskStats.failedBatches.length > 0" class="error-details">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            失败批次详情
          </h3>
          <div v-for="(batch, batchIndex) in taskStats.failedBatches" :key="batchIndex">
            <h4 style="margin: 10px 0;">批次 #{{ batchIndex + 1 }}</h4>
            <div v-for="(item, itemIndex) in batch" :key="itemIndex" class="error-item">
              <div class="error-content">{{ JSON.stringify(item, null, 2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-sliders-h"></i>
            任务控制面板
          </h2>
        </div>

        <div class="task-controls">
          <button
              class="btn btn-success"
              @click="startLocalTask"
              :disabled="taskStats.status === 'RUNNING' || loading"
          >
            <i class="fas fa-play"></i> 启动同步任务
          </button>
          <button
              class="btn btn-error"
              @click="stopLocalTask"
              :disabled="taskStats.status !== 'RUNNING' || loading"
          >
            <i class="fas fa-stop"></i> 停止任务
          </button>
        </div>
      </div>
    </div>

    <!-- loading -->
    <transition name="fade">
      <div class="loading-overlay" v-if="loading">
        <div class="spinner"></div>
        <span style="margin-left: 12px;">加载中...</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import StatusIndicator from '../components/StatusIndicator.vue'
import MetricCard from '../components/MetricCard.vue'
import SyncNode from '../components/SyncNode.vue'
import LogEntry from '../components/LogEntry.vue'
import ShardStatus from '../components/ShardStatus.vue'

export default {
  name: 'TaskMonitoring',
  components: {
    StatusIndicator,
    MetricCard,
    SyncNode,
    LogEntry,
    ShardStatus
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const monitorInterval = ref(null)

    // 从路由参数获取taskId
    const taskId = computed(() => route.query.taskId || route.params.taskId)

    // 当前选中的任务
    const currentTask = computed(() => {
      if (taskId.value) {
        const task = store.state.tasks.find(t => t.taskId === taskId.value)
        if (task) {
          store.commit('setCurrentTask', task)
          store.commit('updateConfig', task)
        }
        return task
      }
      return store.state.currentTask
    })

    // 当前任务的统计信息
    const taskStats = computed(() => {
      if (taskId.value && store.state.allTasksStats?.[taskId.value]) {
        return store.state.allTasksStats[taskId.value]
      }
      return store.state.currentTaskStats
    })

    // 日志
    const logs = computed(() => store.state.logs || [])

    // 获取监控数据的函数（先定义，避免引用问题）
    const fetchMonitorData = async (id) => {
      try {
        const taskId = id || currentTask.value?.taskId
        if (!taskId) return

        const stats = await store.dispatch('fetchTaskStats', taskId)
        if (stats && taskId === currentTask.value?.taskId) {
          store.commit('setCurrentTaskStats', stats)
        }
      } catch (error) {
        store.commit('addLog', {
          time: new Date().toLocaleTimeString(),
          message: `获取监控数据失败: ${error.message}`
        })
      }
    }

    // 启动监控轮询
    const startMonitorPolling = (id) => {
      stopMonitorPolling()
      fetchMonitorData(id)
      monitorInterval.value = setInterval(() => fetchMonitorData(id), 2000)
    }

    // 停止监控轮询
    const stopMonitorPolling = () => {
      if (monitorInterval.value) {
        clearInterval(monitorInterval.value)
        monitorInterval.value = null
      }
    }

    // 监听taskId变化
    watch(taskId, (newTaskId) => {
      if (newTaskId) {
        fetchMonitorData(newTaskId)
        if (monitorInterval.value) {
          clearInterval(monitorInterval.value)
          startMonitorPolling(newTaskId)
        }
      }
    }, { immediate: true })

    // 启动任务
    const startLocalTask = async () => {
      if (!currentTask.value) return

      loading.value = true
      try {
        await store.dispatch('startTask', currentTask.value)
        startMonitorPolling(currentTask.value.taskId)
      } catch (error) {
        console.error('启动任务失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 停止任务
    const stopLocalTask = async () => {
      if (!currentTask.value) return

      loading.value = true
      try {
        await store.dispatch('stopTask', currentTask.value.taskId)
        stopMonitorPolling()
      } catch (error) {
        console.error('停止任务失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 计算属性
    const sourceTypeText = computed(() => {
      const type = currentTask.value?.sourceType
      return type === 'JDBC' ? 'JDBC数据库' :
             type === 'Elasticsearch' ? 'Elasticsearch' :
             type || '数据源'
    })

    const targetIcon = computed(() => {
      const type = currentTask.value?.destinationType
      switch(type) {
        case 'JDBC': return 'fas fa-database'
        case 'Elasticsearch': return 'fas fa-search'
        case 'Kafka': return 'fas fa-stream'
        default: return 'fas fa-database'
      }
    })

    const targetName = computed(() => {
      const type = currentTask.value?.destinationType
      switch(type) {
        case 'JDBC': return 'JDBC数据库'
        case 'Elasticsearch': return 'Elasticsearch'
        case 'Kafka': return 'Kafka'
        default: return '目标存储'
      }
    })

    const targetDescription = computed(() => {
      const type = currentTask.value?.destinationType
      switch(type) {
        case 'JDBC': return '目标数据库'
        case 'Elasticsearch': return '搜索集群'
        case 'Kafka': return '消息队列'
        default: return '目标端'
      }
    })

    const progressPercent = computed(() => {
      if (!taskStats.value?.totalRecords || taskStats.value.totalRecords === 0) return 0
      const percent = (taskStats.value.processedRecords / taskStats.value.totalRecords) * 100
      return Math.min(100, percent).toFixed(1)
    })

    onMounted(() => {
      if (taskId.value) {
        startMonitorPolling(taskId.value)
      }
    })

    onUnmounted(() => {
      stopMonitorPolling()
    })

    return {
      loading,
      currentTask,
      taskStats,
      logs,
      sourceTypeText,
      targetIcon,
      targetName,
      targetDescription,
      progressPercent,
      startLocalTask,
      stopLocalTask
    }
  }
}
</script>

<style scoped>
/* 保持原有的样式不变 */
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
  flex-wrap: wrap;
  gap: 15px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title i {
  color: var(--primary-color);
}

.task-id {
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator.RUNNING {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-indicator.STOPPED {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.status-indicator.PENDING {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.progress-section {
  margin: 25px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.5s ease;
  border-radius: 4px;
}

.shard-progress {
  margin-top: 25px;
}

.shard-progress h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sync-visualization {
  background: var(--bg-tertiary);
  border-radius: 10px;
  padding: 20px;
  margin: 25px 0;
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

.logs-section h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.logs-section h3 i {
  color: var(--primary-color);
}

.task-controls {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  min-width: 140px;
}

.btn-success {
  background: var(--success-color);
}

.btn-error {
  background: var(--error-color);
}

.btn-primary {
  background: var(--primary-color);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed rgba(148, 163, 184, 0.3);
  margin: 40px auto;
  max-width: 500px;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 25px;
}

.error-details {
  margin-top: 25px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.error-details h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-item {
  background: rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
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
  backdrop-filter: blur(5px);
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .task-controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .sync-flow {
    flex-direction: column;
    gap: 20px;
  }

  .sync-arrow {
    width: 2px;
    height: 40px;
    margin: 10px 0;
    background: linear-gradient(to bottom, var(--primary-color), transparent);
  }

  .sync-arrow::after {
    right: -3px;
    top: auto;
    bottom: -8px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 8px solid var(--primary-color);
    border-bottom: none;
  }
}
</style>