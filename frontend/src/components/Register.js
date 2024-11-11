// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		// const token = localStorage.getItem('authToken');
		try {
			await axios.post('http://localhost:5000/api/register', {
				username,
				password,
			});
			// localStorage.setItem('authToken', response.data.token);
			navigate('/login');
		} catch (err) {
			if (err.response && err.response.status === 409) {
				setError('Username already exists');
			} else {
				setError('Registration failed');
			}
		}
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100'>
			<form
				className='bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center'
				onSubmit={handleRegister}>
				<h2 className='text-3xl font-bold text-gray-800 mb-6'>Register</h2>
				<div className='mb-4'>
					<label className='block text-gray-700'>Username</label>
					<input
						type='text'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className='w-full p-3 mt-2 border border-gray-300 rounded-lg'
						required
					/>
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
				</div>
				<button
					type='submit'
					className='w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105'>
					Register
				</button>
				{error && <p className='text-red-500'>{error}</p>}
			</form>
		</div>
	);
}

export default Register;
