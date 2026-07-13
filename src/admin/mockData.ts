import { buildDiagnosisReport, defaultDiagnosisAnswers } from '../diagnosis'
import { visuals } from '../visualAssets'
import type { AdminData, Booking, CaseStudy, ContentCalendarWeek, ContentTopic, DiagnosisRecord, FollowUpRecord, Influencer, Lead, MerchantSettings, SolutionPlan } from './types'
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

const influencers: Influencer[] = [
  {
    id: 'I-0001', name: '无锡家居探店小周', platform: '抖音', category: '探店达人', followers: '18.6 万', city: '无锡', focus: '本地家居探店、装修避坑与门店体验', status: '有意向', quoteRange: '¥6,000-9,000 / 条', contact: '微信：zhou-home-demo', accountLink: 'https://example.com/wuxi-home-zhou', lastCollaborationAt: '未合作', notes: '对“水电阶段做智能”的选题反馈积极，适合门店体验和现场讲解。', suitableContent: ['探店视频', '真实体验', '直播引流'], communicationHistory: ['07-05：已发送门店资料包', '07-08：确认可安排体验拍摄'], cooperationSuggestion: '优先合作一条“装修前最容易忽略的智能点位”探店视频，并挂家庭智能诊断入口。',
  },
  {
    id: 'I-0002', name: '靖江同城生活圈', platform: '视频号', category: '同城生活', followers: '6.8 万', city: '靖江', focus: '同城生活、品质消费与本地服务推荐', status: '已联系', quoteRange: '¥2,000-3,500 / 条', contact: '微信：jj-life-demo', accountLink: 'https://example.com/jingjiang-life', lastCollaborationAt: '未合作', notes: '受众以改善型家庭为主，适合暑期亲子居家舒适度主题。', suitableContent: ['同城种草', '业主故事'], communicationHistory: ['07-07：运营顾问完成首次沟通'], cooperationSuggestion: '结合“孩子放学到家提醒”制作一条家庭守护主题内容。',
  },
  {
    id: 'I-0003', name: '江阴装修日记', platform: '小红书', category: '家居装修', followers: '9.4 万', city: '江阴', focus: '新房装修过程、预算拆解与居住体验', status: '长期合作', quoteRange: '¥4,000-6,000 / 篇', contact: '邮箱：jiangyin-renovation@example.com', accountLink: 'https://example.com/jiangyin-renovation', lastCollaborationAt: '2026-06-26', notes: '已完成两篇装修避坑笔记，收藏率高于账号均值。', suitableContent: ['案例拍摄', '同城种草', '客户问答'], communicationHistory: ['06-18：发布智能照明避坑笔记', '06-26：发布精装房后装方案'], cooperationSuggestion: '持续做“预算 3 万和 10 万的智能差异”系列，适合小红书搜索流量。',
  },
  {
    id: 'I-0004', name: '无锡亲子生活薇薇', platform: '小红书', category: '亲子家庭', followers: '12.1 万', city: '无锡', focus: '亲子居住、儿童房与家庭安全', status: '待沟通', quoteRange: '¥5,000-8,000 / 篇', contact: '小红书私信待确认', accountLink: 'https://example.com/wuxi-parenting', lastCollaborationAt: '未合作', notes: '内容调性温和，适合儿童到家提醒、夜间柔光与空气环境方向。', suitableContent: ['真实体验', '业主故事', '同城种草'], communicationHistory: [], cooperationSuggestion: '先邀请到门店体验儿童房灯光和回家模式，再确定图文共创。',
  },
  {
    id: 'I-0005', name: '本地设计美学志', platform: '抖音', category: '设计美学', followers: '24.3 万', city: '苏州', focus: '高端住宅设计、空间美学与生活方式', status: '已合作', quoteRange: '¥12,000-18,000 / 条', contact: '微信：design-journal-demo', accountLink: 'https://example.com/design-journal', lastCollaborationAt: '2026-07-02', notes: '已完成大平层观影模式短片，适合继续拓展灯光与遮阳内容。', suitableContent: ['案例拍摄', '探店视频', '直播引流'], communicationHistory: ['06-20：确认大平层拍摄方向', '07-02：首条内容发布'], cooperationSuggestion: '以“同一客厅的会客、观影、休息三种灯光”拍摄系列短片。',
  },
]

const contentTopics: ContentTopic[] = [
  { id: 'T-0001', weekId: 'W-01', title: '为什么越来越多装修业主在水电阶段就开始考虑全屋智能？', platform: '抖音', type: '短视频', bestPublishTime: '周二 19:30', goal: '建立前置规划认知，获取装修期线索', painPoint: '担心后装返工、点位遗漏', shootingScene: '水电施工现场 + 智能面板点位示意', scriptPoints: '前置规划的三个关键节点；晚考虑会增加哪些成本。', status: '准备中', targetCustomer: '正在做水电或准备开工的新房业主', hook: '水电封槽前，有三个智能点位一旦漏掉就很难补。', filmingGuide: '用真实工地镜头开场，再切换到完成后的回家模式。', script: '先讲水电阶段为什么重要，再解释照明、窗帘、传感器的预留逻辑，最后给出一张检查清单。', cta: '点击链接做家庭智能诊断', frontendLink: '/diagnosis' },
  { id: 'T-0002', weekId: 'W-01', title: '回家模式到底能帮你省掉多少重复动作？', platform: '小红书', type: '图文笔记', bestPublishTime: '周三 12:20', goal: '用具体生活变化促进诊断转化', painPoint: '下班回家仍需逐项开灯、开空调、拉窗帘', shootingScene: '傍晚玄关到客厅的连续空间', scriptPoints: '回家前后的动作对比；适合哪些家庭；基础配置怎么做。', status: '未开始', targetCustomer: '工作忙、重视生活效率的年轻夫妻和三口之家', hook: '真正让人放松的，不是回到家，而是家先回应你。', filmingGuide: '用同一空间的“手动前”与“自动后”组图呈现。', script: '以 18:32 下班回家为时间线，拆解门锁、玄关灯、空调、窗帘和背景音乐联动。', cta: '查看同户型智能方案', frontendLink: '/experience' },
  { id: 'T-0003', weekId: 'W-01', title: '老人夜间起床，为什么建议做脚下柔光？', platform: '朋友圈', type: '朋友圈', bestPublishTime: '周四 20:10', goal: '激发有老人家庭的照护需求', painPoint: '夜间摸黑、开主灯刺眼、通行风险高', shootingScene: '卧室到卫生间的低照度路径灯', scriptPoints: '低照度、安全感、无需操作三个重点。', status: '已拍摄', targetCustomer: '与老人同住或关注父母居住安全的家庭', hook: '一个不刺眼的夜间动作，往往比复杂设备更有用。', filmingGuide: '用低机位拍脚边光线和卫生间方向引导。', script: '说明脚落地触发、路径灯渐亮和返回后自动熄灭的完整过程。', cta: '预约免费上门勘测', frontendLink: '/booking' },
  { id: 'T-0004', weekId: 'W-02', title: '孩子放学到家提醒，比摄像头更自然的守护方式', platform: '视频号', type: '客户问答', bestPublishTime: '周一 18:30', goal: '连接亲子家庭的安全需求', painPoint: '想确认孩子到家，又不希望过度监控', shootingScene: '玄关门锁、儿童房环境和家长手机提醒', scriptPoints: '开门识别、到家通知、环境舒适度三个场景。', status: '未开始', targetCustomer: '双职工三口之家', hook: '孩子回家这件事，很多父母想知道，却不想一直盯着摄像头。', filmingGuide: '不拍儿童正脸，用门锁事件和家长接收提醒表现。', script: '解释门锁开门事件如何触发家长提醒，以及儿童房温湿度的自然守护。', cta: '点击链接做家庭智能诊断', frontendLink: '/diagnosis' },
  { id: 'T-0005', weekId: 'W-02', title: '已经装修好的房子，还能不能做全屋智能？', platform: '小红书', type: '图文笔记', bestPublishTime: '周三 12:20', goal: '获取精装和已入住家庭线索', painPoint: '担心改造要砸墙、布线复杂', shootingScene: '精装客厅、无线面板和智能窗帘细节', scriptPoints: '哪些能后装；哪些需要评估；预算从哪里开始。', status: '准备中', targetCustomer: '精装未入住或已经入住的改善型家庭', hook: '不是所有智能都要砸墙，关键是别把想做的和适合做的混在一起。', filmingGuide: '展示前后装设备融入完成空间的细节。', script: '按照明、窗帘、空调、安防四类拆分后装可行性，明确评估边界。', cta: '预约免费上门勘测', frontendLink: '/booking' },
  { id: 'T-0006', weekId: 'W-02', title: '观影模式不是一个遥控器，而是一整个空间的联动', platform: '抖音', type: '短视频', bestPublishTime: '周五 20:00', goal: '展示高端体验，吸引大平层与别墅客户', painPoint: '普通电视观看缺少沉浸氛围', shootingScene: '家庭影院、关闭窗帘、投影与局部氛围灯', scriptPoints: '一键触发后空间如何变化；灯光、窗帘、影音和温度联动。', status: '未开始', targetCustomer: '重视影音体验的大平层和别墅业主', hook: '电视打开不叫观影模式，空间开始配合你才算。', filmingGuide: '从日间客厅切到暗场观影，用光线变化完成转场。', script: '展示一个指令后窗帘闭合、主灯退出、氛围灯点亮、投影启动和空调调整。', cta: '查看同户型智能方案', frontendLink: '/experience' },
  { id: 'T-0007', weekId: 'W-03', title: '全屋智能最容易踩坑的 5 个点', platform: '抖音', type: '短视频', bestPublishTime: '周二 19:30', goal: '建立专业信任并吸引咨询', painPoint: '品牌堆砌、预留不足、场景脱离生活', shootingScene: '展厅面板、施工点位与实际住宅场景对照', scriptPoints: '先规划生活，再选系统；避免只看单品。', status: '准备中', targetCustomer: '正在比较智能方案的装修业主', hook: '全屋智能最贵的坑，往往不是设备买贵，而是方案没想清楚。', filmingGuide: '每个坑对应一段真实空间或施工细节。', script: '五点分别讲点位、协议、网络、场景与售后，结尾给用户一份诊断建议。', cta: '点击链接做家庭智能诊断', frontendLink: '/diagnosis' },
  { id: 'T-0008', weekId: 'W-03', title: '智能灯光和普通灯光到底差在哪里？', platform: '朋友圈', type: '朋友圈', bestPublishTime: '周四 20:10', goal: '降低灯光系统理解门槛', painPoint: '只把智能灯光理解成手机开关', shootingScene: '同一客厅的会客、观影、休息三种光环境', scriptPoints: '不同生活状态对应不同光；开关只是最小价值。', status: '已发布', targetCustomer: '重视空间氛围与舒适度的业主', hook: '灯光的价值，不在于能不能用手机开，而在于它会不会理解你此刻在做什么。', filmingGuide: '三组同机位对比，保持家具和构图不变。', script: '用会客、亲子、观影三种状态解释亮度、色温与灯具层次的关系。', cta: '查看同户型智能方案', frontendLink: '/solutions' },
  { id: 'T-0009', weekId: 'W-04', title: '玄关门锁、灯光、窗帘、空调如何联动？', platform: '本地达人', type: '探店合作', bestPublishTime: '周六 15:00', goal: '借达人同城流量引流门店体验', painPoint: '消费者不理解多系统联动的实际价值', shootingScene: '门店样板间玄关至客餐厅', scriptPoints: '达人第一视角体验；逐项展示回家模式。', status: '准备中', targetCustomer: '同城准备装修或刚入住的品质家庭', hook: '我第一次看到门一开，家里自己开始忙起来。', filmingGuide: '达人从门外进入，完整保留门锁到客厅状态变化。', script: '由达人体验回家模式，运营人员补充配置逻辑和适用家庭。', cta: '预约免费上门勘测', frontendLink: '/booking' },
  { id: 'T-0010', weekId: 'W-04', title: '预算 3 万和 10 万的全屋智能区别在哪里？', platform: '视频号', type: '直播预告', bestPublishTime: '周五 19:00', goal: '为门店直播活动导流', painPoint: '预算不透明，担心被过度推荐', shootingScene: '门店方案墙、不同家庭平面图与样板间', scriptPoints: '预算构成；不同面积的优先级；哪些钱不该花。', status: '未开始', targetCustomer: '正在做预算规划的装修业主', hook: '同样叫全屋智能，3 万和 10 万到底多在哪里？', filmingGuide: '直播前用方案板和空间实景拍摄预告。', script: '预告直播中将拆解基础安心、舒适生活和深度智能三类方案的配置逻辑。', cta: '预约免费上门勘测', frontendLink: '/booking' },
]

const contentCalendar: ContentCalendarWeek[] = [
  { id: 'W-01', label: '第一周', theme: '装修前置规划与回家体验', topicIds: ['T-0001', 'T-0002', 'T-0003'] },
  { id: 'W-02', label: '第二周', theme: '亲子守护与精装后装', topicIds: ['T-0004', 'T-0005', 'T-0006'] },
  { id: 'W-03', label: '第三周', theme: '专业避坑与智能灯光认知', topicIds: ['T-0007', 'T-0008'] },
  { id: 'W-04', label: '第四周', theme: '达人探店与预算直播活动', topicIds: ['T-0009', 'T-0010'] },
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
  influencers,
  contentTopics,
  contentCalendar,
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
