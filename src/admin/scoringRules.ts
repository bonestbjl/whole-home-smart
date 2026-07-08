import type { DiagnosisAnswers } from '../diagnosis'
import type { IntentLevel } from './types'

export type ScoringInput = {
  answers: DiagnosisAnswers
  hasPhone: boolean
  activelyBooked: boolean
}

export const scoringRules = [
  { label: '正在装修', points: 20, test: ({ answers }: ScoringInput) => answers.status === '正在装修' },
  { label: '毛坯新房', points: 15, test: ({ answers }: ScoringInput) => answers.status === '毛坯新房' },
  { label: '160㎡以上', points: 15, test: ({ answers }: ScoringInput) => ['160-200㎡', '200㎡以上'].includes(answers.area) },
  { label: '关注四个以上需求', points: 10, test: ({ answers }: ScoringInput) => answers.preferences.length >= 4 },
  {
    label: '深度智能需求',
    points: 15,
    test: ({ answers }: ScoringInput) =>
      answers.preferences.some((item) => ['家庭安全', '老人照护', '儿童照护', '影音娱乐', '节能管理'].includes(item)),
  },
  { label: '提交手机号', points: 15, test: ({ hasPhone }: ScoringInput) => hasPhone },
  { label: '主动预约', points: 20, test: ({ activelyBooked }: ScoringInput) => activelyBooked },
]

export function calculateLeadScore(input: ScoringInput) {
  return scoringRules.reduce((score, rule) => score + (rule.test(input) ? rule.points : 0), 0)
}

export function getIntentLevel(score: number): IntentLevel {
  if (score >= 80) return '高意向'
  if (score >= 60) return '中意向'
  return '普通'
}
