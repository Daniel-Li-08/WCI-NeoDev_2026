import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const name = localStorage.getItem('name');
		if (name !== null) {
			navigate('/cart');
		}

	});
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
		<div className="flex flex-col items-center justify-center my-[10vw]">
			<div className="p-8 w-full max-w-[30rem]">
				<h2 className="text-4xl font-bold mb-6 text-center text-[#768F6A]">Login</h2>
				<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="p-2 border rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue placeholder-[#768F6A] bg-[#E1DACD]"
						required
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="p-2 border rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#768F6A] bg-[#E1DACD]"
						required
					/>
					<button
						type="submit"
						className="text-[#768F6A] bg-[#E1DACD] py-2 rounded hover:bg-blue-200 transition"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
