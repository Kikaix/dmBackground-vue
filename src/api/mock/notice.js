/**
 * 通知公告 Mock 数据
 */
import { mockResponse, paginate } from './index'

let idCounter = 1
const notices = [
  { id: idCounter++, title: '关于宿舍安全用电检查的通知', content: '近期将开展宿舍用电安全大检查，请各位同学配合。检查内容包括：违规电器使用、私拉乱接电线等。', publisher: '后勤管理处', createTime: '2026-06-01 08:00', isTop: true },
  { id: idCounter++, title: '2026年暑假离校宿舍安排', content: '暑假期间宿舍将进行统一维修，请同学们在规定时间内办理离校手续。离校前请关闭水电、门窗，贵重物品自行保管。', publisher: '学生处', createTime: '2026-06-02 10:00', isTop: true },
  { id: idCounter++, title: '关于开展文明宿舍评比活动的通知', content: '为进一步加强宿舍文化建设，营造良好的生活环境，将开展"文明宿舍"评比活动。评比内容包括：卫生、纪律、文化建设等方面。', publisher: '学生会', createTime: '2026-06-03 14:30', isTop: false },
  { id: idCounter++, title: '宿舍网络维护通知', content: '定于本周六对宿舍区网络设备进行升级维护，届时网络将暂时中断，预计维护时间8:00-18:00，给您带来的不便敬请谅解。', publisher: '信息中心', createTime: '2026-06-04 09:00', isTop: false },
  { id: idCounter++, title: '关于加强宿舍门禁管理的通知', content: '为提高宿舍安全管理水平，即日起严格执行门禁制度。所有人员进出宿舍需刷卡，外来访客需登记并押证。', publisher: '保卫处', createTime: '2026-06-05 11:00', isTop: false },
  { id: idCounter++, title: '关于宿舍卫生检查结果的通报', content: '本周宿舍卫生检查结果已出，整体情况良好。请个别卫生不达标的宿舍及时整改，复查不通过将通报批评。', publisher: '后勤管理处', createTime: '2026-06-06 16:00', isTop: false },
  { id: idCounter++, title: '端午节假期宿舍管理安排', content: '端午节假期期间，宿舍正常开放。留校同学请遵守宿舍管理规定，注意用电安全和防火防盗。', publisher: '学生处', createTime: '2026-06-07 08:30', isTop: false }
]

export function mockNoticeApi() {
  return {
    async getList(params = {}) {
      const { page = 1, size = 10, title } = params
      const data = paginate(notices, page, size, (item) => {
        if (title && !item.title.includes(title)) return false
        return true
      })
      return mockResponse(data)
    },

    async getById(id) {
      const item = notices.find(n => n.id === id)
      return mockResponse(item || null)
    },

    async create(data) {
      const newItem = {
        id: idCounter++,
        ...data,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isTop: false
      }
      notices.unshift(newItem)
      return mockResponse(newItem, '发布成功')
    },

    async update(id, data) {
      const idx = notices.findIndex(n => n.id === id)
      if (idx > -1) {
        notices[idx] = { ...notices[idx], ...data }
        return mockResponse(notices[idx], '修改成功')
      }
      return mockResponse(null, '通知不存在')
    },

    async delete(id) {
      const idx = notices.findIndex(n => n.id === id)
      if (idx > -1) {
        notices.splice(idx, 1)
        return mockResponse(null, '删除成功')
      }
      return mockResponse(null, '通知不存在')
    }
  }
}
