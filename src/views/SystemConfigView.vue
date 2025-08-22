<!-- src/components/SystemConfigView.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">系统配置</h2>
    </div>

    <!-- 基础信息 -->
    <div class="form-grid">
      <div class="form-group"><label>任务ID</label><input v-model="config.taskId" class="form-control"></div>
      <div class="form-group"><label>任务名称</label><input v-model="config.taskName" class="form-control"></div>
      <div class="form-group"><label>源类型</label>
        <select v-model="config.sourceType" class="form-control">
          <option value="jdbc">JDBC</option>
          <option value="file">文件系统</option>
        </select>
      </div>
      <div class="form-group"><label>目标类型</label>
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
        <div class="form-group"><label>URL</label><input v-model="config.sourceConfig.url" class="form-control"></div>
        <div class="form-group"><label>用户名</label><input v-model="config.sourceConfig.username" class="form-control"></div>
        <div class="form-group"><label>密码</label><input type="password" v-model="config.sourceConfig.password" class="form-control"></div>
        <div class="form-group"><label>源表</label><input v-model="config.sourceFieldName" class="form-control"></div>
      </div>
    </div>

    <!-- 目标端配置 -->
    <div class="target-end-config">
      <h4>目标端配置</h4>
      <!-- JDBC -->
      <div v-if="config.destinationType === 'jdbc'" class="form-grid">
        <div class="form-group"><label>URL</label><input v-model="config.destinationConfig.url" class="form-control"></div>
        <div class="form-group"><label>用户名</label><input v-model="config.destinationConfig.username" class="form-control"></div>
        <div class="form-group"><label>密码</label><input type="password" v-model="config.destinationConfig.password" class="form-control"></div>
        <div class="form-group"><label>目标表</label><input v-model="config.targetFieldName" class="form-control"></div>
      </div>
      <!-- ES -->
      <div v-if="config.destinationType === 'es'" class="form-grid">
        <div class="form-group"><label>集群节点</label><input v-model="config.destinationConfig.clusterNodes" class="form-control"></div>
        <div class="form-group"><label>禁用SSL</label>
          <select v-model="config.destinationConfig.disableSslVerification" class="form-control">
            <option :value="false">否</option><option :value="true">是</option>
          </select>
        </div>
        <div class="form-group"><label>INDEX</label><input v-model="config.targetFieldName" class="form-control"></div>
      </div>
      <!-- kafka -->
      <div v-if="config.destinationType === 'kafka'" class="form-grid">
        <div class="form-group"><label>服务地址</label><input v-model="config.destinationConfig.bootstrapServers" class="form-control"></div>
        <div class="form-group"><label>topic</label><input v-model="config.targetFieldName" class="form-control"></div>
      </div>
    </div>

    <!-- 同步配置 -->
    <div class="config-advanced">
      <h4>同步配置</h4>
      <div class="form-grid">
        <div class="form-group"><label>批次大小</label><input type="number" v-model="config.syncConfig.batchSize" class="form-control"></div>
        <div class="form-group"><label>最小分片数</label><input type="number" v-model="config.syncConfig.minShards" class="form-control"></div>
        <div class="form-group"><label>最大分片数</label><input type="number" v-model="config.syncConfig.maxShards" class="form-control"></div>
        <div class="form-group"><label>协调器类型</label>
          <select v-model="config.syncConfig.coordinatorType" class="form-control">
            <option value="redis">Redis</option><option value="zookeeper">Zookeeper</option>
          </select>
        </div>
        <div class="form-group"><label>协调器主机</label><input v-model="config.syncConfig.coordinatorConfig.host" class="form-control"></div>
        <div class="form-group"><label>协调器端口</label><input type="number" v-model="config.syncConfig.coordinatorConfig.port" class="form-control"></div>
      </div>
    </div>

    <!-- 字段映射 -->
    <div class="config-advanced">
      <h4>字段映射</h4>
      <button class="btn btn-primary" @click="showFieldModal = true">配置字段</button>
    </div>

    <!-- 弹框 -->
    <FieldMappingModal
        v-if="showFieldModal"
        :fields="fields"
        @close="showFieldModal = false"
        @update="updateFields"
    />

    <!-- 保存 / 重置 -->
    <div style="margin-top: 20px;display:flex;gap:10px">
      <button class="btn btn-primary" @click="saveConfig">保存配置</button>
      <button class="btn btn-warning" @click="resetConfig">重置</button>
    </div>

    <div class="alert alert-success" v-if="configSuccess">
      <i class="fas fa-check-circle"></i> 配置保存成功
    </div>
  </div>
</template>

<script setup>
/* ===== 组合式 API 写法，简单清晰 ===== */
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import FieldMappingModal from '../components/FieldMappingModal.vue'   // 引入弹窗组件

const store = useStore()
const showFieldModal = ref(false)
const configSuccess   = ref(false)

const config = computed({
  get: () => store.state.config,
  set: val => store.commit('updateConfig', val)
})
const fields = computed(() => store.state.config.fields)

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
/* 你的样式已经写得很好，直接复用即可；如想偷懒，把之前 <style> 整段粘过来 */
</style>