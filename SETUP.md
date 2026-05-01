# HELAEARN Authentication System Setup Guide

## Overview

This project uses **Google OAuth2 with JWT token-based authentication** to replace the localStorage-only approach. The system consists of:

- **Frontend**: React + Vite with Google OAuth login
- **Backend**: Express.js server handling OAuth verification and JWT token generation
- **Authentication Flow**: Google OAuth2 → JWT Token → Protected Routes

## Prerequisites

- Node.js 16+ and npm
- Google Cloud Console account for OAuth2 credentials
- Development environment (VS Code recommended)

## Part 1: Get Google OAuth2 Credentials

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Give it a name like "HELAEARN Development"

### Step 2: Enable Google+ API
1. Search for "Google+ API" in the search bar
2. Click on it and select **"Enable"**

### Step 3: Create OAuth2 Credentials
1. Go to **Credentials** in the left sidebar
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Choose **"Web application"** as the application type
4. Add authorized redirect URIs:
   - `http://localhost:5173` (local frontend)
   - `http://localhost:3001/api/auth/callback` (local backend)
   - Your production frontend URL (when deploying)
5. Click **"CREATE"**
6. A modal will show your **Client ID** and **Client Secret** - save these securely

## Part 2: Frontend Configuration

### Step 1: Create `.env.local` File

In the `Healern.com/` directory, create a `.env.local` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

Replace `your_google_client_id_here` with the Client ID from Google Cloud Console.

### Step 2: Install Dependencies

```bash
cd Healern.com
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Part 3: Backend Configuration

### Step 1: Create `.env` File

In the `server/` directory, create a `.env` file:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_chars
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
```

**Important Settings:**
- `JWT_SECRET`: Use a strong, random string (minimum 32 characters for production)
- `JWT_EXPIRY`: How long tokens last (7d = 7 days)
- `FRONTEND_URL`: Where your frontend is running

### Step 2: Install Dependencies

```bash
cd server
npm install
```

### Step 3: Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The backend API will be available at `http://localhost:3001/api`

## Authentication Flow Explanation

### 1. User Clicks "Continue with Google"

```
[Register Page] → Google OAuth Button
```

### 2. Google Login Flow

```
User confirms login → Google returns credential token
```

### 3. Backend Verification

```
Frontend sends token to `/auth/callback`
↓
Backend verifies token with Google API
↓
Backend checks/creates user in database
↓
Backend generates JWT token
↓
Returns JWT + user info to frontend
```

### 4. JWT Token Storage

```
Frontend stores JWT in localStorage (auth_token)
Frontend stores user info in localStorage (auth_user)
```

### 5. Protected Routes

```
For routes requiring authentication:
1. Check if JWT token exists
2. Send JWT in Authorization header: "Bearer [token]"
3. Backend verifies JWT signature and expiry
4. If valid, proceed; if invalid, redirect to login
```

## API Endpoints

### Authentication Endpoints

#### POST `/auth/callback`
Verify Google token and generate JWT

**Request:**
```json
{
  "token": "google_credential_token"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

#### POST `/auth/verify`
Verify JWT token is still valid

**Headers:**
```
Authorization: Bearer [token]
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

#### GET `/auth/me`
Get current authenticated user profile

**Headers:**
```
Authorization: Bearer [token]
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

#### POST `/auth/logout`
Logout (mostly client-side, clears localStorage)

### Protected Endpoints

#### POST `/protected/complete-verification`
Complete account verification after payment

**Headers:**
```
Authorization: Bearer [token]
```

**Request:**
```json
{
  "phone": "0712345678",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification completed",
  "user": {
    "id": "user_id",
    "phone": "0712345678",
    "verified": true
  }
}
```

## Frontend Structure

### Key Files

- **`src/context/AuthContext.tsx`**: Global authentication state management
  - Stores: user data, JWT token, loading state
  - Persists: data to localStorage
  - Provides: useAuth() hook for components

- **`src/components/ProtectedRoute.tsx`**: Route wrapper for authenticated pages
  - Checks if user is logged in
  - Redirects to `/register` if not authenticated
  - Shows loading spinner during auth check

- **`src/lib/api.ts`**: Centralized API client
  - All backend communication goes through this file
  - Automatically adds JWT token to protected endpoints
  - Handles error responses

- **`src/pages/Register.tsx`**: Login page with Google OAuth
  - Google OAuth button
  - Stores JWT token and user info on login

- **`src/pages/Verify.tsx`**: Payment verification page
  - Protected route (requires authentication)
  - Shows logged-in user info
  - Calls backend verification endpoint

- **`src/pages/Dashboard.tsx`**: User dashboard
  - Protected route (requires authentication)
  - Shows user profile and account status
  - Displays verification status

## Backend Structure

### Key Files

- **`src/index.js`**: Express app setup
  - CORS configuration
  - Middleware setup
  - Route mounting

- **`src/middleware/auth.js`**: JWT middleware
  - `verifyToken()`: Validates JWT tokens
  - `generateToken()`: Creates JWT tokens with user data
  - Handles authorization header extraction

- **`src/routes/auth.js`**: Authentication routes
  - POST `/auth/callback`: Google OAuth verification
  - POST `/auth/verify`: JWT verification
  - GET `/auth/me`: Get user profile
  - POST `/auth/logout`: Logout

- **`src/routes/protected.js`**: Protected API routes
  - POST `/protected/complete-verification`: Payment verification
  - GET `/protected/profile`: User profile (protected)

## Common Issues & Solutions

### Issue: "Token is not valid" Error

**Cause**: JWT token expired or invalid format

**Solution**:
1. Check token expiry time in `JWT_EXPIRY` in `.env`
2. Ensure token was properly generated by backend
3. Clear localStorage and login again

### Issue: CORS Error on Frontend

**Cause**: Backend not accepting requests from frontend

**Solution**:
1. Check `FRONTEND_URL` in backend `.env` matches actual frontend URL
2. Restart backend server after changing CORS settings
3. Verify CORS middleware is properly configured in `src/index.js`

### Issue: Google OAuth Button Not Showing

**Cause**: Missing Google Client ID or incorrect setup

**Solution**:
1. Check `.env.local` has `VITE_GOOGLE_CLIENT_ID`
2. Verify it matches the one from Google Cloud Console
3. Ensure Google+ API is enabled in Google Cloud Console
4. Restart frontend dev server

### Issue: "Invalid Google Token" on Backend

**Cause**: Google token verification failed

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` matches frontend
2. Check Google Cloud Console OAuth2 credentials are correct
3. Ensure token hasn't expired (tokens expire quickly)
4. Restart backend server

## Testing the Authentication Flow

### Manual Testing Steps

1. **Start Backend**
   ```bash
   cd server
   npm run dev
   ```
   Should show: `Server running on port 3001`

2. **Start Frontend**
   ```bash
   cd Healern.com
   npm run dev
   ```
   Should show: `http://localhost:5173`

3. **Test Login**
   - Go to `http://localhost:5173/register`
   - Click "Continue with Google"
   - Authorize with your Google account
   - Should redirect to `/verify` page

4. **Test Payment Verification**
   - On `/verify` page, enter M-PESA phone number
   - Click "Pay Ksh 100.00 & Activate"
   - Should show success message

5. **Test Protected Route**
   - Click "Go to Dashboard"
   - Should show dashboard with user info
   - Try manually going to `/dashboard` in another tab
   - Should redirect to `/register` if not logged in

6. **Test Logout**
   - Click logout button
   - Should clear localStorage
   - Should redirect to home page

## Production Deployment

### Frontend (Vercel / Netlify)

1. Set environment variable in deployment settings:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_GOOGLE_CLIENT_ID`: Same Google Client ID

2. Update Google Cloud Console:
   - Add production domain to authorized redirect URIs

### Backend (Heroku / Railway / AWS)

1. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET`: Strong, unique secret
   - `GOOGLE_CLIENT_SECRET`: Your production secret
   - `FRONTEND_URL`: Your production frontend URL

2. Ensure database is properly configured

## Troubleshooting Checklist

- [ ] Google Client ID and Secret are correct
- [ ] `.env.local` (frontend) and `.env` (backend) are created
- [ ] Backend server is running on port 3001
- [ ] Frontend is running on port 5173
- [ ] Both have localhost in CORS/authorized URLs
- [ ] JWT_SECRET in backend is strong (32+ characters)
- [ ] Google+ API is enabled in Cloud Console
- [ ] No typos in environment variable names
- [ ] Restarted both servers after creating `.env` files

## Next Steps

After setup is complete:

1. Test the complete authentication flow manually
2. Add database integration for persistent user storage
3. Implement password reset functionality
4. Add two-factor authentication
5. Set up production environment variables
6. Deploy to production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend console logs for API errors
3. Check browser console for frontend errors
4. Verify `.env` files are in correct directories
