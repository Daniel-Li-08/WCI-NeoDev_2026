import React from 'react';

const Naxbar = () => {

	const logout = () => {
		localStorage.removeItem('name');
		localStorage.removeItem('pw');	
		localStorage.removeItem('isPrime');
	}

	return (
		<nav className=" text-[#768F6A] px-20 py-3 flex flex-row items-center justify-between shadow-md text-3xl align-middle">
			<a href="/"><img alt="" className="w-64 my-[-4rem] translate-y-[5%]" src="/logo_1.svg"/></a>

			<div className="w-full flex justify-end gap-20 px-20 align-middle">
				<a href="/login" className="hover:text-blue-200 transition">
						Login
				</a>

				<a href="/sign-up" className="hover:text-blue-200 transition">
						Sign Up
				</a>

			<a href="/" onClick={()=>{logout()}}>Logout</a>

			</div>

		</nav>
	);
};
// 67
export default Naxbar;
