import { useState } from 'react';
import { useApi } from './useApi';

export function useFileUpload() {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(null);
	const { post } = useApi();

	// Function to upload a file
	const uploadFile = async (file, customName, description, onSuccess) => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('custom_name', customName);
		formData.append('description', description);

		try {
			setUploading(null);
			setError(null);
			await post('/upload', formData);
			if (onSuccess) onSuccess();
		} catch (err) {
			setError('File upload failed');
		} finally {
			setUploading(false);
		}
	};

	return { uploadFile, uploading, error };
}
