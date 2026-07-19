export const WORKFLOW_STAGES = [
  'draft',
  'pending_review',
  'approved',
  'published',
  'archived',
]

export const WORKFLOW_STAGE_LABELS = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
}

export const WORKFLOW_SEQUENCE = [
  { key: 'draft', label: 'Draft' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'published', label: 'Published' },
  { key: 'archived', label: 'Archived' },
]

export function getNextWorkflowStage(stage) {
  const index = WORKFLOW_STAGES.indexOf(stage)
  if (index === -1 || index === WORKFLOW_STAGES.length - 1) return null
  return WORKFLOW_STAGES[index + 1]
}
