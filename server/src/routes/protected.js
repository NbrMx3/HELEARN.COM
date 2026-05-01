import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'

const router = express.Router()

// Get user profile with verification details
router.get('/profile', verifyToken, async (req, res) => {
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
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        verified: user.verified,
        verification: user.verification,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Profile error:', error.message)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Complete account verification with payment
router.post('/complete-verification', verifyToken, async (req, res) => {
  try {
    const { phone, amount } = req.body

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    if (!amount || amount !== 100) {
      return res.status(400).json({ error: 'Invalid payment amount' })
    }

    // Check if user already has a verification record
    let verification = await prisma.verification.findUnique({
      where: { userId: req.user.id },
    })

    if (verification) {
      // Update existing verification
      verification = await prisma.verification.update({
        where: { userId: req.user.id },
        data: {
          phone,
          amount,
          status: 'completed',
          paymentRef: `MPESA-${Date.now()}`,
          verifiedAt: new Date(),
        },
      })
    } else {
      // Create new verification record
      verification = await prisma.verification.create({
        data: {
          userId: req.user.id,
          phone,
          amount,
          status: 'completed',
          paymentRef: `MPESA-${Date.now()}`,
          verifiedAt: new Date(),
        },
      })
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        verified: true,
        phone,
        verificationId: verification.id,
      },
      include: { verification: true },
    })

    res.json({
      success: true,
      message: 'Verification completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        verified: updatedUser.verified,
      },
      verification: {
        id: verification.id,
        userId: verification.userId,
        phone: verification.phone,
        amount: verification.amount,
        status: verification.status,
        paymentRef: verification.paymentRef,
        verifiedAt: verification.verifiedAt,
      },
    })
  } catch (error) {
    console.error('Verification error:', error.message)
    res.status(500).json({ error: 'Failed to complete verification', details: error.message })
  }
})

export default router
