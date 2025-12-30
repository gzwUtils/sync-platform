<template>
  <!-- 半透明彩色遮罩 -->
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-wrapper">
      <div class="modal-container">
        <!-- 顶部标题栏 -->
        <header class="modal-header">
          <h3>字段映射配置</h3>
          <div class="header-actions">
            <button class="btn-tool" @click="showSmartImport = !showSmartImport">
              <i class="fas fa-file-code"></i> 智能导入
            </button>
            <button class="btn-tool" @click="toggleSameTableMode">
              <i class="fas" :class="sameTableMode ? 'fa-check-circle' : 'fa-clone'"></i>
              同表模式
            </button>
            <button class="close-btn" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </header>

        <!-- 智能导入区域 -->
        <div v-if="showSmartImport" class="smart-import-area">
          <h4><i class="fas fa-database"></i> 粘贴SQL建表语句</h4>
          <textarea
            ref="sqlTextarea"
            v-model="sqlText"
            placeholder="粘贴完整的CREATE TABLE语句，例如：
CREATE TABLE user_data (
  \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL,
  \`email\` varchar(100) NOT NULL,
  \`phone\` varchar(20) DEFAULT NULL,
  \`gender\` tinyint(4) NOT NULL DEFAULT '0',
  \`age\` tinyint(3) unsigned NOT NULL DEFAULT '0',
  \`city\` varchar(50) NOT NULL,
  \`registration_date\` datetime NOT NULL,
  \`balance\` decimal(10,2) NOT NULL DEFAULT '0.00',
  \`create_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);"
            rows="6"
          ></textarea>
          <div class="import-actions">
            <button @click="useExampleSQL" class="btn btn-outline">
              <i class="fas fa-magic"></i> 使用示例
            </button>
            <button @click="parseSQL" class="btn btn-primary">
              <i class="fas fa-cogs"></i> 解析并导入
            </button>
            <button @click="showSmartImport = false" class="btn btn-outline">
              <i class="fas fa-times"></i> 关闭
            </button>
          </div>
        </div>

        <!-- 同表模式提示 -->
        <div v-if="sameTableMode" class="mode-tip">
          <i class="fas fa-info-circle"></i>
          同表模式已启用：目标字段自动与源字段同名，类型自动映射
        </div>

        <!-- 字段统计栏 -->
        <div class="field-stats">
          <span><i class="fas fa-columns"></i> 共 {{ innerFields.length }} 个字段</span>
          <div class="field-actions">
            <button class="btn-sm" @click="addField">
              <i class="fas fa-plus"></i> 添加字段
            </button>
            <button class="btn-sm" @click="clearAll">
              <i class="fas fa-trash"></i> 清空
            </button>
          </div>
        </div>

        <!-- 可滚动的内容区域 -->
        <div class="scrollable-content">
          <!-- 字段配置表格 -->
          <div class="fields-table-container">
            <table class="fields-table">
              <thead>
                <tr>
                  <th width="60">#</th>
                  <th>源字段</th>
                  <th width="160">源类型（Java）</th>
                  <th>目标字段</th>
                  <th width="160">目标类型（Java）</th>
                  <th width="100">校验点</th>
                  <th width="120">角色</th>
                  <th width="80">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(field, idx) in innerFields" :key="field.id">
                  <td class="serial">{{ idx + 1 }}</td>
                  <td>
                    <input
                      v-model="field.sourceField"
                      class="field-input"
                      placeholder="源字段名"
                      @blur="handleSourceChange(field)"
                    />
                    <!-- 隐藏的javaField字段，值自动与sourceField相同 -->
                    <input type="hidden" v-model="field.javaField" />
                  </td>
                  <td>
                    <select v-model="field.sourceType" class="field-select" @change="handleSourceTypeChange(field)">
                      <option value="">请选择</option>
                      <option v-for="type in javaTypeOptions" :key="type" :value="type">{{ type }}</option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model="field.targetField"
                      class="field-input"
                      :placeholder="sameTableMode ? field.sourceField : '目标字段名'"
                      :readonly="sameTableMode"
                    />
                    <span v-if="sameTableMode && field.sourceField" class="auto-match-hint">自动匹配</span>
                  </td>
                  <td>
                    <select v-model="field.targetType" class="field-select">
                      <option value="">请选择</option>
                      <option v-for="type in javaTypeOptions" :key="type" :value="type">{{ type }}</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="field.checkpoint" class="field-select">
                      <option :value="true">是</option>
                      <option :value="false">否</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="field.role" class="field-select">
                      <option value="id">ID</option>
                      <option value="data">数据</option>
                      <option value="version">版本</option>
                      <option value="timestamp">时间戳</option>
                    </select>
                  </td>
                  <td>
                    <button class="icon-btn" @click="removeField(field.id)" title="删除">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 空状态 -->
            <div v-if="innerFields.length === 0" class="empty-state">
              <i class="fas fa-columns"></i>
              <p>暂无字段配置</p>
              <button @click="addField" class="btn btn-primary">
                <i class="fas fa-plus"></i> 添加字段
              </button>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <footer class="modal-footer">
          <button class="btn cancel" @click="$emit('close')">
            <i class="fas fa-times"></i> 取消
          </button>
          <button class="btn confirm" @click="confirm">
            <i class="fas fa-check"></i> 保存配置
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  fields: {
    type: Array,
    required: true,
    default: () => []
  }
})
const emit = defineEmits(['close', 'update'])

const store = useStore()
const innerFields = ref([])
const sameTableMode = ref(false)
const showSmartImport = ref(false)
const sqlText = ref('')

// Java实体类类型选项
const javaTypeOptions = [
  'String',
  'Long',
  'Integer',
  'Short',
  'Byte',
  'Double',
  'Float',
  'BigDecimal',
  'Boolean',
  'LocalDate',
  'LocalDateTime',
  'LocalTime',
  'Instant',
  'Timestamp',
  'Date'
]

// 初始化字段数据
watch(() => props.fields, (newFields) => {
  innerFields.value = newFields.map((field, index) => ({
    id: field.id || `field-${Date.now()}-${index}`,
    javaField: field.javaField || field.sourceField || '', // 确保javaField有值
    sourceField: field.sourceField || '',
    sourceType: field.sourceType || '',
    targetField: field.targetField || '',
    targetType: field.targetType || '',
    checkpoint: field.checkpoint || false,
    role: field.role || 'data'
  }))
}, { immediate: true })

// 监听sourceField变化，自动更新javaField
watch(() => innerFields.value, (fields) => {
  fields.forEach(field => {
    if (field.sourceField && !field.javaField) {
      field.javaField = field.sourceField
    } else if (field.sourceField && field.javaField !== field.sourceField) {
      // 如果sourceField变化了，自动更新javaField
      field.javaField = field.sourceField
    }
  })
}, { deep: true })

/* ========== 基本字段操作 ========== */
const addField = () => {
  const newField = {
    id: `field-${Date.now()}-${innerFields.value.length}`,
    javaField: '', // 初始为空，会自动根据sourceField填充
    sourceField: '',
    sourceType: '',
    targetField: '',
    targetType: '',
    checkpoint: false,
    role: 'data'
  }
  innerFields.value.push(newField)
}

const removeField = (fieldId) => {
  const index = innerFields.value.findIndex(f => f.id === fieldId)
  if (index !== -1) {
    innerFields.value.splice(index, 1)
  }
}

const confirm = () => {
  // 验证必填字段
  const invalidFields = innerFields.value.filter(f =>
    !f.sourceField || !f.sourceType || !f.targetField || !f.targetType
  )

  if (invalidFields.length > 0) {
    alert(`有 ${invalidFields.length} 个字段信息不完整，请补充完整`)
    return
  }

  // 确保每个字段都有javaField，如果没有则用sourceField填充
  const fieldsToEmit = innerFields.value.map(field => ({
    ...field,
    javaField: field.javaField || field.sourceField // 确保javaField有值
  }))

  emit('update', fieldsToEmit)
  emit('close')
}

const clearAll = () => {
  if (innerFields.value.length > 0 && confirm('确定要清空所有字段吗？')) {
    innerFields.value = []
  }
}

/* ========== 智能功能 ========== */
const toggleSameTableMode = () => {
  sameTableMode.value = !sameTableMode.value

  if (sameTableMode.value) {
    // 启用同表模式：自动设置目标字段为源字段，类型相同
    innerFields.value.forEach(field => {
      if (field.sourceField && !field.targetField) {
        field.targetField = field.sourceField
      }
      if (field.sourceType && !field.targetType) {
        field.targetType = field.sourceType
      }
    })
  }
}

const handleSourceChange = (field) => {
  if (sameTableMode.value && field.sourceField && !field.targetField) {
    field.targetField = field.sourceField
  }
  // sourceField变化时，自动更新javaField
  if (field.sourceField) {
    field.javaField = field.sourceField
  }
}

const handleSourceTypeChange = (field) => {
  if (sameTableMode.value && field.sourceType && !field.targetType) {
    field.targetType = field.sourceType
  }
}

// 数据库类型到Java类型的映射（用于SQL解析）
const mapDbToJavaType = (dbType) => {
  const typeLower = dbType.toLowerCase()

  if (typeLower.includes('bigint')) {
    return 'Long'
  }
  if (typeLower.includes('int') || typeLower.includes('integer')) {
    return 'Integer'
  }
  if (typeLower.includes('tinyint') || typeLower.includes('smallint')) {
    return typeLower.includes('unsigned') ? 'Integer' : 'Short'
  }
  if (typeLower.includes('decimal') || typeLower.includes('numeric')) {
    return 'BigDecimal'
  }
  if (typeLower.includes('double')) {
    return 'Double'
  }
  if (typeLower.includes('float')) {
    return 'Float'
  }
  if (typeLower.includes('boolean') || typeLower.includes('bool')) {
    return 'Boolean'
  }
  if (typeLower.includes('datetime') || typeLower.includes('timestamp')) {
    return 'LocalDateTime'
  }
  if (typeLower.includes('date')) {
    return 'LocalDate'
  }
  if (typeLower.includes('time')) {
    return 'LocalTime'
  }
  if (typeLower.includes('byte') || typeLower.includes('blob') || typeLower.includes('binary')) {
    return 'Byte'
  }
  // 字符串类型
  if (typeLower.includes('char') || typeLower.includes('text') || typeLower.includes('varchar')) {
    return 'String'
  }
  // 默认返回String
  return 'String'
}

/* ========== SQL智能导入功能 ========== */
const useExampleSQL = () => {
  sqlText.value = `CREATE TABLE user_data (
  \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL,
  \`email\` varchar(100) NOT NULL,
  \`phone\` varchar(20) DEFAULT NULL,
  \`gender\` tinyint(4) NOT NULL DEFAULT '0',
  \`age\` tinyint(3) unsigned NOT NULL DEFAULT '0',
  \`city\` varchar(50) NOT NULL,
  \`registration_date\` datetime NOT NULL,
  \`balance\` decimal(10,2) NOT NULL DEFAULT '0.00',
  \`create_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`

  // 自动聚焦到textarea
  nextTick(() => {
    const textarea = document.querySelector('.smart-import-area textarea')
    if (textarea) {
      textarea.focus()
      textarea.select()
    }
  })
}

// 解析SQL建表语句
const parseSQL = () => {
  if (!sqlText.value.trim()) {
    alert('请输入SQL建表语句')
    return
  }

  const sql = sqlText.value.trim()

  try {
    // 提取表名（可选，用于显示信息）
    const tableNameMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i)

    // 提取主键
    const pkMatch = sql.match(/PRIMARY\s+KEY\s*\([`"]?(\w+)[`"]?\)/i)
    const primaryKey = pkMatch ? pkMatch[1] : null

    // 提取字段定义部分
    const fieldsMatch = sql.match(/\(([\s\S]*?)\)(?:\s*ENGINE|\s*PRIMARY|\s*UNIQUE|\s*KEY|\s*\)\s*;)/i)
    if (!fieldsMatch) {
      alert('无法解析SQL语句，请检查格式')
      return
    }

    const fieldsContent = fieldsMatch[1]
    const fieldLines = fieldsContent.split('\n')

    const newFields = []

    fieldLines.forEach(line => {
      line = line.trim()

      // 跳过空行和约束定义
      if (!line ||
          line.startsWith('PRIMARY KEY') ||
          line.startsWith('UNIQUE KEY') ||
          line.startsWith('KEY') ||
          line.startsWith('CONSTRAINT') ||
          line.startsWith(')') ||
          line.startsWith('--') ||
          line.startsWith('/*')) {
        return
      }

      // 移除末尾的逗号
      line = line.replace(/,\s*$/, '')

      // 匹配字段定义：`字段名` 类型(长度) 约束
      const fieldMatch = line.match(/[`"]?(\w+)[`"]?\s+([a-zA-Z]+(?:\(\d+(?:,\d+)?\))?)(?:\s+(.*))?/i)
      if (fieldMatch) {
        const fieldName = fieldMatch[1]
        const fieldType = fieldMatch[2]
        const constraints = fieldMatch[3] || ''

        const isPrimaryKey = primaryKey === fieldName
        const isNotNull = constraints.includes('NOT NULL')

        // 将数据库类型映射到Java类型
        const javaType = mapDbToJavaType(fieldType)

        const newField = {
          id: `sql-${Date.now()}-${newFields.length}`,
          javaField: fieldName, // 设置javaField
          sourceField: fieldName,
          sourceType: javaType,
          targetField: fieldName, // 默认目标字段名与源字段名相同
          targetType: javaType, // 默认目标类型与源类型相同
          checkpoint: isPrimaryKey, // 主键设为校验点
          role: isPrimaryKey ? 'id' : 'data'
        }

        // 特殊处理时间字段
        if (javaType === 'LocalDateTime' || javaType === 'LocalDate') {
          newField.role = 'timestamp'
        }

        // 如果是自增主键，设为校验点
        if (isPrimaryKey && constraints.includes('AUTO_INCREMENT')) {
          newField.checkpoint = true
        }

        newFields.push(newField)
      }
    })

    if (newFields.length === 0) {
      alert('未能解析出任何字段，请检查SQL格式')
      return
    }

    // 询问如何处理现有字段
    if (innerFields.value.length > 0) {
      const action = confirm(`解析出 ${newFields.length} 个字段。当前已有 ${innerFields.value.length} 个字段，如何处理？
确定 - 替换现有字段
取消 - 添加到现有字段末尾`)

      if (action) {
        innerFields.value = newFields
      } else {
        innerFields.value.push(...newFields)
      }
    } else {
      innerFields.value = newFields
    }

    showSmartImport.value = false
    sqlText.value = ''

    alert(`成功导入 ${newFields.length} 个字段！`)

  } catch (error) {
    console.error('解析SQL失败:', error)
    alert('解析SQL失败，请检查SQL格式是否正确')
  }
}
</script>

<style scoped>
/* 弹框基础样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-wrapper {
  width: 95%;
  max-width: 1400px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* 重要：防止外部滚动 */
}

/* 顶部标题栏 */
.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-tool {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-tool:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 智能导入区域 */
.smart-import-area {
  background: #f8f9fa;
  padding: 20px 30px;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.smart-import-area h4 {
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.smart-import-area textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 15px;
}

.smart-import-area textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.import-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 同表模式提示 */
.mode-tip {
  background: #e7f3ff;
  color: #0066cc;
  padding: 10px 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #cce0ff;
  flex-shrink: 0;
  font-size: 0.9rem;
}

/* 字段统计栏 */
.field-stats {
  padding: 15px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.field-stats span {
  font-size: 0.95rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-actions {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.btn-sm:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

/* 可滚动的内容区域 - 关键部分 */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* 重要：允许flex子项缩小 */
}

/* 字段表格容器 */
.fields-table-container {
  padding: 20px 30px;
  min-height: 200px;
}

/* 字段表格 */
.fields-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.fields-table th {
  background: #f8f9fa;
  padding: 12px 10px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.fields-table td {
  padding: 10px 10px;
  border-bottom: 1px solid #e5e5e5;
  vertical-align: middle;
}

.fields-table tr:hover {
  background-color: #f8f9fa;
}

.serial {
  text-align: center;
  color: #666;
  font-weight: 500;
}

/* 输入框和选择框样式 */
.field-input, .field-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.field-input:focus, .field-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.field-input:readonly {
  background: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.field-select {
  background: white;
  cursor: pointer;
}

/* 隐藏的input */
input[type="hidden"] {
  display: none;
}

/* 自动匹配提示 */
.auto-match-hint {
  font-size: 0.75rem;
  color: #667eea;
  display: block;
  margin-top: 4px;
  font-style: italic;
}

/* 操作按钮 */
.icon-btn {
  padding: 6px;
  border: none;
  background: none;
  cursor: pointer;
  color: #6c757d;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.icon-btn:hover {
  background: #fff5f5;
  color: #dc3545;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 20px 0;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 1rem;
}

/* 底部按钮 */
.modal-footer {
  padding: 20px 30px;
  background: white;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.btn {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
}

.btn.cancel {
  background: #e5e5e5;
  color: #333;
}

.btn.confirm {
  background: #10b981;
  color: #fff;
}

.btn-primary {
  background: #0d6efd;
  color: white;
}

.btn-outline {
  background: white;
  color: #0d6efd;
  border: 1px solid #0d6efd;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-wrapper {
    width: 98%;
    max-height: 95vh;
    margin: 10px;
  }

  .modal-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .fields-table-container {
    padding: 15px;
  }

  .fields-table {
    font-size: 0.8rem;
  }

  .field-input, .field-select {
    padding: 6px 8px;
    font-size: 0.8rem;
  }

  .modal-footer {
    padding: 15px;
  }

  .btn {
    padding: 10px 20px;
    min-width: 120px;
  }
}

/* 表格水平滚动支持 */
@media (max-width: 1200px) {
  .fields-table-container {
    overflow-x: auto;
  }

  .fields-table {
    min-width: 1000px;
  }
}
</style>