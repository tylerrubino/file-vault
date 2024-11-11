// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// import React, { useState, useEffect } from 'react';

// export function useAuth() {
// 	const [isLoggedIn, setIsLoggedIn] = useState(false);

// 	useEffect(() => {
// 		// check if token exists in local storage when hook is initialized
// 		const token = localStorage.getItem('authToken');
// 		setIsLoggedIn(!!token);
// 	}, []);

// 	const login = (token) => {
// 		// save token to local storage and update state
// 		localStorage.setItem('authToken', token);
// 		setIsLoggedIn(true);
// 	};

// 	const logout = () => {
// 		// remove token and reset state
// 		localStorage.removeItem('authToken');
// 		setIsLoggedIn(false);
// 	};

// 	return { isLoggedIn, login, logout };
// }
