import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
			<h1 className='text-4xl font-bold text-gray-800 mb-4'>
				Welcome to FileVault
			</h1>
			<p className='text-gray-700 mb-6 text-center max-w-md'>
				FileVault is a secure platform to upload, share, and manage your files.
				Sign up to start managing your files securely.
			</p>
			<div className='space-x-4'>
				<Link
					to='/register'
					className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'>
					Get Started
				</Link>
				<Link
					to='/login'
					className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors'>
					Log In
				</Link>
			</div>
		</div>
	);
};

export default Home;
