'use server'
import { createServiceClient } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase'

export async function updateProfile(_state: { error: string } | null | undefined, formData: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const sb = createServiceClient()
  const { error } = await sb.from('profiles').update({
    name: (formData.get('name') as string)?.trim() || null,
    username: (formData.get('username') as string)?.trim(),
    bio: (formData.get('bio') as string)?.trim() || null,
    website: (formData.get('website') as string)?.trim() || null,
    location: (formData.get('location') as string)?.trim() || null,
    pronouns: (formData.get('pronouns') as string)?.trim() || null,
    location_sharing: formData.get('location_sharing') === 'on',
  }).eq('id', user.id)

  if (error) return { error: error.message }
  return null
}

export async function verifyUser(userId: string) {
  const sb = createServiceClient()
  const { error } = await sb.from('profiles').update({ verified: true }).eq('id', userId)
  if (error) return { error: error.message }
  return null
}

export async function unverifyUser(userId: string) {
  const sb = createServiceClient()
  const { error } = await sb.from('profiles').update({ verified: false }).eq('id', userId)
  if (error) return { error: error.message }
  return null
}

export async function sendPasswordReset(userId: string) {
  const sb = createServiceClient()
  const { data: user, error: fetchErr } = await sb.auth.admin.getUserById(userId)
  if (fetchErr || !user?.user?.email) return { error: fetchErr?.message ?? 'No email' }
  const { error } = await sb.auth.resetPasswordForEmail(user.user.email)
  if (error) return { error: error.message }
  return null
}

export async function restrictUser(userId: string) {
  const sb = createServiceClient()
  const { error } = await sb.from('profiles').update({ is_restricted: true }).eq('id', userId)
  if (error) return { error: error.message }
  return null
}

export async function blockUser(userId: string) {
  const sb = createServiceClient()
  const { error } = await sb.auth.admin.updateUserById(userId, { ban_duration: '87600h' })
  if (error) return { error: error.message }
  return null
}

export async function removeUser(userId: string) {
  const sb = createServiceClient()
  const { error } = await sb.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  return null
}

export async function approveVenue(venueId: string): Promise<void> {
  const sb = createServiceClient()
  await sb.from('venues').update({ is_approved: true }).eq('id', venueId)
}

export async function unapproveVenue(venueId: string): Promise<void> {
  const sb = createServiceClient()
  await sb.from('venues').update({ is_approved: false }).eq('id', venueId)
}
