let timer = null

export function showToast(message, duration = 2000) {
  const existing = document.querySelector('.global-toast')
  if (existing) existing.remove()
  clearTimeout(timer)

  const el = document.createElement('div')
  el.className = 'global-toast'
  el.textContent = message
  document.body.appendChild(el)

  timer = setTimeout(() => {
    el.classList.add('global-toast--out')
    setTimeout(() => el.remove(), 300)
  }, duration)
}
