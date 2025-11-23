import { useNavigate } from 'react-router-dom';

const CreateCart = () => {
	const navigate = useNavigate();
	return (
		<div clasName="flex flex-col items-center justify-center gap-4">
			<h1 className="">
				You are logged in as a prime user, would you like to create a new cart?
			</h1>
			<button
				className="bg-blue-700"
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
