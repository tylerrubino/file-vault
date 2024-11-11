// src/components/SharedFiles.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaDownload, FaTrashAlt } from 'react-icons/fa';

function SharedFiles() {
	const [sharedFiles, setSharedFiles] = useState([]);

	useEffect(() => {
		const fetchSharedFiles = async () => {
			try {
				const token = localStorage.getItem('authToken');
				const response = await axios.get(
					'http://localhost:5000/api/shared-files',
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setSharedFiles(response.data);
			} catch (err) {
				console.error('Error fetching shared files:', err);
			}
		};
		fetchSharedFiles();
	}, []);

	const handleDownload = async (customName) => {
		const token = localStorage.getItem('authToken');
		try {
			const response = await axios.get(
				`http://localhost:5000/api/download/${customName}`,
				{
					headers: { Authorization: `Bearer ${token}` },
					responseType: 'blob', // Important for file download
				}
			);
			const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.setAttribute('download', 'filename.ext'); // Replace with actual filename from metadata
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (error) {
			console.error('Error downloading file:', error);
			alert('Failed to download file');
		}
	};

	const handleDelete = async (m) => {
		const token = localStorage.getItem('authToken');
		try {
			await axios.delete(`http://localhost:5000/api/files/${m}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			// Remove the deleted file from the state
			setSharedFiles(sharedFiles.filter((file) => file.id !== m));
			alert('File deleted successfully');
		} catch (err) {
			console.error('Error deleting file:', err);
			alert('Failed to delete the file');
		}
	};

	return (
		<div className='p-6'>
			<h1 className='text-3xl font-bold text-gray-800 mb-4'>Shared Files</h1>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{sharedFiles.map((file) => (
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
								onClick={() => handleDownload(file.id)}>
								<FaDownload />
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
	);
}

export default SharedFiles;
