import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/dash-logo.png';
import './CSS/loginregister.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function LoginRegister() {
	const { state } = useLocation();
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [formDataLogin, setFormDataLogin] = useState({
		email: '',
		password: '',
	});
	const [formDataRegister, setFormDataRegister] = useState({
		username: '',
		email: '',
		password: '',
		role: 'user',
		avatar_url: '',
	});
	const [passwordMatch, setPasswordMatch] = useState('');
	const [msg, setMsg] = useState('');

	async function sendData(url, data) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
				credentials: 'include',
			});
			return response;
		} catch (error) {
			console.log(error);
		}
	}

	const handleOnChange = e => {
		const { name, value } = e.target;
		console.log('e.target:', e.target.value);

		if (state?.fromLandingBtn === 'login') {
			setFormDataLogin({
				...formDataLogin,
				[name]: value,
			});
		} else {
			if (e.target.name === 'passwordMatch') {
				setPasswordMatch(e.target.value);
				console.log(e.target.value);
			}

			setFormDataRegister({
				...formDataRegister,
				[name]: value,
			});
		}
	};

	const handleOnSubmit = async e => {
		e.preventDefault();
		setMsg('');

		if (!API_BASE) {
			setMsg('Missing API base URL. Please set VITE_API_BASE_URL in your .env file.');
			return;
		}

		let response;

		if (state?.fromLandingBtn === 'login') {
			response = await sendData(`${API_BASE}/login`, formDataLogin);
		} else {
			if (formDataRegister.password !== passwordMatch) {
				console.log('Passwords must match');
				return;
			}
			response = await sendData(`${API_BASE}/register`, formDataRegister);
		}

		if (!response) {
			setMsg('Network error. Is the server running?');
			return;
		}

		const responseData = await response.json();
		const status = response.status;

		if (status === 200 || status === 201) {
			const user = responseData.data.user;
			console.log('Login', user);
			login(user);
			responseData.data.user.role === 'user'
				? navigate('/dashboard', {
						replace: true,
				  })
				: navigate('/admin', {
						replace: true,
				  });
		} else {
			setMsg(responseData?.error?.message || 'Request failed. Please try again.');
		}
	};

	return (
		<div>
			{/* LOGIN */}
			{state?.fromLandingBtn === 'login' ? (
				<div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<Link to='/'>
							<img
								src={logo}
								alt='Dashstar logo'
								className='mx-auto h-30 w-auto'
							/>
						</Link>

						<h2 className='mt-10 text-center text-2xl/9 font-bold tracking-tight text-white'>
							Sign in to your account
						</h2>
					</div>

					<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
						<form
							action='#'
							method='POST'
							onSubmit={handleOnSubmit}
							className='space-y-6'
						>
							<div>
								<label
									htmlFor='email'
									className='block text-sm/6 font-medium text-gray-100 tx'
								>
									Email address
								</label>
								<div className='mt-2'>
									<input
										id='email'
										type='email'
										name='email'
										required
										autoComplete='email'
										onChange={handleOnChange}
										value={formDataLogin.email}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label
										htmlFor='password'
										className='block text-sm/6 font-medium text-gray-100'
									>
										Password
									</label>
									<div className='text-sm'>
										<a
											href='#'
											className='font-semibold text-indigo-400 hover:text-indigo-300'
										>
											Forgot password?
										</a>
									</div>
								</div>
								<div className='mt-2'>
									<input
										id='password'
										type='password'
										name='password'
										required
										autoComplete='current-password'
										onChange={handleOnChange}
										value={formDataLogin.password}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>

							{msg && (
								<p className='mt-2 text-center text-sm text-red-400'>{msg}</p>
							)}

							<div>
								<button
									type='submit'
									className='mr-auto ml-auto flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
								>
									Sign in
								</button>
							</div>
						</form>

						<p className='mt-10 text-center text-sm/6 text-gray-400'>
							Don't have an account?
							<button
								style={{ color: 'white' }}
								className='ml-4 font-semibold text-indigo-400 hover:text-indigo-300'
								onClick={() => {
									navigate('/login', { state: { fromLandingBtn: 'register' } });
								}}
							>
								Register
							</button>
						</p>
					</div>
				</div>
			) : (
				<div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
					{/* Register */}
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<Link to='/'>
							<img
								src={logo}
								alt='Dashstar logo'
								className='mx-auto h-30 w-auto'
							/>
						</Link>

						<h2 className='mt-10 text-center text-2xl/9 font-bold tracking-tight text-white'>
							Create an account
						</h2>
					</div>

					<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
						<form
							action='#'
							method='POST'
							onSubmit={handleOnSubmit}
							className='space-y-6'
						>
							<div>
								<label
									htmlFor='username'
									className='block text-sm/6 font-medium text-gray-100 tx'
								>
									Username{' '}
									<span style={{ color: '#ad002b', marginLeft: '10px' }}>
										* Required
									</span>
								</label>
								<div className='mt-2'>
									<input
										id='username'
										type='text'
										name='username'
										required
										onChange={handleOnChange}
										value={formDataRegister.username}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor='email'
									className='block text-sm/6 font-medium text-gray-100 tx'
								>
									Email address{' '}
									<span style={{ color: '#ad002b', marginLeft: '10px' }}>
										* Required
									</span>
								</label>
								<div className='mt-2'>
									<input
										id='email'
										type='email'
										name='email'
										required
										onChange={handleOnChange}
										value={formDataRegister.email}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label
										htmlFor='password'
										className='block text-sm/6 font-medium text-gray-100'
									>
										Password{' '}
										<span style={{ color: '#ad002b', marginLeft: '10px' }}>
											* Required
										</span>
									</label>
								</div>
								<div className='mt-2'>
									<input
										id='password'
										type='password'
										name='password'
										required
										onChange={handleOnChange}
										value={formDataRegister.password}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>
							<div>
								<div className='flex items-center justify-between'>
									<label
										htmlFor='passwordMatch'
										className='block text-sm/6 font-medium text-gray-100'
									>
										Re-enter Password{' '}
										<span style={{ color: '#ad002b', marginLeft: '10px' }}>
											* Required
										</span>
									</label>
								</div>
								<div className='mt-2'>
									<input
										id='passwordMatch'
										type='password'
										name='passwordMatch'
										required
										onChange={handleOnChange}
										value={passwordMatch}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor='role'
									className='block text-sm/6 font-medium text-gray-100 tx'
								>
									Account Role
								</label>
								<div className='mt-2'>
									<select
										id='role'
										name='role'
										onChange={handleOnChange}
										value={formDataRegister.role}
										style={{ backgroundColor: 'rgb(49, 0, 37)' }}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									>
										<option value='user'>User</option>
										<option value='admin'>Admin</option>
									</select>
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label
										htmlFor='avatar_url'
										className='block text-sm/6 font-medium text-gray-100'
									>
										Avatar image URL (Optional)
									</label>
								</div>
								<div className='mt-2'>
									<input
										id='avatar_url'
										type='text'
										name='avatar_url'
										onChange={handleOnChange}
										value={formDataRegister.avatar_url}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
								<div>
									<img
										style={{
											width: '100px',
											height: '100px',
											borderRadius: '50%',
											objectFit: 'cover',
											margin: '0 auto',
											marginTop: '20px',
											backgroundColor: '#4d0731',
										}}
										src={
											!formDataRegister.avatar_url
												? null
												: formDataRegister.avatar_url
										}
										alt='Avatar image preview'
									/>
								</div>
							</div>

							{msg && (
								<p className='mt-2 text-center text-sm text-red-400'>{msg}</p>
							)}

							<div>
								<button
									type='submit'
									className='mr-auto ml-auto flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
								>
									Register
								</button>
							</div>
						</form>

						<p className='mt-10 text-center text-sm/6 text-gray-400'>
							Already have an account?
							<button
								style={{ color: 'white' }}
								className='ml-4 font-semibold text-indigo-400 hover:text-indigo-300'
								onClick={() => {
									navigate('/login', { state: { fromLandingBtn: 'login' } });
								}}
							>
								Login
							</button>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
