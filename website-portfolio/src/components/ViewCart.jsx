import React, { use, useEffect, useState } from 'react';
import CartItem from './CartItem';

const ViewCart = () => {
	const [cartItems, setCartItems] = useState([]);

	const loadCart = async () => {
		const response = await fetch(
			'https://wci-neo-dev-2025api.vercel.app/cart/getCart',
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
	});

	return (
		<div>
			<h1>View your cart:</h1>
			{cartItems.map((item) => (
				<CartItem item={item} />
			))}
		</div>
	);
};

export default ViewCart;
