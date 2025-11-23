import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddItemModel from './AddItemModel';
import CartItem from './CartItem';

const ViewCart = () => {
	const [cartItems, setCartItems] = useState([]);
	const [cartOwner, setCartOwner] = useState('');
	const navigate = useNavigate();

	const loadCart = async () => {
		let cartName;
		if (localStorage.getItem('prime') == 'false') {
			const cartNameResponse = await fetch(
				'https://wci-neo-dev-2025api.vercel.app/user/getCart',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ name: localStorage.getItem('name') }),
				}
			);

			const cartNameData = await cartNameResponse.json();
			cartName = cartNameData.cart;
			setCartOwner(cartName);
		} else {
			console.log('prime is set to true');
			cartName = localStorage.getItem('name');
			console.log('localStorage name: ' + localStorage.getItem('name'));
			setCartOwner(cartName);
			console.log('cartOwner set to: ' + cartOwner);
		}
		const response = await fetch(
			'https://wci-neo-dev-2025api.vercel.app/cart/getCart',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					owner: cartName,
				}),
			}
		);

		if (response.ok) {
			const data = await response.json();
			console.log('Cart Items:');
			console.log(data);
			setCartItems(data.items);
			console.log(cartItems);
		} else {
			const error = await response.text();
			alert(`Failed to load cart: ${error}`);
		}
	};

	useEffect(() => {
		loadCart();
	}, []);

	let cartContent;
	const [isModalOpen, setIsModalOpen] = useState(false);

	if (cartItems.length === 0) {
		cartContent = (
			<div className="flex flex-col items-center justify-center gap-4">
				<img
					src="smile_face.svg"
					alt="Happy Face"
					className="w-64 h-64 mt-8 object-contain rounded"
				/>
				<h1 className="text-neutral px-20 py-3 flex flex-row items-center justify-between text-3xl align-middle">
					You are all caught up!
				</h1>
				<button
					className="text-textColor bg-button rounded py-2 px-4 hover:bg-blue-200 transition"
					onClick={() => setIsModalOpen(true)}
				>
					Add to Cart
				</button>
			</div>
		);
	} else {
		cartContent = (
			<div className="flex flex-col items-center justify-center gap-4">
				{cartOwner === localStorage.getItem('name') ? (
					<h1 className="text-4xl text-textColor font-semibold mt-6 mb-4">
						Here is your cart <span className="text-lighter">{cartOwner}</span>
					</h1>
				) : (
					<h1 className="text-4xl text-textColor font-semibold mt-6 mb-4">
						You are viewing <span className="text-lighter">{cartOwner}'s</span>{' '}
						cart
					</h1>
				)}

				<div className="flex flex-col gap-2 items-center justify-center bg-extraLight mx-5 p-6 rounded-2xl">
					<div className="flex flex-row justify-between w-full">
						<button
							className="text-background bg-textColor rounded py-2 px-4 hover:bg-blue-200 transition"
							onClick={() => setIsModalOpen(true)}
						>
							Add to Cart
						</button>
						<button
							className="text-background bg-textColor rounded py-2 px-4 hover:bg-blue-200 transition"
							onClick={() => {
								navigate('/cart');
								window.location.reload();
							}}
						>
							Refresh
						</button>
					</div>

					{cartItems.map((item) => (
						<CartItem item={item} key={item.id || item._id || item.name} />
					))}
				</div>
			</div>
		);
	}

	// render modal for adding items
	const modal = (
		<AddItemModel
			isOpen={isModalOpen}
			onClose={() => setIsModalOpen(false)}
			onAdded={() => {
				setIsModalOpen(false);
				loadCart();
			}}
			cartOwner={cartOwner}
		/>
	);

	return (
		<>
			{cartContent}
			{modal}
		</>
	);
};

export default ViewCart;
