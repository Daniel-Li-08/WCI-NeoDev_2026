import React, { useState } from 'react';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle login logic here
		alert(`Username: ${username}\nPassword: ${password}`);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
			<div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
				<h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
					<button
						type="submit"
						className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
