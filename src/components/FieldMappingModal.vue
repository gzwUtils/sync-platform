<template>
  <!-- 半透明彩色遮罩 -->
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-wrapper">
      <div class="modal-container">
        <!-- 顶部标题栏 -->
        <header class="modal-header">
          <h3>字段映射配置</h3>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </header>

        <!-- 主体内容 -->
        <main class="modal-body">
          <section
              v-for="(f, idx) in innerFields"
              :key="idx"
              class="field-row"
          >
            <div class="field-cell">
              <label>java属性</label>
              <input v-model="f.javaField" />
            </div>
            <div class="field-cell">
              <label>源字段</label>
              <input v-model="f.sourceField" />
            </div>
            <div class="field-cell">
              <label>源字段类型</label>
              <select v-model="f.sourceType">
                <option>String</option>
                <option>Long</option>
                <option>Integer</option>
                <option>Double</option>
                <option>BigDecimal</option>
                <option>LocalDate</option>
                <option>LocalDateTime</option>
              </select>
            </div>
            <div class="field-cell">
              <label>目标字段</label>
              <input v-model="f.targetField" />
            </div>
            <div class="field-cell">
              <label>目标字段类型</label>
              <select v-model="f.targetType">
                <option v-for="t in targetTypeOptions" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="field-cell">
              <label>是否是校验点</label>
              <select v-model="f.checkpoint">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </div>
            <div class="field-cell">
              <label>角色</label>
              <select v-model="f.role">
                <option value="id">ID</option>
                <option value="data">DATA</option>
                <option value="version">VERSION</option>
                <option value="timestamp">TIMESTAMP</option>
              </select>
            </div>
            <button class="del-btn" @click="removeField(idx)">
              <i class="fas fa-trash"></i>
            </button>
          </section>

          <!-- 新增按钮 -->
          <button class="add-btn" @click="addField">
            <i class="fas fa-plus-circle"></i> 新增字段
          </button>
        </main>

        <!-- 底部按钮 -->
        <footer class="modal-footer">
          <button class="btn cancel" @click="$emit('close')">取消</button>
          <button class="btn confirm" @click="confirm">保存</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import { useStore } from 'vuex'
const props = defineProps({ fields: { type: Array, required: true } })
const emit  = defineEmits(['close', 'update'])

const innerFields = ref(JSON.parse(JSON.stringify(props.fields)))
watch(() => props.fields, n => (innerFields.value = JSON.parse(JSON.stringify(n))), { immediate: true })

const addField    = () => innerFields.value.push({ javaField:'',sourceType:'String',sourceField:'',checkpoint:false,targetField:'',targetType:'String',role:'data' })
const removeField = idx => innerFields.value.splice(idx, 1)
const confirm     = () => emit('update', innerFields.value)


const store = useStore()
const destinationType = computed(() => store.state.config.destinationType)



/* 2. 动态选项 */
const targetTypeOptions = computed(() => {
  switch (destinationType.value) {
    case 'Elasticsearch':
      return ['Keyword', 'Text', 'Date', 'Long', 'Integer', 'Double', 'Boolean','Byte']
    case 'KAFKA':
      return ['String', 'Long', 'Integer', 'Double', 'BigDecimal', 'LocalDate', 'LocalDateTime', 'Boolean']
    case 'JDBC':
    default:
      return ['String', 'Long', 'Integer', 'Double', 'BigDecimal', 'LocalDate', 'LocalDateTime', 'Boolean','Byte']
  }
})
</script>

<style scoped>
/* 1. 遮罩层 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

/* 2. 弹框卡片 */
.modal-wrapper {
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}
.modal-container {
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 3. 顶部标题栏 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: linear-gradient(135deg, #ff6b9e, #feca57);
  color: #fff;
}
.modal-header h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  transition: transform .2s;
}
.close-btn:hover { transform: scale(1.2); }

/* 4. 主体滚动区 */
.modal-body {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
  background: #ffffff;

  height: 0;
  min-height: 100%;
  max-height: calc(90vh - 220px);
}
.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
  padding: 12px;
  border-radius: 16px;
  background: #f7f7f7;
  border: 1px solid #e5e5e5;
  transition: transform .2s, box-shadow .2s;
}
.field-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.field-cell { display: flex; flex-direction: column; }
.field-cell label {
  margin-bottom: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}
.field-cell input,
.field-cell select {
  padding: 8px 10px;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  background: #fff;
  color: #333;
  transition: border-color .2s;
}
.field-cell input:focus,
.field-cell select:focus {
  border-color: #54a0ff;
  outline: none;
}
.del-btn {
  align-self: end;
  padding: 8px 10px;
  border: none;
  border-radius: 50%;
  background: #ff6b9e;
  color: #fff;
  cursor: pointer;
  transition: background .2s;
}
.del-btn:hover { background: #ff4273; }

.add-btn {
  margin-bottom: 20px;
  padding: 12px 24px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #4fd1c5, #54a0ff);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s;
}
.add-btn:hover { transform: scale(1.05); }

/* 5. 底部按钮 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 30px;
  background: #ffffff;
}
.btn.cancel { background: #e5e5e5; color: #333; }
.btn.confirm { background: #10b981; color: #fff; }
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 6. 响应式 */
@media (max-width: 768px) {
  .field-row { grid-template-columns: 1fr 1fr; }
}
</style>