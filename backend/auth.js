const { getUserByUsername, updateUserPassword } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

// Login function
const authenticateUser = (username, password, callback) => {
	getUserByUsername(username, (err, user) => {
		if (err) return callback(err);
		if (!user) return callback(null, false);

		// Compare password with hashed password
		bcrypt.compare(password, user.hashed_password, (err, isMatch) => {
			if (err) return callback(err);
			return callback(null, isMatch);
		});
	});
};

// Password change function (uses `updateUserPassword`)
const changeUserPassword = (username, newPassword, callback) => {
	updateUserPassword(username, newPassword, callback);
};

// Generate a token for a user
const generateToken = (user) => {
	return jwt.sign(user, secretKey, { expiresIn: '24h' });
};

// Middleware to authenticate and verify token
const authenticateToken = (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1]; // Extract token after 'Bearer'
	if (!token) {
		console.log('Token not found');
		return res
			.status(401)
			.json({ message: 'Access denied. No token provided.' });
	}

	jwt.verify(token, secretKey, (err, user) => {
		if (err) {
			console.log('Token verification failed:', err.message); // Log the error
			return res.status(403).json({ message: 'Invalid token.' });
		}
		req.user = user;
		next();
	});
};

module.exports = {
	authenticateUser,
	changeUserPassword,
	generateToken,
	authenticateToken,
};
