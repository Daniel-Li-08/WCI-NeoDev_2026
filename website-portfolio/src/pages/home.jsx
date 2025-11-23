import React from 'react';

const Home = () => {
	return (
		<div className="min-h-screen flex flex-col items-center px-6 py-10">
			<h1 className="text-textColor text-6xl font-bold mb-4">
				Your neighborhood's delivery shortcut.
			</h1>
			<img
				src="package_logo.svg"
				alt="package"
				className="w-80 h-80 object-contain rounded"
			/>
			<div className="bg-[var(--background)] p-2 rounded-lg shadow-md mt-3 max-w-3xl">
				<h2 className="text-textColor text-center text-3xl font-semibold mt-3 mb-3">
					The only thing we have to fear is a big package!
					<br /> <div className="text-2xl text-self">Wait...</div>
				</h2>
				<p className="text-textColor max-w-2xl text-lg text-center">
					Explore our platform to manage your shopping carts seamlessly. Whether
					you're adding a new cart or viewing existing items, we've got you
					covered. Dive in and start shopping smarter today!
				</p>
			</div>
			<div className="flex flex-row mx-10 gap-2 pt-2 justify-center text-center">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-6">
					<div className="p-6 bg-[var(--button-color)] flex flex-col rounded-lg shadow-md">
						<h3 className="text-[var(--text-color)] text-2xl font-semibold mb-3 text-center">
							What is Amaze?
						</h3>
						<p className="text-[var(--text-color)] leading-relaxed max-w-md my-auto">
							Amaze helps neighbors organize group orders so everyone saves on
							shipping. Prime holders can share benefits and earn back their
							subscription cost by coordinating deliveries in your area.
						</p>
					</div>
					<div className="p-6 bg-[var(--background)] border border-[var(--button-color)] rounded-lg shadow-sm">
						<h3 className="text-[var(--text-color)] text-2xl font-semibold mb-3">
							Why Amaze?
						</h3>
						<div className="space-y-2 text-[var(--text-color)] text-left">
							<p className="font-medium">Reduce costs</p>
							<p className="text-sm">
								Group orders significantly lower per-person shipping.
							</p>
							<p className="font-medium">Be greener</p>
							<p className="text-sm">
								Fewer separate deliveries means less packaging and lower
								emissions.
							</p>
							<p className="font-medium">Community convenience</p>
							<p className="text-sm">
								Coordinate with neighbors for simple local pickup or delivery.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
