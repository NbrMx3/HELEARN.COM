import { spawn } from 'node:child_process'

const targetUrl = process.argv[2] || 'http://localhost:5173'
const platform = process.platform

function launch(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
      shell: platform === 'win32',
    })

    child.once('error', () => resolve(false))
    child.once('spawn', () => {
      child.unref()
      resolve(true)
    })
  })
}

async function openCleanBrowser() {
  const candidates =
    platform === 'win32'
      ? [
          { command: 'chrome', args: ['--incognito', '--disable-extensions', targetUrl], label: 'Google Chrome' },
          { command: 'msedge', args: ['--inprivate', '--disable-extensions', targetUrl], label: 'Microsoft Edge' },
          { command: 'start', args: [targetUrl], label: 'default browser' },
        ]
      : platform === 'darwin'
        ? [
            {
              command: 'open',
              args: ['-na', 'Google Chrome', '--args', '--incognito', '--disable-extensions', targetUrl],
              label: 'Google Chrome',
            },
            {
              command: 'open',
              args: ['-na', 'Microsoft Edge', '--args', '--inprivate', '--disable-extensions', targetUrl],
              label: 'Microsoft Edge',
            },
            { command: 'open', args: [targetUrl], label: 'default browser' },
          ]
        : [
            { command: 'google-chrome', args: ['--incognito', '--disable-extensions', targetUrl], label: 'Google Chrome' },
            { command: 'microsoft-edge', args: ['--inprivate', '--disable-extensions', targetUrl], label: 'Microsoft Edge' },
            { command: 'xdg-open', args: [targetUrl], label: 'default browser' },
          ]

  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await launch(candidate.command, candidate.args)
    if (ok) {
      console.log(`[open-clean-browser] Opened ${candidate.label} at ${targetUrl}`)
      return
    }
  }

  console.log(`[open-clean-browser] Unable to launch a browser automatically. Open this URL manually: ${targetUrl}`)
  process.exitCode = 1
}

void openCleanBrowser()
