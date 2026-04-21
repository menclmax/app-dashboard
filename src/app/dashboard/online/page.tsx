import { getOnlineUsers, getRecentlyOfflineUsers } from "@/lib/data"
import { OnlineClient } from "./online-client"

export default async function OnlineUsersPage() {
  const [onlineUsers, recentlyOffline] = await Promise.all([
    getOnlineUsers(),
    getRecentlyOfflineUsers(),
  ])
  return <OnlineClient initialOnline={onlineUsers} initialOffline={recentlyOffline} />
}
