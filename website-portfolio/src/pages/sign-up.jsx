import React, { useState } from 'react';

const SignUp = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isPrime, setIsPrime] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Handle login logic here
		const data = JSON.stringify({
			name: username,
			pw: password,
			prime: isPrime,
		});
		console.log(data);
		const response = await fetch(
			'https://wci-neo-dev-2025api.vercel.app/user/create',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: data,
			}
		);
		const stuff = await response.json();
		console.log(stuff);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen ">
			<div className=" p-8 rounded shadow-md w-full max-w-sm">
				<h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
				<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
					<label>
						<input
							type="checkbox"
							checked={isPrime}
							onChange={(e) => setIsPrime(e.target.checked)}
						/>
						Are you a Prime member?
					</label>
					<button
						type="submit"
						className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
					>
						Sign Up
					</button>
				</form>
			</div>
		</div>
	);
};

export default SignUp;
