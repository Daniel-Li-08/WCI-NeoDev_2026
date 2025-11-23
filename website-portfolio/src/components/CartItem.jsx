import React from 'react';

const CartItem = ({ item }) => {
	return (
		<div className="border bg-button rounded py-3 px-5 flex justify-between items-center">
			<a
				href={item.link}
				rel="noreferrer"
				target="_blank"
				className="font-semibold text-textColor hover:text-blue-500 transition max-w-[50vw] min-w-[20vw]"
			>
				{item.link.split('amazon.ca/')[1].split('/dp/')[0].replace(/-/g, ' ')}
			</a>
			<span className="ml-2 text-lighter flex flex-row font-semibold">
				Quantity: {item.quantity}
			</span>
			{/* Add more item details or actions here if needed */}
		</div>
	);
};

export default CartItem;
