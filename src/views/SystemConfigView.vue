<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">系统配置</h2>
    </div>

    <!-- 基础信息 -->
    <div class="form-grid">
      <div class="form-group">
        <label>任务ID</label>
        <input v-model="config.taskId" class="form-control" />
      </div>
      <div class="form-group">
        <label>任务名称</label>
        <input v-model="config.taskName" class="form-control" />
      </div>
      <div class="form-group">
        <label>源类型</label>
        <select v-model="config.sourceType" class="form-control">
          <option value="jdbc">JDBC</option>
          <option value="file">文件系统</option>
        </select>
      </div>
      <div class="form-group">
        <label>目标类型</label>
        <select v-model="config.destinationType" class="form-control">
          <option value="jdbc">JDBC</option>
          <option value="es">Elasticsearch</option>
          <option value="kafka">KAFKA</option>
        </select>
      </div>
    </div>

    <!-- 源端配置 -->
    <div class="target-end-config">
      <h4>源端配置</h4>
      <div v-if="config.sourceType === 'jdbc'" class="form-grid">
        <div class="form-group">
          <label>URL</label>
          <input v-model="config.sourceConfig.url" class="form-control" />
        </div>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="config.sourceConfig.username" class="form-control" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="config.sourceConfig.password" class="form-control" />
        </div>
        <div class="form-group">
          <label>源表</label>
          <input  v-model="config.sourceFieldName" class="form-control" />
        </div>
      </div>
    </div>

    <!-- 目标端配置 -->
    <div class="target-end-config">
      <h4>目标端配置</h4>

      <!-- JDBC -->
      <div v-if="config.destinationType === 'jdbc'" class="form-grid">
        <div class="form-group">
          <label>URL</label>
          <input v-model="config.destinationConfig.url" class="form-control" />
        </div>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="config.destinationConfig.username" class="form-control" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="config.destinationConfig.password" class="form-control" />
        </div>
        <div class="form-group">
          <label>目标表</label>
          <input  v-model="config.targetFieldName" class="form-control" />
        </div>
      </div>

      <!-- ES -->
      <div v-if="config.destinationType === 'es'" class="form-grid">
        <div class="form-group">
          <label>集群节点</label>
          <input v-model="config.destinationConfig.clusterNodes" class="form-control" />
        </div>
        <div class="form-group">
          <label>禁用SSL</label>
          <select v-model="config.destinationConfig.disableSslVerification" class="form-control">
            <option :value="false">否</option>
            <option :value="true">是</option>
          </select>
        </div>
        <div class="form-group">
          <label>INDEX</label>
          <input  v-model="config.targetFieldName" class="form-control" />
        </div>
      </div>
    </div>

    <!-- kafka -->
    <div v-if="config.destinationType === 'kafka'" class="form-grid">
      <div class="form-group">
        <label>服务地址</label>
        <input v-model="config.destinationConfig.bootstrapServers" class="form-control" />
      </div>
      <div class="form-group">
        <label>topic</label>
        <input  v-model="config.targetFieldName" class="form-control" />
      </div>
    </div>
  </div>

    <!-- 同步配置 -->
    <div class="config-advanced">
      <h4>同步配置</h4>
      <div class="form-grid">
        <div class="form-group">
          <label>批次大小</label>
          <input type="number" v-model="config.syncConfig.batchSize" class="form-control" />
        </div>
        <div class="form-group">
          <label>最小分片数</label>
          <input type="number" v-model="config.syncConfig.minShards" class="form-control" />
        </div>
        <div class="form-group">
          <label>最大分片数</label>
          <input type="number" v-model="config.syncConfig.maxShards" class="form-control" />
        </div>
        <div class="form-group">
          <label>协调器类型</label>
          <select v-model="config.syncConfig.coordinatorType" class="form-control">
            <option value="redis">Redis</option>
            <option value="zookeeper">Zookeeper</option>
          </select>
        </div>
        <div class="form-group">
          <label>协调器主机</label>
          <input v-model="config.syncConfig.coordinatorConfig.host" class="form-control" />
        </div>
        <div class="form-group">
          <label>协调器端口</label>
          <input type="number" v-model="config.syncConfig.coordinatorConfig.port" class="form-control" />
        </div>
      </div>
    </div>

    <!-- 字段映射 -->
    <div class="config-advanced">
      <h4>字段映射</h4>
      <div
          v-for="(f, idx) in fields"
          :key="idx"
          class="form-grid"
          style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px"
      >
        <div class="form-group">
          <label>javaField</label>
          <input v-model="f.javaField" class="form-control" />
        </div>
        <div class="form-group">
          <label>sourceField</label>
          <input v-model="f.sourceField" class="form-control" />
        </div>
        <div class="form-group">
          <label>sourceType</label>
          <select v-model="f.sourceType" class="form-control">
            <option value="String">String</option>
            <option value="Long">Long</option>
            <option value="Integer">Integer</option>
            <option value="Double">Double</option>
            <option value="BigDecimal">BigDecimal</option>
            <option value="LocalDate">LocalDate</option>
            <option value="LocalDateTime">LocalDateTime</option>
          </select>
        </div>
        <div class="form-group">
          <label>targetField</label>
          <input v-model="f.targetField" class="form-control" />
        </div>
        <div class="form-group">
          <label>targetType</label>
          <select v-model="f.targetType" class="form-control">
            <option value="String">String</option>
            <option value="Long">Long</option>
            <option value="Integer">Integer</option>
            <option value="Double">Double</option>
            <option value="BigDecimal">BigDecimal</option>
            <option value="LocalDate">LocalDate</option>
            <option value="LocalDateTime">LocalDateTime</option>
          </select>
        </div>
        <div class="form-group">
          <label>checkpoint</label>
          <select v-model="f.checkpoint" class="form-control">
            <option :value="true">是</option>
            <option :value="false">否</option>
          </select>
        </div>
        <div class="form-group">
          <label>role</label>
          <select v-model="f.role" class="form-control">
            <option value="id">ID</option>
            <option value="data">DATA</option>
            <option value="version">VERSION</option>
            <option value="timestamp">TIMESTAMP</option>
          </select>
        </div>
        <div class="form-group">
          <label>操作</label>
          <button class="btn btn-error" @click="removeField(idx)">删除</button>
        </div>
      </div>
      <button class="btn btn-primary" @click="addField">新增字段</button>
    </div>

    <!-- 保存 / 重置 -->
    <div style="margin-top: 20px; display: flex; gap: 10px">
      <button class="btn btn-primary" @click="saveConfig">
        <i class="fas fa-save"></i> 保存配置
      </button>
      <button class="btn btn-warning" @click="resetConfig">
        <i class="fas fa-undo"></i> 重置
      </button>
    </div>

    <div class="alert alert-success" v-if="configSuccess" style="margin-top: 20px">
      <i class="fas fa-check-circle"></i>
      <span>配置保存成功</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()
    const configSuccess = ref(false)

    const config = computed({
      get: () => store.state.config,
      set: (value) => store.commit('updateConfig', value)
    })

    const fields   = computed(() => store.state.config.fields)

    // 保存配置
    const saveConfig = () => {
      store.commit('setCurrentTask', config.value)
      store.commit('updateConfig', { ...config.value })
      configSuccess.value = true
      setTimeout(() => {
        configSuccess.value = false
      }, 3000)
    }

    // 重置配置
    const resetConfig = () => {
      store.commit('resetConfig')
    }

    /* 操作方法里通过 mutation 改 store */
    function addField() {
      const list = [...fields.value]
      list.push({
        javaField: '',
        sourceType: 'String',
        sourceField: '',
        checkpoint: false,
        targetField: '',
        targetType: 'String',
        role: 'data'
      })
      store.commit('updateConfig', { ...config.value, fields: list })
    }
    function removeField(idx) {
      const list = [...fields.value]
      list.splice(idx, 1)
      store.commit('updateConfig', { ...config.value, fields: list })
    }

    return {
      config,
      configSuccess,
      fields,
      addField,
      removeField,
      saveConfig,
      resetConfig
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