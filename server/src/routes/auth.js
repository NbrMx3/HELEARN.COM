import express from 'express'
import axios from 'axios'
import { generateToken, verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Mock user database (replace with real DB in production)
const users = new Map()

// Verify Google token and create/update user
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'Credential is required' })
    }

    // Verify token with Google
    const response = await axios.post(
      'https://www.googleapis.com/oauth2/v1/tokeninfo',
      null,
      {
        params: {
          access_token: credential,
        },
      }
    )

    if (!response.data.email) {
      return res.status(400).json({ error: 'Unable to verify token' })
    }

    // Extract user info from credential (JWT)
    // In production, verify this properly with Google's public key
    let user = {
      id: response.data.user_id || `user-${Date.now()}`,
      email: response.data.email,
      name: response.data.name || 'User',
      picture: response.data.picture || null,
    }

    // Store user (replace with database)
    users.set(user.email, user)

    // Generate JWT token
    const token = generateToken(user)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    })
  } catch (error) {
    console.error('Auth error:', error.message)
    res.status(500).json({ error: 'Authentication failed', details: error.message })
  }
})

// Google OAuth callback handler (alternative approach)
router.post('/callback', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    // Verify token using Google API
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const userData = {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      picture: response.data.picture,
    }

    // Store user
    users.set(userData.email, userData)

    // Generate JWT
    const jwtToken = generateToken(userData)

    res.json({
      success: true,
      token: jwtToken,
      user: userData,
    })
  } catch (error) {
    console.error('Callback error:', error.message)
    res.status(500).json({ error: 'Callback failed' })
  }
})

// Verify JWT token
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

// Logout endpoint
router.post('/logout', (req, res) => {
  // Token is invalidated on client side
  // In production, you might maintain a blacklist
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

export default router
