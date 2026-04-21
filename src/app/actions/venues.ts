'use server'

import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

async function mirrorPhotosToStorage(
  sb: ReturnType<typeof createServiceClient>,
  venueId: string,
  photos: string[]
): Promise<string[]> {
  const storageHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host
  const result: string[] = []

  for (let i = 0; i < photos.length; i++) {
    const url = photos[i]
    if (url.includes(storageHost)) {
      result.push(url)
      continue
    }
    try {
      const res = await fetch(url)
      if (!res.ok) { result.push(url); continue }
      const contentType = res.headers.get('content-type') ?? 'image/jpeg'
      const ext = contentType.split('/')[1]?.split(';')[0] ?? 'jpg'
      const buffer = new Uint8Array(await res.arrayBuffer())
      const path = `${venueId}/selected-${i}.${ext}`
      const { error } = await sb.storage
        .from('venue-photos')
        .upload(path, buffer, { contentType, upsert: true })
      if (error) { result.push(url); continue }
      const { data } = sb.storage.from('venue-photos').getPublicUrl(path)
      result.push(data.publicUrl)
    } catch {
      result.push(url)
    }
  }

  return result
}

export async function createVenue(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  const sb = createServiceClient()

  const tagsRaw = formData.get('tags') as string | null
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

  const priceRaw = formData.get('price_range')
  const price_range = priceRaw ? parseInt(priceRaw as string, 10) || null : null

  const openingHoursRaw = formData.get('opening_hours') as string | null
  const opening_hours = openingHoursRaw ? JSON.parse(openingHoursRaw) : null

  const googlePhotosRaw = formData.get('google_photos') as string | null
  const google_photos = googlePhotosRaw ? JSON.parse(googlePhotosRaw) : null

  const selectedPhotosRaw = formData.get('selected_photos') as string | null
  const selected_photos = selectedPhotosRaw ? JSON.parse(selectedPhotosRaw) : null

  const sectionApprovalsRaw = formData.get('section_approvals') as string | null
  const section_approvals = sectionApprovalsRaw ? JSON.parse(sectionApprovalsRaw) : {}

  const { data, error } = await sb.from('venues').insert({
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    lat: parseFloat(formData.get('lat') as string) || 0,
    lng: parseFloat(formData.get('lng') as string) || 0,
    tags: tags.length > 0 ? tags : null,
    price_range,
    wifi: formData.get('wifi') === 'on',
    outlets: formData.get('outlets') === 'on',
    pet_friendly: formData.get('pet_friendly') === 'on',
    vegan: formData.get('vegan') === 'on',
    open_now: formData.get('open_now') === 'on',
    cover_color: (formData.get('cover_color') as string) || null,
    google_place_id: (formData.get('google_place_id') as string) || null,
    is_approved: formData.get('is_approved') === 'on',
    is_user_submitted: false,
    opening_hours,
    google_photos,
    selected_photos,
    section_approvals,
  }).select('id').single()

  if (error) return { error: error.message }

  const venueId = data.id

  if (selected_photos && selected_photos.length > 0) {
    const mirrored = await mirrorPhotosToStorage(sb, venueId, selected_photos)
    await sb.from('venues').update({ selected_photos: mirrored }).eq('id', venueId)
  }

  revalidatePath('/dashboard/places')
  return { id: venueId }
}

export async function updateVenue(
  venueId: string,
  formData: FormData
): Promise<{ error: string } | null> {
  const sb = createServiceClient()

  const tagsRaw = formData.get('tags') as string | null
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

  const priceRaw = formData.get('price_range')
  const price_range = priceRaw ? parseInt(priceRaw as string, 10) || null : null

  const openingHoursRaw = formData.get('opening_hours') as string | null
  const opening_hours = openingHoursRaw ? JSON.parse(openingHoursRaw) : null

  const googlePhotosRaw = formData.get('google_photos') as string | null
  const google_photos = googlePhotosRaw ? JSON.parse(googlePhotosRaw) : null

  const selectedPhotosRaw = formData.get('selected_photos') as string | null
  const selected_photos_raw: string[] | null = selectedPhotosRaw ? JSON.parse(selectedPhotosRaw) : null
  const selected_photos = selected_photos_raw && selected_photos_raw.length > 0
    ? await mirrorPhotosToStorage(sb, venueId, selected_photos_raw)
    : selected_photos_raw

  const sectionApprovalsRaw = formData.get('section_approvals') as string | null
  const section_approvals = sectionApprovalsRaw ? JSON.parse(sectionApprovalsRaw) : {}

  const { error } = await sb.from('venues').update({
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    lat: parseFloat(formData.get('lat') as string) || 0,
    lng: parseFloat(formData.get('lng') as string) || 0,
    tags: tags.length > 0 ? tags : null,
    price_range,
    wifi: formData.get('wifi') === 'on',
    outlets: formData.get('outlets') === 'on',
    pet_friendly: formData.get('pet_friendly') === 'on',
    vegan: formData.get('vegan') === 'on',
    open_now: formData.get('open_now') === 'on',
    cover_color: (formData.get('cover_color') as string) || null,
    google_place_id: (formData.get('google_place_id') as string) || null,
    is_approved: formData.get('is_approved') === 'on',
    opening_hours,
    google_photos,
    selected_photos,
    section_approvals,
  }).eq('id', venueId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/places')
  return null
}

export async function uploadVenuePhoto(
  venueId: string,
  formData: FormData,
  field: 'cover_photo_url' | 'photo_url' | 'logo_url'
): Promise<{ url: string } | { error: string }> {
  const sb = createServiceClient()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${venueId}/${field}-${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await sb.storage
    .from('venue-photos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = sb.storage.from('venue-photos').getPublicUrl(path)
  const url = urlData.publicUrl

  const { error: updateError } = await sb
    .from('venues')
    .update({ [field]: url })
    .eq('id', venueId)

  if (updateError) return { error: updateError.message }

  return { url }
}

export async function deleteVenue(venueId: string): Promise<void> {
  const sb = createServiceClient()
  await sb.from('venues').delete().eq('id', venueId)
  revalidatePath('/dashboard/places')
}

export async function toggleSectionApproval(
  venueId: string,
  section: string,
  approve: boolean,
  approver: { name: string | null; avatar: string | null }
): Promise<{ error: string } | null> {
  const sb = createServiceClient()

  const { data: venue } = await sb
    .from('venues')
    .select('section_approvals')
    .eq('id', venueId)
    .single()

  const current = (venue?.section_approvals as Record<string, unknown>) ?? {}
  let updated: Record<string, unknown>

  if (approve) {
    updated = {
      ...current,
      [section]: {
        approved_at: new Date().toISOString(),
        approver_name: approver.name,
        approver_avatar: approver.avatar,
      },
    }
  } else {
    updated = { ...current }
    delete updated[section]
  }

  const { error } = await sb
    .from('venues')
    .update({ section_approvals: updated })
    .eq('id', venueId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/places')
  return null
}
