import { useEffect, useState } from 'react'
import { getStoredTheme, storeTheme } from '../lib/storage'
import type { ThemeMode } from '../lib/storage'
import { Sun, Moon, Monitor } from 'lucide-react'

function applyModeToDocument(m: ThemeMode) {
  if (typeof window === 'undefined') return
  const el = document.documentElement

  function setClassEnabled(enabled: boolean) {
    if (enabled) el.classList.add('dark')
    else el.classList.remove('dark')
  }

  if (m === 'system') {
    const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setClassEnabled(prefers)
  } else if (m === 'dark') {
    setClassEnabled(true)
  } else {
    setClassEnabled(false)
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme() ?? 'system')

  useEffect(() => {
    applyModeToDocument(mode)
    storeTheme(mode)
  }, [mode])

  // update when system preference changes while in `system` mode
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyModeToDocument('system')
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', handler)
    else mq.addListener(handler as any)
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', handler)
      else mq.removeListener(handler as any)
    }
  }, [mode])

  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-white/80 p-1 shadow-sm dark:bg-slate-800">
      <button
        aria-label="Default theme"
        title="Default (follow system)"
        onClick={() => setMode('system')}
        className={`p-2 rounded-md ${mode === 'system' ? 'ring-2 ring-offset-1 ring-sky-500' : 'hover:bg-white/60 dark:hover:bg-slate-700'}`}
      >
        <Monitor size={16} />
      </button>

      <button
        aria-label="Light theme"
        title="Light"
        onClick={() => setMode('light')}
        className={`p-2 rounded-md ${mode === 'light' ? 'ring-2 ring-offset-1 ring-sky-500' : 'hover:bg-white/60 dark:hover:bg-slate-700'}`}
      >
        <Sun size={16} />
      </button>

      <button
        aria-label="Dark theme"
        title="Dark"
        onClick={() => setMode('dark')}
        className={`p-2 rounded-md ${mode === 'dark' ? 'ring-2 ring-offset-1 ring-sky-500' : 'hover:bg-white/60 dark:hover:bg-slate-700'}`}
      >
        <Moon size={16} />
      </button>
    </div>
  )
}
