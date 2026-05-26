import { success, error } from '@/lib/utils'
import { getDb, getToolList } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const { searchParams } = request.nextUrl

    const result = await getToolList({
      db,
      category: searchParams.get('category') || undefined,
      badgePayment: searchParams.get('badge_payment') || undefined,
      badgeChinaAccess: searchParams.get('badge_china_access') || undefined,
      badgeOpenSource: searchParams.get('badge_open_source') || undefined,
      badgeMaintenance: searchParams.get('badge_maintenance') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      pageSize: 20,
    })

    return Response.json(success(result))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
