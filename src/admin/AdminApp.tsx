import { createContext, useContext, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { adminService, withBooking, withCaseStudy, withFollowUp, withLeadStatus, withSettings, withoutCaseStudy } from './services/adminService'
import type { AdminData, Booking, BookingStatus, BookingType, CaseStudy, FollowUpRecord, FollowUpType, Lead, LeadStatus, MerchantSettings } from './types'
import './Admin.css'

const leadStatuses: LeadStatus[] = ['新线索', '待联系', '已联系', '持续跟进', '已预约', '方案设计中', '已报价', '已成交', '暂时搁置', '无效线索']
const followTypes: FollowUpType[] = ['电话联系', '微信联系', '到店体验', '上门勘测', '发送方案', '报价', '成交', '其他']
const bookingTypes: BookingType[] = ['电话沟通', '到店体验', '上门勘测', '方案沟通', '报价沟通']
const bookingStatuses: BookingStatus[] = ['待确认', '已确认', '已完成', '已取消']

type LeadFilters = {
  keyword: string
  status: string
  intent: string
  stage: string
  area: string
  family: string
  plan: string
  source: string
}

type AdminContextValue = {
  data: AdminData
  setData: (data: AdminData) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export default function AdminApp() {
  const [data, setData] = useState(() => adminService.load())

  return (
    <AdminContext.Provider value={{ data, setData }}>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="*" element={<AdminShell />} />
      </Routes>
    </AdminContext.Provider>
  )
}

function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('Admin context missing')
  return context
}

function AdminLogin() {
  return (
    <main className="admin-login">
      <section>
        <span>Smart Home Merchant Console</span>
        <h1>商家管理后台</h1>
        <p>管理线索、诊断、跟进、预约、案例和转化数据。</p>
        <Link className="admin-primary" to="/admin">
          进入工作台
        </Link>
      </section>
    </main>
  )
}

function AdminShell() {
  const [open, setOpen] = useState(false)
  const nav = [
    ['工作台', '/admin'],
    ['线索中心', '/admin/leads'],
    ['智能诊断', '/admin/diagnosis'],
    ['预约管理', '/admin/bookings'],
    ['客户管理', '/admin/customers'],
    ['案例管理', '/admin/cases'],
    ['解决方案', '/admin/solutions'],
    ['数据分析', '/admin/analytics'],
    ['系统设置', '/admin/settings'],
  ]

  return (
    <div className="admin-app">
      <aside className={open ? 'admin-sidebar open' : 'admin-sidebar'}>
        <Link className="admin-brand" to="/admin">
          <b>H</b>
          <span>禾境智能后台</span>
        </Link>
        <nav onClick={() => setOpen(false)}>
          {nav.map(([label, to]) => (
            <NavLink end={to === '/admin'} key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button onClick={() => setOpen((value) => !value)} type="button">导航</button>
          <div>
            <strong>商家运营中心</strong>
            <span>线索进入 → 诊断查看 → 销售跟进 → 预约成交</span>
          </div>
          <Link to="/">返回前台</Link>
        </header>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="diagnosis" element={<DiagnosisAdminPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="cases" element={<CasesAdminPage />} />
          <Route path="cases/new" element={<CaseEditorPage />} />
          <Route path="cases/:id/edit" element={<CaseEditorPage />} />
          <Route path="solutions" element={<SolutionsAdminPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  )
}

function Dashboard() {
  const { data } = useAdmin()
  const stats = getDashboardStats(data)
  const latestLeads = [...data.leads].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5)
  const todos = data.leads.filter((lead) => !['已成交', '无效线索'].includes(lead.status)).slice(0, 5)

  return (
    <AdminPage title="工作台" desc="今天需要优先处理的线索、预约和转化数据。">
      <div className="admin-metrics">
        {[
          ['今日新增线索', stats.todayLeads],
          ['今日完成诊断', stats.todayDiagnosis],
          ['今日预约', stats.todayBookings],
          ['待跟进客户', stats.pending],
          ['本月成交', stats.monthDeals],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="admin-grid two">
        <AdminCard title="今日待办">
          <table className="admin-table compact">
            <tbody>
              {todos.map((lead) => (
                <tr key={lead.id}>
                  <td><b>{lead.customerName}</b><span>{lead.area} · {lead.familyType}</span></td>
                  <td><IntentBadge level={lead.intentLevel} /></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>{nextFollowTime(data, lead.id)}</td>
                  <td><Link to={`/admin/leads/${lead.id}`}>处理</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
        <AdminCard title="转化漏斗">
          <Funnel data={data} />
        </AdminCard>
      </div>
      <AdminCard title="最新线索">
        <LeadTable leads={latestLeads} />
      </AdminCard>
      <AdminCard title="渠道来源">
        <Bars values={data.analytics.sources} />
      </AdminCard>
    </AdminPage>
  )
}

function LeadsPage() {
  const { data } = useAdmin()
  const [view, setView] = useState<'table' | 'board'>('table')
  const [filters, setFilters] = useState({ keyword: '', status: '全部', intent: '全部', stage: '全部', area: '全部', family: '全部', plan: '全部', source: '全部' })
  const filtered = data.leads.filter((lead) => {
    const text = `${lead.customerName}${lead.phone}${lead.community}`
    return (
      text.includes(filters.keyword) &&
      matchFilter(filters.status, lead.status) &&
      matchFilter(filters.intent, lead.intentLevel) &&
      matchFilter(filters.stage, lead.decorationStage) &&
      matchFilter(filters.area, areaBucket(lead.area)) &&
      matchFilter(filters.family, lead.familyType) &&
      matchFilter(filters.plan, lead.recommendedPlan) &&
      matchFilter(filters.source, lead.source)
    )
  })

  return (
    <AdminPage title="线索中心" desc="筛选、搜索和推进销售状态。">
      <FilterPanel filters={filters} setFilters={setFilters} />
      <div className="admin-toolbar">
        <span>共 {filtered.length} 条线索</span>
        <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} type="button">表格视图</button>
        <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')} type="button">销售看板</button>
      </div>
      {view === 'table' ? <LeadTable leads={filtered} /> : <LeadBoard leads={filtered} />}
    </AdminPage>
  )
}

function FilterPanel({ filters, setFilters }: { filters: LeadFilters; setFilters: (filters: LeadFilters) => void }) {
  const update = (key: string, value: string) => setFilters({ ...filters, [key]: value })
  return (
    <section className="admin-filters">
      <input placeholder="搜索姓名 / 手机号 / 小区" value={filters.keyword} onChange={(event) => update('keyword', event.target.value)} />
      <Select value={filters.status} onChange={(value) => update('status', value)} options={['全部', ...leadStatuses]} />
      <Select value={filters.intent} onChange={(value) => update('intent', value)} options={['全部', '高意向', '中意向', '普通']} />
      <Select value={filters.stage} onChange={(value) => update('stage', value)} options={['全部', '毛坯新房', '正在装修', '精装未入住', '已经入住']} />
      <Select value={filters.area} onChange={(value) => update('area', value)} options={['全部', '80-120㎡', '120-160㎡', '160㎡以上']} />
      <Select value={filters.family} onChange={(value) => update('family', value)} options={['全部', '三口之家', '有老人家庭', '宠物家庭', '多代同住家庭', '年轻夫妻']} />
      <Select value={filters.plan} onChange={(value) => update('plan', value)} options={['全部', '舒适安全型全屋智能方案', '照护安全型全屋智能方案', '舒适省心型全屋智能方案']} />
      <Select value={filters.source} onChange={(value) => update('source', value)} options={['全部', '抖音', '小红书', '朋友圈', '微信', '销售人员分享', '自然访问']} />
    </section>
  )
}

function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {['客户', '联系电话', '面积', '装修阶段', '家庭成员', '主要需求', '推荐方案', '意向', '来源', '状态', '提交时间', '负责人'].map((item) => (
              <th key={item}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td><Link to={`/admin/leads/${lead.id}`}>{lead.customerName}</Link><span>{lead.community}</span></td>
              <td>{lead.phone}</td>
              <td>{lead.area}</td>
              <td>{lead.decorationStage}</td>
              <td>{lead.familyType}</td>
              <td>{lead.mainNeeds.slice(0, 3).join(' / ')}</td>
              <td>{lead.recommendedPlan}</td>
              <td><IntentBadge level={lead.intentLevel} score={lead.score} /></td>
              <td>{lead.source}</td>
              <td><StatusBadge status={lead.status} /></td>
              <td>{lead.submittedAt}</td>
              <td>{lead.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LeadBoard({ leads }: { leads: Lead[] }) {
  return (
    <div className="lead-board">
      {leadStatuses.slice(0, 8).map((status) => (
        <section key={status}>
          <h3>{status}<span>{leads.filter((lead) => lead.status === status).length}</span></h3>
          {leads.filter((lead) => lead.status === status).map((lead) => (
            <Link className="board-card" key={lead.id} to={`/admin/leads/${lead.id}`}>
              <b>{lead.customerName}</b>
              <span>{lead.area} · {lead.familyType}</span>
              <IntentBadge level={lead.intentLevel} score={lead.score} />
            </Link>
          ))}
        </section>
      ))}
    </div>
  )
}

function LeadDetailPage() {
  const { id } = useParams()
  const { data, setData } = useAdmin()
  const lead = data.leads.find((item) => item.id === id)
  const navigate = useNavigate()
  if (!lead) return <AdminPage title="未找到线索" desc="该线索不存在或已删除。" />

  const diagnosis = data.diagnosisRecords.find((item) => item.id === lead.diagnosisId)
  const followUps = data.followUps.filter((item) => item.leadId === lead.id)
  const bookings = data.bookings.filter((item) => item.leadId === lead.id)

  const updateStatus = (status: string) => setData(withLeadStatus(data, lead.id, status as LeadStatus))
  const markInvalid = () => setData(withLeadStatus(data, lead.id, '无效线索'))

  const addFollow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const followUp: FollowUpRecord = {
      id: `F-${Date.now()}`,
      leadId: lead.id,
      type: String(form.type) as FollowUpType,
      time: String(form.time || new Date().toISOString().slice(0, 16)).replace('T', ' '),
      content: String(form.content),
      nextFollowTime: String(form.nextFollowTime).replace('T', ' '),
      note: String(form.note),
      owner: lead.owner,
    }
    setData(withFollowUp(data, followUp))
    event.currentTarget.reset()
  }

  const addBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const booking: Booking = {
      id: `B-${Date.now()}`,
      leadId: lead.id,
      customer: lead.customerName,
      phone: lead.phone,
      type: String(form.type) as BookingType,
      date: String(form.date),
      time: String(form.time),
      address: String(form.address),
      area: lead.area,
      owner: lead.owner,
      note: String(form.note),
      status: '待确认',
    }
    setData(withBooking(data, booking))
    event.currentTarget.reset()
  }

  return (
    <AdminPage title={`${lead.customerName} · 客户详情`} desc={`${lead.city} ${lead.community} · ${lead.source} · ${lead.submittedAt}`}>
      <div className="detail-actions">
        <Select value={lead.status} onChange={updateStatus} options={leadStatuses} />
        <button onClick={markInvalid} type="button">标记无效</button>
        <button onClick={() => navigate('/admin/leads')} type="button">返回列表</button>
      </div>
      <div className="admin-grid two">
        <AdminCard title="客户基本信息">
          <InfoGrid items={{
            联系电话: lead.phone,
            面积: lead.area,
            装修状态: lead.decorationStage,
            家庭成员: lead.members.join(' / '),
            城市: lead.city,
            小区: lead.community,
            来源: lead.source,
            负责人: lead.owner,
            意向评分: `${lead.score} · ${lead.intentLevel}`,
            当前状态: lead.status,
          }} />
        </AdminCard>
        <AdminCard title="推荐方案">
          <h3>{lead.recommendedPlan}</h3>
          <p>{diagnosis?.result.issues[0]?.direction}</p>
          <div className="scene-pills">{diagnosis?.result.scenes.map((scene) => <span key={scene}>{scene}</span>)}</div>
        </AdminCard>
      </div>
      {diagnosis && (
        <AdminCard title="完整诊断结果">
          <div className="admin-score-row">
            {Object.entries(diagnosis.result.scores).map(([key, value]) => <span key={key}>{scoreLabel(key)} <b>{value}</b></span>)}
          </div>
          <div className="admin-grid three">
            {diagnosis.result.issues.map((issue) => (
              <article className="mini-card" key={issue.title}>
                <h3>{issue.title}</h3>
                <p>{issue.diagnosis}</p>
              </article>
            ))}
          </div>
        </AdminCard>
      )}
      {diagnosis && (
        <AdminCard title="原始诊断答题记录">
          <InfoGrid items={{
            房屋状态: diagnosis.answers.status,
            面积: diagnosis.answers.area,
            回家体验: diagnosis.answers.returnActions.join(' / '),
            离家焦虑: diagnosis.answers.awayConcerns.join(' / '),
            夜间生活: diagnosis.answers.nightLife.join(' / '),
            核心偏好: diagnosis.answers.preferences.join(' / '),
          }} />
        </AdminCard>
      )}
      <div className="admin-grid two">
        <AdminCard title="添加跟进">
          <form className="admin-form" onSubmit={addFollow}>
            <Select name="type" options={followTypes} />
            <input name="time" type="datetime-local" />
            <textarea name="content" placeholder="跟进内容" required />
            <input name="nextFollowTime" type="datetime-local" />
            <textarea name="note" placeholder="销售备注" />
            <button className="admin-primary" type="submit">提交跟进</button>
          </form>
        </AdminCard>
        <AdminCard title="安排预约">
          <form className="admin-form" onSubmit={addBooking}>
            <Select name="type" options={bookingTypes} />
            <input name="date" type="date" required />
            <input name="time" type="time" required />
            <input name="address" placeholder="地址" required />
            <textarea name="note" placeholder="备注" />
            <button className="admin-primary" type="submit">创建预约</button>
          </form>
        </AdminCard>
      </div>
      <AdminCard title="跟进时间线">
        <Timeline followUps={followUps} bookings={bookings} />
      </AdminCard>
    </AdminPage>
  )
}

function DiagnosisAdminPage() {
  const { data } = useAdmin()
  const needs = countList(data.leads.flatMap((lead) => lead.mainNeeds))
  const statusDist = countList(data.leads.map((lead) => lead.decorationStage))
  const areaDist = countList(data.leads.map((lead) => areaBucket(lead.area)))
  const familyDist = countList(data.leads.map((lead) => lead.familyType))
  const planDist = countList(data.leads.map((lead) => lead.recommendedPlan))
  const completed = data.diagnosisRecords.length

  return (
    <AdminPage title="智能诊断" desc="统计诊断完成情况、热门需求和推荐方案分布。">
      <div className="admin-metrics">
        <Metric label="今日完成数" value={data.diagnosisRecords.filter((item) => item.completedAt.startsWith('2026-07-08')).length} />
        <Metric label="本周完成数" value={completed} />
        <Metric label="诊断完成率" value={`${rate(data.analytics.diagnosisCompleted, data.analytics.diagnosisStarts)}%`} />
        <Metric label="留资率" value={`${rate(data.analytics.contacts, data.analytics.diagnosisCompleted)}%`} />
      </div>
      <div className="admin-grid two">
        <AdminCard title="热门需求"><Bars values={needs} /></AdminCard>
        <AdminCard title="房屋状态分布"><Bars values={statusDist} /></AdminCard>
        <AdminCard title="面积分布"><Bars values={areaDist} /></AdminCard>
        <AdminCard title="家庭类型分布"><Bars values={familyDist} /></AdminCard>
        <AdminCard title="推荐方案分布"><Bars values={planDist} /></AdminCard>
      </div>
    </AdminPage>
  )
}

function BookingsPage() {
  const { data, setData } = useAdmin()
  const updateBooking = (id: string, status: string) => {
    const next = { ...data, bookings: data.bookings.map((item) => (item.id === id ? { ...item, status: status as BookingStatus } : item)) }
    adminService.save(next)
    setData(next)
  }

  return (
    <AdminPage title="预约管理" desc="查看电话沟通、到店体验、上门勘测、方案沟通和报价沟通。">
      <div className="admin-grid two">
        <AdminCard title="列表视图">
          <table className="admin-table">
            <thead><tr>{['客户', '电话', '类型', '日期', '时间', '地址', '面积', '负责人', '备注', '状态'].map((item) => <th key={item}>{item}</th>)}</tr></thead>
            <tbody>
              {data.bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.customer}</td><td>{booking.phone}</td><td>{booking.type}</td><td>{booking.date}</td><td>{booking.time}</td><td>{booking.address}</td><td>{booking.area}</td><td>{booking.owner}</td><td>{booking.note}</td>
                  <td><Select value={booking.status} onChange={(value) => updateBooking(booking.id, value)} options={bookingStatuses} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
        <AdminCard title="日历基础视图">
          <div className="calendar-list">
            {data.bookings.map((booking) => (
              <article key={booking.id}>
                <b>{booking.date}</b>
                <span>{booking.time} · {booking.customer} · {booking.type}</span>
                <StatusBadge status={booking.status} />
              </article>
            ))}
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  )
}

function CustomersPage() {
  const { data } = useAdmin()
  const customers = data.leads.filter((lead) => !['无效线索'].includes(lead.status))
  return (
    <AdminPage title="客户管理" desc="沉淀可持续跟进客户。">
      <LeadTable leads={customers} />
    </AdminPage>
  )
}

function CasesAdminPage() {
  const { data, setData } = useAdmin()
  return (
    <AdminPage title="案例管理" desc="维护前台案例内容、排序、推荐和上下架。">
      <div className="admin-toolbar">
        <Link className="admin-primary" to="/admin/cases/new">新增案例</Link>
      </div>
      <table className="admin-table">
        <thead><tr>{['案例名称', '城市', '面积', '家庭成员', '方案类型', '设备', '场景', '标签', '状态', '排序', '首页推荐', '操作'].map((item) => <th key={item}>{item}</th>)}</tr></thead>
        <tbody>
          {data.cases.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td><td>{item.city}</td><td>{item.area}</td><td>{item.familyMembers}</td><td>{item.planType}</td><td>{item.deviceCount}</td><td>{item.sceneCount}</td><td>{item.tags.join(' / ')}</td><td>{item.status}</td><td>{item.sort}</td><td>{item.featured ? '是' : '否'}</td>
              <td className="table-actions"><Link to={`/admin/cases/${item.id}/edit`}>编辑</Link><button onClick={() => setData(withoutCaseStudy(data, item.id))} type="button">删除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  )
}

function CaseEditorPage() {
  const { id } = useParams()
  const { data, setData } = useAdmin()
  const navigate = useNavigate()
  const editing = data.cases.find((item) => item.id === id)

  const saveCase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const caseStudy: CaseStudy = {
      id: editing?.id ?? `C-${Date.now()}`,
      name: String(form.name),
      city: String(form.city),
      community: String(form.community),
      area: String(form.area),
      layout: String(form.layout),
      familyMembers: String(form.familyMembers),
      painPoints: String(form.painPoints),
      planType: String(form.planType),
      deviceCount: Number(form.deviceCount),
      sceneCount: Number(form.sceneCount),
      dailyAutomationCount: Number(form.dailyAutomationCount),
      intro: String(form.intro),
      solution: String(form.solution),
      lifeChanges: String(form.lifeChanges),
      image: String(form.image),
      tags: String(form.tags).split(/[，,]/).map((tag) => tag.trim()).filter(Boolean),
      status: String(form.status) as CaseStudy['status'],
      sort: Number(form.sort),
      featured: form.featured === 'on',
    }
    setData(withCaseStudy(data, caseStudy))
    navigate('/admin/cases')
  }

  return (
    <AdminPage title={editing ? '编辑案例' : '新增案例'} desc="案例结构与前台案例页保持一致。">
      <form className="admin-form case-form" onSubmit={saveCase}>
        {[
          ['name', '案例名称'], ['city', '城市'], ['community', '小区'], ['area', '面积'], ['layout', '户型'], ['familyMembers', '家庭成员'], ['planType', '方案类型'], ['deviceCount', '设备数量'], ['sceneCount', '场景数量'], ['dailyAutomationCount', '每日自动执行次数'], ['image', '图片 URL'], ['tags', '标签，用逗号分隔'], ['sort', '排序'],
        ].map(([name, placeholder]) => <input defaultValue={String(editing?.[name as keyof CaseStudy] ?? '')} key={name} name={name} placeholder={placeholder} />)}
        <textarea defaultValue={editing?.painPoints} name="painPoints" placeholder="客户痛点" />
        <textarea defaultValue={editing?.intro} name="intro" placeholder="案例介绍" />
        <textarea defaultValue={editing?.solution} name="solution" placeholder="解决方案" />
        <textarea defaultValue={editing?.lifeChanges} name="lifeChanges" placeholder="生活变化" />
        <Select name="status" defaultValue={editing?.status ?? '上架'} options={['上架', '下架']} />
        <label className="check-row"><input defaultChecked={editing?.featured} name="featured" type="checkbox" /> 首页推荐</label>
        <button className="admin-primary" type="submit">保存案例</button>
      </form>
    </AdminPage>
  )
}

function SolutionsAdminPage() {
  const { data } = useAdmin()
  return (
    <AdminPage title="解决方案" desc="维护方案名称、预算、推荐场景和展示状态。">
      <table className="admin-table">
        <thead><tr>{['方案名称', '适合家庭', '适合面积', '推荐场景', '推荐系统', '预算范围', '展示状态', '排序'].map((item) => <th key={item}>{item}</th>)}</tr></thead>
        <tbody>
          {data.solutions.map((item) => (
            <tr key={item.id}>
              <td><b>{item.name}</b><span>{item.intro}</span></td>
              <td>{item.suitableFamily}</td><td>{item.suitableArea}</td><td>{item.recommendedScenes.join(' / ')}</td><td>{item.recommendedSystems.join(' / ')}</td><td>{item.budgetRange}</td><td>{item.displayStatus}</td><td>{item.sort}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  )
}

function AnalyticsPage() {
  const { data } = useAdmin()
  const [range, setRange] = useState('30天')
  return (
    <AdminPage title="数据分析" desc="查看访问、诊断、留资、预约和成交转化。">
      <div className="admin-toolbar">
        {['今天', '7天', '30天', '本月'].map((item) => <button className={range === item ? 'active' : ''} key={item} onClick={() => setRange(item)} type="button">{item}</button>)}
      </div>
      <div className="admin-metrics">
        <Metric label="访问量" value={data.analytics.visits} />
        <Metric label="开始诊断数" value={data.analytics.diagnosisStarts} />
        <Metric label="完成诊断数" value={data.analytics.diagnosisCompleted} />
        <Metric label="留资数" value={data.analytics.contacts} />
        <Metric label="预约数" value={data.analytics.bookings} />
        <Metric label="成交数" value={data.analytics.deals} />
      </div>
      <div className="admin-grid two">
        <AdminCard title="转化漏斗"><Funnel data={data} /></AdminCard>
        <AdminCard title="来源渠道"><Bars values={data.analytics.sources} /></AdminCard>
      </div>
      <div className="admin-metrics">
        <Metric label="诊断完成率" value={`${rate(data.analytics.diagnosisCompleted, data.analytics.diagnosisStarts)}%`} />
        <Metric label="留资率" value={`${rate(data.analytics.contacts, data.analytics.diagnosisCompleted)}%`} />
        <Metric label="预约率" value={`${rate(data.analytics.bookings, data.analytics.contacts)}%`} />
        <Metric label="成交率" value={`${rate(data.analytics.deals, data.analytics.bookings)}%`} />
      </div>
    </AdminPage>
  )
}

function SettingsPage() {
  const { data, setData } = useAdmin()
  const [saved, setSaved] = useState(false)
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const settings = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, String(value)])) as MerchantSettings
    setData(withSettings(data, settings))
    setSaved(true)
  }

  return (
    <AdminPage title="系统设置" desc="管理品牌、联系方式、预约提示和前台 CTA 文案。">
      <form className="admin-form settings-form" onSubmit={save}>
        {[
          ['brandName', '品牌名称'], ['logo', 'Logo'], ['phone', '联系电话'], ['wechat', '微信'], ['address', '门店地址'], ['businessHours', '营业时间'], ['city', '城市'], ['bookingSuccessText', '预约成功提示语'], ['frontCtaText', '前台 CTA 文案'], ['budgetRanges', '预算区间'],
        ].map(([name, label]) => (
          <label key={name}>{label}<input defaultValue={data.settings[name as keyof MerchantSettings]} name={name} /></label>
        ))}
        <button className="admin-primary" type="submit">保存设置</button>
        {saved && <p className="admin-success">设置已保存。</p>}
      </form>
    </AdminPage>
  )
}

function AdminPage({ children, desc, title }: { children?: ReactNode; desc: string; title: string }) {
  return (
    <main className="admin-page">
      <div className="admin-page-head">
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {children}
    </main>
  )
}

function AdminCard({ children, title }: { children: ReactNode; title: string }) {
  return <section className="admin-card"><h2>{title}</h2>{children}</section>
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <article><span>{label}</span><strong>{value}</strong></article>
}

function Select({ defaultValue, name, onChange, options, value }: { defaultValue?: string; name?: string; onChange?: (value: string) => void; options: string[]; value?: string }) {
  return (
    <select defaultValue={defaultValue} name={name} value={value} onChange={(event) => onChange?.(event.target.value)}>
      {options.map((item) => <option key={item}>{item}</option>)}
    </select>
  )
}

function IntentBadge({ level, score }: { level: string; score?: number }) {
  return <span className={`intent-badge intent-${level}`}>{level}{score ? ` ${score}` : ''}</span>
}

function StatusBadge({ status }: { status: string }) {
  return <span className="status-badge">{status}</span>
}

function InfoGrid({ items }: { items: Record<string, string> }) {
  return <dl className="info-grid">{Object.entries(items).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
}

function Timeline({ bookings, followUps }: { bookings: Booking[]; followUps: FollowUpRecord[] }) {
  const entries = [
    ...followUps.map((item) => ({ time: item.time, title: item.type, text: item.content })),
    ...bookings.map((item) => ({ time: `${item.date} ${item.time}`, title: item.type, text: `${item.address} · ${item.status}` })),
  ].sort((a, b) => b.time.localeCompare(a.time))
  return <div className="timeline-list">{entries.map((item) => <article key={`${item.time}${item.title}`}><strong>{item.title}</strong><span>{item.time}</span><p>{item.text}</p></article>)}</div>
}

function Bars({ values }: { values: Record<string, number> }) {
  const max = Math.max(...Object.values(values), 1)
  return <div className="bars">{Object.entries(values).map(([key, value]) => <div key={key}><span>{key}</span><i><b style={{ width: `${(value / max) * 100}%` }} /></i><strong>{value}</strong></div>)}</div>
}

function Funnel({ data }: { data: AdminData }) {
  const values = {
    访问: data.analytics.visits,
    诊断开始: data.analytics.diagnosisStarts,
    诊断完成: data.analytics.diagnosisCompleted,
    留资: data.analytics.contacts,
    预约: data.analytics.bookings,
    成交: data.analytics.deals,
  }
  return <Bars values={values} />
}

function getDashboardStats(data: AdminData) {
  return {
    todayLeads: data.leads.filter((lead) => lead.submittedAt.startsWith('2026-07-08')).length,
    todayDiagnosis: data.diagnosisRecords.filter((item) => item.completedAt.startsWith('2026-07-08')).length,
    todayBookings: data.bookings.filter((booking) => booking.date === '2026-07-08').length,
    pending: data.leads.filter((lead) => ['新线索', '待联系', '已联系', '持续跟进'].includes(lead.status)).length,
    monthDeals: data.leads.filter((lead) => lead.status === '已成交').length + data.analytics.deals,
  }
}

function nextFollowTime(data: AdminData, leadId: string) {
  return data.followUps.find((item) => item.leadId === leadId)?.nextFollowTime || '待安排'
}

function matchFilter(filter: string, value: string) {
  return filter === '全部' || value === filter
}

function areaBucket(area: string) {
  if (area.includes('200') || area.includes('260') || area.includes('168')) return '160㎡以上'
  if (area.includes('128') || area.includes('120-160')) return '120-160㎡'
  return '80-120㎡'
}

function countList(items: string[]) {
  return items.reduce<Record<string, number>>((map, item) => {
    map[item] = (map[item] ?? 0) + 1
    return map
  }, {})
}

function rate(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0
}

function scoreLabel(key: string) {
  return ({ convenience: '便利体验', security: '安全需求', comfort: '舒适需求', entertainment: '影音需求', care: '家庭照护' }[key] ?? key)
}
