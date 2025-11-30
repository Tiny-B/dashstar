import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './CSS/loginregister.css';

export default function LoginRegister() {
	const { state } = useLocation();
	const navigate = useNavigate();
	const [formDataLogin, setFormDataLogin] = useState({
		email: '',
		password: '',
	});
	const [formDataRegister, setFormDataRegister] = useState({
		username: '',
		email: '',
		password: '',
		role: '',
		avatar_url: '',
	});

	async function sendData(url, data) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			return response;
		} catch (error) {
			console.log(error);
		}
	}

	const handleOnChange = e => {
		const { name, value } = e.target;

		if (state?.fromLandingBtn === 'login') {
			setFormDataLogin({
				...formDataLogin,
				[name]: value,
			});
		} else {
			setFormDataLogin({
				...formDataRegister,
				[name]: value,
			});
		}
	};

	const handleOnSubmit = async e => {
		e.preventDefault();

		if (state?.fromLandingBtn === 'login') {
			const response = await sendData(
				'http://localhost:3002/api/login',
				formDataLogin
			);
			console.log('response:', response);

			const data = await response.json();
			console.log('data:', data);

			const status = response.status;
			console.log('status:', response.status);

			if (status === 200) {
				console.log('redirect to dashboard');

				console.log(data.data.user);
				data.data.user.role === 'user'
					? navigate('/dashboard', { replace: true, state: data.data.user })
					: navigate('/admin', { replace: true, state: data.data.user });
			} else {
				console.log(data.error.message);
			}
		} else {
			// do registration logic
		}
	};

	return (
		<div>
			{/* LOGIN */}
			{state?.fromLandingBtn === 'login' ? (
				<div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img
							src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500'
							alt='Your Company'
							className='mx-auto h-10 w-auto'
						/>
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

							<div>
								<button
									type='submit'
									className='mr-auto ml-auto flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
								>
									Sign in
								</button>
							</div>
						</form>
					</div>
				</div>
			) : (
				<div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
					{/* Register */}
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img
							src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500'
							alt='Your Company'
							className='mx-auto h-10 w-auto'
						/>
						<h2 className='mt-10 text-center text-2xl/9 font-bold tracking-tight text-white'>
							Sign in to your account
						</h2>
					</div>

					<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
						<form
							action='#'
							method='POST'
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
										value={formDataRegister.password}
										className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
									/>
								</div>
							</div>

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
							Already have an account?
							<a
								href='#'
								className='ml-4 font-semibold text-indigo-400 hover:text-indigo-300'
							>
								Login
							</a>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
