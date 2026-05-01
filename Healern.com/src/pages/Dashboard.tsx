import { LogOut, Shield, Smartphone, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h1>
            <p className="mt-1 text-slate-400">Your account dashboard</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {user.picture && (
                    <img
                      alt={user.name}
                      className="h-16 w-16 rounded-full border-2 border-blue-500"
                      src={user.picture}
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-slate-400">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Verified</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-800/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Account Status</span>
                <User className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">Active</p>
              <p className="text-xs text-slate-500">Verification complete</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border-emerald-800/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Verification Fee</span>
                <Smartphone className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">Ksh 100</p>
              <p className="text-xs text-slate-500">Paid via M-PESA</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border-purple-800/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Member Since</span>
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">Today</p>
              <p className="text-xs text-slate-500">Welcome aboard!</p>
            </div>
          </Card>
        </div>

        {/* Account Details */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Account Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between rounded-lg bg-slate-700/50 px-4 py-3">
                <span className="text-slate-300">Email</span>
                <span className="font-medium text-white">{user.email}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-700/50 px-4 py-3">
                <span className="text-slate-300">Name</span>
                <span className="font-medium text-white">{user.name}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-700/50 px-4 py-3">
                <span className="text-slate-300">User ID</span>
                <span className="font-mono text-sm text-slate-300">{user.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between rounded-lg bg-emerald-500/10 px-4 py-3">
                <span className="text-slate-300">Status</span>
                <span className="font-medium text-emerald-400">Verified</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button className="justify-center" variant="secondary">
                Download Receipt
              </Button>
              <Button className="justify-center" variant="secondary">
                View History
              </Button>
              <Button className="justify-center" variant="secondary">
                Update Profile
              </Button>
              <Button
                className="justify-center"
                variant="secondary"
                onClick={() => navigate('/', { replace: true })}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>© 2026 HELAEARN AGENCY. All rights reserved.</p>
        </div>
      </div>
    </main>
  )
}
