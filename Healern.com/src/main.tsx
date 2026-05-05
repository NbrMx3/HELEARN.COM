import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

function setupDevExtensionNoiseFilter() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return
  }

  const ignoredSnippets = [
    'Unchecked runtime.lastError: The message port closed before a response was received.',
    'Could not establish connection. Receiving end does not exist.',
  ]

  const originalConsoleError = console.error.bind(console)

  console.error = (...args: unknown[]) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : arg instanceof Error ? arg.message : ''))
      .join(' ')

    if (ignoredSnippets.some((snippet) => message.includes(snippet))) {
      return
    }

    originalConsoleError(...args)
  }

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const reasonText =
      typeof reason === 'string'
        ? reason
        : reason instanceof Error
          ? `${reason.message} ${reason.stack ?? ''}`
          : ''

    if (ignoredSnippets.some((snippet) => reasonText.includes(snippet))) {
      event.preventDefault()
    }
  })
}

setupDevExtensionNoiseFilter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
