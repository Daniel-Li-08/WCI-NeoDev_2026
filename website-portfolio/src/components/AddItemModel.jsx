import React, { useState } from 'react';

/**
 * AddItemModel
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onAdded: (item) => void  // called with response data on success
 * - apiUrl: (optional) string - endpoint to POST new item to (default used if not provided)
 */
const AddItemModel = ({ isOpen, onClose, onAdded, apiUrl, cartOwner }) => {
	const [url, setUrl] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	if (!isOpen) return null;

	const submit = async (e) => {
		e.preventDefault();
		setError('');

		if (!url || url.trim() === '') {
			setError('Please enter the Amazon product URL.');
			return;
		}
		if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
			setError('Quantity must be a positive integer.');
			return;
		}

		setLoading(true);
		try {
			const owner = localStorage.getItem('name') || null;
			const res = await fetch(
				'https://wci-neo-dev-2025api.vercel.app/cart/additem',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						link: url.trim(),
						quantity: Number(quantity),
						cart: cartOwner,
					}),
				}
			);

			if (res.ok) {
				const data = await res.json().catch(() => null);
				if (onAdded) onAdded(data);
				// reset
				setUrl('');
				setQuantity(1);
				onClose();
			} else {
				const text = await res.text();
				setError(text || 'Failed to add item');
			}
		} catch (err) {
			setError(err.message || 'Network error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
				<div className="flex justify-between items-center p-4 border-b">
					<h3 className="text-lg font-semibold text-textColor">
						Add item to{' '}
						{cartOwner === localStorage.getItem('name')
							? 'your cart'
							: `${cartOwner}'s cart`}
					</h3>
					<button
						aria-label="Close"
						onClick={onClose}
						className="p-1 rounded hover:bg-gray-100"
					>
						{/* use x_icon.svg in public/ if available; fallback to text X */}
						<img
							src="/x_icon.svg"
							alt="close"
							className="w-5 h-5"
							onError={(e) => {
								e.currentTarget.style.display = 'none';
							}}
						/>
						<span className="sr-only">Close</span>
					</button>
				</div>

				<form onSubmit={submit} className="p-4 flex flex-col gap-3">
					<label className="flex flex-col">
						<span className="font-medium  text-textColor text-sm">
							Amazon product URL
						</span>
						<input
							type="url"
							placeholder="https://www.amazon.ca/..."
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="mt-1 p-2 border focus:ring-blue-500 placeholder-lighter rounded text-textColor bg-button"
							required
						/>
					</label>

					<label className="flex flex-col">
						<span className="font-medium text-sm text-textColor">Quantity</span>
						<input
							type="number"
							min={1}
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							className="mt-1 p-2 text-textColor border rounded bg-button w-32"
							required
						/>
					</label>

					{error && <div className="text-red-600 text-sm">{error}</div>}

					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded border text-textColor border-textColor hover:bg-gray-100"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 bg-textColor text-button rounded hover:bg-blue-200 hover:text-textColor disabled:opacity-60"
						>
							{loading ? 'Adding…' : 'Add Item'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddItemModel;
