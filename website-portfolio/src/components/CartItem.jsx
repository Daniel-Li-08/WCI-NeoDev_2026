import React from 'react';

const CartItem = ({ item }) => {
	return (
		<div className="border bg-button rounded py-3 px-5 flex justify-between items-center">
			<div>
				<a
					href={item.link}
					rel="noreferrer"
					target="_blank"
					className="font-semibold text-textColor hover:text-blue-500 transition"
				>
					{item.link}
				</a>
				<span className="ml-2 text-lighter font-semibold">
					Quantity: {item.quantity}
				</span>
			</div>
			{/* Add more item details or actions here if needed */}
		</div>
	);
};

export default CartItem;
