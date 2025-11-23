import { useNavigate } from 'react-router-dom';

const CreateCart = () => {
	const navigate = useNavigate();
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<h1 className="text-4xl font-bold mb-6 text-center text-[#768F6A] mt-4">
				You are logged in as a prime user, would you like to create a new cart?
			</h1>
			<button
				className="text-[#768F6A] bg-[#E1DACD] text-4xl p-2 rounded hover:bg-blue-200 transition"
				onClick={async () => {
					const response = await fetch(
						'https://wci-neo-dev-2025api.vercel.app/cart/create',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								owner: localStorage.getItem('name'),
							}),
						}
					);
					if (response.ok) {
						alert('Cart created successfully!');
						navigate('/cart');
						window.location.reload();
					} else {
						const errorData = await response.text();
						alert(`Error creating cart: ${errorData}`);
					}
				}}
			>
				Create Cart
			</button>
		</div>
	);
};

export default CreateCart;
