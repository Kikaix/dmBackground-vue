/**
 * 全局常量定义
 */

// 后端 API 基础地址（按平台切换）
// #ifdef H5
export const BASE_URL = '/api'
// #endif

// #ifdef MP-WEIXIN
export const BASE_URL = 'https://springboot-1y6r-270784-5-1443650889.sh.run.tcloudbase.com/api'
// #endif

// 业务状态码（与 Java 后端约定）
export const BIZ_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// HTTP 状态码映射
export const HTTP_STATUS = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求资源不存在',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用'
}

// 性别
export const GENDER = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
]

// 报修状态
export const REPAIR_STATUS = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

// 访客状态
export const VISITOR_STATUS = [
  { value: 'visiting', label: '访问中' },
  { value: 'left', label: '已离开' }
]

// 宿舍类型
export const DORMITORY_TYPE = [
  { value: 'male', label: '男生宿舍' },
  { value: 'female', label: '女生宿舍' }
]

// 分页默认配置
export const PAGE_CONFIG = {
  page: 1,
  size: 10,
  sizes: [10, 20, 50]
}

// 小程序页面路径（统一管理，避免硬编码）
export const PAGE_PATH = {
  DORMITORY_LIST: '/pages/dormitory/list',
}
