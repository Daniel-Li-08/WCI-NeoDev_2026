import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCart = () => {
	const [ownerName, setOwnerName] = useState('');
	const [userName, setUserName] = useState(localStorage.getItem('name'));
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const response = await fetch(
			'https://wci-neo-dev-2025api.vercel.app/user/setCart',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					owner: ownerName,
					name: userName,
				}),
			}
		);
		if (response.ok) {
			alert('Cart added successfully!');
			navigate('/cart');
			window.location.reload();
		} else {
			const error = await response.text();
			alert('Error adding cart: ' + error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center gap-2">
			<h1 className="text-4xl font-bold mb-6 text-center text-[#768F6A] mt-4">
				Welcome, <span className="text-[#C1DBB3]">{userName}</span>!
			</h1>
			<h1 className="text-3xl font-bold mb-6 text-center text-[#768F6A]">
				You currently aren't apart of a cart. Please add one
			</h1>
			<form
				onSubmit={handleSubmit}
				className="flex flex-row gap-3 items-center mt-4"
			>
				<input
					type="text"
					placeholder="Enter cart owner name"
					value={ownerName}
					onChange={(e) => setOwnerName(e.target.value)}
					className="p-2 border rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue placeholder-[#768F6A] bg-[#E1DACD]"
				/>
				<button
					type="submit"
					className="text-[#768F6A] bg-[#E1DACD] py-2 px-3 rounded hover:bg-blue-200 transition"
				>
					Add Cart
				</button>
				{/* ...existing code... */}
			</form>
		</div>
	);
};

export default AddCart;
