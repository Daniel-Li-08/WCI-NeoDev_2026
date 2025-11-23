import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCart = () => {
	const [ownerName, setOwnerName] = useState();
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
		<>
			<h1>Welcome {userName}!</h1>
			<h1>You currently aren't apart of a cart. Please add one</h1>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Enter cart owner name"
					value={ownerName}
					onChange={(e) => setOwnerName(e.target.value)}
				/>
				<button type="submit">Add Cart</button>
				{/* ...existing code... */}
			</form>
		</>
	);
};

export default AddCart;
