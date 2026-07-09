import awaySecurityEntry from './assets/visuals/away-security-entry.jpg'
import childRoomCare from './assets/visuals/child-room-care.jpg'
import cinemaMode from './assets/visuals/cinema-mode.jpg'
import curtainShading from './assets/visuals/curtain-shading.jpg'
import elderCarePath from './assets/visuals/elder-care-path.jpg'
import homecomingHero from './assets/visuals/homecoming-hero.jpg'
import kitchenSafety from './assets/visuals/kitchen-safety.jpg'
import layeredLighting from './assets/visuals/layered-lighting.jpg'
import morningBedroom from './assets/visuals/morning-bedroom.jpg'
import nightPathLight from './assets/visuals/night-path-light.jpg'
import petHomeCare from './assets/visuals/pet-home-care.jpg'
import sleepModeBedroom from './assets/visuals/sleep-mode-bedroom.jpg'
import smartControlPanel from './assets/visuals/smart-control-panel.jpg'

export type VisualAsset = {
  src: string
  alt: string
  position: string
  page: string
  module: string
  expression: string
  space: string
  time: string
  people: string
  light: string
  ratio: string
}

export const visuals = {
  homecomingHero: {
    src: homecomingHero,
    alt: '傍晚主人回家后玄关与客厅灯光自动亮起的高端住宅空间',
    position: '44% center',
    page: '首页',
    module: '首屏回家状态',
    expression: '主人回家，灯光、窗帘、安防进入居家状态',
    space: '玄关连接客餐厅',
    time: '傍晚/夜间',
    people: '弱人物或无人物，强调刚回家状态',
    light: '暖光开启，室内外明暗对比',
    ratio: '16:9',
  },
  morningBedroom: {
    src: morningBedroom,
    alt: '清晨阳光穿过打开窗帘进入现代卧室',
    position: '50% center',
    page: '效果体验',
    module: '07:00 起床',
    expression: '清晨唤醒，窗帘打开，自然光进入',
    space: '卧室',
    time: '清晨',
    people: '无人物',
    light: '柔和自然光',
    ratio: '3:2',
  },
  awaySecurityEntry: {
    src: awaySecurityEntry,
    alt: '离家后进入节能安防状态的安静玄关与智能门锁',
    position: '40% center',
    page: '效果体验',
    module: '08:10 离家',
    expression: '人离开后，住宅关闭、节能、安防布防',
    space: '玄关/门口',
    time: '离家后',
    people: '无人物',
    light: '低照度，部分关闭',
    ratio: '4:3',
  },
  cinemaMode: {
    src: cinemaMode,
    alt: '窗帘关闭且投影开启的暗环境家庭影院观影模式',
    position: '50% center',
    page: '效果体验/场景实验室',
    module: '观影模式',
    expression: '灯光渐暗，窗帘关闭，投影与影音启动',
    space: '家庭影院/影音客厅',
    time: '夜间',
    people: '无人物',
    light: '暗环境，局部氛围灯',
    ratio: '4:3',
  },
  sleepModeBedroom: {
    src: sleepModeBedroom,
    alt: '夜晚低照度灯带与床头灯营造的高级卧室睡眠模式',
    position: '50% center',
    page: '效果体验/场景实验室',
    module: '睡眠模式',
    expression: '晚安后低照度、关闭窗帘、睡眠温控',
    space: '主卧',
    time: '深夜',
    people: '无人物',
    light: '低照度暖光',
    ratio: '4:3',
  },
  nightPathLight: {
    src: nightPathLight,
    alt: '深夜卧室到走廊的地脚柔光路径灯',
    position: '50% center',
    page: '效果体验/解决方案',
    module: '夜间起床',
    expression: '脚落地后柔和路径灯亮起，不开刺眼主灯',
    space: '卧室到走廊',
    time: '深夜',
    people: '无人物',
    light: '地脚低亮度暖光',
    ratio: '4:3',
  },
  childRoomCare: {
    src: childRoomCare,
    alt: '柔和灯光下带学习区与床的高级儿童房',
    position: '50% center',
    page: '案例/解决方案',
    module: '儿童照护',
    expression: '儿童到家、空气温度与夜间柔光',
    space: '儿童房',
    time: '傍晚/夜间',
    people: '无人物',
    light: '柔和暖光',
    ratio: '4:3',
  },
  elderCarePath: {
    src: elderCarePath,
    alt: '老人夜间在家庭走廊中沿柔光路径安全行动',
    position: '48% center',
    page: '案例/场景实验室',
    module: '长辈守护',
    expression: '老人夜间起身，路径灯与异常提醒',
    space: '卧室到走廊/卫生间路径',
    time: '夜间',
    people: '老人背影，非医疗化',
    light: '低照度路径灯',
    ratio: '4:3',
  },
  petHomeCare: {
    src: petHomeCare,
    alt: '宠物在现代客厅中活动且智能设备融入家庭环境',
    position: '50% center',
    page: '案例/解决方案',
    module: '宠物家庭',
    expression: '无人时远程查看、温度维持与宠物设备建议',
    space: '客厅',
    time: '日间/傍晚',
    people: '无主人，有宠物',
    light: '自然光与柔和室内光',
    ratio: '4:3',
  },
  kitchenSafety: {
    src: kitchenSafety,
    alt: '现代厨房燃气灶、水槽与安全传感器细节',
    position: '44% center',
    page: '解决方案',
    module: '厨房安全',
    expression: '燃气、烟雾、漏水安全监测',
    space: '厨房',
    time: '夜间/任务照明',
    people: '无人物',
    light: '橱柜下方暖光',
    ratio: '4:3',
  },
  curtainShading: {
    src: curtainShading,
    alt: '落地窗与窗帘过滤自然光的现代客厅遮阳场景',
    position: '50% center',
    page: '解决方案',
    module: '智能遮阳',
    expression: '窗帘、自然光、遮阳变化',
    space: '客厅落地窗',
    time: '白天',
    people: '无人物',
    light: '自然光影变化',
    ratio: '4:3',
  },
  layeredLighting: {
    src: layeredLighting,
    alt: '多层暖光营造不同氛围的现代客厅智能照明场景',
    position: '50% center',
    page: '解决方案',
    module: '智能照明',
    expression: '同一空间通过灯带、壁洗、台灯形成多场景氛围',
    space: '客厅',
    time: '夜间',
    people: '无人物',
    light: '多层暖光',
    ratio: '4:3',
  },
  smartControlPanel: {
    src: smartControlPanel,
    alt: '安装在住宅墙面并融入空间的智能中控面板',
    position: '42% center',
    page: '解决方案',
    module: '智能中控',
    expression: '中控面板融入家庭环境，统一管理场景',
    space: '玄关/客厅墙面',
    time: '傍晚/夜间',
    people: '无人物',
    light: '暖光室内',
    ratio: '4:3',
  },
} satisfies Record<string, VisualAsset>

export const visualAudit = Object.values(visuals)
