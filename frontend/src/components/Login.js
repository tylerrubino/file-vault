import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			// const token = localStorage.getItem('authToken');
			const response = await axios.post('http://localhost:5000/api/login', {
				username,
				password,
			});
			const token = response.data.token;

			// save token to local storage and update context
			localStorage.setItem('authToken', token);
			login(); // update the authentication state in context

			// redirect to dashboard
			navigate('/dashboard');
		} catch (err) {
			alert('Invalid credentials');
		}
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100'>
			<form
				className='bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center'
				onSubmit={handleLogin}>
				<h2 className='text-3xl font-bold text-gray-800 mb-6'>Login</h2>
				<div className='mb-4'>
					<label className='block text-gray-700'>Username</label>
					<input
						type='text'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className='w-full p-3 mt-2 border border-gray-300 rounded-lg'
						required
					/>
					{error && <p className='error-message'>{error}</p>}
				</div>
				<div className='mb-6'>
					<label className='block text-gray-700'>Password</label>
					<input
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='w-full p-3 mt-2 border border-gray-300 rounded-lg'
						required
					/>
					{error && <p className='error-message'>{error}</p>}
				</div>
				<button
					type='submit'
					className='w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105'>
					Log In
				</button>
			</form>
		</div>
	);
};

export default Login;
