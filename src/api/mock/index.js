/**
 * Mock 数据开关
 * 改为 false 即切换到真实后端接口
 */
export const USE_MOCK = false

/**
 * 模拟网络延迟（毫秒）
 */
export const MOCK_DELAY = 300

/**
 * 包装 Mock 响应（模拟延迟，直接返回数据）
 * 与 request.js 行为一致：只返回解析后的 data 字段
 * @param {*} data - 响应数据
 * @returns {Promise} 模拟延迟后返回
 */
export function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY)
  })
}

/**
 * 模拟分页数据
 * @param {Array} list - 全量数据
 * @param {number} page - 页码
 * @param {number} size - 每页条数
 * @param {Function} filterFn - 过滤函数，返回 true 保留
 * @returns {Object} { records, total, page, size }
 */
export function paginate(list, page = 1, size = 10, filterFn) {
  let filtered = filterFn ? list.filter(filterFn) : list
  const total = filtered.length
  const start = (page - 1) * size
  const records = filtered.slice(start, start + size)
  return { records, total, page, size }
}
