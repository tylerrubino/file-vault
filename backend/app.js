require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app); // create an HTTP server
const io = socketIo(server); // init socket.io with server

const PORT = process.env.port || 5000;

// Use CORS middleware
app.use(
	cors({
		origin: 'http://localhost:3000', // allow requests from frontend
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // specify HTTP methods
		credentials: true, // enable cookies
	})
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve files in the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api', routes(io)); // Connect the routes to the '/api' path

// Socket.IO connection handler
io.on('connection', (socket) => {
	console.log('A user connected');

	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

// Export io instance to use in routes.js
module.exports = io;

// Start the server with Socket.IO
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
