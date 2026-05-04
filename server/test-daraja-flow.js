#!/usr/bin/env node

/**
 * End-to-end Daraja sandbox test helper.
 *
 * This script seeds a registered user and a pending payment transaction,
 * replays a mock Daraja callback against the live backend, and then reads
 * back the payment status to confirm verification completed.
 *
 * Usage:
 *   node test-daraja-flow.js <registeredPhone> [SUCCESS|FAILED]
 *   npm run test:daraja -- 0712345678
 */

import axios from 'axios'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const args = process.argv.slice(2)
const registeredPhone = args[0]
const status = (args[1] ?? 'SUCCESS').toUpperCase()

if (!registeredPhone) {
  console.error('Usage: node test-daraja-flow.js <registeredPhone> [SUCCESS|FAILED]')
  console.error('Example: node test-daraja-flow.js 0712345678 SUCCESS')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Load server/.env before running this script.')
  process.exit(1)
}

const normalizedPhone = String(registeredPhone).replace(/\D/g, '')
if (normalizedPhone.length < 9) {
  console.error('Invalid phone number. Must contain at least 9 digits.')
  process.exit(1)
}

const isSuccess = status === 'SUCCESS'
const checkoutRequestId = `test-checkout-${Date.now()}`
const merchantRequestId = `test-merchant-${Date.now()}`
const receiptNumber = `TEST${Date.now()}`

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
      ? undefined
      : { rejectUnauthorized: false },
})

function formatDarajaTimestamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

async function seedTestTransaction() {
  await pool.query(
    `INSERT INTO registered_users (
      phone,
      display_name,
      email,
      country,
      password,
      invited_by,
      verified,
      verified_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NULL, NOW())
    ON CONFLICT (phone) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email,
      country = EXCLUDED.country,
      password = EXCLUDED.password,
      invited_by = EXCLUDED.invited_by,
      verified = FALSE,
      verified_at = NULL,
      updated_at = NOW()`,
    [normalizedPhone, 'Test User', 'test@example.com', 'Kenya', 'password', 'invitee'],
  )

  await pool.query(
    `INSERT INTO payment_transactions (
      registered_phone,
      payer_phone,
      amount,
      status,
      merchant_request_id,
      checkout_request_id,
      response_description,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, NOW(), NOW())
    ON CONFLICT (checkout_request_id) DO UPDATE SET
      registered_phone = EXCLUDED.registered_phone,
      payer_phone = EXCLUDED.payer_phone,
      amount = EXCLUDED.amount,
      status = 'PENDING',
      merchant_request_id = EXCLUDED.merchant_request_id,
      response_description = EXCLUDED.response_description,
      updated_at = NOW()`,
    [normalizedPhone, normalizedPhone, 100, merchantRequestId, checkoutRequestId, 'Seeded for callback test'],
  )
}

async function run() {
  try {
    console.log(`\nSeeding test transaction for ${registeredPhone}...`)
    await seedTestTransaction()

    const callbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: merchantRequestId,
          CheckoutRequestID: checkoutRequestId,
          ResultCode: isSuccess ? 0 : 1,
          ResultDesc: isSuccess
            ? 'The service request has been processed successfully.'
            : 'User cancelled the payment.',
          ...(isSuccess
            ? {
                CallbackMetadata: {
                  Item: [
                    { Name: 'Amount', Value: 100 },
                    { Name: 'MpesaReceiptNumber', Value: receiptNumber },
                    { Name: 'TransactionDate', Value: formatDarajaTimestamp() },
                    { Name: 'PhoneNumber', Value: normalizedPhone },
                  ],
                },
              }
            : {}),
        },
      },
    }

    console.log(`Replaying ${status} callback against http://localhost:3001/api/mpesa/callback...`)
    const callbackResponse = await axios.post('http://localhost:3001/api/mpesa/callback', callbackPayload, {
      headers: { 'Content-Type': 'application/json' },
    })

    console.log('Callback response:', callbackResponse.data)

    const statusResponse = await axios.get(`http://localhost:3001/api/mpesa/status/${registeredPhone}`)
    console.log('Status response:', statusResponse.data)

    if (statusResponse.data.verified) {
      console.log('\nVerification completed successfully.')
    } else {
      console.log('\nVerification did not complete.')
    }
  } catch (error) {
    console.error('\nDaraja test failed:', error.response?.data || error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()