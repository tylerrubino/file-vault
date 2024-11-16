# file-vault

file-vault is a secure and user-friendly file sharing and storage web application. Designed to handle file uploads, sharing between users, and secure authentication, it provides a robust platform for managing your files online.

The inspiration behind this project was in regards to how I was sharing files between my devices. Consistently using a private discord server to share compressed files and school assignments was beginning to become impractical, and being a CS major, simply using an already existing file sharing system was not practical enough apparently.

## Features

### Backend

- **User Authentication**: Secure login and registration with hashed passwords and JWT-based authentication.
- **File Management**: Upload, delete, download, and view files with a clean and responsive UI.
- **File Sharing**: Owners can share files with other registered users and manage access.
- **Access Revocation**: Owners can revoke access for specific users, and shared users can remove their own access.
- **Real-Time Notifications**: Socket.io integration to notify users of updates, such as new uploads or access changes.

## Tech Stack

### Backend

- **Node.js & Express**: Server and API framework.
- **SQLite**: Database for storing metadata, such as user and file information.
- **Socket.io**: Real-time notifications.
- **JWT (JSON Web Tokens)**: Authentication.
- **Multer**: File-uploads.

### Frontend

- **React**: User interface framework.
- **Tailwind CSS**: For styling components and creating responsive layouts.
- **Axios**: For API communication.
- **React Router**: For navigation.

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- SQLite3
- npm or yarn

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/rubi-storage.git
   cd rubi-storage

   ```

2. **Install Dependencies**:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Setup Environment Variables**:

   - Create a `.env` file in the backend folder with the following variables:

   ```bash
   PORT=3000
   SECRET_KEY=your-secret-key
   ```

4. **Run the Backend Server**:

   ```bash
   cd backend
   npm start
   ```

5. **Run the Frontend**:

   ```bash
   cd frontend
   npm start
   ```

6. **Access the app at** `http://localhost:3000`.

## API Endpoints

### Authentication

| Method | Endpoint        | Description                   |
| ------ | --------------- | ----------------------------- |
| POST   | `/api/register` | Register a new user           |
| POST   | `/api/login`    | Login and receive a JWT token |

### File Management

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| POST   | `/api/upload`                | Upload a new file                |
| GET    | `/api/files`                 | Retrieve all user-uploaded files |
| DELETE | `/api/files/:id`             | Delete a user-owned file         |
| GET    | `/api/download/:custom_name` | Download a file by custom name   |

### File Sharing

| Method | Endpoint                                      | Description                         |
| ------ | --------------------------------------------- | ----------------------------------- |
| POST   | `/api/share`                                  | Share a file with another user      |
| GET    | `/api/shared-files`                           | Retrieve files shared with the user |
| DELETE | `/api/shared-files/:fileId/:sharedWithUserId` | Revoke access for a shared file     |

## Usage Notes

This project uses **JTW authentication** for secure access to API endpoints. Make sure to include a valid token in the `Authorization` header (e.g., `Bearer <token>`) when making requests to protected routes.

## Future Enhancements

- **Cloud Storage**: Integration with AWS S3 or Google Cloud for file storage.
- **Database Migration**: Potential migration from SQLite to PostgreSQL or MySQL for scalability.
- **Enhanced Frontend UI**: A clean and responsive React interface using Tailwind CSS.

## Contributing

Contributions are welcome! If you’d like to improve the UI, add new features, or fix bugs:

1. Fork the project
2. Create a new branch (git checkout -b feature-name)
3. Commit your changes (git commit -m "Add new feature")
4. Push the branch (git push origin feature-name)
5. Open a pull request

## License

This project is open-source and available under the MIT License.
