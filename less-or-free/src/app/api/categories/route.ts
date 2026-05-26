import { success, error } from '@/lib/utils'
import { getDb, getCategoriesWithCount } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const categories = await getCategoriesWithCount(db)
    return Response.json(success(categories))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
