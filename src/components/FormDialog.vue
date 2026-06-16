<template>
  <!-- 遮罩层 -->
  <view v-if="visible" class="dialog-mask" @click="handleMaskClick">
    <!-- 弹窗内容 -->
    <view class="dialog-container" @click.stop>
      <!-- 头部 -->
      <view class="dialog-header">
        <text class="dialog-title">{{ title }}</text>
        <view class="dialog-close" @click="handleClose">
          <text>✕</text>
        </view>
      </view>

      <!-- 表单区域 -->
      <scroll-view scroll-y class="dialog-body">
        <view
          class="form-item"
          v-for="field in fields"
          :key="field.key"
        >
          <text class="form-label">
            {{ field.required ? '*' : '' }}{{ field.label }}
          </text>

          <!-- 文本输入 -->
          <input
            v-if="field.type === 'input' || !field.type"
            class="form-input"
            :placeholder="field.placeholder || '请输入' + field.label"
            v-model="formData[field.key]"
          />

          <!-- 选择器 -->
          <picker
            v-else-if="field.type === 'select'"
            mode="selector"
            :range="field.options"
            :range-key="'label'"
            @change="(e) => onSelectChange(field.key, field.options[e.detail.value])"
          >
            <view class="form-picker">
              <text :class="{ placeholder: !getSelectLabel(field) }">
                {{ getSelectLabel(field) || field.placeholder || '请选择' + field.label }}
              </text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>

          <!-- 文本域 -->
          <textarea
            v-else-if="field.type === 'textarea'"
            class="form-textarea"
            :placeholder="field.placeholder || '请输入' + field.label"
            v-model="formData[field.key]"
          />
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="dialog-footer">
        <view class="btn-cancel" @click="handleClose">
          <text>取消</text>
        </view>
        <view class="btn-confirm" @click="handleConfirm">
          <text>确认</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '表单' },
  /** 表单字段配置（与 SearchBar 的 fields 格式一致） */
  fields: { type: Array, default: () => [] },
  /** 编辑时的初始数据 */
  formDataProp: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'close', 'update:visible'])

// 初始化空表单
function initForm() {
  const data = {}
  props.fields.forEach(f => {
    data[f.key] = f.defaultValue || ''
  })
  return data
}

const formData = reactive(initForm())

// 编辑时回填数据
watch(() => props.formDataProp, (val) => {
  if (val) {
    Object.keys(val).forEach(k => {
      if (k in formData) formData[k] = val[k]
    })
  } else {
    Object.assign(formData, initForm())
  }
})

// 弹窗打开时重置
watch(() => props.visible, (val) => {
  if (val) {
    if (props.formDataProp) {
      Object.keys(props.formDataProp).forEach(k => {
        if (k in formData) formData[k] = props.formDataProp[k]
      })
    } else {
      Object.assign(formData, initForm())
    }
  }
})

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

function handleConfirm() {
  // 简单必填校验
  for (const f of props.fields) {
    if (f.required && !formData[f.key]) {
      uni.showToast({ title: `请填写${f.label}`, icon: 'none' })
      return
    }
  }
  emit('confirm', { ...formData })
}

function handleClose() {
  emit('close')
  emit('update:visible', false)
}

function handleMaskClick() {
  handleClose()
}
</script>

<style lang="scss" scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-container {
  width: 85%;
  max-height: 70vh;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dialog-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.dialog-close {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
}

.dialog-body {
  flex: 1;
  padding: 0 30rpx;
  max-height: 50vh;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  height: 72rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #fafafa;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #fafafa;
  color: #333;
}

.form-textarea {
  min-height: 150rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #fafafa;
  width: 100%;
  box-sizing: border-box;
}

.placeholder {
  color: #bbb;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

.dialog-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: $primary-color;
  color: #fff;
}
</style>
