import express from 'express'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Example protected route - get user profile
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    profile: {
      ...req.user,
      createdAt: new Date().toISOString(),
    },
  })
})

// Example protected route - complete verification
router.post('/complete-verification', verifyToken, (req, res) => {
  const { phone, amount } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  // In production, process M-PESA payment here
  res.json({
    success: true,
    message: 'Verification completed successfully',
    verification: {
      userId: req.user.id,
      email: req.user.email,
      phone,
      amount: 100,
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
