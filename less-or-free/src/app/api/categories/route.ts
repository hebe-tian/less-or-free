export const runtime = 'edge'

import { success, error } from '@/lib/utils'
import { getDb, getCategoriesWithCount } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const db = getDb(request)
    const categories = await getCategoriesWithCount(db)
    return Response.json(success(categories))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
