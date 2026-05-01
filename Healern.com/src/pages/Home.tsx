import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'

export function Home() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Button
        className="min-w-[180px] px-8 py-3 text-base tracking-[0.12em]"
        onClick={() => {
          navigate('/register')
        }}
      >
        JOIN NOW
      </Button>
    </main>
  )
}
