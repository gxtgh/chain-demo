export type AcceptanceStatus = 'not_started' | 'in_progress' | 'blocked' | 'done'
export type AcceptancePriority = 'high' | 'medium' | 'low'
export type AcceptanceRole =
  | 'productDiscovery'
  | 'productDelivery'
  | 'engineering'
  | 'qa'
  | 'lead'
  | 'userAcceptance'

export type AcceptanceTask = {
  id: string
  role: AcceptanceRole
  title: string
  status: AcceptanceStatus
  priority: AcceptancePriority
  blocked: boolean
  note: string
  link?: string
}

export type AcceptanceRoleProgress = {
  role: AcceptanceRole
  status: AcceptanceStatus
  completion: number
  owner: string
  updatedAt: string
  summary: string
}

export type AcceptanceRisk = {
  title: string
  level: AcceptancePriority
  summary: string
  action: string
}

export type AcceptanceFunction = {
  id: string
  title: string
  route: string
  themes: string[]
  status: AcceptanceStatus
  completion: number
  summary: string
  currentStage: string
  roles: AcceptanceRoleProgress[]
  tasks: AcceptanceTask[]
  risks: AcceptanceRisk[]
}
