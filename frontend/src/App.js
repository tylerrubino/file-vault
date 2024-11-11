import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import SharedFiles from './components/SharedFiles';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import { useAuth } from './hooks/useAuth'; // Custom hook for auth state

function App() {
	const { isLoggedIn } = useAuth();

	return (
		<Router>
			<NavBar />
			<Routes>
				<Route path='/' element={<Home />} />
				<Route
					path='/dashboard'
					element={isLoggedIn ? <Dashboard /> : <Navigate to='/login' />}
				/>
				{isLoggedIn && (
					<>
						<Route path='/shared-files' element={<SharedFiles />} />
						<Route path='/upload' element={<FileUpload />} />
					</>
				)}

				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
			</Routes>
		</Router>
	);
}

export default App;
