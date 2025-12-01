import { Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import LoginRegister from './pages/LoginRegister';
import RequireAuth from './components/RequireAuth';

function App() {
	return (
		<Routes>
			{/* Public routes */}
			<Route
				path='/'
				element={<Landing />}
			/>
			<Route
				path='/login'
				element={<LoginRegister />}
			/>

			{/* Protected routes */}
			<Route element={<RequireAuth />}>
				<Route
					path='/profile'
					element={<Profile />}
				/>
				<Route
					path='/dashboard'
					element={<Dashboard />}
				/>
				<Route
					path='/admin'
					element={<Admin />}
				/>
			</Route>

			<Route
				path='*'
				element={<p>404 - page not found</p>}
			/>
		</Routes>
	);
}

export default App;
