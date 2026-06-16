<template>
  <view class="data-table">
    <!-- 表头 -->
    <view class="table-header">
      <view
        class="th"
        v-for="col in columns"
        :key="col.key"
        :style="{ flex: col.flex || 1, width: col.width, textAlign: col.align || 'left' }"
      >
        <text>{{ col.title }}</text>
      </view>
      <view v-if="$slots.actions || showActions" class="th th-actions">
        <text>操作</text>
      </view>
    </view>

    <!-- 表格体 -->
    <view v-if="data.length" class="table-body">
      <view
        class="table-row"
        v-for="(row, index) in data"
        :key="row.id || index"
      >
        <view
          class="td"
          v-for="col in columns"
          :key="col.key"
          :style="{ flex: col.flex || 1, width: col.width, textAlign: col.align || 'left' }"
        >
          <!-- 自定义渲染 -->
          <slot v-if="$slots[col.key]" :name="col.key" :row="row" :value="row[col.key]" />
          <!-- 默认渲染 -->
          <text v-else class="td-text">{{ formatValue(row, col) }}</text>
        </view>
        <!-- 操作列 -->
        <view v-if="$slots.actions || showActions" class="td td-actions">
          <slot name="actions" :row="row" />
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <EmptyState v-else text="暂无数据" />
  </view>
</template>

<script setup>
import EmptyState from './EmptyState.vue'
import { GENDER } from '@/utils/constants'

defineProps({
  /** 列配置
   * [{ key: 'name', title: '姓名', flex: 1, width: '', align: 'left' }]
   */
  columns: { type: Array, default: () => [] },
  /** 数据 */
  data: { type: Array, default: () => [] },
  /** 是否显示操作列（无 slot 时也可通过此属性控制） */
  showActions: { type: Boolean, default: true }
})

/**
 * 格式化单元格值（字典映射等）
 */
function formatValue(row, col) {
  const val = row[col.key]
  if (val == null || val === '') return '-'

  // 使用自定义格式化函数
  if (col.formatter) {
    return col.formatter(row, val)
  }

  return val
}
</script>

<style lang="scss" scoped>
.data-table {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.table-header {
  display: flex;
  background: #fafafa;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.th {
  font-size: 26rpx;
  color: #888;
  font-weight: 500;
}

.table-body {
  // scrollable
}

.table-row {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
}

.td {
  font-size: 26rpx;
  color: #333;
}

.td-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.th-actions, .td-actions {
  flex: 0 0 140rpx !important;
  text-align: center !important;
}
</style>
