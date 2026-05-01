import express from 'express'
import axios from 'axios'
import { generateToken, verifyToken } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'

const router = express.Router()

// Google OAuth callback handler
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

    const googleData = {
      googleId: response.data.id,
      email: response.data.email,
      name: response.data.name,
      picture: response.data.picture,
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: googleData.email },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleData.email,
          name: googleData.name,
          picture: googleData.picture,
          googleId: googleData.googleId,
        },
      })
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { email: googleData.email },
        data: {
          name: googleData.name,
          picture: googleData.picture,
          googleId: googleData.googleId,
        },
      })
    }

    // Generate JWT
    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    })

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    })
  } catch (error) {
    console.error('Callback error:', error.message)
    res.status(500).json({ error: 'Callback failed', details: error.message })
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
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { verification: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        verified: user.verified,
        verification: user.verification,
      },
    })
  } catch (error) {
    console.error('Get user error:', error.message)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
