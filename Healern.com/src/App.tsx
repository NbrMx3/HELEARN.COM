import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Register } from './pages/Register'
import { Verify } from './pages/Verify'
import { useEffect } from 'react'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const routes = ['/', '/register', '/verify']
    const mq = window.matchMedia('(min-width: 1024px)')
    let enabled = mq.matches

    function onKey(e: KeyboardEvent) {
      if (!enabled) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

      const active = document.activeElement
      const tag = active?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (active as HTMLElement | null)?.isContentEditable) return

      const idx = routes.indexOf(location.pathname)
      if (idx === -1) return

      if (e.key === 'ArrowRight' && idx < routes.length - 1) {
        navigate(routes[idx + 1])
      }

      if (e.key === 'ArrowLeft' && idx > 0) {
        navigate(routes[idx - 1])
      }
    }

    function onMediaChange(ev: MediaQueryListEvent) {
      enabled = ev.matches
    }

    window.addEventListener('keydown', onKey)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMediaChange)
    } else {
      // older browsers
      // @ts-ignore
      mq.addListener(onMediaChange)
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', onMediaChange)
      } else {
        // @ts-ignore
        mq.removeListener(onMediaChange)
      }
    }
  }, [location.pathname, navigate])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
