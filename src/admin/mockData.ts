import { buildDiagnosisReport, defaultDiagnosisAnswers } from '../diagnosis'
import { visuals } from '../visualAssets'
import type { AdminData, Booking, CaseStudy, DiagnosisRecord, FollowUpRecord, Lead, MerchantSettings, SolutionPlan } from './types'
import { calculateLeadScore, getIntentLevel } from './scoringRules'

const answerProfiles = {
  family128: {
    ...defaultDiagnosisAnswers,
    status: '正在装修',
    area: '120-160㎡',
    returnActions: ['手动开玄关灯', '手动开客厅灯', '打开空调', '拉窗帘', '希望这些动作自动完成'],
    awayConcerns: ['怀疑门是否锁好', '担心燃气安全', '想确认老人或孩子是否到家'],
    nightLife: ['摸黑寻找开关', '希望脚落地后自动亮起柔和路径灯'],
    members: ['夫妻或情侣', '儿童'],
    childConcerns: ['是否希望知道孩子是否安全到家？', '是否关注儿童房空气与温度？', '是否需要夜间柔和灯光？'],
    preferences: ['家庭安全', '灯光氛围', '儿童照护', '生活省心'],
  },
  senior168: {
    ...defaultDiagnosisAnswers,
    status: '毛坯新房',
    area: '160-200㎡',
    returnActions: ['手动开玄关灯', '打开空调', '拉窗帘'],
    awayConcerns: ['怀疑门是否锁好', '担心燃气安全', '希望远程查看家庭状态'],
    nightLife: ['打开刺眼主灯', '希望脚落地后自动亮起柔和路径灯'],
    members: ['夫妻或情侣', '老人'],
    seniorConcerns: ['是否担心老人夜间起床安全？', '是否担心燃气忘关？', '是否希望出现异常情况时及时收到提醒？'],
    preferences: ['家庭安全', '老人照护', '舒适环境', '节能管理'],
  },
  pet95: {
    ...defaultDiagnosisAnswers,
    status: '已经入住',
    area: '80-120㎡',
    returnActions: ['打开空调', '寻找遥控器', '希望这些动作自动完成'],
    awayConcerns: ['希望远程查看家庭状态'],
    nightLife: ['已经有夜灯'],
    members: ['独居', '宠物'],
    petConcerns: ['是否需要远程查看？', '是否关注无人时环境温度？'],
    preferences: ['舒适环境', '生活省心', '节能管理'],
  },
  villa260: {
    ...defaultDiagnosisAnswers,
    status: '正在装修',
    area: '200㎡以上',
    returnActions: ['手动开玄关灯', '手动开客厅灯', '打开空调', '拉窗帘', '寻找遥控器', '打开音乐'],
    awayConcerns: ['怀疑门是否锁好', '怀疑灯是否关闭', '担心空调忘记关闭', '担心燃气安全', '希望远程查看家庭状态'],
    nightLife: ['摸黑寻找开关', '使用手机照明'],
    members: ['夫妻或情侣', '儿童', '老人'],
    seniorConcerns: ['是否担心老人夜间起床安全？', '是否希望出现异常情况时及时收到提醒？'],
    childConcerns: ['是否希望知道孩子是否安全到家？', '是否关注儿童房空气与温度？'],
    preferences: ['家庭安全', '灯光氛围', '老人照护', '儿童照护', '影音娱乐', '节能管理'],
  },
  young105: {
    ...defaultDiagnosisAnswers,
    status: '精装未入住',
    area: '80-120㎡',
    returnActions: ['手动开客厅灯', '打开空调', '打开音乐'],
    awayConcerns: ['怀疑灯是否关闭', '担心空调忘记关闭'],
    nightLife: ['使用手机照明'],
    members: ['夫妻或情侣'],
    preferences: ['灯光氛围', '影音娱乐', '生活省心'],
  },
}

const diagnosisRecords: DiagnosisRecord[] = Object.entries(answerProfiles).map(([, answers], index) => ({
  id: `D-${String(index + 1).padStart(4, '0')}`,
  leadId: `L-${String(index + 1).padStart(4, '0')}`,
  completedAt: ['2026-07-08 09:26', '2026-07-08 10:14', '2026-07-07 18:42', '2026-07-06 21:08', '2026-07-05 16:20'][index],
  answers,
  result: buildDiagnosisReport(answers),
}))

const leadSeed = [
  ['L-0001', '陈亦然', '138 5176 2048', '无锡', '太湖雍华府', '128㎡', '正在装修', '三口之家', ['夫妻或情侣', '儿童'], ['家庭安全', '灯光氛围', '儿童照护', '生活省心'], '朋友圈', '已联系', '2026-07-08 09:31', '林佳', true, true],
  ['L-0002', '顾明远', '139 1260 8841', '苏州', '湖滨四季', '168㎡', '毛坯新房', '有老人家庭', ['夫妻或情侣', '老人'], ['家庭安全', '老人照护', '舒适环境', '节能管理'], '小红书', '已预约', '2026-07-08 10:18', '周航', true, true],
  ['L-0003', '沈若晴', '136 0188 7621', '上海', '静安和樾', '95㎡', '已经入住', '宠物家庭', ['独居', '宠物'], ['舒适环境', '生活省心', '节能管理'], '抖音', '持续跟进', '2026-07-07 18:45', '林佳', true, false],
  ['L-0004', '陆承安', '158 2198 3360', '杭州', '云栖玫瑰园', '260㎡', '正在装修', '多代同住家庭', ['夫妻或情侣', '儿童', '老人'], ['家庭安全', '灯光氛围', '老人照护', '儿童照护', '影音娱乐', '节能管理'], '销售人员分享', '方案设计中', '2026-07-06 21:12', '周航', true, true],
  ['L-0005', '许知夏', '137 7420 5196', '南京', '金陵星河湾', '105㎡', '精装未入住', '年轻夫妻', ['夫妻或情侣'], ['灯光氛围', '影音娱乐', '生活省心'], '自然访问', '待联系', '2026-07-05 16:25', '林佳', true, false],
] as const

const leads: Lead[] = leadSeed.map((seed, index) => {
  const [id, customerName, phone, city, community, area, decorationStage, familyType, members, mainNeeds, source, status, submittedAt, owner, hasPhone, activelyBooked] = seed
  const diagnosis = diagnosisRecords[index]
  const score = calculateLeadScore({ answers: diagnosis.answers, hasPhone, activelyBooked })
  return {
    id,
    customerName,
    phone,
    city,
    community,
    area,
    decorationStage,
    familyType,
    members: [...members],
    mainNeeds: [...mainNeeds],
    recommendedPlan: diagnosis.result.planType,
    score,
    intentLevel: getIntentLevel(score),
    source,
    status,
    submittedAt,
    owner,
    hasPhone,
    activelyBooked,
    diagnosisId: diagnosis.id,
    remark: '客户希望先看方案逻辑，再确认是否上门勘测。',
  }
})

const followUps: FollowUpRecord[] = [
  { id: 'F-0001', leadId: 'L-0001', type: '电话联系', time: '2026-07-08 10:02', content: '已确认客户正在做水电前方案，希望重点解决孩子到家提醒和夜间柔光。', nextFollowTime: '2026-07-09 15:00', note: '发送舒适安全型方案初稿。', owner: '林佳' },
  { id: 'F-0002', leadId: 'L-0002', type: '微信联系', time: '2026-07-08 11:20', content: '客户关注老人夜间起床和厨房燃气，已约周五上门勘测。', nextFollowTime: '2026-07-10 09:30', note: '准备老人照护案例。', owner: '周航' },
  { id: 'F-0003', leadId: 'L-0004', type: '发送方案', time: '2026-07-07 14:10', content: '已发送别墅全宅分区方案，客户希望增加影音室和地下室控制。', nextFollowTime: '2026-07-09 10:30', note: '需要设计师加入。', owner: '周航' },
]

const bookings: Booking[] = [
  { id: 'B-0001', leadId: 'L-0002', customer: '顾明远', phone: '139 1260 8841', type: '上门勘测', date: '2026-07-10', time: '09:30', address: '苏州 湖滨四季', area: '168㎡', owner: '周航', note: '重点看老人房、厨房和客厅窗帘点位。', status: '已确认' },
  { id: 'B-0002', leadId: 'L-0004', customer: '陆承安', phone: '158 2198 3360', type: '方案沟通', date: '2026-07-09', time: '10:30', address: '线上会议', area: '260㎡', owner: '周航', note: '讨论全宅分区、影音室和安防策略。', status: '待确认' },
]

const cases: CaseStudy[] = [
  { id: 'C-0001', name: '无锡 128㎡ 三口之家舒适安全改造', city: '无锡', community: '太湖雍华府', area: '128㎡', layout: '三室两厅', familyMembers: '夫妻 + 儿童', painPoints: '孩子到家提醒、夜间柔光、离家安全焦虑。', planType: '舒适安全型', deviceCount: 42, sceneCount: 11, dailyAutomationCount: 18, intro: '以家庭安全和日常省心为核心的三口之家方案。', solution: '门锁、灯光、窗帘、环境监测和儿童房联动。', lifeChanges: '孩子到家可提醒，夜间起床柔光自动亮起，离家后状态统一确认。', image: visuals.childRoomCare.src, tags: ['三口之家', '儿童照护'], status: '上架', sort: 1, featured: true },
  { id: 'C-0002', name: '苏州 168㎡ 有老人家庭照护系统', city: '苏州', community: '湖滨四季', area: '168㎡', layout: '四室两厅', familyMembers: '夫妻 + 老人', painPoints: '老人夜间起床、燃气安全、异常提醒。', planType: '照护安全型', deviceCount: 58, sceneCount: 16, dailyAutomationCount: 26, intro: '围绕老人照护和厨房安全建立稳定联动。', solution: '老人房夜间路径灯、燃气复核、异常静止提醒。', lifeChanges: '老人夜间通行更安全，家属远程焦虑降低。', image: visuals.elderCarePath.src, tags: ['老人家庭', '大平层'], status: '上架', sort: 2, featured: true },
]

const solutions: SolutionPlan[] = [
  { id: 'S-0001', name: '基础安心型', intro: '适合先解决门锁、照明和基础安防的家庭。', suitableFamily: '精装房、已入住家庭', suitableArea: '80-120㎡', recommendedScenes: ['回家模式', '离家模式', '夜间起床'], recommendedSystems: ['智能照明', '智能安防'], budgetRange: '¥15,000-30,000', displayStatus: '展示', sort: 1 },
  { id: 'S-0002', name: '舒适生活型', intro: '强化灯光、窗帘、温控和常用生活自动化。', suitableFamily: '年轻夫妻、三口之家', suitableArea: '100-160㎡', recommendedScenes: ['回家模式', '睡眠模式', '家庭活动'], recommendedSystems: ['智能照明', '智能遮阳', '智能温控'], budgetRange: '¥30,000-60,000', displayStatus: '展示', sort: 2 },
  { id: 'S-0003', name: '舒适安全型', intro: '兼顾家庭安全、儿童老人照护和舒适体验。', suitableFamily: '有儿童或老人家庭', suitableArea: '120-200㎡', recommendedScenes: ['儿童到家提醒', '长辈守护', '安全监测'], recommendedSystems: ['智能安防', '智能环境', '智能中控'], budgetRange: '¥60,000-120,000', displayStatus: '展示', sort: 3 },
  { id: 'S-0004', name: '高端全宅型', intro: '面向大平层和别墅的多系统全宅联动。', suitableFamily: '大平层、别墅住宅', suitableArea: '200㎡以上', recommendedScenes: ['全宅离家', '影音室', '分区温控'], recommendedSystems: ['智能中控', '智能影音', '智能温控', '智能安防'], budgetRange: '¥120,000+', displayStatus: '展示', sort: 4 },
]

const settings: MerchantSettings = {
  brandName: '禾境全屋智能',
  logo: 'H',
  phone: '400-880-2036',
  wechat: 'hejing-smarthome',
  address: '上海市静安区南京西路 688 号智能生活体验中心',
  businessHours: '周一至周日 10:00-20:00',
  city: '上海、苏州、无锡、杭州、南京',
  bookingSuccessText: '设计顾问将在工作时间内与你联系，并结合户型与生活习惯完善方案。',
  frontCtaText: '开始家庭智能诊断',
  budgetRanges: '基础型 ¥15,000-30,000；舒适型 ¥30,000-60,000；深度智能 ¥60,000-120,000；高配方案 ¥120,000+',
}

export const initialAdminData: AdminData = {
  leads,
  diagnosisRecords,
  followUps,
  bookings,
  cases,
  solutions,
  settings,
  analytics: {
    visits: 1860,
    diagnosisStarts: 642,
    diagnosisCompleted: 418,
    contacts: 156,
    bookings: 47,
    deals: 12,
    sources: { 抖音: 326, 小红书: 248, 朋友圈: 186, 微信: 142, 销售人员分享: 94, 自然访问: 286, 其他: 38 },
  },
}
