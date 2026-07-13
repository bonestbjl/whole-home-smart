import type { DiagnosisAnswers, DiagnosisReport } from '../diagnosis'

export type LeadStatus =
  | '新线索'
  | '待联系'
  | '已联系'
  | '持续跟进'
  | '已预约'
  | '方案设计中'
  | '已报价'
  | '已成交'
  | '暂时搁置'
  | '无效线索'

export type IntentLevel = '高意向' | '中意向' | '普通'

export type FollowUpType = '电话联系' | '微信联系' | '到店体验' | '上门勘测' | '发送方案' | '报价' | '成交' | '其他'

export type BookingStatus = '待确认' | '已确认' | '已完成' | '已取消'

export type BookingType = '电话沟通' | '到店体验' | '上门勘测' | '方案沟通' | '报价沟通'

export type DiagnosisRecord = {
  id: string
  leadId: string
  completedAt: string
  answers: DiagnosisAnswers
  result: DiagnosisReport
}

export type FollowUpRecord = {
  id: string
  leadId: string
  type: FollowUpType
  time: string
  content: string
  nextFollowTime: string
  note: string
  owner: string
}

export type Booking = {
  id: string
  leadId: string
  customer: string
  phone: string
  type: BookingType
  date: string
  time: string
  address: string
  area: string
  owner: string
  note: string
  status: BookingStatus
}

export type Lead = {
  id: string
  customerName: string
  phone: string
  city: string
  community: string
  area: string
  decorationStage: string
  familyType: string
  members: string[]
  mainNeeds: string[]
  recommendedPlan: string
  score: number
  intentLevel: IntentLevel
  source: string
  status: LeadStatus
  submittedAt: string
  owner: string
  hasPhone: boolean
  activelyBooked: boolean
  diagnosisId: string
  remark: string
}

export type Customer = Lead & {
  totalFollowUps: number
  lastContactAt: string
}

export type CaseStudy = {
  id: string
  name: string
  city: string
  community: string
  area: string
  layout: string
  familyMembers: string
  painPoints: string
  planType: string
  deviceCount: number
  sceneCount: number
  dailyAutomationCount: number
  intro: string
  solution: string
  lifeChanges: string
  image: string
  tags: string[]
  status: '上架' | '下架'
  sort: number
  featured: boolean
}

export type SolutionPlan = {
  id: string
  name: string
  intro: string
  suitableFamily: string
  suitableArea: string
  recommendedScenes: string[]
  recommendedSystems: string[]
  budgetRange: string
  displayStatus: '展示' | '隐藏'
  sort: number
}

export type AnalyticsData = {
  visits: number
  diagnosisStarts: number
  diagnosisCompleted: number
  contacts: number
  bookings: number
  deals: number
  sources: Record<string, number>
}

export type MerchantSettings = {
  brandName: string
  logo: string
  phone: string
  wechat: string
  address: string
  businessHours: string
  city: string
  bookingSuccessText: string
  frontCtaText: string
  budgetRanges: string
}

export type InfluencerPlatform = '抖音' | '小红书' | '视频号' | '快手' | '本地社群' | '其他'

export type InfluencerCategory = '同城生活' | '家居装修' | '探店达人' | '设计美学' | '亲子家庭' | '房产楼盘' | '本地网红' | '其他'

export type InfluencerStatus = '待沟通' | '已联系' | '有意向' | '已合作' | '长期合作' | '暂不合适'

export type Influencer = {
  id: string
  name: string
  platform: InfluencerPlatform
  category: InfluencerCategory
  followers: string
  city: string
  focus: string
  status: InfluencerStatus
  quoteRange: string
  contact: string
  accountLink: string
  lastCollaborationAt: string
  notes: string
  suitableContent: string[]
  communicationHistory: string[]
  cooperationSuggestion: string
}

export type ContentPlatform = '抖音' | '小红书' | '朋友圈' | '视频号' | '本地达人'

export type ContentType = '短视频' | '图文笔记' | '朋友圈' | '案例故事' | '客户问答' | '探店合作' | '直播预告'

export type ContentTopicStatus = '未开始' | '准备中' | '已拍摄' | '已发布' | '效果复盘'

export type ContentTopic = {
  id: string
  weekId: string
  title: string
  platform: ContentPlatform
  type: ContentType
  bestPublishTime: string
  goal: string
  painPoint: string
  shootingScene: string
  scriptPoints: string
  status: ContentTopicStatus
  targetCustomer: string
  hook: string
  filmingGuide: string
  script: string
  cta: string
  frontendLink: string
}

export type ContentCalendarWeek = {
  id: string
  label: string
  theme: string
  topicIds: string[]
}

export type AdminData = {
  leads: Lead[]
  diagnosisRecords: DiagnosisRecord[]
  followUps: FollowUpRecord[]
  bookings: Booking[]
  cases: CaseStudy[]
  solutions: SolutionPlan[]
  influencers: Influencer[]
  contentTopics: ContentTopic[]
  contentCalendar: ContentCalendarWeek[]
  analytics: AnalyticsData
  settings: MerchantSettings
}
