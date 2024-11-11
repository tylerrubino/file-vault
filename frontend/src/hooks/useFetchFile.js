import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export function useFetchFiles() {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { get } = useApi();

	// Fetch files on component mount
	useEffect(() => {
		const fetchFiles = async () => {
			setLoading(true);
			try {
				const data = await get('/files');
				setFiles(data);
				setError(null);
			} catch (err) {
				setError('Failed to fetch filess');
			} finally {
				setLoading(false);
			}
		};

		fetchFiles();
	}, [get]);

	return { files, loading, error };
}
