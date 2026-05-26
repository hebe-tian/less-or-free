export const runtime = 'edge'

import { success, error } from '@/lib/utils'
import { getDb, getToolWithCategories } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb(request)
    const tool = await getToolWithCategories(db, id)

    if (!tool) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    return Response.json(success(tool))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
