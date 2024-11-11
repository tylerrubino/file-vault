// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import { useNavigate } from 'react-router-dom';
import {
	FaDownload,
	FaShareAlt,
	FaRegTrashAlt,
	FaTrashAlt,
	FaPlus,
} from 'react-icons/fa';

const Dashboard = () => {
	const [files, setFiles] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const navigate = useNavigate();

	// fetch user files
	const fetchFiles = async () => {
		const token = localStorage.getItem('authToken');

		// Check if token exists before making request
		if (!token) {
			console.log('No token found. Redirecting to login.');
			navigate('/login'); // Redirect to login if no token is found
			return;
		}

		try {
			const response = await axios.get('http://localhost:5000/api/files', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Ensure response data is an array, fallback to empty array if not
			const filesData = Array.isArray(response.data) ? response.data : [];
			setFiles(filesData);
		} catch (error) {
			if (error.response && error.response.status === 403) {
				console.log('Token missing or invalid. Redirecting to login.');
				navigate('/login'); // Redirect if unauthorized
			} else {
				console.error('Error fetching files:', error);
			}
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (!token) {
			navigate('/login'); // Redirect to login if not logged in
		} else {
			fetchFiles(); // Fetch files only if token is available
		}
	}, []);

	// Handle file deletion
	const handleDelete = async (fileId) => {
		try {
			const token = localStorage.getItem('authToken');
			console.log(`Attempting to delete file with ID: ${fileId}`); // Debugging

			const response = await axios.delete(
				`http://localhost:5000/api/files/${fileId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			console.log('Delete response:', response.data); // Debugging
			// Show appropriate message to the user based on response
			alert(response.data.message || 'File deleted successfully');

			// Update local state to remove the file from the UI
			setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
		} catch (err) {
			console.error('Error deleting file:', err);
			alert('Failed to delete the file');
		}
	};

	// handle download
	const handleDownload = async (customName) => {
		try {
			const token = localStorage.getItem('authToken');
			console.log(`Downloading file with customName: ${customName}`); // Debugging

			const response = await axios.get(
				`http://localhost:5000/api/download/${customName}`,
				{
					headers: { Authorization: `Bearer ${token}` },
					responseType: 'blob', // Important for file download
				}
			);

			// create a download link
			const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.setAttribute('download', customName); // Replace with actual filename from metadata
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (error) {
			console.error('Error downloading file:', error);
			// alert('Failed to download file');
		}
	};

	// handle sharing the file
	const handleShare = async (fileId) => {
		const sharedWithUsername = prompt('Enter the username to share with');
		if (!sharedWithUsername) {
			alert('Username is required');
			return;
		}

		const token = localStorage.getItem('authToken');
		try {
			await axios.post(
				'http://localhost:5000/api/share',
				{ fileId, sharedWithUsername },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			alert(`File shared with ${sharedWithUsername}`);
		} catch (error) {
			console.error('Error sharing file:', error);
			alert('Failed to share file');
		}
	};

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<div className='p-6'>
			<h1 className='text-3xl font-bold text-gray-800 mb-4'>Dashboard</h1>
			{!isModalOpen ? (
				<button
					onClick={openModal}
					className='bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors flex items-center space-x-2'>
					<FaPlus />
					<span>Upload File</span>
				</button>
			) : (
				<button
					onClick={closeModal}
					className='bg-red-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors flex items-center space-x-2'>
					{/* <FaPlus /> */}
					<span>Cancel</span>
				</button>
			)}

			{isModalOpen && (
				<FileUpload
					onUploadSuccess={fetchFiles}
					closeModal={() => setIsModalOpen(false)}
				/>
			)}

			<div className='mt-8'>
				<h2 className='text-2xl font-semibold text-gray-700 mb-2'>
					Your Files
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{files.map((file) => (
						<div
							key={file.id}
							className='bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
							<h3 className='text-lg font-semibold text-gray-800'>
								{file.custom_name || file.filename}
							</h3>
							<p className='text-sm text-gray-600 mt-1'>{file.description}</p>
							<div className='flex justify-between items-center mt-4'>
								<button
									className='bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors'
									onClick={() => handleDownload(file.custom_name)}>
									<FaDownload />
								</button>
								<button
									className='bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors'
									onClick={() => handleShare(file.id)}>
									<FaShareAlt />
								</button>
								<button
									className='bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors'
									onClick={() => handleDelete(file.id)}>
									<FaTrashAlt />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
		// <div className='p-4'>
		// 	<h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
		// 	<FileUpload onUploadSuccess={fetchFiles} />{' '}
		// 	{/* Passing onUploadSuccess as a prop */}
		// 	<div className='mt-4'>
		// 		<h2 className='text-xl font-semibold'>Your Files</h2>
		// 		{files && files.length > 0 ? (
		// 			files.map((file) => (
		// 				<div key={file.id} className='border p-2 rounded mt-2'>
		// 					<p>{file.custom_name || file.filename}</p>
		// 				</div>
		// 			))
		// 		) : (
		// 			<p>no files available</p>
		// 		)}
		// 	</div>
		// </div>
	);
};

export default Dashboard;
