import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import { Pool } from 'pg'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const DARAJA_BASE_URL = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke'
const DARAJA_CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY || ''
const DARAJA_CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET || ''
const DARAJA_SHORTCODE = process.env.DARAJA_SHORTCODE || ''
const DARAJA_PASSKEY = process.env.DARAJA_PASSKEY || ''
const DARAJA_CALLBACK_URL = process.env.DARAJA_CALLBACK_URL || ''
const DARAJA_TRANSACTION_TYPE = process.env.DARAJA_TRANSACTION_TYPE || 'CustomerPayBillOnline'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')
		? { rejectUnauthorized: false }
		: undefined,
})

async function initializeDatabase() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS registered_users (
			phone TEXT PRIMARY KEY,
			display_name TEXT NOT NULL,
			email TEXT NOT NULL,
			country TEXT NOT NULL,
			password TEXT NOT NULL,
			invited_by TEXT NOT NULL,
			verified BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			verified_at TIMESTAMPTZ,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)

	await pool.query(`
		CREATE TABLE IF NOT EXISTS payment_transactions (
			id BIGSERIAL PRIMARY KEY,
			registered_phone TEXT NOT NULL,
			payer_phone TEXT NOT NULL,
			amount NUMERIC(10, 2) NOT NULL,
			status TEXT NOT NULL DEFAULT 'PENDING',
			merchant_request_id TEXT,
			checkout_request_id TEXT UNIQUE,
			response_description TEXT,
			result_code INTEGER,
			result_desc TEXT,
			receipt_number TEXT,
			transaction_date TIMESTAMPTZ,
			callback_payload JSONB,
			verified_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
}

function normalizePhoneNumber(phoneNumber) {
	const digits = String(phoneNumber ?? '').replace(/\D/g, '')

	if (digits.startsWith('0') && digits.length === 10) {
		return `254${digits.slice(1)}`
	}

	if (digits.startsWith('254') && digits.length === 12) {
		return digits
	}

	if (digits.length === 9) {
		return `254${digits}`
	}

	return digits
}

function formatTimestamp(date = new Date()) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')

	return `${year}${month}${day}${hours}${minutes}${seconds}`
}

function parseMpesaTransactionDate(value) {
	const digits = String(value ?? '').replace(/\D/g, '')

	if (digits.length !== 14) {
		return null
	}

	const year = Number(digits.slice(0, 4))
	const month = Number(digits.slice(4, 6)) - 1
	const day = Number(digits.slice(6, 8))
	const hours = Number(digits.slice(8, 10))
	const minutes = Number(digits.slice(10, 12))
	const seconds = Number(digits.slice(12, 14))

	return new Date(year, month, day, hours, minutes, seconds)
}

let cachedDarajaToken = null
let cachedDarajaTokenExpiry = 0

async function getDarajaAccessToken() {
	if (!DARAJA_CONSUMER_KEY || !DARAJA_CONSUMER_SECRET) {
		throw new Error('Daraja credentials are not configured')
	}

	if (cachedDarajaToken && Date.now() < cachedDarajaTokenExpiry) {
		return cachedDarajaToken
	}

	const credentials = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString('base64')
	const response = await axios.get(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
		headers: {
			Authorization: `Basic ${credentials}`,
		},
	})

	cachedDarajaToken = response.data.access_token
	cachedDarajaTokenExpiry = Date.now() + (Number(response.data.expires_in ?? 0) - 60) * 1000

	return cachedDarajaToken
}

async function markRegisteredUserVerified(registeredPhone) {
	await pool.query(
		`UPDATE registered_users
		SET verified = TRUE,
			verified_at = NOW(),
			updated_at = NOW()
		WHERE phone = $1`,
		[registeredPhone],
	)
}

function mapPaymentTransaction(row) {
	return {
		id: row.id,
		registeredPhone: row.registered_phone,
		payerPhone: row.payer_phone,
		amount: Number(row.amount),
		status: row.status,
		merchantRequestId: row.merchant_request_id,
		checkoutRequestId: row.checkout_request_id,
		responseDescription: row.response_description,
		resultCode: row.result_code,
		resultDesc: row.result_desc,
		receiptNumber: row.receipt_number,
		transactionDate: row.transaction_date,
		verifiedAt: row.verified_at,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	}
}

function mapRegisteredUser(row) {
	return {
		displayName: row.display_name,
		email: row.email,
		phone: row.phone,
		country: row.country,
		password: row.password,
		invitedBy: row.invited_by,
		verified: row.verified,
		createdAt: row.created_at,
		verifiedAt: row.verified_at,
	}
}

function sendDatabaseError(res, error) {
	console.error('Database error:', error)
	res.status(500).json({ error: 'Database request failed' })
}

app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	credentials: true,
}))

app.use(express.json())

app.get('/health', (req, res) => {
	res.json({ status: 'Server is running' })
})

// Temporary debug endpoint to inspect Daraja env var presence (masked)
app.get('/api/debug/env', (req, res) => {
	const mask = (v) => (v ? `${v.slice(0, 4)}...(${v.length})` : null)
	return res.json({
		daraja_base_url: process.env.DARAJA_BASE_URL || null,
		daraja_consumer_key: mask(process.env.DARAJA_CONSUMER_KEY || ''),
		daraja_consumer_secret: process.env.DARAJA_CONSUMER_SECRET ? '***' : null,
		daraja_shortcode: process.env.DARAJA_SHORTCODE || null,
		daraja_passkey: process.env.DARAJA_PASSKEY ? '***' : null,
		daraja_callback_url: process.env.DARAJA_CALLBACK_URL || null,
	})
})

app.post('/api/mpesa/stkpush', async (req, res) => {
	const { registeredPhone, payerPhone, amount, accountReference, transactionDesc } = req.body ?? {}
	const normalizedRegisteredPhone = String(registeredPhone ?? '').trim()
	const normalizedPayerPhone = normalizePhoneNumber(payerPhone)
	const numericAmount = Number(amount ?? 0)

	if (!normalizedRegisteredPhone || !normalizedPayerPhone || !Number.isFinite(numericAmount) || numericAmount <= 0) {
		return res.status(400).json({ error: 'Missing or invalid payment details' })
	}

	if (!DARAJA_SHORTCODE || !DARAJA_PASSKEY || !DARAJA_CALLBACK_URL) {
		return res.status(500).json({ error: 'Daraja configuration is incomplete' })
	}

	try {
		const token = await getDarajaAccessToken()
		const timestamp = formatTimestamp()
		const password = Buffer.from(`${DARAJA_SHORTCODE}${DARAJA_PASSKEY}${timestamp}`).toString('base64')

		const darajaPayload = {
			BusinessShortCode: DARAJA_SHORTCODE,
			Password: password,
			Timestamp: timestamp,
			TransactionType: DARAJA_TRANSACTION_TYPE,
			Amount: Math.round(numericAmount),
			PartyA: normalizedPayerPhone,
			PartyB: DARAJA_SHORTCODE,
			PhoneNumber: normalizedPayerPhone,
			CallBackURL: DARAJA_CALLBACK_URL,
			AccountReference: accountReference || normalizedRegisteredPhone,
			TransactionDesc: transactionDesc || 'HELAEARN verification fee',
		}

		const darajaResponse = await axios.post(
			`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
			darajaPayload,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)

		if (String(darajaResponse.data?.ResponseCode ?? '') !== '0') {
			return res.status(502).json({
				error: darajaResponse.data?.ResponseDescription || 'Daraja request was rejected',
			})
		}

		await pool.query(
			`INSERT INTO payment_transactions (
				registered_phone,
				payer_phone,
				amount,
				status,
				merchant_request_id,
				checkout_request_id,
				response_description,
				updated_at
			) VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, NOW())
			ON CONFLICT (checkout_request_id) DO UPDATE SET
				registered_phone = EXCLUDED.registered_phone,
				payer_phone = EXCLUDED.payer_phone,
				amount = EXCLUDED.amount,
				status = 'PENDING',
				merchant_request_id = EXCLUDED.merchant_request_id,
				response_description = EXCLUDED.response_description,
				updated_at = NOW()`,
			[
				normalizedRegisteredPhone,
				normalizedPayerPhone,
				numericAmount,
				darajaResponse.data.MerchantRequestID,
				darajaResponse.data.CheckoutRequestID,
				darajaResponse.data.CustomerMessage || darajaResponse.data.ResponseDescription || null,
			],
		)

		return res.status(201).json({
			success: true,
			message: darajaResponse.data.CustomerMessage || 'M-PESA prompt sent',
			merchantRequestId: darajaResponse.data.MerchantRequestID,
			checkoutRequestId: darajaResponse.data.CheckoutRequestID,
		})
	} catch (error) {
		console.error('Daraja STK push failed:', error)
		return res.status(500).json({ error: 'Unable to initiate M-PESA payment' })
	}
})

app.get('/api/mpesa/status/:registeredPhone', async (req, res) => {
	const { registeredPhone } = req.params

	try {
		const userResult = await pool.query('SELECT phone, verified, verified_at FROM registered_users WHERE phone = $1 LIMIT 1', [registeredPhone])
		const paymentResult = await pool.query(
			`SELECT *
			 FROM payment_transactions
			 WHERE registered_phone = $1
			 ORDER BY updated_at DESC, created_at DESC
			 LIMIT 1`,
			[registeredPhone],
		)

		if (userResult.rowCount === 0) {
			return res.status(404).json({ error: 'Registered user not found' })
		}

		const user = userResult.rows[0]
		const payment = paymentResult.rows[0] ?? null

		return res.json({
			success: true,
			verified: user.verified,
			verifiedAt: user.verified_at,
			paymentStatus: payment?.status ?? null,
			message: user.verified
				? 'Payment completed and account verified'
				: payment?.status === 'FAILED'
					? 'Payment failed'
					: payment?.status === 'PENDING'
						? 'Payment is still pending'
						: 'No payment record found yet',
			payment: payment ? mapPaymentTransaction(payment) : null,
		})
	} catch (error) {
		console.error('Status lookup failed:', error)
		return res.status(500).json({ error: 'Unable to load payment status' })
	}
})

app.post('/api/mpesa/callback', async (req, res) => {
	const callback = req.body?.Body?.stkCallback

	if (!callback?.CheckoutRequestID) {
		return res.status(400).json({ error: 'Invalid callback payload' })
	}

	const checkoutRequestId = callback.CheckoutRequestID
	const merchantRequestId = callback.MerchantRequestID ?? null
	const resultCode = Number(callback.ResultCode ?? 1)
	const resultDesc = callback.ResultDesc ?? 'Unknown result'
	const callbackItems = callback.CallbackMetadata?.Item ?? []
	const callbackMetadata = Object.fromEntries(
		callbackItems
			.filter((item) => item?.Name)
			.map((item) => [item.Name, item.Value ?? null]),
	)

	try {
		const transactionResult = await pool.query(
			`SELECT * FROM payment_transactions WHERE checkout_request_id = $1 LIMIT 1`,
			[checkoutRequestId],
		)

		if (transactionResult.rowCount === 0) {
			return res.status(404).json({ error: 'Payment transaction not found' })
		}

		const payment = transactionResult.rows[0]
		const isSuccess = resultCode === 0

		await pool.query(
			`UPDATE payment_transactions
			 SET status = $2,
				merchant_request_id = COALESCE($3, merchant_request_id),
				result_code = $4,
				result_desc = $5,
				receipt_number = $6,
				transaction_date = $7,
				callback_payload = $8::jsonb,
				verified_at = CASE WHEN $2 = 'SUCCESS' THEN NOW() ELSE verified_at END,
				updated_at = NOW()
			 WHERE checkout_request_id = $1`,
			[
				checkoutRequestId,
				isSuccess ? 'SUCCESS' : 'FAILED',
				merchantRequestId,
				resultCode,
				resultDesc,
				callbackMetadata.MpesaReceiptNumber ?? null,
				parseMpesaTransactionDate(callbackMetadata.TransactionDate),
				JSON.stringify(req.body),
			],
		)

		if (isSuccess) {
			await markRegisteredUserVerified(payment.registered_phone)
		}

		return res.json({ success: true })
	} catch (error) {
		console.error('Daraja callback handling failed:', error)
		return res.status(500).json({ error: 'Unable to process payment callback' })
	}
})

app.post('/api/users', async (req, res) => {
	const { displayName, email, phone, country, password, invitedBy } = req.body ?? {}

	if (!displayName || !email || !phone || !country || !password || !invitedBy) {
		return res.status(400).json({ error: 'Missing required registration fields' })
	}

	try {
		const result = await pool.query(
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
				updated_at = NOW()
			RETURNING *`,
			[phone, displayName, email, country, password, invitedBy],
		)

		res.status(201).json(mapRegisteredUser(result.rows[0]))
	} catch (error) {
		sendDatabaseError(res, error)
	}
})

app.get('/api/users/:phone', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM registered_users WHERE phone = $1 LIMIT 1', [req.params.phone])

		if (result.rowCount === 0) {
			return res.status(404).json({ error: 'Registered user not found' })
		}

		res.json(mapRegisteredUser(result.rows[0]))
	} catch (error) {
		sendDatabaseError(res, error)
	}
})

app.patch('/api/users/:phone/verify', async (req, res) => {
	try {
		const result = await pool.query(
			`UPDATE registered_users
			SET verified = TRUE,
				verified_at = NOW(),
				updated_at = NOW()
			WHERE phone = $1
			RETURNING *`,
			[req.params.phone],
		)

		if (result.rowCount === 0) {
			return res.status(404).json({ error: 'Registered user not found' })
		}

		res.json(mapRegisteredUser(result.rows[0]))
	} catch (error) {
		sendDatabaseError(res, error)
	}
})

await initializeDatabase()

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
})
