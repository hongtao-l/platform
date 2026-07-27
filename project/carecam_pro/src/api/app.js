import { ref } from 'vue'

// TODO: 接入真实 API — 替换为 request.get('/app/version')
export function checkAppVersion() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: {
          version: '1.2.0',
          downloadUrl: 'https://example.com/carecam-pro-v1.2.0.apk',
          releaseNotes: '• 修复夜间模式白平衡异常\n• 新增 AI 人形检测联动\n• 优化 P2P 连接速度\n• 支持全彩夜视模式'
        }
      })
    }, 500)
  })
}
