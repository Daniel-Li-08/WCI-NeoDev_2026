import React, { use, useEffect, useState } from 'react';

const Cart = () => {
	const username = localStorage.getItem('name');
	const password = localStorage.getItem('pw');
	const isPrime = localStorage.getItem('prime');

	const [cart, setCart] = useState(null);

	const [cartItems, setCartItems] = useState([]);

	const checkCart = async () => {
		const response = await fetch(
			'https://wci-neo-dev-2025api.vercel.app/user/getCart',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: username,
				}),
			}
		);

		const data = await response.json();
		console.log(data);
		if (data.cart) {
			setCart(data.cart);
			return true;
		} else {
			return false;
		}
	};

	useEffect(() => {
		if (!checkCart()) {
			
		}
	});

	const loadCart = async () => {
		const response = await fetch(
			'https://wci-neo-dev-2025api.vercel.app/cart/getCart',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: username,
					pw: password,
				}),
			}
		);

		const data = await response.json();
		console.log(data);
	};

	return (
		<div>
			<h1>Welcome, {username}!</h1>
			<h2>Here is your cart, {cart}:</h2>
		</div>
	);
};

export default Cart;
