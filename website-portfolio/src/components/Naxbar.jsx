import React from 'react';

const Naxbar = () => {
	return (
		<nav className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
			<div className="font-bold text-xl">MyPortfolio</div>
			<ul className="flex space-x-6">
				<li>
					<a href="/" className="hover:text-blue-200 transition">
						Home
					</a>
				</li>
				<li>
					<a href="/login" className="hover:text-blue-200 transition">
						Login
					</a>
				</li>
			</ul>
		</nav>
	);
};

export default Naxbar;
