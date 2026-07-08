import { initialAdminData } from '../mockData'
import type { AdminData, Booking, CaseStudy, FollowUpRecord, LeadStatus, MerchantSettings } from '../types'

const adminStorageKey = 'smart-home-admin-data'

function cloneData(data: AdminData): AdminData {
  return JSON.parse(JSON.stringify(data)) as AdminData
}

export const adminService = {
  load(): AdminData {
    const raw = localStorage.getItem(adminStorageKey)
    if (!raw) {
      const data = cloneData(initialAdminData)
      localStorage.setItem(adminStorageKey, JSON.stringify(data))
      return data
    }
    return { ...cloneData(initialAdminData), ...JSON.parse(raw) } as AdminData
  },

  save(data: AdminData) {
    localStorage.setItem(adminStorageKey, JSON.stringify(data))
  },

  reset() {
    const data = cloneData(initialAdminData)
    localStorage.setItem(adminStorageKey, JSON.stringify(data))
    return data
  },
}

export function withLeadStatus(data: AdminData, leadId: string, status: LeadStatus) {
  const next = { ...data, leads: data.leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)) }
  adminService.save(next)
  return next
}

export function withFollowUp(data: AdminData, followUp: FollowUpRecord) {
  const next = { ...data, followUps: [followUp, ...data.followUps] }
  adminService.save(next)
  return next
}

export function withBooking(data: AdminData, booking: Booking) {
  const next = {
    ...data,
    bookings: [booking, ...data.bookings],
    leads: data.leads.map((lead) => (lead.id === booking.leadId ? { ...lead, status: '已预约' as LeadStatus, activelyBooked: true } : lead)),
  }
  adminService.save(next)
  return next
}

export function withCaseStudy(data: AdminData, caseStudy: CaseStudy) {
  const exists = data.cases.some((item) => item.id === caseStudy.id)
  const next = {
    ...data,
    cases: exists ? data.cases.map((item) => (item.id === caseStudy.id ? caseStudy : item)) : [caseStudy, ...data.cases],
  }
  adminService.save(next)
  return next
}

export function withoutCaseStudy(data: AdminData, id: string) {
  const next = { ...data, cases: data.cases.filter((item) => item.id !== id) }
  adminService.save(next)
  return next
}

export function withSettings(data: AdminData, settings: MerchantSettings) {
  const next = { ...data, settings }
  adminService.save(next)
  return next
}
