import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Register } from './pages/Register'
import { Verify } from './pages/Verify'
import { useEffect } from 'react'
import { ThemeToggle } from './components/ThemeToggle'

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

    // Pointer/touch and trackpad wheel gesture handling
    let pointerDown = false
    let pointerStartX = 0
    let wheelAccum = 0
    let lastWheelTime = 0

    function isEditableFocused() {
      const active = document.activeElement
      const tag = active?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || (active as HTMLElement | null)?.isContentEditable
    }

    function onPointerDown(e: PointerEvent) {
      if (!enabled) return
      // only consider primary pointers
      if ((e as PointerEvent).isPrimary === false) return
      pointerDown = true
      pointerStartX = e.clientX
    }

    function onPointerUp(e: PointerEvent) {
      if (!enabled) return
      if (!pointerDown) return
      pointerDown = false
      if (isEditableFocused()) return
      const dx = e.clientX - pointerStartX
      const threshold = 80
      const idx = routes.indexOf(location.pathname)
      if (dx <= -threshold && idx < routes.length - 1) {
        navigate(routes[idx + 1])
      } else if (dx >= threshold && idx > 0) {
        navigate(routes[idx - 1])
      }
    }

    function onWheel(e: WheelEvent) {
      if (!enabled) return
      if (isEditableFocused()) return
      // prefer horizontal gestures
      const now = Date.now()
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return

      // reset accumulation if time gap
      if (now - lastWheelTime > 300) wheelAccum = 0
      lastWheelTime = now
      wheelAccum += e.deltaX

      // threshold for trackpad swipe (tuned for common devices)
      const WHEEL_THRESHOLD = 120
      const idx = routes.indexOf(location.pathname)

      if (wheelAccum >= WHEEL_THRESHOLD && idx < routes.length - 1) {
        wheelAccum = 0
        navigate(routes[idx + 1])
      } else if (wheelAccum <= -WHEEL_THRESHOLD && idx > 0) {
        wheelAccum = 0
        navigate(routes[idx - 1])
      }
    }

    function onMediaChange(ev: MediaQueryListEvent) {
      enabled = ev.matches
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('wheel', onWheel)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMediaChange)
    } else {
      // older browsers
      // @ts-ignore
      mq.addListener(onMediaChange)
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('wheel', onWheel)
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', onMediaChange)
      } else {
        // @ts-ignore
        mq.removeListener(onMediaChange)
      }
    }
  }, [location.pathname, navigate])

  return (
    <div className="min-h-screen">
      <header className="pointer-events-auto fixed right-4 top-4 z-50"> 
        <ThemeToggle />
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
