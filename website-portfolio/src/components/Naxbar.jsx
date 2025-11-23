import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Naxbar = () => {
	const location = useLocation();
	const [loggedIn, setLogStatus] = useState(
		localStorage.getItem('name') != null
	);

	const logout = () => {
		localStorage.removeItem('name');
		localStorage.removeItem('pw');
		localStorage.removeItem('isPrime');
		setLogStatus(false);
	};

	useEffect(() => {
		setLogStatus(localStorage.getItem('name') != null);
	}, [location]);

	return (
		<nav className=" text-textColor px-20 py-3 flex flex-row items-center justify-between shadow-md text-3xl align-middle">
			<a href="/">
				<img
					alt=""
					className="w-64 my-[-4rem] translate-y-[5%]"
					src="/logo_1.svg"
				/>
			</a>

			<div className="w-full flex justify-end gap-20 px-20 align-middle">
				{!loggedIn ? (
					<a
						href="/login"
						className={`hover:text-blue-200 transition ${
							location.pathname === '/login' ? 'font-bold text-extraLight' : ''
						}`}
					>
						Login
					</a>
				) : (
					<a
						href="/cart"
						className={`hover:text-blue-200 transition ${
							location.pathname === '/cart' ? 'font-bold text-extraLight' : ''
						}`}
					>
						Cart
					</a>
				)}

				{!loggedIn ? (
					<a
						href="/sign-up"
						className={`hover:text-blue-200 transition ${
							location.pathname === '/sign-up'
								? 'font-bold text-extraLight'
								: ''
						}`}
					>
						Sign Up
					</a>
				) : (
					<></>
				)}

				{localStorage.getItem('name') !== null ? (
					<a
						href="/"
						className="hover:text-blue-200 transition"
						onClick={() => {
							logout();
						}}
					>
						Logout
					</a>
				) : (
					<></>
				)}
			</div>
		</nav>
	);
};
// 67
export default Naxbar;
