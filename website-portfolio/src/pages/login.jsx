import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

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
				alert('Login successful!');
				const data = await response.json();
				console.log(data);
				localStorage.setItem('name', username);
				localStorage.setItem('pw', password);
				localStorage.setItem('prime', data.prime);
				navigate('/cart');
			} else if (response.status === 400) {
				const error = await response.text();
				alert(`Login failed: ${error}`);
			} else {
				const errorData = await response.text();
				alert(errorData); // Show error message from backend
			}
		} catch (err) {
			alert(`An error occurred: ${err.message}`);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen ">
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
