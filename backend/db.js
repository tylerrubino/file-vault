// SQLite Databse
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Connect to SQLite Database
const db = new sqlite3.Database('database.db', (err) => {
	if (err) {
		console.error('Could not connect to a database');
	} else {
		console.log('Connected to SQLite database');
	}
});

// Log the table schema for file (debugging)
db.all('PRAGMA table_info(files);', (err, rows) => {
	if (err) {
		console.error('Error fetching schema:', err.message);
	} else {
		console.log('Table schema:', rows);
	}
});

// Create file metadata if it doesnt exist
db.run(`
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
		custom_name TEXT,
		description TEXT,
        size INTEGER,
        uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		owner_id INTEGER NOT NULL,
		FOREIGN KEY (owner_id) REFERENCES users(id)
    )
`);

// Create users metadata table if it doesnt exist
db.run(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		hashed_password TEXT NOT NULL
	)
`);

// create shared_files metadata table if it doesnt exist
db.run(`
	CREATE TABLE IF NOT EXISTS shared_files (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		file_id INTEGER NOT NULL,
		shared_with_user_id INTEGER NOT NULL,
		shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (file_id) REFERENCES files(id),
		FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
		UNIQUE (file_id, shared_with_user_id) -- Prevents duplicate sharing
	)
`);

// create user_files metadata table if it doesnt exist
db.run(`
	CREATE TABLE IF NOT EXISTS user_files (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
    	user_id INTEGER NOT NULL,
    	file_id INTEGER NOT NULL,
    	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    	FOREIGN KEY (user_id) REFERENCES users(id),
    	FOREIGN KEY (file_id) REFERENCES files(id),
    	UNIQUE (user_id, file_id)
	)
`);

// Inert file metadata
const insertFile = (
	filename,
	custom_name,
	description,
	size,
	userId,
	callback
) => {
	db.run(
		`INSERT INTO files (filename, custom_name, description, size, owner_id) VALUES (?, ?, ?, ?, ?)`,
		[filename, custom_name, description, size, userId],
		function (err) {
			if (err) {
				// Database insertioon failed; delete file from uploads
				const filePath = path.join(__dirname, 'uploads', filename);
				fs.unlink(filePath, (unlinkErr) => {
					if (unlinkErr) {
						console.error(
							'Failed to delete file after DB error:',
							unlinkErr.message
						);
					}
				});
				return callback(err);
			}

			// callback(null, this.lastID);
			const fileId = this.lastID;
			// callback(null, fileId);

			console.log(`Inserting file with values:`, [
				filename,
				custom_name,
				description,
				size,
				userId,
			]);

			// Link file to the owner in user_files table
			db.run(
				`INSERT INTO user_files (user_id, file_id) VALUES (?, ?)`,
				[userId, fileId],
				(err) => {
					if (err) {
						// cleanup if user_files insertion fails
						const filePath = path.join(__dirname, 'uploads', filename);
						fs.unlink(filePath, (unlinkErr) => {
							if (unlinkErr) {
								console.error(
									'Failed to delete file after user_files DB error:',
									unlinkErr.message
								);
							}
						});
						return callback(err);
					}
					callback(null, fileId);
				}
			);
		}
	);
};

// Retrieve all file metadata
const getFiles = (userId) => {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM files WHERE owner_id = ?`, [userId], (err, rows) => {
			if (err) {
				return reject(err);
			}
			resolve(rows);
		});
	});

	// 	if (err) {
	// 		console.error('Error fetching files:', err.message);
	// 		return callback(err);
	// 	}
	// 	console.log(`Files retrieved for userId ${userId}:`, rows);
	// 	callback(null, rows);
	// });
};

// Check if a file exists by filename
const getFileByFilename = (custom_name, callback) => {
	db.get(
		`SELECT * FROM files WHERE custom_name = ?`,
		[custom_name],
		(err, row) => {
			callback(err, row);
		}
	);
};

// Delete a file entry from the database by ID
const deleteFileById = (id, callback) => {
	db.run(`DELETE FROM files WHERE id = ?`, [id], function (err) {
		if (typeof callback === 'function') {
			callback(err, this.changes); // `this.changes` indicates the number of rows affected
		} else {
			console.error('Error: Callback is not a function');
		}
	});
};

// Function to add new user
const addUser = (username, password, callback = () => {}) => {
	// Default callback
	bcrypt.hash(password, 10, (err, hashedPassword) => {
		if (err) return callback(err);

		db.run(
			`INSERT INTO users (username, hashed_password) VALUES (?, ?)`,
			[username, hashedPassword],
			function (err) {
				if (err) {
					console.error('Error adding user:', err.message);
					return callback(err);
				}
				callback(null, this.lastID);
			}
		);
	});
};

// Get user by username to verify credentials during login
const getUserByUsername = (username, callback) => {
	db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
		callback(err, row);
	});
};

// Update a user's password in the `users` table
const updateUserPassword = (username, newPassword, callback) => {
	bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
		if (err) return callback(err);

		db.run(
			`UPDATE users SET hashed_password = ? WHERE username = ?`,
			[hashedPassword, username],
			function (err) {
				if (err) {
					console.error('Error updating password:', err.message);
					return callback(err);
				}
				callback(null, this.changes);
			}
		);
	});
};

const shareFileWithUser = (fileId, sharedWithUserId, userId, callback) => {
	console.log(
		`Attempting to share fileId: ${fileId} from userId: ${userId} to sharedWithUserId: ${sharedWithUserId}`
	);

	// Check if the requesting user is authorized to share this file (i.e., if they own the file)
	db.get(
		`SELECT * FROM user_files WHERE user_id = ? AND file_id = ?`,
		[userId, fileId],
		(err, row) => {
			if (err) {
				console.error('Database error:', err.message);
				return callback(err);
			}
			if (!row) {
				// User is not authorized to share the file
				const error = new Error('Not authorized to share this file');
				error.status = 403;
				return callback(error); // Pass a custom error to routes.js
			}

			console.log(`User ${userId} is authorized to share file ${fileId}`);

			// Add entry to give the target user access to the file
			db.run(
				`INSERT OR IGNORE INTO shared_files (file_id, shared_with_user_id) VALUES (?, ?)`,
				[fileId, sharedWithUserId],
				(err) => {
					if (err) {
						console.error('Failed to share file:', err.message);
						return callback(err); // Pass error back to routes.js
					}
					console.log(
						`File ${fileId} shared with user ${sharedWithUserId} successfully.`
					);
					callback(null); // No error, sharing was successful
				}
			);
		}
	);
};

const getSharedFilesForUser = (userId, callback) => {
	db.all(
		`SELECT f.*
         FROM files f
         INNER JOIN shared_files sf ON f.id = sf.file_id
         WHERE sf.shared_with_user_id = ?`,
		[userId],
		(err, rows) => {
			if (err) {
				console.error('Error fetching shared files:', err.message);
				return callback(err);
			}
			console.log(`Shared files for userId ${userId}:`, rows);
			callback(null, rows);
		}
	);
};

const deleteUserFileLink = (userId, fileId, callback) => {
	db.run(
		`DELETE FROM user_files WHERE user_id = ? AND file_id = ?`,
		[userId, fileId],
		function (err) {
			if (err) {
				console.error('Error deleting user file link:', err.message);
				return callback(err);
			}
			callback(null, this.changes); // returns number of rows affected
		}
	);
};

// check if any users stil have access to the file
const checkFileSharedWithOtherUsers = (fileId, callback) => {
	db.get(
		`SELECT COUNT(*) AS count FROM user_files WHERE file_id = ?`,
		[fileId],
		(err, row) => {
			if (err) {
				return callback(err);
			}
			callback(null, row.count > 0); // Returns true if other users still linked
		}
	);
};

// Delete the actual file record and file in storage if no users are linked
const deleteFileCompletely = (fileId, filename, callback) => {
	const filePath = path.join(__dirname, 'uploads', filename);
	db.run(`DELETE FROM files WHERE id = ?`, [fileId], function (err) {
		if (err) {
			return callback(err);
		}
		// Remove physical file
		fs.unlink(filePath, (fsErr) => {
			if (fsErr) {
				console.error('Failed to delete file from storage:', fsErr.message);
			}
			callback(null, this.changes);
		});
	});
};

const removeFileAccess = (fileId, sharedWithUserId, callback) => {
	db.run(
		`DELETE FROM shared_files WHERE file_id = ? AND shared_with_user_id = ?`,
		[fileId, sharedWithUserId],
		function (err) {
			if (err) {
				console.error('Error removing access:', err.message);
				return callback(err);
			}
			console.log(
				`Access removed for fileId ${fileId} and userId ${sharedWithUserId}`
			);
			callback(null, this.changes); // `this.changes` shows the number of affected rows
		}
	);
};

module.exports = {
	db,
	insertFile,
	getFiles,
	getFileByFilename,
	deleteFileById,
	addUser,
	getUserByUsername,
	updateUserPassword,
	shareFileWithUser,
	getSharedFilesForUser,
	deleteFileCompletely,
	deleteUserFileLink,
	checkFileSharedWithOtherUsers,
	removeFileAccess,
};
