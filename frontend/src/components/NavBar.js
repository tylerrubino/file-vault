import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// NavBar component
const NavBar = () => {
	const { isLoggedIn, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<nav className='bg-gradient-to-r from-purple-500 to-indigo-500 p-4 shadow-lg'>
			{/*Container for links */}
			<div className='container mx-auto flex justify-between items-center'>
				<Link to='/' className='text-white text-2xl font-bold'>
					FileVault
				</Link>
				<div className='flex space-x-6'>
					{isLoggedIn && (
						<Link
							to='/dashboard'
							className='text-white hover:text-indigo-200 transition duration-200'>
							Dashboard
						</Link>
					)}
					{isLoggedIn ? (
						<>
							<Link
								to='/shared-files'
								className='text-white hover:text-indigo-200 transition duration-200'>
								Shared Files
							</Link>
							<button
								onClick={handleLogout}
								className='text-white hover:text-indigo-200 transition duration-200'>
								Logout
							</button>
						</>
					) : (
						<Link
							to='/login'
							className='text-white hover:text-indigo-200 transition duration-200'>
							Login
						</Link>
					)}
					{!isLoggedIn && (
						<Link
							to='/register'
							className='text-white hover:text-indigo-200 transition duration-200'>
							Register
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default NavBar;
