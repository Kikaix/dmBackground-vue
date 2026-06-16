<template>
  <view class="search-bar">
    <view class="search-fields">
      <view
        class="search-field"
        v-for="field in fields"
        :key="field.key"
        :style="{ flex: field.flex || 1 }"
      >
        <input
          v-if="field.type === 'input' || !field.type"
          class="field-input"
          :placeholder="field.placeholder || field.label"
          v-model="formData[field.key]"
          @confirm="handleSearch"
        />
        <picker
          v-else-if="field.type === 'select'"
          mode="selector"
          :range="field.options"
          :range-key="'label'"
          @change="(e) => onSelectChange(field.key, field.options[e.detail.value])"
        >
          <view class="field-picker">
            <text :class="{ placeholder: !formData[field.key] }">
              {{ getSelectLabel(field) || field.placeholder || field.label }}
            </text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>
    <view class="search-actions">
      <view class="btn-search" @click="handleSearch">
        <text>搜索</text>
      </view>
      <view class="btn-reset" @click="handleReset">
        <text>重置</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, watch, onMounted } from 'vue'

const props = defineProps({
  /** 搜索字段配置
   * [{ key: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名', flex: 1 },
   *  { key: 'status', label: '状态', type: 'select', options: [...], placeholder: '请选择' }]
   */
  fields: { type: Array, default: () => [] },
  /** 初始值 */
  initialValues: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['search', 'reset'])

const formData = reactive({ ...props.initialValues })

// 初始化默认值
onMounted(() => {
  props.fields.forEach(f => {
    if (!(f.key in formData)) {
      formData[f.key] = f.defaultValue || ''
    }
  })
})

// 当外部传入的 initialValues 变化时同步
watch(() => props.initialValues, (val) => {
  Object.assign(formData, val)
}, { deep: true })

function getSelectLabel(field) {
  const val = formData[field.key]
  if (!val) return ''
  if (typeof val === 'object') return val.label
  const opt = field.options?.find(o => o.value === val)
  return opt ? opt.label : val
}

function onSelectChange(key, option) {
  formData[key] = option?.value || ''
}

function handleSearch() {
  // 过滤空值
  const params = {}
  Object.keys(formData).forEach(k => {
    if (formData[k] !== '' && formData[k] != null) {
      params[k] = formData[k]
    }
  })
  emit('search', params)
}

function handleReset() {
  props.fields.forEach(f => {
    formData[f.key] = f.defaultValue || ''
  })
  emit('reset')
}
</script>

<style lang="scss" scoped>
.search-bar {
  background: #fff;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.search-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.search-field {
  min-width: 200rpx;
}

.field-input {
  height: 64rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #fafafa;
}

.field-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #fafafa;
  color: #333;
}

.placeholder {
  color: #bbb;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
  margin-left: 12rpx;
}

.search-actions {
  display: flex;
  gap: 16rpx;
}

.btn-search, .btn-reset {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.btn-search {
  background: $primary-color;
  color: #fff;
}

.btn-reset {
  background: #f5f5f5;
  color: #666;
}
</style>
