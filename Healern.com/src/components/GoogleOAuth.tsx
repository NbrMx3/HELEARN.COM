import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import type { ReactNode } from 'react'

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here.apps.googleusercontent.com'

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}

export { GoogleLogin }
