import React from 'react';

const CartItem = ({ item }) => {
	return (
		<div className="border rounded p-3 mb-2 flex justify-between items-center">
			<div>
				<span className="font-semibold">{item.link}</span>
				<span className="ml-2 text-gray-500">Quantity: {item.quantity}</span>
			</div>
			{/* Add more item details or actions here if needed */}
		</div>
	);
};

export default CartItem;
