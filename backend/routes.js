module.exports = (io) => {
	const express = require('express');
	const multer = require('multer');
	const path = require('path');
	const fs = require('fs');
	const {
		db,
		deleteFileById,
		insertFile,
		getFiles,
		getFileByFilename,
		addUser,
		getUserByUsername,
		shareFileWithUser,
		getSharedFilesForUser,
		deleteFileCompletely,
		deleteUserFileLink,
		checkFileSharedWithOtherUsers,
		removeFileAccess,
	} = require('./db');
	const bcrypt = require('bcrypt');

	const router = express.Router();

	const { authenticateToken, generateToken } = require('./auth');

	// Configure Multer for file uploads
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'uploads/');
		},
		filename: (req, file, cb) => {
			cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to original filename
		},
	});
	const upload = multer({ storage });

	// POST /api/upload - Upload a File
	router.post(
		'/upload',
		authenticateToken,
		upload.single('file'),
		(req, res) => {
			console.log('Reached /upload route');

			// Check if the file metadata exists
			if (!req.file) {
				console.log('No file provided');
				return res.status(400).json({ message: 'File not provided' });
			}

			const userId = req.user.userId;
			const { filename, size } = req.file;
			const { custom_name, description } = req.body;

			// Insert file metadata into the databse
			insertFile(
				filename,
				custom_name,
				description,
				size,
				userId,
				(err, fileId) => {
					console.log('Reached database insert callback');

					if (err) {
						console.error('Database Error:', err.message); // Log error details to the console
						return res
							.status(500)
							.json({ message: 'Database error', error: err.message }); // Send the error message back in the response
					}

					// Notify clients of new upload
					io.emit('fileUploaded', {
						fileId,
						filename,
						custom_name,
						description,
						size,
						userId,
					});
					return res
						.status(200)
						.json({ message: 'File uploaded successfully', fileId });
				}
			);
		}
	);

	// GET /api/files - Retrieve metadata for all file
	router.get('/files', authenticateToken, (req, res) => {
		const userId = req.user.userId;

		// Retrieve metadata
		getFiles(userId, (err, rows) => {
			if (err) {
				return res.status(500).json({ message: 'Database error' });
			}
			io.emit('filesRetrieved');
			res.status(200).json(rows);
		});
	});

	// GET /api/download/:filename - Download a file
	router.get('/download/:custom_name', authenticateToken, (req, res) => {
		const { custom_name } = req.params;

		// Check if the file with a custom name exists in the database
		getFileByFilename(custom_name, (err, file) => {
			if (err) {
				return res.status(500).json({ message: 'Database error' });
			}

			if (!file) {
				return res.status(404).json({ message: 'File not found in database' });
			}

			// Define the path to the actual filename in the uploads folder
			const filePath = path.join(__dirname, 'uploads', file.filename);

			// Send the file for download
			res.download(filePath, (err) => {
				if (err) {
					res.status(404).json({ message: 'File not found on server' });
				}

				// Notify clients of new upload
				io.emit('fileDownloaded', {
					fileId: file.id,
					filename: file.filename,
					custom_name: file.custom_name,
					description: file.description,
					size: file.size,
				});
			});
		});
	});

	// DELETE /api/files/:id - Delete a file by ID
	router.delete('/files/:id', authenticateToken, (req, res) => {
		const userId = req.user.userId;
		const { id: fileId } = req.params;

		db.get(`SELECT * FROM user_files WHERE id = ?`, [fileId], (err, file) => {
			if (err) {
				return res.status(500).json({ message: 'Database error' });
			}

			if (!file) {
				return res
					.status(404)
					.json({ message: 'File not found for this user' });
			}
			// If user is the owner, delete file if no other users are linked
			if (file.owner_id === userId) {
				checkFileSharedWithOtherUsers(fileId, (err, hasOtherUsers) => {
					if (err)
						return res
							.status(500)
							.json({ message: 'Database error checking file links' });

					if (hasOtherUsers) {
						// Only remove user's link if other users still have access
						deleteUserFileLink(userId, fileId, (err) => {
							if (err)
								return res
									.status(500)
									.json({ message: 'Failed to remove access' });
							res.status(200).json({ message: 'Access removed' });
						});
					} else {
						// No other users have access, so delete file completely
						deleteFileCompletely(fileId, file.filename, (err) => {
							if (err)
								return res
									.status(500)
									.json({ message: 'Failed to delete file' });
							res.status(200).json({ message: 'File deleted completely' });
						});
					}
				});
			} else {
				// If user is not the owner, simply delete their access link
				deleteUserFileLink(userId, fileId, (err) => {
					if (err)
						return res.status(500).json({ message: 'Failed to remove access' });
					res.status(200).json({ message: 'Access removed' });
				});
			}
		});
	});

	// User registration
	router.post('/register', (req, res) => {
		const { username, password } = req.body;

		addUser(username, password, (err, userId) => {
			if (err) {
				if (err.message.includes('UNIQUE constraint failed')) {
					// Return a 409 Conflict error for duplicate username
					return res.status(409).json({ message: 'Username already exists' });
				}
				// Return a 500 error for other database issues
				return res.status(500).json({ message: 'User registration failed' });
			}
			res.status(200).json({ message: 'User registered successfully', userId });
		});
	});

	// POST /api/login - Login and authenticate
	router.post('/login', (req, res) => {
		const { username, password } = req.body;

		// Retrieve the user by username
		getUserByUsername(username, (err, user) => {
			if (err || !user) {
				return res
					.status(401)
					.json({ message: 'Invalid username or password' });
			}

			// Compare provided password with stored hashed password
			bcrypt.compare(password, user.hashed_password, (err, isMatch) => {
				if (err || !isMatch) {
					return res
						.status(401)
						.json({ message: 'Invalid username or password' });
				}

				// Password is correct, generate JWT token
				const token = generateToken({
					userId: user.id,
					username: user.username,
				});
				res.json({ token });
			});
		});
	});

	// Share a file with another user
	router.post('/share', authenticateToken, (req, res) => {
		const userId = req.user.userId;
		const { fileId, sharedWithUserId } = req.body;

		shareFileWithUser(fileId, sharedWithUserId, userId, (err, shareId) => {
			if (err) {
				if (err.status === 403) {
					return res.status(403).json({ message: err.message }); // Not authorized error
				}
				return res
					.status(500)
					.json({ message: 'Database error', error: err.message });
			}

			res.status(200).json({ message: 'File shared successfully' });
		});
	});

	// Get shared files for the authenticated user
	router.get('/shared-files', authenticateToken, (req, res) => {
		const userId = req.user.userId;

		getSharedFilesForUser(userId, (err, files) => {
			if (err) {
				return res
					.status(500)
					.json({ message: 'Failed to retrieve shared files' });
			}
			res.status(200).json(files);
		});
	});

	// DELETE /api/shared-files/:fileId/:sharedWithUserId - Remove access for a shared file
	router.delete(
		'/shared-files/:fileId/:sharedWithUserId',
		authenticateToken,
		(req, res) => {
			const userId = req.user.userId; // The ID of the user making the request
			const { fileId, sharedWithUserId } = req.params;

			// Check if the requesting user is the owner of the file before removing access
			db.get(
				`SELECT * FROM files WHERE id = ? AND owner_id = ?`,
				[fileId, userId],
				(err, row) => {
					if (err) {
						console.error('Database error:', err.message);
						return res.status(500).json({ message: 'Database error' });
					}
					if (row) {
						// The requester is the owner; allow them to remove access for sharedWithUserId
						return removeFileAccess(
							fileId,
							sharedWithUserId,
							(err, changes) => {
								if (err) {
									return res
										.status(500)
										.json({ message: 'Failed to remove access' });
								}
								if (changes === 0) {
									return res
										.status(404)
										.json({ message: 'No shared access found for this user' });
								}
								return res.status(200).json({ message: 'Access removed' });
							}
						);
					}

					// Case 2: The shared user is removing their own access
					if (parseInt(sharedWithUserId) === userId) {
						// The requester is the shared user and wants to remove their own access
						return removeFileAccess(fileId, userId, (err, changes) => {
							if (err) {
								return res
									.status(500)
									.json({ message: 'Failed to remove access' });
							}
							if (changes === 0) {
								return res
									.status(404)
									.json({ message: 'No shared access found for this user' });
							}
							return res.status(200).json({ message: 'Access removed' });
						});
					}

					// If neither condition matches, the user is unauthorized
					return res
						.status(403)
						.json({ message: 'Not authorized to remove access for this file' });
				}
			);
		}
	);

	return router;
};
