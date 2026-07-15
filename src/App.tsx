import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Location } from 'react-router-dom'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  dayMoments,
  floorRooms,
  homeScene,
  labScenes,
  smartCases,
  solutionSystems,
} from './content'
import {
  buildDiagnosisReport,
  conditionalQuestions,
  defaultDiagnosisAnswers,
  diagnosisSections,
  diagnosisStorageKey,
} from './diagnosis'
import type { DiagnosisAnswers } from './diagnosis'
import AdminApp from './admin/AdminApp'
import { visuals } from './visualAssets'
import './App.css'

type AnswerKey = keyof DiagnosisAnswers

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<FrontendApp />} />
      </Routes>
    </BrowserRouter>
  )
}

function FrontendApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
        <Route path="/diagnosis/result" element={<DiagnosisResultPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Layout>
  )
}

function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = [
    ['首页', '/'],
    ['智能诊断', '/diagnosis'],
    ['效果体验', '/experience'],
    ['智慧案例', '/cases'],
    ['解决方案', '/solutions'],
    ['预约设计', '/booking'],
  ]

  return (
    <div className="app">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="全屋智能首页">
          <span className="brand-mark">H</span>
          <span>全屋智能</span>
        </Link>
        <button className="menu-button" onClick={() => setMobileOpen((open) => !open)} type="button">
          菜单
        </button>
        <nav className={mobileOpen ? 'open' : ''} onClick={() => setMobileOpen(false)}>
          {navItems.map(([label, to]) => (
            <NavLink className={({ isActive }) => (isActive ? 'active' : '')} key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="header-cta" to="/diagnosis">
          开始智能诊断
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero-section page-home">
        <img src={homeScene.image} alt="夜间高级现代住宅回家场景" className="hero-bg" style={{ objectPosition: homeScene.imagePosition }} />
        <div className="hero-shade" />
        <div className="hero-content reveal">
          <p className="eyebrow">Home Intelligence Diagnosis</p>
          <h1>你的家，真的了解你的生活吗？</h1>
          <p className="hero-copy">
            用 2 分钟完成家庭智能诊断，看看哪些重复动作、生活焦虑和家庭需求，其实可以交给家自动完成。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/diagnosis">
              开始家庭智能诊断
            </Link>
            <Link className="ghost-button" to="/experience">
              先看看智能生活效果
            </Link>
          </div>
        </div>
        <div className="live-panel reveal" aria-label="智能住宅实时状态面板">
          <div className="panel-top">
            <span>18:32</span>
            <strong>主人回家</strong>
          </div>
          <h2>家正在自动切换状态</h2>
          {homeScene.status.map((item, index) => (
            <div className="status-row" key={item} style={{ animationDelay: `${index * 0.18}s` }}>
              <span />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="section value-section reveal">
        <div className="section-heading">
          <p className="eyebrow">Why Diagnose First</p>
          <h2>不是先看设备，而是先看你的生活里有哪些问题可以被解决。</h2>
        </div>
        <div className="value-grid">
          {[
            ['重复动作', '每天开灯、拉窗帘、调空调、确认门锁，看似小事，却反复消耗注意力。'],
            ['生活焦虑', '离家后的门锁、燃气、老人儿童状态，需要被系统地感知和反馈。'],
            ['家庭需求', '儿童、老人、宠物、影音和节能需求不同，适合的全屋方案也应该不同。'],
          ].map(([title, copy]) => (
            <article className="value-card" key={title}>
              <span />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="generator-banner reveal">
        <div>
          <p className="eyebrow">Start With Your Home</p>
          <h2>先完成诊断，生成属于你的家庭智能报告。</h2>
          <p>诊断会从回家、离家、夜间生活和家庭成员需求出发，给出问题、评分、推荐场景和方案方向。</p>
        </div>
        <Link className="primary-button" to="/diagnosis">
          开始智能诊断
        </Link>
      </section>
    </>
  )
}

function DiagnosisPage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<DiagnosisAnswers>(() => readStoredDiagnosis() ?? defaultDiagnosisAnswers)

  const setSingle = (key: AnswerKey, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  const toggleMulti = (key: AnswerKey, value: string) => {
    setAnswers((current) => {
      const list = current[key] as string[]
      let next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      if (key === 'awayConcerns' && value === '基本没有这些担忧' && !list.includes(value)) next = ['基本没有这些担忧']
      if (key === 'awayConcerns' && value !== '基本没有这些担忧') next = next.filter((item) => item !== '基本没有这些担忧')
      return { ...current, [key]: next }
    })
  }

  const submitDiagnosis = () => {
    localStorage.setItem(diagnosisStorageKey, JSON.stringify(answers))
    navigate('/diagnosis/result', { state: { answers } })
  }

  return (
    <section className="section diagnosis-page">
      <PageIntro
        eyebrow="Lifestyle Diagnosis"
        title="家庭智能诊断"
        copy="这不是报价问卷，而是从你的日常动作、离家焦虑、夜间生活和家庭成员需求里，找到全屋智能真正应该解决的问题。"
      />
      <div className="diagnosis-layout">
        <div className="diagnosis-sections">
          {diagnosisSections.map((section) => (
            <article className="diagnosis-card reveal" key={section.label}>
              <p className="eyebrow">{section.label}</p>
              {section.questions.map((question) => (
                <QuestionBlock
                  answers={answers}
                  key={question.key}
                  mode={question.mode}
                  options={[...question.options]}
                  title={question.title}
                  valueKey={question.key as AnswerKey}
                  onSingle={setSingle}
                  onToggle={toggleMulti}
                />
              ))}
            </article>
          ))}
          {(['老人', '儿童', '宠物'] as const).map((member) => {
            const question = conditionalQuestions[member]
            return answers.members.includes(member) ? (
              <article className="diagnosis-card reveal" key={member}>
                <p className="eyebrow">{question.label}</p>
                <QuestionBlock
                  answers={answers}
                  mode="multi"
                  options={[...question.options]}
                  title={question.title}
                  valueKey={question.key as AnswerKey}
                  onSingle={setSingle}
                  onToggle={toggleMulti}
                />
              </article>
            ) : null
          })}
        </div>
        <aside className="diagnosis-summary">
          <span>Diagnosis Profile</span>
          <strong>{answers.area}</strong>
          <p>{answers.status}</p>
          <p>{answers.members.length ? answers.members.join(' / ') : '请选择家庭成员'}</p>
          <p>{answers.preferences.slice(0, 4).join(' / ') || '请选择核心偏好'}</p>
          <button className="primary-button" onClick={submitDiagnosis} type="button">
            生成我的家庭智能诊断报告
          </button>
        </aside>
      </div>
    </section>
  )
}

function QuestionBlock({
  answers,
  mode,
  onSingle,
  onToggle,
  options,
  title,
  valueKey,
}: {
  answers: DiagnosisAnswers
  mode: string
  onSingle: (key: AnswerKey, value: string) => void
  onToggle: (key: AnswerKey, value: string) => void
  options: string[]
  title: string
  valueKey: AnswerKey
}) {
  return (
    <div className="question-block">
      <h3>{title}</h3>
      <div className="option-grid">
        {options.map((option) => {
          const value = answers[valueKey]
          const selected = Array.isArray(value) ? value.includes(option) : value === option
          return (
            <button
              className={selected ? 'selected' : ''}
              key={option}
              onClick={() => (mode === 'single' ? onSingle(valueKey, option) : onToggle(valueKey, option))}
              type="button"
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DiagnosisResultPage() {
  const location = useLocation() as Location<{ answers?: DiagnosisAnswers }>
  const answers = location.state?.answers ?? readStoredDiagnosis()
  const report = useMemo(() => (answers ? buildDiagnosisReport(answers) : null), [answers])

  if (!answers || !report) {
    return (
      <section className="section empty-result">
        <PageIntro eyebrow="Report Missing" title="还没有可用的诊断结果" copy="请先完成家庭智能诊断。完成后刷新页面也会保留最近一次诊断结果。" />
        <Link className="primary-button" to="/diagnosis">
          开始智能诊断
        </Link>
      </section>
    )
  }

  return (
    <section className="section result-page">
      <div className="result-panel reveal">
        <div className="result-head">
          <div>
            <p className="eyebrow">Diagnosis Report</p>
            <h2>{report.planType}</h2>
            <p>{report.summary.join(' · ')}</p>
          </div>
          <div className="budget-box">
            <span>推荐家庭方案类型</span>
            <strong>{report.planType}</strong>
            <p>以下结果基于生活方式诊断生成，设计师可结合户型与预算进一步深化。</p>
          </div>
        </div>

        <div className="result-visual-strip">
          {[visuals.homecomingHero, visuals.nightPathLight, visuals.smartControlPanel].map((asset) => (
            <img key={asset.module} src={asset.src} alt={asset.alt} style={{ objectPosition: asset.position }} />
          ))}
        </div>

        <div className="score-grid">
          {[
            ['便利体验', report.scores.convenience],
            ['安全需求', report.scores.security],
            ['舒适需求', report.scores.comfort],
            ['影音需求', report.scores.entertainment],
            ['家庭照护', report.scores.care],
          ].map(([label, score]) => (
            <article key={label}>
              <strong>{score}</strong>
              <span>{label}</span>
              <i style={{ height: `${score}%` }} />
            </article>
          ))}
        </div>

        <div className="issue-grid">
          {report.issues.map((issue) => (
            <article key={issue.title}>
              <h3>{issue.title}</h3>
              <p><b>诊断说明：</b>{issue.diagnosis}</p>
              <p><b>生活表现：</b>{issue.manifestation}</p>
              <p><b>解决方向：</b>{issue.direction}</p>
            </article>
          ))}
        </div>

        <div className="scene-tags">
          <h3>推荐核心场景</h3>
          <div>
            {report.scenes.map((scene) => (
              <span key={scene}>{scene}</span>
            ))}
          </div>
        </div>

        <div className="hero-actions result-actions">
          <Link className="primary-button" to="/experience">
            查看智能之后的一天
          </Link>
          <Link className="ghost-button" to="/cases">
            查看类似家庭案例
          </Link>
          <Link className="ghost-button" to="/booking">
            预约设计师完善方案
          </Link>
        </div>
      </div>
    </section>
  )
}

function ExperiencePage() {
  const [activeDay, setActiveDay] = useState(2)
  const [activeLab, setActiveLab] = useState(0)
  const day = dayMoments[activeDay]
  const lab = labScenes[activeLab]

  return (
    <>
      <section className={`section day-section ${day.tone}`}>
        <PageIntro eyebrow="Before / After Smart Living" title="同样的一天，不一样的生活方式。" copy="按照真实家庭一天中的关键时刻，对比安装前和智能之后的生活变化。" />
        <div className="day-experience reveal">
          <div className="timeline" aria-label="智能生活效果时间线">
            {dayMoments.map((moment, index) => (
              <button className={activeDay === index ? 'active' : ''} key={moment.time} onClick={() => setActiveDay(index)} type="button">
                <strong>{moment.time}</strong>
                <span>{moment.title}</span>
              </button>
            ))}
          </div>
          <div className="scene-stage">
            <img src={day.image} alt={`${day.title}住宅场景`} style={{ objectPosition: day.imagePosition }} />
            <div className="scene-overlay" />
            <div className="scene-copy">
              <p>{day.time}</p>
              <h3>{day.title}</h3>
              <span>{day.story}</span>
            </div>
            <div className="before-after-panel">
              <CompareList title="现在" items={day.now} />
              <CompareList title="智能之后" items={day.smart} />
            </div>
          </div>
        </div>
      </section>

      <section className="section lab-section">
        <div className="section-heading reveal">
          <p className="eyebrow">Scene Laboratory</p>
          <h2>一个动作，触发多个空间和设备变化。</h2>
        </div>
        <div className="lab-layout reveal">
          <div className="lab-cards">
            {labScenes.map((scene, index) => (
              <button className={activeLab === index ? 'active' : ''} key={scene.title} onClick={() => setActiveLab(index)} type="button">
                {scene.title}
              </button>
            ))}
          </div>
          <article className="lab-detail">
            <img src={lab.image} alt={`${lab.title}智能场景`} style={{ objectPosition: lab.imagePosition }} />
            <div className="lab-flow">
              <p>{lab.action}</p>
              <h3>{lab.title}</h3>
              <div className="flow-line">
                {lab.steps.map((item, index) => (
                  <span key={item} style={{ animationDelay: `${index * 0.18}s` }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

function CompareList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h4>{title}</h4>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  )
}

function CasesPage() {
  const categories = ['全部', '三口之家', '有老人家庭', '独居青年', '宠物家庭', '大平层', '别墅住宅']
  const [active, setActive] = useState('全部')
  const visibleCases = active === '全部' ? smartCases : smartCases.filter((item) => item.category === active)

  return (
    <section className="section cases-section">
      <PageIntro eyebrow="Family Case Library" title="智慧案例按家庭类型组织。" copy="重点不是设备清单，而是这个家庭的生活发生了什么改变。" />
      <div className="category-tabs">
        {categories.map((category) => (
          <button className={active === category ? 'active' : ''} key={category} onClick={() => setActive(category)} type="button">
            {category}
          </button>
        ))}
      </div>
      <div className="case-grid reveal">
        {visibleCases.map((item) => (
          <article key={item.id}>
            <img src={item.image} alt={item.place} style={{ objectPosition: item.imagePosition }} />
            <div>
              <p>{item.category} · {item.place}</p>
              <h3>{item.area} · {item.family}</h3>
              <p className="case-story">核心问题：{item.coreProblem}</p>
              <p className="case-story">推荐方案：{item.planType}</p>
              <div className="case-stats">
                <span><strong>{item.devices}</strong>智能设备</span>
                <span><strong>{item.scenes}</strong>核心场景</span>
                <span><strong>{item.daily}</strong>每日自动执行</span>
              </div>
              <Link className="ghost-button" to={`/cases/${item.id}`}>
                查看完整方案
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CaseDetailPage() {
  const { id } = useParams()
  const item = smartCases.find((caseItem) => caseItem.id === id) ?? smartCases[0]

  return (
    <section className="section case-detail-page">
      <div className="case-detail-hero reveal">
        <img src={item.image} alt={item.place} style={{ objectPosition: item.imagePosition }} />
        <div>
          <p className="eyebrow">{item.category}</p>
          <h1>{item.place}</h1>
          <p>{item.area} · {item.family} · {item.planType}</p>
        </div>
      </div>
      <div className="detail-grid">
        <DetailBlock title="项目背景" items={[item.background]} />
        <DetailBlock title="原始生活问题" items={[item.coreProblem]} />
        <DetailBlock title="设计目标" items={item.goals} />
        <DetailBlock title="智能场景设计" items={item.sceneDesign} />
        <DetailBlock title="系统配置" items={item.systems} />
        <DetailBlock title="生活变化" items={item.changes} />
      </div>
      <div className="day-mini">
        {dayMoments.map((moment) => (
          <article key={moment.time}>
            <strong>{moment.time}</strong>
            <span>{moment.title}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function DetailBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <article>
      <h3>{title}</h3>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </article>
  )
}

function SolutionsPage() {
  const [activeSystem, setActiveSystem] = useState(0)
  const [activeRoom, setActiveRoom] = useState<keyof typeof floorRooms>('客厅')
  const system = solutionSystems[activeSystem]

  return (
    <>
      <section className="section systems-section reveal">
        <PageIntro eyebrow="Whole-home Solutions" title="全屋解决方案从生活问题开始，而不是从设备参数开始。" copy="每个系统都对应一个具体生活问题，再落到典型场景、适用家庭和设备类型。" />
        <div className="systems-layout">
          <div className="system-list">
            {solutionSystems.map((item, index) => (
              <button className={activeSystem === index ? 'active' : ''} key={item.title} onClick={() => setActiveSystem(index)} type="button">
                {item.title}
              </button>
            ))}
          </div>
          <article className="system-preview">
            <img src={system.image} alt={system.title} style={{ objectPosition: system.imagePosition }} />
            <div>
              <h3>{system.title}</h3>
              <p>{system.solution}</p>
              <dl>
                <div><dt>生活问题</dt><dd>{system.problem}</dd></div>
                <div><dt>典型使用场景</dt><dd>{system.scenes}</dd></div>
                <div><dt>适用家庭</dt><dd>{system.family}</dd></div>
                <div><dt>相关设备类型</dt><dd>{system.devices}</dd></div>
              </dl>
            </div>
          </article>
        </div>
      </section>
      <section className="section floor-section reveal">
        <div className="section-heading">
          <p className="eyebrow">Smart Point Map</p>
          <h2>智慧住宅点位图</h2>
        </div>
        <div className="floor-layout">
          <div className="floor-plan" aria-label="三室两厅智慧住宅点位图">
            {Object.keys(floorRooms).map((room) => (
              <button className={`room room-${room} ${activeRoom === room ? 'active' : ''}`} key={room} onClick={() => setActiveRoom(room as keyof typeof floorRooms)} type="button">
                <span>{room}</span>
                <i />
              </button>
            ))}
          </div>
          <article className="room-config">
            <p className="eyebrow">Selected Space</p>
            <h3>{floorRooms[activeRoom].name}</h3>
            {floorRooms[activeRoom].items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </article>
        </div>
      </section>
      <ServiceSection />
    </>
  )
}

function ServiceSection() {
  return (
    <section className="section service-section reveal">
      <div className="section-heading">
        <p className="eyebrow">Service Workflow</p>
        <h2>从需求沟通到交付售后，每一步都影响最终体验。</h2>
      </div>
      <div className="service-track">
        {['需求沟通', '现场勘测', '方案设计', '点位确认', '设备安装', '系统调试', '场景设定', '交付与售后'].map((item, index) => (
          <article key={item}>
            <strong>{index + 1}</strong>
            <h3>{item}</h3>
            <p>{serviceCopy(index)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function BookingPage() {
  return (
    <section className="booking-section standalone-booking">
      <div className="booking-copy reveal">
        <p className="eyebrow">Book A Private Consultation</p>
        <h2>让设计师看看，你的家适合怎样做智能升级。</h2>
        <p>预约后可以获得家庭需求分析、户型智能点位建议、场景规划建议、设备配置建议和预算区间建议。</p>
        <img className="booking-visual" src={visuals.smartControlPanel.src} alt={visuals.smartControlPanel.alt} style={{ objectPosition: visuals.smartControlPanel.position }} />
        <div className="booking-benefits">
          {['家庭需求分析', '户型智能点位建议', '场景规划建议', '设备配置建议', '预算区间建议'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <BookingForm />
    </section>
  )
}

function BookingForm() {
  const [bookingDone, setBookingDone] = useState(false)

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.currentTarget))
    localStorage.setItem('smart-home-booking-demo', JSON.stringify({ ...formData, createdAt: new Date().toISOString() }))
    event.currentTarget.reset()
    setBookingDone(true)
  }

  return (
    <form className="booking-form reveal" onSubmit={submitBooking}>
      <input required name="name" placeholder="姓名" />
      <input required name="phone" placeholder="手机号" />
      <input name="city" placeholder="城市" />
      <input name="community" placeholder="小区" />
      <input name="area" placeholder="面积" />
      <select name="status" defaultValue="正在装修">
        <option>毛坯新房</option>
        <option>正在装修</option>
        <option>精装未入住</option>
        <option>已经入住</option>
      </select>
      <textarea name="note" placeholder="核心需求" />
      <button className="primary-button" type="submit">
        提交预约
      </button>
      {bookingDone && (
        <div className="success designed-success">
          <strong>预约成功</strong>
          <span>设计顾问将在工作时间内与你联系，并结合你的户型、家庭成员和智能需求，完善专属方案建议。</span>
        </div>
      )}
    </form>
  )
}

function PageIntro({ copy, eyebrow, title }: { copy: string; eyebrow: string; title: string }) {
  return (
    <div className="section-heading page-intro reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  )
}

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
  return null
}

function readStoredDiagnosis() {
  try {
    const raw = localStorage.getItem(diagnosisStorageKey)
    return raw ? ({ ...defaultDiagnosisAnswers, ...JSON.parse(raw) } as DiagnosisAnswers) : null
  } catch {
    return null
  }
}

function serviceCopy(index: number) {
  return [
    '明确户型、家庭成员、装修阶段和真实生活习惯。',
    '确认结构、强弱电、窗帘盒、网络和设备安装条件。',
    '输出空间级系统方案、场景清单和预算区间。',
    '与设计、施工和业主共同确认每个控制点位。',
    '按施工节奏完成设备安装、接线和基础联调。',
    '验证网络、传感、执行器和跨系统联动稳定性。',
    '按家庭日常节奏设定回家、离家、睡眠等场景。',
    '交付使用培训，并提供后续调整与维护服务。',
  ][index]
}

export default App
