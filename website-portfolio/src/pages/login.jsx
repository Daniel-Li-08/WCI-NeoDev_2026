import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const name = localStorage.getItem('name');
		if (name !== null) {
			navigate('/cart');
		}
	}, [navigate]);
	const handleSubmit = async (e) => {
		e.preventDefault();
		// Handle login logic here
		try {
			const response = await fetch(
				`https://wci-neo-dev-2025api.vercel.app/user/checkpw`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						pw: password,
						name: username,
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log(data);
				localStorage.setItem('name', username);
				localStorage.setItem('pw', password);
				localStorage.setItem('prime', data.prime);
				setErrorMessage('');
				navigate('/cart');
			} else if (response.status === 400) {
				const error = await response.text();
				// show inline error message instead of an alert
				if (error === 'Incorrect password') {
					setErrorMessage('Incorrect password');
				} else if (error === 'User not found') {
					setErrorMessage('User not found');
				} else {
					alert('A 400 error occurred: ' + error);
				}
			} else {
				const errorData = await response.text();
				alert('An error occurred: ' + errorData);
			}
		} catch (err) {
			alert('An unexpected error occurred');
		}
	};

	return (
		<div className="flex flex-col items-center justify-center my-[10vw]">
			<div className="p-8 w-full max-w-[30rem]">
				<h2 className="text-4xl font-bold mb-6 text-center text-textColor">
					Login
				</h2>
				<form onSubmit={handleSubmit} className="flex flex-col gap-2">
					<p
						className={`font-semibold text-1xl ${
							errorMessage === 'User not found'
								? 'text-red-500'
								: 'text-textColor'
						}`}
					>
						{errorMessage === 'User not found' ? errorMessage : 'Username'}
					</p>
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => {
							setUsername(e.target.value);
							if (errorMessage) setErrorMessage('');
						}}
						className="p-2 border rounded-[0.5rem] mb-2 focus:outline-none focus:ring-2 focus:ring-blue placeholder-textColor bg-button"
						required
					/>
					<p
						className={`font-semibold text-1xl ${
							errorMessage === 'Incorrect password'
								? 'text-red-500'
								: 'text-textColor'
						}`}
					>
						{errorMessage === 'Incorrect password' ? errorMessage : 'Password'}
					</p>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							if (errorMessage) setErrorMessage('');
						}}
						className="p-2 border rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-textColor bg-button"
						required
					/>
					<button
						type="submit"
						className="text-textColor bg-button py-2 mt-4 rounded hover:bg-blue-200 transition"
					>
						Login
					</button>
					<a
						href="/sign-up"
						className="text-center text-textColor mt-2 hover:text-blue-200 transition"
					>
						{' '}
						Create an Account
					</a>
				</form>
			</div>
		</div>
	);
};

export default Login;
