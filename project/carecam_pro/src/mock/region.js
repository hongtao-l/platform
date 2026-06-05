export function fetchRegionInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: {
          regionCode: 'ap-southeast',
          regionName: '亚太（新加坡）',
          regionNameEn: 'Asia Pacific (Singapore)',
          serverHost: 'ap.example.com',
          assignedAt: '2025-01-15T10:30:00Z',
          isCrossRegion: true
        }
      })
    }, 300)
  })
}
