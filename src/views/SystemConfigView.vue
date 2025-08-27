<template>
  <div class="card">
    <!-- 卡片标题 -->
    <div class="card-header">
      <h2 class="card-title">系统配置</h2>
    </div>

    <!-- 1. 基础信息 -->
    <h3 class="section-title">基础信息</h3>
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
          <option value="">请选择</option>
          <option value="JDBC">JDBC</option>
        </select>
      </div>
      <div class="form-group">
        <label>目标类型</label>
        <select v-model="config.destinationType" class="form-control">
          <option value="">请选择</option>
          <option value="JDBC">JDBC</option>
          <option value="Elasticsearch">Elasticsearch</option>
          <option value="KAFKA">KAFKA</option>
        </select>
      </div>
    </div>

    <!-- 2. 源端配置（仅当选中时显示） -->
    <div v-if="config.sourceType">
      <h3 class="section-title">源端配置</h3>
      <div v-if="config.sourceType === 'JDBC'" class="form-grid">
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
          <input v-model="config.sourceFieldName" class="form-control" />
        </div>
      </div>
    </div>

    <!-- 3. 目标端配置（仅当选中时显示） -->
    <div v-if="config.destinationType">
      <h3 class="section-title">目标端配置</h3>

      <!-- JDBC -->
      <div v-if="config.destinationType === 'JDBC'" class="form-grid">
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
          <input v-model="config.targetFieldName" class="form-control" />
        </div>
      </div>

      <!-- Elasticsearch -->
      <div v-else-if="config.destinationType === 'Elasticsearch'" class="form-grid">
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
          <input v-model="config.targetFieldName" class="form-control" />
        </div>
      </div>

      <!-- Kafka -->
      <div v-else-if="config.destinationType === 'KAFKA'" class="form-grid">
        <div class="form-group">
          <label>服务地址</label>
          <input v-model="config.destinationConfig.bootstrapServers" class="form-control" />
        </div>
        <div class="form-group">
          <label>topic</label>
          <input v-model="config.targetFieldName" class="form-control" />
        </div>
      </div>
    </div>

    <!-- 4. 同步配置 -->
    <h3 class="section-title">同步配置</h3>
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
    </div>

    <!-- 5. 协调器 -->
    <h3 class="section-title">协调器</h3>
    <div class="form-grid">
      <div class="form-group">
        <label>协调器类型</label>
        <select v-model="config.syncConfig.coordinatorType" class="form-control">
          <option value="redis">Redis</option>
          <option value="memory">memory</option>
        </select>
      </div>
    </div>

    <!-- Redis 配置（4 列并排） -->
    <div v-if="config.syncConfig.coordinatorType === 'redis'" class="form-grid">
      <div class="form-group">
        <label>协调主机</label>
        <input v-model="config.syncConfig.coordinatorConfig.host" class="form-control" />
      </div>
      <div class="form-group">
        <label>协调端口</label>
        <input type="number" v-model="config.syncConfig.coordinatorConfig.port" class="form-control" />
      </div>
      <div class="form-group">
        <label>协调密码</label>
        <input type="password" v-model="config.syncConfig.coordinatorConfig.password" class="form-control" />
      </div>
    </div>

    <!-- 6. 字段映射（弹框） -->
    <h3 class="section-title">字段映射</h3>
    <button class="btn btn-primary" @click="showFieldModal = true">配置字段</button>

    <FieldMappingModal
        v-if="showFieldModal"
        :fields="fields"
        @close="showFieldModal = false"
        @update="updateFields"
    />

    <!-- 操作区 -->
    <div style="margin-top: 24px; display: flex; gap: 10px">
      <button class="btn btn-primary" @click="saveConfig">保存配置</button>
      <button class="btn btn-warning" @click="resetConfig">重置</button>
    </div>

    <!-- 成功提示 -->
    <div class="alert alert-success" v-if="configSuccess">
      <i class="fas fa-check-circle"></i> 配置保存成功
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import FieldMappingModal from '../components/FieldMappingModal.vue'

const store = useStore()
const showFieldModal = ref(false)
const configSuccess = ref(false)

/* 计算属性，读写 store */
const config = computed({
  get: () => store.state.config,
  set: val => store.commit('updateConfig', val)
})
const fields = computed(() => store.state.config.fields)

/* 事件 */
function updateFields(newFields) {
  store.commit('updateConfig', { ...config.value, fields: newFields })
}

function saveConfig() {
  store.commit('setCurrentTask', config.value)
  store.commit('updateConfig', { ...config.value })
  configSuccess.value = true
  setTimeout(() => (configSuccess.value = false), 3000)
}

function resetConfig() {
  store.commit('resetConfig')
}
</script>

<style scoped>
.section-title {
  margin: 32px 0 12px;
  font-size: 1.1rem;
  font-weight: 600;
  border-left: 4px solid #0d6efd;
  padding-left: 8px;
}
</style>