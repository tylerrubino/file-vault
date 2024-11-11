import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		// Check if there's a valid token on load
		const token = localStorage.getItem('authToken');
		if (token) setIsLoggedIn(!!token);
	}, []);

	const login = (token) => {
		// localStorage.setItem('authToken', token);
		setIsLoggedIn(true);
	};

	const logout = () => {
		setIsLoggedIn(false);
		localStorage.removeItem('authToken');
	};

	return (
		<AuthContext.Provider value={{ isLoggedIn, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
