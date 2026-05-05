import { execSync } from 'node:child_process'

const requestedPorts = process.argv
  .slice(2)
  .map((value) => Number(value))
  .filter((value) => Number.isInteger(value) && value > 0)

const ports = requestedPorts.length > 0 ? [...new Set(requestedPorts)] : [5173, 3001]
const isWindows = process.platform === 'win32'

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return ''
  }
}

function getPidsForPort(port) {
  if (isWindows) {
    const output = runCommand(`netstat -ano -p tcp | findstr :${port}`)
    return [...new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.includes(`:${port}`))
        .map((line) => {
          const segments = line.split(/\s+/)
          return Number(segments[segments.length - 1])
        })
        .filter((pid) => Number.isInteger(pid) && pid > 0),
    )]
  }

  const output = runCommand(`lsof -ti tcp:${port}`)
  return [...new Set(
    output
      .split(/\r?\n/)
      .map((value) => Number(value.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0),
  )]
}

function killPid(pid) {
  if (pid === process.pid) {
    return false
  }

  try {
    if (isWindows) {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
    } else {
      process.kill(pid, 'SIGKILL')
    }
    return true
  } catch {
    return false
  }
}

for (const port of ports) {
  const pids = getPidsForPort(port)

  if (pids.length === 0) {
    console.log(`[free-ports] Port ${port} is already free.`)
    continue
  }

  let killedAny = false
  for (const pid of pids) {
    if (killPid(pid)) {
      killedAny = true
      console.log(`[free-ports] Killed PID ${pid} on port ${port}.`)
    }
  }

  if (!killedAny) {
    console.log(`[free-ports] Found process(es) on port ${port} but could not kill them.`)
  }
}
