import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth() {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<p className='text-gray-500'>Checking authentication …</p>
			</div>
		);
	}

	if (!user) {
		return (
			<Navigate
				to='/login'
				state={{ fromLandingBtn: 'login' }}
				replace
			/>
		);
	}

	return <Outlet />;
}
