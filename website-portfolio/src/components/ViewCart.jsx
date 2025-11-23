import React, { use, useEffect, useState } from 'react';
import CartItem from './CartItem';

const ViewCart = () => {
	const [cartItems, setCartItems] = useState([]);

	const loadCart = async () => {
		let cartName = '';
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
		} else {
			cartName = localStorage.getItem('name');
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
	if (cartItems.length === 0) {
		cartContent = (
			<p className="font-semibold text-gray-500">
				Your items will appear here.
			</p>
		);
	} else {
		cartContent = cartItems.map((item) => <CartItem item={item} />);
	}

	return (
		<div className="flex flex-col items-center justify-center my-[10vw]">
			<h1 className="text-[#768F6A] px-20 py-3 flex flex-row items-center justify-between text-3xl align-middle">
				{cartItems.length === 0 ? (
					<span>Your cart is currently empty!</span>
				) : (
					<span>View your cart:</span>
				)}
			</h1>
			{cartContent}
		</div>
	);
};

export default ViewCart;
