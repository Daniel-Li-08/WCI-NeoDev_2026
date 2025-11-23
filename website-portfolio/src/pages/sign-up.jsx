import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isPrime, setIsPrime] = useState(false);
	const [message, setMessage] = useState(<></>);
	const navigate = useNavigate();

	useEffect(() => {
		const name = localStorage.getItem('name');
		if (name !== null) {
			navigate('/cart');
		}
	}, []);

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
		const stuff = await response.status;
		if (stuff == 200) {
			setMessage(<p className="text-[#768F6A]">Success</p>);
		} else {
			setMessage(<p className="text-red-600">Failure</p>);
		}
	};

	return (
		<>
			<div className="flex flex-col items-center justify-center my-[10vw]">
				<div className="p-8 w-full max-w-[30rem]">
					<h2 className="text-4xl font-bold mb-6 text-center text-[#768F6A]">
						Sign up
					</h2>
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
						<label className="flex flex-row">
							<input
								type="checkbox"
								checked={isPrime}
								onChange={(e) => setIsPrime(e.target.checked)}
								className="accent-[#768F6A]"
							/>
							<p className="text-[#768F6A] mx-4">Are you a Prime member?</p>
						</label>
						<button
							type="submit"
							className="text-[#768F6A] bg-[#E1DACD] py-2 rounded hover:bg-blue-200 transition"
						>
							Sign Up
						</button>
						{message}
					</form>
				</div>
			</div>
		</>
	);
};

export default SignUp;
