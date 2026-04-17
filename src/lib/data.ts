import 'server-only'
import { createServiceClient } from './supabase'

export type Profile = {
  id: string
  username: string
  name: string | null
  avatar_url: string | null
  verified: boolean
  last_seen: string | null
  created_at: string | null
  xp: number
  level: number
  is_admin: boolean
}

export type Venue = {
  id: string
  name: string
  address: string | null
  created_at: string | null
  is_approved: boolean
  is_user_submitted: boolean
  tags: string[] | null
  rating: number | null
  review_count: number | null
  submitted_by: string | null
  submitted_by_name: string | null
  submitted_by_username: string | null
}

export type DashboardStats = {
  totalUsers: number
  newToday: number
  newYesterday: number
  onlineNow: number
  pendingApprovals: number
  totalVenues: number
  approvedVenues: number
  totalReviews: number
  signupsThisMonth: number
  signupsLastMonth: number
  venuesThisMonth: number
  venuesLastMonth: number
  reviewsThisMonth: number
  reviewsLastMonth: number
}

function startOfDay(offset = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d.toISOString()
}

function startOfMonth(offset = 0) {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  d.setMonth(d.getMonth() + offset)
  return d.toISOString()
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const sb = createServiceClient()
  const onlineThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newYesterday },
    { count: onlineNow },
    { count: pendingApprovals },
    { count: totalVenues },
    { count: approvedVenues },
    { count: totalReviews },
    { count: signupsThisMonth },
    { count: signupsLastMonth },
    { count: venuesThisMonth },
    { count: venuesLastMonth },
    { count: reviewsThisMonth },
    { count: reviewsLastMonth },
  ] = await Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay()),
    sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay(-1)).lt('created_at', startOfDay()),
    sb.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', onlineThreshold),
    sb.from('venues').select('*', { count: 'exact', head: true }).eq('is_user_submitted', true).eq('is_approved', false),
    sb.from('venues').select('*', { count: 'exact', head: true }),
    sb.from('venues').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    sb.from('reviews').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth()),
    sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth(-1)).lt('created_at', startOfMonth()),
    sb.from('venues').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth()),
    sb.from('venues').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth(-1)).lt('created_at', startOfMonth()),
    sb.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth()),
    sb.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth(-1)).lt('created_at', startOfMonth()),
  ])

  return {
    totalUsers: totalUsers ?? 0,
    newToday: newToday ?? 0,
    newYesterday: newYesterday ?? 0,
    onlineNow: onlineNow ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    totalVenues: totalVenues ?? 0,
    approvedVenues: approvedVenues ?? 0,
    totalReviews: totalReviews ?? 0,
    signupsThisMonth: signupsThisMonth ?? 0,
    signupsLastMonth: signupsLastMonth ?? 0,
    venuesThisMonth: venuesThisMonth ?? 0,
    venuesLastMonth: venuesLastMonth ?? 0,
    reviewsThisMonth: reviewsThisMonth ?? 0,
    reviewsLastMonth: reviewsLastMonth ?? 0,
  }
}

export async function getRecentUsers(limit = 5): Promise<Profile[]> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('profiles')
    .select('id, username, name, avatar_url, verified, last_seen, created_at, xp, level, is_admin')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getOnlineUsers(): Promise<Profile[]> {
  const sb = createServiceClient()
  const threshold = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { data } = await sb
    .from('profiles')
    .select('id, username, name, avatar_url, verified, last_seen, created_at, xp, level, is_admin')
    .gte('last_seen', threshold)
    .order('last_seen', { ascending: false })
  return data ?? []
}

export async function getPendingVenues(limit = 5): Promise<Venue[]> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('venues')
    .select('id, name, address, created_at, is_approved, is_user_submitted, tags, rating, review_count, submitted_by, profiles(name, username)')
    .eq('is_user_submitted', true)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((v: any) => ({
    ...v,
    submitted_by_name: v.profiles?.name ?? null,
    submitted_by_username: v.profiles?.username ?? null,
    profiles: undefined,
  }))
}

export async function getAllUsers(): Promise<Profile[]> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('profiles')
    .select('id, username, name, avatar_url, verified, last_seen, created_at, xp, level, is_admin')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllVenues(): Promise<Venue[]> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('venues')
    .select('id, name, address, created_at, is_approved, is_user_submitted, tags, rating, review_count, submitted_by, profiles(name, username)')
    .order('created_at', { ascending: false })
  return (data ?? []).map((v: any) => ({
    ...v,
    submitted_by_name: v.profiles?.name ?? null,
    submitted_by_username: v.profiles?.username ?? null,
    profiles: undefined,
  }))
}
