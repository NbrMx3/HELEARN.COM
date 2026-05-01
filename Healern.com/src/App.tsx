import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Register } from './pages/Register'
import { Verify } from './pages/Verify'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/register" element={<Register />} />
			<Route path="/verify" element={<Verify />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
