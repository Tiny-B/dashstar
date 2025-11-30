import { Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import LoginRegister from './pages/LoginRegister';

function App() {
	return (
		<Routes>
			<Route
				path='/'
				element={<Landing />}
			/>
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
			<Route
				path='/login'
				element={<LoginRegister />}
			/>
		</Routes>
	);
}

export default App;
