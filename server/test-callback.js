#!/usr/bin/env node

/**
 * Test Daraja Callback Helper
 * 
 * Run this to simulate a successful M-PESA payment callback from Daraja
 * Usage: node test-callback.js <registeredPhone> [status]
 * 
 * Examples:
 *   node test-callback.js 0712345678
 *   node test-callback.js 254712345678 SUCCESS
 */

import axios from 'axios'

const args = process.argv.slice(2)
const registeredPhone = args[0]
const status = args[1]?.toUpperCase() ?? 'SUCCESS'

if (!registeredPhone) {
  console.error('Usage: node test-callback.js <registeredPhone> [status]')
  console.error('Example: node test-callback.js 0712345678 SUCCESS')
  process.exit(1)
}

// Normalize phone number (strip non-digits, ensure it's valid)
const normalizedPhone = String(registeredPhone).replace(/\D/g, '')
if (normalizedPhone.length < 9) {
  console.error('Invalid phone number. Must be at least 9 digits.')
  process.exit(1)
}

const isSuccess = status === 'SUCCESS'
const resultCode = isSuccess ? 0 : 1

// Create a mock Daraja STK callback payload
const mockCallback = {
  Body: {
    stkCallback: {
      MerchantRequestID: `test-merchant-${Date.now()}`,
      CheckoutRequestID: `test-checkout-${Date.now()}`,
      ResultCode: resultCode,
      ResultDesc: isSuccess ? 'The service request has been processed successfully.' : 'User cancelled.',
      CallbackMetadata: isSuccess
        ? {
            Item: [
              { Name: 'Amount', Value: 100 },
              { Name: 'MpesaReceiptNumber', Value: `TEST${Date.now()}` },
              { Name: 'TransactionDate', Value: formatDarajaTimestamp() },
              { Name: 'PhoneNumber', Value: normalizedPhone },
            ],
          }
        : undefined,
    },
  },
}

async function sendCallback() {
  try {
    console.log(`\n📤 Sending ${status} callback for phone: ${registeredPhone}`)
    console.log('Payload:', JSON.stringify(mockCallback, null, 2))

    const response = await axios.post('http://localhost:3001/api/mpesa/callback', mockCallback, {
      headers: { 'Content-Type': 'application/json' },
    })

    console.log('\n✅ Callback sent successfully!')
    console.log('Response:', response.data)

    // Check the payment status
    console.log(`\n🔍 Checking payment status for ${registeredPhone}...`)
    const statusResponse = await axios.get(`http://localhost:3001/api/mpesa/status/${registeredPhone}`)
    console.log('Status:', statusResponse.data)

    if (statusResponse.data.verified) {
      console.log('\n✨ User is now verified!')
    }
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message)
    process.exit(1)
  }
}

function formatDarajaTimestamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

sendCallback()
