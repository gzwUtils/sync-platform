<template>
  <div>
    <main class="container">
      <section class="card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-tasks"></i>
            全部任务
            <span class="subtitle">{{ filteredTasks.length }} 个任务</span>
          </h2>
          <div class="header-actions">
            <button class="btn btn-outline" @click="refreshTasks" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            </button>
          </div>
        </div>

        <div class="filter-search">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
                type="text"
                v-model="searchQuery"
                placeholder="搜索任务名称或ID..."
                :disabled="loading"
            >
          </div>
          <div class="filter-select">
            <select v-model="typeFilter" :disabled="loading">
              <option value="">所有类型</option>
              <option value="Elasticsearch">Elasticsearch</option>
              <option value="JDBC">JDBC</option>
              <option value="Kafka">Kafka</option>
            </select>
          </div>
        </div>

        <!-- 网格布局 -->
        <div class="task-grid">
          <div
              class="task-card"
              :class="getTargetClass(task.destinationType)"
              v-for="task in filteredTasks"
              :key="task.taskId"
          >
            <div class="task-header">
              <div class="task-icon">
                <i :class="getIconClass(task.destinationType)"></i>
              </div>
              <div class="task-actions">
                <button
                    class="btn btn-outline"
                    @click="selectTask(task)"
                    title="查看"
                    :disabled="loading"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                    class="btn btn-play"
                    @click="startLocalTask(task)"
                    :disabled="taskStats[task.taskId]?.status === 'RUNNING' || loading"
                    title="启动"
                >
                  <i class="fas fa-play"></i>
                </button>
                <button
                    class="btn btn-stop"
                    @click="stopLocalTask(task)"
                    :disabled="taskStats[task.taskId]?.status !== 'RUNNING' || loading"
                    title="停止"
                >
                  <i class="fas fa-stop"></i>
                </button>
              </div>
            </div>

            <div class="task-info">
              <div class="task-name">
                {{ task.taskName }}
                <span class="status-badge" :class="'status-' + (taskStats[task.taskId]?.status || 'STOPPED').toLowerCase()">
                  {{ taskStats[task.taskId]?.status || 'STOPPED' }}
                </span>
              </div>

              <div class="task-details">
                <div class="task-detail">
                  <span class="detail-label">ID:</span>
                  {{ task.taskId }}
                </div>
                <div class="task-detail">
                  <span class="detail-label">源:</span>
                  <span class="tag tag-source">{{ task.sourceType }}</span>
                </div>
                <div class="task-detail">
                  <span class="detail-label">目标:</span>
                  <span class="tag tag-dest">{{ task.destinationType }}</span>
                </div>
              </div>

              <div class="progress-container" v-if="taskStats[task.taskId]?.totalRecords > 0">
                <div class="progress-info">
                  <span>处理进度</span>
                  <span>{{ calculateProgress(task.taskId) }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: calculateProgress(task.taskId) + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="task-footer">
              <div class="task-stats">
                共 {{ taskStats[task.taskId]?.totalRecords || 0 }} / 已处理 {{ taskStats[task.taskId]?.processedRecords || 0 }}
              </div>
              <div class="task-status">
                <span class="status-indicator" :class="taskStats[task.taskId]?.status || 'STOPPED'"></span>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="filteredTasks.length === 0 && !loading">
            <i class="fas fa-inbox"></i>
            <p>没有找到匹配的任务</p>
            <button class="btn btn-outline" @click="clearFilters">
              <i class="fas fa-times"></i> 清除筛选条件
            </button>
          </div>
        </div>
      </section>
    </main>

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
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'TaskList',
  components: {
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const loading = ref(false)
    const searchQuery = ref('')
    const typeFilter = ref('')

    // 获取任务列表
    const tasks = computed(() => store.state.tasks ?? [])

    // 获取所有任务的统计信息
    const taskStats = computed(() => store.state.allTasksStats || {})

    // 过滤任务
    const filteredTasks = computed(() => {
      return tasks.value.filter(task => {
        const matchesSearch = searchQuery.value === '' ||
          task.taskName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          task.taskId.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesType = !typeFilter.value ||
          task.destinationType === typeFilter.value

        return matchesSearch && matchesType
      })
    })

    // 计算进度百分比
    const calculateProgress = (taskId) => {
      const stats = taskStats.value[taskId]
      if (!stats || !stats.totalRecords || stats.totalRecords === 0) return 0
      return Math.round((stats.processedRecords / stats.totalRecords) * 100)
    }

    // 组件挂载时获取数据
    onMounted(async () => {
      await loadTasks()
    })

    // 加载任务列表
    const loadTasks = async () => {
      loading.value = true
      try {
        await store.dispatch('fetchTasks')

        // 为每个任务获取统计信息
        const tasksList = store.state.tasks
        await Promise.all(tasksList.map(task =>
          store.dispatch('fetchTaskStats', task.taskId)
        ))
      } catch (error) {
        console.error('加载任务列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 刷新任务列表
    const refreshTasks = async () => {
      await loadTasks()
    }

    // 查看任务详情
    const selectTask = (task) => {
      store.commit('setCurrentTask', task)
      store.commit('updateConfig', task)
      router.push({
        path: '/monitoring',
        query: { taskId: task.taskId }
      })
    }

    // 启动任务
    const startLocalTask = async (task) => {
      loading.value = true
      try {
        await store.dispatch('startTask', task)
        // 重新获取该任务的统计信息
        await store.dispatch('fetchTaskStats', task.taskId)
      } catch (error) {
        console.error('启动任务失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 停止任务
    const stopLocalTask = async (task) => {
      loading.value = true
      try {
        await store.dispatch('stopTask', task.taskId)
        // 重新获取该任务的统计信息
        await store.dispatch('fetchTaskStats', task.taskId)
      } catch (error) {
        console.error('停止任务失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 清除筛选条件
    const clearFilters = () => {
      searchQuery.value = ''
      typeFilter.value = ''
    }

    // 获取目标类型对应的CSS类
    const getTargetClass = (type) => {
      switch (type) {
        case 'Elasticsearch': return 'elasticsearch'
        case 'JDBC': return 'jdbc'
        case 'Kafka': return 'kafka'
        default: return 'default'
      }
    }

    // 获取图标类
    const getIconClass = (type) => {
      switch (type) {
        case 'Elasticsearch':
          return 'fab fa-searchengin'
        case 'JDBC':
          return 'fas fa-database'
        case 'Kafka':
          return 'fas fa-stream'
        default:
          return 'fas fa-question'
      }
    }

    return {
      loading,
      tasks,
      taskStats,
      filteredTasks,
      searchQuery,
      typeFilter,
      calculateProgress,
      refreshTasks,
      selectTask,
      startLocalTask,
      stopLocalTask,
      clearFilters,
      getTargetClass,
      getIconClass
    }
  }
}
</script>

<style scoped>
:root {
  --card-bg-1: #1e3a5f;
  --card-bg-2: #152842;
  --card-shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
  --card-shadow-lg: 0 14px 30px rgba(0, 0, 0, 0.5);
  --tag-source: #0ea5e9;
  --tag-dest: #10b981;
  --elasticsearch: #2c5aa0;
  --jdbc: #3a6d99;
  --kafka: #2875a0;
  --default: #374151;
  --primary: #3b82f6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f8fafc;
}

.card-title i {
  color: #3b82f6;
}

.subtitle {
  background: rgba(30, 58, 138, 0.5);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-search {
  display: flex;
  gap: 16px;
  padding: 16px 32px;
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 41, 59, 0.8);
  color: white;
  outline: none;
  transition: border-color 0.3s;
}

.search-box input:focus {
  border-color: #3b82f6;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.filter-select select {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 41, 59, 0.8);
  color: white;
  outline: none;
  cursor: pointer;
  min-width: 120px;
}

.filter-select select:focus {
  border-color: #3b82f6;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
  padding: 32px;
}

.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--card-bg-1) 0%, var(--card-bg-2) 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--card-shadow-sm);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 280px;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow-lg);
}

.task-card.elasticsearch {
  border-left: 4px solid var(--elasticsearch);
}

.task-card.jdbc {
  border-left: 4px solid var(--jdbc);
}

.task-card.kafka {
  border-left: 4px solid var(--kafka);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 16px;
}

.task-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-actions {
  display: flex;
  gap: 8px;
}

.btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  color: #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.btn-outline {
  background-color: var(--primary);
}

.btn-play {
  background-color: var(--success);
}

.btn-stop {
  background-color: var(--danger);
}

.btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.task-info {
  padding: 0 20px 20px;
  flex: 1;
}

.task-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-running {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-stopped {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.task-detail {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.detail-label {
  min-width: 50px;
  color: #94a3b8;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8px;
}

.tag-source {
  background-color: var(--tag-source);
  color: #fff;
}

.tag-dest {
  background-color: var(--tag-dest);
  color: #fff;
}

.progress-container {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.progress-bar {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.task-stats {
  font-size: 0.85rem;
  color: #94a3b8;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.RUNNING {
  background-color: var(--success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.status-indicator.STOPPED {
  background-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.status-indicator.PENDING {
  background-color: var(--warning);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 12px;
  border: 2px dashed rgba(148, 163, 184, 0.3);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.fa-spin {
  animation: fa-spin 2s linear infinite;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .task-grid {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-search {
    flex-direction: column;
  }
}
</style>