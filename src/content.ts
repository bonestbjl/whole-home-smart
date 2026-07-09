import { visuals } from './visualAssets'

export type DayMoment = {
  time: string
  title: string
  image: string
  imagePosition: string
  tone: string
  now: string[]
  smart: string[]
  story: string
  devices: string[][]
}

export type SmartCase = {
  id: string
  category: string
  place: string
  area: string
  family: string
  coreProblem: string
  planType: string
  devices: string
  scenes: string
  daily: string
  image: string
  imagePosition: string
  background: string
  goals: string[]
  sceneDesign: string[]
  systems: string[]
  changes: string[]
}

export type SolutionSystem = {
  title: string
  problem: string
  solution: string
  scenes: string
  family: string
  devices: string
  image: string
  imagePosition: string
}

export const homeScene = {
  image: visuals.homecomingHero.src,
  imagePosition: visuals.homecomingHero.position,
  status: ['门锁识别成功', '玄关灯开启', '客厅空调进入舒适模式', '窗帘关闭', '安防切换为居家状态'],
}

export const dayMoments: DayMoment[] = [
  {
    time: '07:00',
    title: '起床',
    image: visuals.morningBedroom.src,
    imagePosition: visuals.morningBedroom.position,
    tone: 'morning',
    now: ['手机闹钟响起', '手动拉开窗帘', '开灯后光线刺眼', '重新调节空调'],
    smart: ['窗帘缓慢开启', '灯光渐亮至 30%', '温度进入舒适模式', '轻音乐低音量播放'],
    story: '不是闹钟把你叫醒，而是阳光、温度与音乐，让身体慢慢回到清晨。',
    devices: [['窗帘', '30% -> 100%'], ['灯光', '0% -> 30%'], ['空调', '睡眠模式 -> 舒适模式'], ['音乐', '轻音乐播放']],
  },
  {
    time: '08:10',
    title: '离家',
    image: visuals.awaySecurityEntry.src,
    imagePosition: visuals.awaySecurityEntry.position,
    tone: 'away',
    now: ['检查灯光', '检查空调', '检查门窗', '确认门锁', '担心燃气'],
    smart: ['触发离家模式', '全屋灯光关闭', '空调进入节能状态', '窗帘调整', '安全系统布防', '异常设备状态提醒'],
    story: '门锁完成上锁后，全屋进入低能耗状态，安防与传感开始接管。',
    devices: [['照明', '全屋关闭'], ['空调', '节能待机'], ['安防', '布防完成'], ['窗帘', '隐私模式']],
  },
  {
    time: '18:30',
    title: '回家',
    image: visuals.homecomingHero.src,
    imagePosition: visuals.homecomingHero.position,
    tone: 'home',
    now: ['摸黑开玄关灯', '打开客厅灯', '寻找空调遥控器', '拉上窗帘'],
    smart: ['门锁识别成功', '玄关灯自动亮起', '客厅灯光 45% 暖光', '空调调整至 24℃', '窗帘自动关闭'],
    story: '玄关先亮，客厅随后变暖，家在你开门之前已经准备好。',
    devices: [['玄关灯', '自动开启'], ['客厅灯光', '45% 暖光'], ['空调', '24℃'], ['安防', '居家状态']],
  },
  {
    time: '20:00',
    title: '家庭活动',
    image: visuals.layeredLighting.src,
    imagePosition: visuals.layeredLighting.position,
    tone: 'family',
    now: ['餐厅灯光不够柔和', '客厅温度需要反复调', '音乐和灯光各自操作'],
    smart: ['餐厅灯 65% 暖光', '新风低噪运行', '中控切换家庭场景', '窗帘半开保持隐私'],
    story: '灯光变得柔和，餐客厅保持舒适温度，每个人都自然停留在一起。',
    devices: [['餐厅灯', '65% 暖光'], ['空气', '新风低噪运行'], ['中控', '家庭场景'], ['窗帘', '半开']],
  },
  {
    time: '22:30',
    title: '观影',
    image: visuals.cinemaMode.src,
    imagePosition: visuals.cinemaMode.position,
    tone: 'cinema',
    now: ['关灯', '拉窗帘', '打开投影', '调整音响', '手机消息打扰'],
    smart: ['一键观影模式', '灯光降至 15%', '窗帘关闭', '投影与音响启动', '手机减少打扰'],
    story: '一个动作触发灯光渐暗、窗帘合拢与影音启动，客厅进入影院状态。',
    devices: [['灯光', '15% 暗场'], ['窗帘', '关闭'], ['投影', '启动'], ['手机', '减少打扰']],
  },
  {
    time: '23:50',
    title: '睡眠',
    image: visuals.sleepModeBedroom.src,
    imagePosition: visuals.sleepModeBedroom.position,
    tone: 'night',
    now: ['逐个关灯', '确认门窗', '夜间起床摸黑', '打开主灯影响睡意'],
    smart: ['一句晚安', '全屋灯光关闭', '夜间地脚灯待命', '空调睡眠曲线', '安防夜间守护'],
    story: '睡眠模式不是关掉一切，而是保留夜间需要的安全、温度与柔光。',
    devices: [['主灯', '关闭'], ['夜灯', '感应待命'], ['空调', '睡眠曲线'], ['安防', '夜间守护']],
  },
]

export const labScenes = [
  { title: '观影模式', image: visuals.cinemaMode.src, imagePosition: visuals.cinemaMode.position, action: '按下观影', steps: ['客厅主灯渐暗', '窗帘关闭', '投影与音响启动', '手机减少打扰'] },
  { title: '睡眠模式', image: visuals.sleepModeBedroom.src, imagePosition: visuals.sleepModeBedroom.position, action: '一句晚安', steps: ['全屋灯光熄灭', '主卧温度进入睡眠曲线', '夜间地脚灯待命', '安防转入夜间守护'] },
  { title: '离家模式', image: visuals.awaySecurityEntry.src, imagePosition: visuals.awaySecurityEntry.position, action: '门锁上锁', steps: ['灯光全部关闭', '空调节能运行', '窗帘进入隐私状态', '门窗传感布防'] },
  { title: '长辈守护', image: visuals.elderCarePath.src, imagePosition: visuals.elderCarePath.position, action: '夜间起身', steps: ['床边灯轻亮', '走廊地脚灯联动', '燃气与门锁复核', '异常静止提醒'] },
]

export const solutionSystems: SolutionSystem[] = [
  { title: '智能照明', problem: '开关分散、夜间刺眼、灯光氛围单一。', solution: '通过分区调光、人体感应和场景预设，让光线跟随时间与活动变化。', scenes: '回家、起夜、观影、会客、儿童睡眠。', family: '重视氛围、老人儿童夜间通行、无主灯设计家庭。', devices: '调光模块、智能开关、人体传感、场景面板。', image: visuals.layeredLighting.src, imagePosition: visuals.layeredLighting.position },
  { title: '智能遮阳', problem: '忘记拉窗帘、隐私和采光需要反复手动调整。', solution: '根据时间、日照、观影和离家状态自动开合窗帘。', scenes: '清晨唤醒、午后遮阳、观影、离家隐私。', family: '大窗景住宅、客厅阳台、卧室舒适需求强的家庭。', devices: '窗帘电机、轨道、光照传感、场景面板。', image: visuals.curtainShading.src, imagePosition: visuals.curtainShading.position },
  { title: '智能安防', problem: '离家后担心门锁、燃气、门窗和老人儿童状态。', solution: '门锁、门窗、燃气、烟感和摄像能力联动，异常状态及时提醒。', scenes: '离家布防、夜间守护、燃气提醒、孩子到家通知。', family: '有老人儿童、经常出差、关注安全边界的家庭。', devices: '智能门锁、门窗传感、烟感、燃气传感、摄像设备。', image: visuals.awaySecurityEntry.src, imagePosition: visuals.awaySecurityEntry.position },
  { title: '智能温控', problem: '空调反复调节、不同房间舒适度不一致。', solution: '结合时间、房间状态和家庭习惯，形成舒适节能的温度曲线。', scenes: '回家预冷、睡眠温控、离家节能、老人房恒温。', family: '重视舒适和节能、房间多、老人儿童敏感家庭。', devices: '空调控制器、温湿度传感、地暖控制、新风联动。', image: visuals.petHomeCare.src, imagePosition: visuals.petHomeCare.position },
  { title: '智能环境', problem: '空气、湿度和异味变化不易被及时察觉。', solution: '持续监测空气质量，并联动新风、空调或提醒开窗。', scenes: '儿童房空气、烹饪排风、睡眠环境、宠物无人环境。', family: '有儿童、宠物、老人或空气敏感成员的家庭。', devices: '空气传感、温湿度传感、新风控制、净化设备联动。', image: visuals.childRoomCare.src, imagePosition: visuals.childRoomCare.position },
  { title: '智能影音', problem: '观影前设备多、操作分散、氛围难统一。', solution: '把灯光、窗帘、投影、音响和免打扰状态整合为一个场景。', scenes: '观影、游戏、家庭影院、周末娱乐。', family: '喜欢影音娱乐、客厅影院或独立影音室家庭。', devices: '投影联动、音响控制、灯光场景、窗帘控制。', image: visuals.cinemaMode.src, imagePosition: visuals.cinemaMode.position },
  { title: '智能中控', problem: '设备越多越难用，家人不愿学习复杂 App。', solution: '把复杂设备收束到场景面板、语音和自动化规则中。', scenes: '一键回家、离家、晚安、会客、清洁。', family: '全屋系统较完整、多人共同使用、重视稳定交付的家庭。', devices: '中控主机、场景面板、语音网关、自动化规则。', image: visuals.smartControlPanel.src, imagePosition: visuals.smartControlPanel.position },
]

export const floorRooms = {
  玄关: { name: '玄关智慧方案', items: ['智能门锁 x 1', '人体感应 x 1', '玄关灯光联动 x 2', '离家模式 x 1'] },
  客厅: { name: '客厅智慧方案', items: ['智能照明 x 6', '智能窗帘 x 2', '人体传感 x 1', '环境传感 x 1', '中控面板 x 1', '影音联动 x 1'] },
  主卧: { name: '主卧智慧方案', items: ['睡眠模式 x 1', '智能窗帘 x 2', '温控联动 x 1', '夜间感应灯 x 2'] },
  儿童房: { name: '儿童房智慧方案', items: ['夜间柔光 x 2', '空气环境监测 x 1', '睡眠环境控制 x 1', '异常状态提醒 x 1'] },
  厨房: { name: '厨房智慧方案', items: ['烟雾监测 x 1', '燃气监测 x 1', '漏水监测 x 1', '台面灯光联动 x 2'] },
}

export const smartCases: SmartCase[] = [
  {
    id: 'family-child-128',
    category: '三口之家',
    place: '无锡 · 某高端住宅',
    area: '128㎡',
    family: '夫妻 + 儿童',
    coreProblem: '孩子回家提醒、夜间柔光和离家安全焦虑。',
    planType: '舒适安全型全屋智能方案',
    devices: '42',
    scenes: '11',
    daily: '18',
    image: visuals.childRoomCare.src,
    imagePosition: visuals.childRoomCare.position,
    background: '业主正在装修新房，希望减少重复操作，同时让孩子回家和夜间生活更安心。',
    goals: ['回家、离家、睡眠形成自动化', '儿童房空气与夜间灯光更舒适', '门锁、燃气和门窗状态可远程确认'],
    sceneDesign: ['孩子开门后父母收到到家提醒', '夜间起床脚边柔光自动亮起', '离家后全屋关闭并布防'],
    systems: ['智能照明', '智能安防', '环境监测', '智能温控', '智能中控'],
    changes: ['早晨唤醒更自然', '离家不用反复确认', '孩子到家有明确反馈', '夜间起床不再刺眼'],
  },
  {
    id: 'senior-flat-168',
    category: '有老人家庭',
    place: '苏州 · 湖景平层',
    area: '168㎡',
    family: '夫妻 + 老人',
    coreProblem: '老人夜间起床、燃气安全和异常状态提醒。',
    planType: '照护安全型全屋智能方案',
    devices: '58',
    scenes: '16',
    daily: '26',
    image: visuals.elderCarePath.src,
    imagePosition: visuals.elderCarePath.position,
    background: '家庭成员希望在不打扰老人生活习惯的前提下，提高夜间通行和厨房安全。',
    goals: ['老人房夜间柔光路径', '厨房燃气和烟雾提醒', '异常长时间静止提醒'],
    sceneDesign: ['老人起床后床边灯和走廊灯低亮', '燃气异常时家庭成员同步提醒', '晚安模式复核门窗与厨房安全'],
    systems: ['智能照明', '智能安防', '智能环境', '智能中控'],
    changes: ['夜间通行更安心', '厨房风险更早发现', '家属少了远程担忧'],
  },
  {
    id: 'pet-youth-95',
    category: '宠物家庭',
    place: '上海 · 精装改善房',
    area: '95㎡',
    family: '独居青年 + 宠物',
    coreProblem: '无人时宠物环境温度、远程查看和回家体验。',
    planType: '省心舒适型智能改造方案',
    devices: '36',
    scenes: '9',
    daily: '15',
    image: visuals.petHomeCare.src,
    imagePosition: visuals.petHomeCare.position,
    background: '业主已入住，希望尽量少动装修，通过轻改造让日常和宠物照护更省心。',
    goals: ['回家自动进入舒适状态', '无人时保持宠物舒适温度', '可远程查看家庭状态'],
    sceneDesign: ['主人到家前空调进入舒适模式', '温度异常时提醒并联动空调', '离家后门锁和摄像状态自动复核'],
    systems: ['智能温控', '智能安防', '环境监测', '智能照明'],
    changes: ['回家不再摸黑找遥控器', '出门后能确认宠物状态', '轻改造也能形成完整场景'],
  },
]
