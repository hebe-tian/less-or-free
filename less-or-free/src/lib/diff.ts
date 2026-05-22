export interface SnapshotTool {
  id: string
  name: string
  badge_payment: string
  badge_china_access: string
  badge_open_source: string
  badge_maintenance: string
  status: string
  category_ids: string[]
}

export interface DiffResult {
  added: SnapshotTool[]
  removed: SnapshotTool[]
  changed: {
    id: string
    name: string
    changes: {
      field: string
      oldValue: unknown
      newValue: unknown
    }[]
  }[]
}

export function computeDiff(v1Data: SnapshotTool[], v2Data: SnapshotTool[]): DiffResult {
  const v1Map = new Map(v1Data.map((t) => [t.id, t]))
  const v2Map = new Map(v2Data.map((t) => [t.id, t]))

  const added: SnapshotTool[] = []
  const removed: SnapshotTool[] = []
  const changed: DiffResult['changed'] = []

  for (const [id, tool] of v2Map) {
    if (!v1Map.has(id)) {
      added.push(tool)
    } else {
      const oldTool = v1Map.get(id)!
      const changes: DiffResult['changed'][0]['changes'] = []

      const fieldsToCompare = [
        'name',
        'badge_payment',
        'badge_china_access',
        'badge_open_source',
        'badge_maintenance',
        'status',
      ] as const

      for (const field of fieldsToCompare) {
        if (oldTool[field] !== tool[field]) {
          changes.push({
            field,
            oldValue: oldTool[field],
            newValue: tool[field],
          })
        }
      }

      const oldCats = [...(oldTool.category_ids || [])].sort().join(',')
      const newCats = [...(tool.category_ids || [])].sort().join(',')
      if (oldCats !== newCats) {
        changes.push({
          field: 'category_ids',
          oldValue: oldTool.category_ids,
          newValue: tool.category_ids,
        })
      }

      if (changes.length > 0) {
        changed.push({ id, name: tool.name, changes })
      }
    }
  }

  for (const [id, tool] of v1Map) {
    if (!v2Map.has(id)) {
      removed.push(tool)
    }
  }

  return { added, removed, changed }
}
