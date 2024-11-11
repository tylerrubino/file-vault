// src/components/FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess, closeModal }) => {
	const [file, setFile] = useState(null);
	const [customName, setCustomName] = useState('');
	const [description, setDescription] = useState('');

	const handleFileChange = (e) => setFile(e.target.files[0]);
	const handleCustomNameChange = (e) => setCustomName(e.target.value);
	const handleDescriptionChange = (e) => setDescription(e.target.value);

	const handleUpload = async () => {
		if (!file) return;

		const formData = new FormData();

		//replace spaces with underscores in custom name
		formData.append('file', file);
		formData.append('custom_name', customName.replace(/\s+/g, '_'));
		formData.append('description', description);

		try {
			const token = localStorage.getItem('authToken');
			await axios.post('http://localhost:5000/api/upload', formData, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('authToken')}`,
					'Content-Type': 'multipart/form-data',
				},
			});
			alert('File uploaded successfully');
			setFile(null);
			setCustomName('');
			setDescription('');
			if (onUploadSuccess) onUploadSuccess();
			closeModal();
		} catch (err) {
			console.error('Upload error:', err);
			alert('Failed to upload file');
		}
	};

	return (
		<div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50'>
			<div className='bg-white rounded-lg p-6 w-11/12 max-w-md mx-auto'>
				<h2 className='text-2xl font-bold mb-4 text-gray-700'>Upload File</h2>

				<input
					type='file'
					onChange={(e) => setFile(e.target.files[0])}
					className='mb-4'
				/>
				<input
					type='text'
					placeholder='Custom Name'
					value={customName}
					onChange={handleCustomNameChange}
					className='w-full p-2 border rounded mb-4'
				/>
				<input
					type='text'
					placeholder='Description'
					value={description}
					onChange={handleDescriptionChange}
					className='w-full p-2 border rounded mb-4'
				/>

				<div className='flex justify-end space-x-4'>
					<button
						onClick={closeModal}
						className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors'>
						Close
					</button>
					<button
						onClick={handleUpload}
						className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'>
						Upload
					</button>
				</div>
			</div>
		</div>
	);
};

export default FileUpload;
