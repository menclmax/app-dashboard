'use server'
import { createServiceClient } from '@/lib/supabase'

export type AppNotification = {
  id: string
  title: string
  body: string
  time: string
  href?: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export async function getNotifications(): Promise<AppNotification[]> {
  const sb = createServiceClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: newUsers }, { data: pendingVenues }, { data: recentReviews }] = await Promise.all([
    sb
      .from('profiles')
      .select('id, username, name, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10),
    sb
      .from('venues')
      .select('id, name, created_at, profiles(name, username)')
      .eq('is_user_submitted', true)
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
      .limit(10),
    sb
      .from('reviews')
      .select('id, created_at, venue_id, venues(name)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const notifications: (AppNotification & { _iso: string })[] = []

  for (const u of newUsers ?? []) {
    notifications.push({
      id: `user-${u.id}`,
      title: 'New user registered',
      body: `${u.name ?? u.username} joined the platform.`,
      time: timeAgo(u.created_at),
      href: '/dashboard/users',
      _iso: u.created_at,
    })
  }

  for (const v of pendingVenues ?? []) {
    const by = (v as any).profiles?.name ?? (v as any).profiles?.username ?? 'someone'
    notifications.push({
      id: `venue-${v.id}`,
      title: 'Approval request',
      body: `Pending approval for place "${v.name}" submitted by ${by}.`,
      time: timeAgo(v.created_at),
      href: '/dashboard/approvals',
      _iso: v.created_at,
    })
  }

  for (const r of recentReviews ?? []) {
    const venueName = (r as any).venues?.name ?? 'a venue'
    notifications.push({
      id: `review-${r.id}`,
      title: 'New review',
      body: `A review was posted for "${venueName}".`,
      time: timeAgo(r.created_at),
      href: '/dashboard/places',
      _iso: r.created_at,
    })
  }

  notifications.sort((a, b) => new Date(b._iso).getTime() - new Date(a._iso).getTime())

  return notifications.slice(0, 10).map(({ _iso: _, ...n }) => n)
}
