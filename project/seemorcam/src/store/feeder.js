import { reactive } from 'vue'

/* ===== Mock Demo Data Store ===== */

export const useFeederStore = reactive({
  /* ---- User ---- */
  user: {
    email: 'demo@seemorcam.com',
    avatar: '',
    nickname: 'Pet Lover'
  },

  /* ---- Device ---- */
  device: {
    id: 'FEED-001',
    name: 'Kitchen Feeder',
    sn: 'SM2024FEED001',
    online: true,
    foodLevel: 65,        // 0-100%
    foodLevelGrams: 650,  // estimated grams remaining
    feedingSpeed: 'medium', // slow | medium | fast
    nextFeed: { time: '18:00', portions: 5 },
    model: 'Smart Pet Feeder Pro',
    firmware: 'v1.2.0',
    bindTime: '2026-07-15 14:30'
  },

  /* ---- Feeding Schedules ---- */
  schedules: [
    { id: 1, time: '07:00', portions: 3, enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], label: 'Breakfast' },
    { id: 2, time: '12:00', portions: 2, enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], label: 'Lunch' },
    { id: 3, time: '18:00', portions: 5, enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], label: 'Dinner' }
  ],

  /* ---- Feeding History ---- */
  history: [
    { id: 1, time: '2026-08-05 18:00', portions: 5, type: 'scheduled', status: 'success' },
    { id: 2, time: '2026-08-05 15:22', portions: 2, type: 'manual', status: 'success' },
    { id: 3, time: '2026-08-05 12:00', portions: 2, type: 'scheduled', status: 'success' },
    { id: 4, time: '2026-08-05 07:00', portions: 3, type: 'scheduled', status: 'success' },
    { id: 5, time: '2026-08-04 18:00', portions: 5, type: 'scheduled', status: 'success' },
    { id: 6, time: '2026-08-04 12:00', portions: 2, type: 'scheduled', status: 'success' },
    { id: 7, time: '2026-08-04 07:00', portions: 3, type: 'scheduled', status: 'success' }
  ],

  /* ---- Notifications ---- */
  notifications: [
    { id: 1, type: 'alert', title: 'Food Level Low', message: 'Kitchen Feeder has less than 20% food remaining. Please refill soon.', time: '2026-08-05 16:30', read: false },
    { id: 2, type: 'info', title: 'Feeding Completed', message: 'Scheduled feeding at 12:00 completed successfully (2 portions).', time: '2026-08-05 12:00', read: true },
    { id: 3, type: 'info', title: 'Feeding Completed', message: 'Scheduled feeding at 07:00 completed successfully (3 portions).', time: '2026-08-05 07:00', read: true },
    { id: 4, type: 'alert', title: 'Device Offline', message: 'Kitchen Feeder went offline at 08/04 22:15. Please check your network connection.', time: '2026-08-04 22:15', read: true },
    { id: 5, type: 'info', title: 'Device Back Online', message: 'Kitchen Feeder is back online.', time: '2026-08-04 22:18', read: true },
    { id: 6, type: 'success', title: 'Device Bound', message: 'Kitchen Feeder (SM2024FEED001) successfully bound to your account.', time: '2026-08-04 14:30', read: true }
  ],

  /* ---- Settings ---- */
  settings: {
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    language: 'English'
  }
})

/* ---- Actions ---- */

export function doFeed(portions) {
  const record = {
    id: Date.now(),
    time: new Date().toLocaleString('en-US', { hour12: false }),
    portions,
    type: 'manual',
    status: 'success'
  }
  useFeederStore.history.unshift(record)
  return record
}

export function addSchedule(schedule) {
  const newSchedule = {
    id: Date.now(),
    ...schedule,
    enabled: true
  }
  useFeederStore.schedules.push(newSchedule)
  return newSchedule
}

export function deleteSchedule(id) {
  const idx = useFeederStore.schedules.findIndex(s => s.id === id)
  if (idx > -1) useFeederStore.schedules.splice(idx, 1)
}

export function toggleSchedule(id) {
  const s = useFeederStore.schedules.find(s => s.id === id)
  if (s) s.enabled = !s.enabled
}

export function setFeedingSpeed(speed) {
  useFeederStore.device.feedingSpeed = speed
}

export function bindDevice(name, sn) {
  useFeederStore.device.name = name
  useFeederStore.device.sn = sn
  useFeederStore.device.bindTime = new Date().toLocaleString('en-US', { hour12: false })
  useFeederStore.notifications.unshift({
    id: Date.now(),
    type: 'success',
    title: 'Device Bound',
    message: `${name} (${sn}) successfully bound to your account.`,
    time: new Date().toLocaleString('en-US', { hour12: false }),
    read: false
  })
}

export function markNotificationRead(id) {
  const n = useFeederStore.notifications.find(n => n.id === id)
  if (n) n.read = true
}

export function getUnreadCount() {
  return useFeederStore.notifications.filter(n => !n.read).length
}
