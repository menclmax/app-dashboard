export type UserPlan = "free" | "pro" | "premium"
export type UserStatus = "active" | "suspended" | "banned"

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  plan: UserPlan
  status: UserStatus
  verified: boolean
  joinedAt: string
  lastSeen: string
  isOnline: boolean
  spotsAdded: number
  reviews: number
}

export type PlaceStatus = "pending" | "approved" | "rejected"
export type PlaceCategory = "cafe" | "specialty" | "roastery" | "bakery-cafe" | "coworking"

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  address: string
  city: string
  submittedBy: string
  submittedById: string
  submittedAt: string
  status: PlaceStatus
  images: number
  description: string
  rejectionNote?: string
}

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Sofia Andrade", email: "sofia@example.com", avatar: null, plan: "pro", status: "active", verified: true, joinedAt: "2024-01-15", lastSeen: "2026-04-16T10:22:00Z", isOnline: true, spotsAdded: 12, reviews: 34 },
  { id: "u2", name: "Lucas Ferreira", email: "lucas@example.com", avatar: null, plan: "free", status: "active", verified: true, joinedAt: "2024-03-02", lastSeen: "2026-04-16T09:58:00Z", isOnline: true, spotsAdded: 4, reviews: 11 },
  { id: "u3", name: "Mariana Costa", email: "mariana@example.com", avatar: null, plan: "premium", status: "active", verified: true, joinedAt: "2023-11-20", lastSeen: "2026-04-16T10:01:00Z", isOnline: true, spotsAdded: 28, reviews: 91 },
  { id: "u4", name: "João Mendes", email: "joao@example.com", avatar: null, plan: "free", status: "suspended", verified: false, joinedAt: "2025-06-10", lastSeen: "2026-04-14T18:30:00Z", isOnline: false, spotsAdded: 1, reviews: 2 },
  { id: "u5", name: "Beatriz Lima", email: "beatriz@example.com", avatar: null, plan: "pro", status: "active", verified: true, joinedAt: "2024-07-25", lastSeen: "2026-04-16T08:45:00Z", isOnline: true, spotsAdded: 7, reviews: 19 },
  { id: "u6", name: "Rafael Santos", email: "rafael@example.com", avatar: null, plan: "free", status: "banned", verified: false, joinedAt: "2025-02-14", lastSeen: "2026-03-01T12:00:00Z", isOnline: false, spotsAdded: 0, reviews: 0 },
  { id: "u7", name: "Camila Rocha", email: "camila@example.com", avatar: null, plan: "premium", status: "active", verified: true, joinedAt: "2023-08-05", lastSeen: "2026-04-15T20:10:00Z", isOnline: false, spotsAdded: 41, reviews: 110 },
  { id: "u8", name: "Pedro Alves", email: "pedro@example.com", avatar: null, plan: "free", status: "active", verified: false, joinedAt: "2026-04-16", lastSeen: "2026-04-16T10:30:00Z", isOnline: true, spotsAdded: 0, reviews: 0 },
  { id: "u9", name: "Isabela Nunes", email: "isabela@example.com", avatar: null, plan: "pro", status: "active", verified: true, joinedAt: "2024-09-18", lastSeen: "2026-04-16T07:55:00Z", isOnline: false, spotsAdded: 9, reviews: 27 },
  { id: "u10", name: "Gabriel Torres", email: "gabriel@example.com", avatar: null, plan: "free", status: "active", verified: true, joinedAt: "2025-01-08", lastSeen: "2026-04-16T09:12:00Z", isOnline: true, spotsAdded: 3, reviews: 8 },
]

export const MOCK_PLACES: Place[] = [
  { id: "p1", name: "Grão Coffee Lab", category: "specialty", address: "Rua Augusta 1420", city: "São Paulo", submittedBy: "Sofia Andrade", submittedById: "u1", submittedAt: "2026-04-16T08:00:00Z", status: "pending", images: 4, description: "Minimalist specialty coffee lab with single origin pour-overs and a rotating menu of seasonal blends." },
  { id: "p2", name: "Brisa Café", category: "cafe", address: "Av. Atlântica 300", city: "Rio de Janeiro", submittedBy: "Mariana Costa", submittedById: "u3", submittedAt: "2026-04-15T14:30:00Z", status: "pending", images: 6, description: "Cozy beachside café serving espresso drinks and homemade pastries." },
  { id: "p3", name: "The Roast Room", category: "roastery", address: "Rua Oscar Freire 88", city: "São Paulo", submittedBy: "Camila Rocha", submittedById: "u7", submittedAt: "2026-04-14T11:00:00Z", status: "pending", images: 3, description: "In-house micro-roastery offering guided tasting sessions and beans for retail." },
  { id: "p4", name: "Pão & Café", category: "bakery-cafe", address: "Rua da Consolação 512", city: "São Paulo", submittedBy: "Lucas Ferreira", submittedById: "u2", submittedAt: "2026-04-13T09:15:00Z", status: "approved", images: 5, description: "Artisanal bakery with a full espresso bar and freshly baked sourdough." },
  { id: "p5", name: "Café Nômade", category: "coworking", address: "Rua Harmonia 210", city: "São Paulo", submittedBy: "Beatriz Lima", submittedById: "u5", submittedAt: "2026-04-12T16:45:00Z", status: "approved", images: 7, description: "Remote-work-friendly café with fast Wi-Fi, private booths, and all-day breakfast." },
  { id: "p6", name: "Colina Espresso", category: "specialty", address: "Rua Padre Chagas 90", city: "Porto Alegre", submittedBy: "João Mendes", submittedById: "u4", submittedAt: "2026-04-11T13:00:00Z", status: "rejected", images: 1, description: "Tiny spot with just a counter and two tables.", rejectionNote: "Too few images submitted. Please add at least 3 photos of the interior and exterior before resubmitting." },
  { id: "p7", name: "Fazenda Urbana", category: "roastery", address: "Alameda Santos 755", city: "São Paulo", submittedBy: "Gabriel Torres", submittedById: "u10", submittedAt: "2026-04-16T09:45:00Z", status: "pending", images: 2, description: "Urban farm-to-cup roastery sourcing beans directly from Brazilian cerrado farms." },
]

export const STATS = {
  totalUsers: 10,
  newSignupsToday: 1,
  onlineNow: 6,
  pendingApprovals: 4,
  totalPlaces: 7,
  approvedPlaces: 2,
  totalReviews: 302,
  monthlyGrowth: 18,
}
