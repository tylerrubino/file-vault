import React from 'react';

export function useApi() {
	// fetch the token from local storage
	const token = localStorage.getItem('authToken');

	// base config for axios with token
	const api = axios.create({
		baseUrl: 'http://localhost:5000/api',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	// GET request function
	const get = async (url) => {
		try {
			const response = await api.get(url);
			return response.data;
		} catch (error) {
			console.error('API GET Error:', error);
			throw error;
		}
	};

	// POST request function
	const post = async (url, data) => {
		try {
			const response = await api.post(url, data);
			return response.data;
		} catch (error) {
			console.error('API POST Error:', error);
			throw error;
		}
	};

	// DELETE request function
	const del = async (url) => {
		try {
			const response = await api.delete(url);
			return response.data;
		} catch (error) {
			console.error('API DELETE Error:', error);
			throw error;
		}
	};

	return { get, post, del };
}
