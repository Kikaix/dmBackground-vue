/**
 * 数据统计 API
 */
import { USE_MOCK } from '@/api/mock'
import { mockStatisticsApi } from '@/api/mock/statistics'
import request from '@/utils/request'

const realApi = {
  getOverview:           ()     => request.get('/statistics/overview'),
  getOccupancyByBuilding:()     => request.get('/statistics/occupancy'),
  getRepairTrend:        ()     => request.get('/statistics/repair-trend'),
  getRepairCategory:     ()     => request.get('/statistics/repair-category'),
}

const mock = mockStatisticsApi()

export const statisticsApi = USE_MOCK ? mock : realApi
export default statisticsApi
