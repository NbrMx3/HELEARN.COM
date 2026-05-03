import { useEffect, useState } from 'react'
import { getStoredTheme, storeTheme } from '../lib/storage'
import type { ThemeMode } from '../lib/storage'

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme() ?? 'system')

  useEffect(() => {
    applyMode(mode)
    storeTheme(mode)
  }, [mode])

  function applyMode(m: ThemeMode) {
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

  return (
    <div className="inline-flex items-center gap-2">
      <label className="sr-only">Theme</label>
      <select
        aria-label="Theme"
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
        className="rounded-md border bg-white/80 px-2 py-1 text-sm shadow-sm dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="system">Default</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
