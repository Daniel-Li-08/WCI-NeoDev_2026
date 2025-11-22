import React, { useEffect, useState } from 'react';
import AddCart from '../components/AddCart';
import CreateCart from '../components/CreateCart';
import ViewCart from '../components/ViewCart';

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
		console.log(isPrime);
		if (data.cart) {
			setCart(data.cart);
			return true;
		} else {
			setCart(null);
			return false;
		}
	};

	useEffect(() => {
		checkCart();
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

	let content;
	if (cart) {
		content = <ViewCart />;
	} else if (isPrime == "true") {
		content = <CreateCart />;
	} else {
		content = <AddCart />;
	}

	return content;
};

export default Cart;
