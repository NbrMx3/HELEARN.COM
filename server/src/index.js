import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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
