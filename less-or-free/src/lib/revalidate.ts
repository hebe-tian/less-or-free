import { revalidatePath } from 'next/cache'

export async function revalidateFrontend(): Promise<void> {
  try {
    revalidatePath('/')
    revalidatePath('/tools')
    revalidatePath('/category/[slug]')
    revalidatePath('/tool/[id]')
    revalidatePath('/snapshots')
  } catch {
    // revalidation may fail in dev mode, that's ok
  }
}
