export type DiagnosisAnswers = {
  status: string
  area: string
  returnActions: string[]
  awayConcerns: string[]
  nightLife: string[]
  members: string[]
  seniorConcerns: string[]
  childConcerns: string[]
  petConcerns: string[]
  preferences: string[]
}

export type DiagnosisReport = {
  summary: string[]
  scores: Record<'convenience' | 'security' | 'comfort' | 'entertainment' | 'care', number>
  issues: {
    title: string
    diagnosis: string
    manifestation: string
    direction: string
  }[]
  planType: string
  scenes: string[]
}

export const diagnosisStorageKey = 'smart-home-diagnosis-demo'

export const defaultDiagnosisAnswers: DiagnosisAnswers = {
  status: '正在装修',
  area: '120-160㎡',
  returnActions: [],
  awayConcerns: [],
  nightLife: [],
  members: [],
  seniorConcerns: [],
  childConcerns: [],
  petConcerns: [],
  preferences: [],
}

export const diagnosisSections = [
  {
    label: 'A. 房屋情况',
    questions: [
      { key: 'status', title: '当前状态', mode: 'single', options: ['毛坯新房', '正在装修', '精装未入住', '已经入住'] },
      { key: 'area', title: '面积', mode: 'single', options: ['80㎡以下', '80-120㎡', '120-160㎡', '160-200㎡', '200㎡以上'] },
    ],
  },
  {
    label: 'B. 回家体验',
    questions: [
      {
        key: 'returnActions',
        title: '晚上回家时，你通常需要完成哪些事情？',
        mode: 'multi',
        options: ['手动开玄关灯', '手动开客厅灯', '打开空调', '拉窗帘', '寻找遥控器', '打开音乐', '希望这些动作自动完成'],
      },
    ],
  },
  {
    label: 'C. 离家焦虑',
    questions: [
      {
        key: 'awayConcerns',
        title: '离开家后，你是否遇到过以下情况？',
        mode: 'multi',
        options: ['怀疑门是否锁好', '怀疑灯是否关闭', '担心空调忘记关闭', '担心燃气安全', '想确认老人或孩子是否到家', '希望远程查看家庭状态', '基本没有这些担忧'],
      },
    ],
  },
  {
    label: 'D. 夜间生活',
    questions: [
      {
        key: 'nightLife',
        title: '夜间起床时，你现在通常是什么情况？',
        mode: 'multi',
        options: ['摸黑寻找开关', '打开刺眼主灯', '使用手机照明', '已经有夜灯', '希望脚落地后自动亮起柔和路径灯'],
      },
    ],
  },
  {
    label: 'E. 家庭成员',
    questions: [
      { key: 'members', title: '家庭成员', mode: 'multi', options: ['独居', '夫妻或情侣', '儿童', '老人', '宠物'] },
    ],
  },
  {
    label: 'F. 核心生活偏好',
    questions: [
      {
        key: 'preferences',
        title: '你最希望家帮你改善什么？',
        mode: 'multi',
        options: ['灯光氛围', '家庭安全', '舒适环境', '生活省心', '老人照护', '儿童照护', '影音娱乐', '节能管理'],
      },
    ],
  },
] as const

export const conditionalQuestions = {
  老人: {
    key: 'seniorConcerns',
    label: '老人照护补充',
    title: '关于老人照护，你还关注哪些问题？',
    options: ['是否担心老人夜间起床安全？', '是否担心燃气忘关？', '是否希望出现异常情况时及时收到提醒？'],
  },
  儿童: {
    key: 'childConcerns',
    label: '儿童照护补充',
    title: '关于儿童照护，你还关注哪些问题？',
    options: ['是否希望知道孩子是否安全到家？', '是否关注儿童房空气与温度？', '是否需要夜间柔和灯光？'],
  },
  宠物: {
    key: 'petConcerns',
    label: '宠物照护补充',
    title: '关于宠物照护，你还关注哪些问题？',
    options: ['是否需要远程查看？', '是否关注无人时环境温度？', '是否需要宠物相关智能设备建议？'],
  },
} as const

export function buildDiagnosisReport(answers: DiagnosisAnswers): DiagnosisReport {
  const returnLoad = answers.returnActions.filter((item) => item !== '希望这些动作自动完成').length
  const awayLoad = answers.awayConcerns.includes('基本没有这些担忧') ? 0 : answers.awayConcerns.length
  const nightLoad = answers.nightLife.filter((item) => item !== '已经有夜灯').length
  const careLoad = answers.seniorConcerns.length + answers.childConcerns.length + answers.petConcerns.length
  const hasSenior = answers.members.includes('老人')
  const hasChild = answers.members.includes('儿童')
  const hasPet = answers.members.includes('宠物')

  const scores = {
    convenience: clampScore(54 + returnLoad * 6 + nightLoad * 4 + preferenceBonus(answers, ['生活省心', '灯光氛围'])),
    security: clampScore(50 + awayLoad * 7 + (hasSenior ? 8 : 0) + preferenceBonus(answers, ['家庭安全', '节能管理'])),
    comfort: clampScore(52 + nightLoad * 5 + returnLoad * 3 + preferenceBonus(answers, ['舒适环境', '灯光氛围'])),
    entertainment: clampScore(38 + (answers.preferences.includes('影音娱乐') ? 24 : 0) + (answers.returnActions.includes('寻找遥控器') ? 10 : 0)),
    care: clampScore(40 + careLoad * 8 + (hasSenior ? 14 : 0) + (hasChild ? 12 : 0) + (hasPet ? 8 : 0)),
  }

  const issuePool = [
    {
      weight: returnLoad * 10 + (answers.returnActions.includes('希望这些动作自动完成') ? 14 : 0),
      title: '回家过程重复操作较多',
      diagnosis: '回家后的灯光、温度、窗帘和音乐仍依赖手动处理，舒适感发生得太晚。',
      manifestation: '开门后需要先找开关、找遥控器，再逐个把空间调整到适合停留的状态。',
      direction: '建立回家模式，以门锁或人体感应触发玄关灯、客厅灯、空调、窗帘和安防状态切换。',
    },
    {
      weight: awayLoad * 12,
      title: '离家安全焦虑较高',
      diagnosis: '离家后的不确定感主要来自门锁、灯光、空调、燃气和家庭成员状态无法被统一确认。',
      manifestation: '出门后反复回想是否关灯、关空调、锁门，或想知道老人孩子是否安全到家。',
      direction: '建立离家模式和远程家庭状态面板，联动门锁、门窗、灯光、空调、燃气和布防提醒。',
    },
    {
      weight: nightLoad * 11,
      title: '夜间生活便利性不足',
      diagnosis: '夜间起床时，照明方式要么不够安全，要么破坏睡眠节奏。',
      manifestation: '摸黑找开关、用手机照明，或打开刺眼主灯后影响自己和家人继续入睡。',
      direction: '设置床边、走廊和卫生间低亮度路径灯，脚落地或人体经过时自动柔和亮起。',
    },
    {
      weight: hasSenior ? 45 + answers.seniorConcerns.length * 10 : 0,
      title: '老人照护需要更及时的家庭反馈',
      diagnosis: '老人相关风险不一定来自复杂设备，而是夜间通行、燃气和异常状态缺少及时提醒。',
      manifestation: '家人不在身边时，很难知道老人是否夜间起身、厨房是否安全、是否出现异常停留。',
      direction: '增加老人房夜间柔光、厨房燃气复核、异常长时间静止提醒和紧急求助建议。',
    },
    {
      weight: hasChild ? 42 + answers.childConcerns.length * 10 : 0,
      title: '儿童安全与环境状态需要被看见',
      diagnosis: '孩子到家、儿童房空气温度和夜间照明，会影响家庭安全感与居住舒适度。',
      manifestation: '父母想知道孩子是否安全到家，也关注夜间灯光是否柔和、房间环境是否稳定。',
      direction: '配置孩子到家通知、儿童房环境监测、夜间柔光和睡眠环境控制。',
    },
    {
      weight: hasPet ? 34 + answers.petConcerns.length * 9 : 0,
      title: '无人时宠物环境缺少持续保障',
      diagnosis: '宠物家庭最需要的是离家后的可见状态和温度环境稳定。',
      manifestation: '外出时会担心家中温度、空气和宠物活动情况。',
      direction: '增加远程查看、环境温度维持、异常提醒和宠物相关设备预留建议。',
    },
  ]

  const issues = issuePool
    .sort((a, b) => b.weight - a.weight)
    .filter((issue) => issue.weight > 0)
    .slice(0, 3)
    .map(({ title, diagnosis, manifestation, direction }) => ({ title, diagnosis, manifestation, direction }))

  const planType =
    scores.security >= 82 && scores.care >= 70
      ? '照护安全型全屋智能方案'
      : scores.convenience >= 80 && scores.comfort >= 74
        ? '舒适省心型全屋智能方案'
        : scores.entertainment >= 64
          ? '影音氛围型全屋智能方案'
          : '舒适安全型全屋智能方案'

  const scenes = unique([
    '回家模式',
    '离家模式',
    nightLoad > 0 ? '夜间起床' : '',
    hasChild ? '儿童到家提醒' : '',
    awayLoad > 0 ? '安全监测' : '',
    '睡眠模式',
    hasSenior ? '长辈守护' : '',
    hasPet ? '宠物远程查看' : '',
    answers.preferences.includes('影音娱乐') ? '观影模式' : '',
  ]).filter(Boolean)

  return {
    summary: [answers.area, familyLabel(answers), statusLabel(answers.status)],
    scores,
    issues,
    planType,
    scenes,
  }
}

function preferenceBonus(answers: DiagnosisAnswers, keys: string[]) {
  return keys.reduce((sum, key) => sum + (answers.preferences.includes(key) ? 8 : 0), 0)
}

function clampScore(value: number) {
  return Math.max(36, Math.min(96, value))
}

function familyLabel(answers: DiagnosisAnswers) {
  if (answers.members.includes('儿童') && answers.members.includes('老人')) return '多代同住家庭'
  if (answers.members.includes('儿童')) return '三口之家'
  if (answers.members.includes('老人')) return '有老人家庭'
  if (answers.members.includes('宠物')) return '宠物家庭'
  return answers.members[0] || '家庭成员待确认'
}

function statusLabel(status: string) {
  return status.includes('装修') || status.includes('毛坯') ? '新房装修阶段' : status
}

function unique(items: string[]) {
  return Array.from(new Set(items))
}
