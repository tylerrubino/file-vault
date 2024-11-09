# file-vault

file-vault is a private, web-based file storage and sharing application. It allows users to upload, manage, and share files securely with other users. Built with a Node.js backend and a React frontend, this project is intended to be a self-hosted solution for private file management.

The inspiration behind this project was in regards to how I was sharing files between my devices. Consistently using a private discord server to share compressed files and school assignments was beginning to become impractical, and being a CS major, simply using an already existing file sharing system was not practical enough apparently.

### Project Status

**Currently in Development**: The backend is complete, and the frontend is now in development. The app uses SQLite for metadata and the local filesystem for file storage, but future iterations may explore cloud storage options or database migration. SQLite was chosen since it is lightweight and easy to get running quickly.

---

## Features

### Backend

- **File Upload, Download, and Deletion**: Users can securely upload, download, and delete files.
- **File Sharing**: Owners can share files with other registered users and manage access.
- **Access Revocation**: Owners can revoke access for specific users, and shared users can remove their own access.
- **User Authentication**: JWT-based authentication for secure access.
- **Real-Time Notifications**: Socket.io integration to notify users of updates, such as new uploads or access changes.

### Frontend (In Progress)

- A responsive React app will allow users to manage files, view shared files, and receive notifications.

## Tech Stack

### Backend

- **Node.js & Express**: Server and API framework.
- **SQLite**: Database for storing metadata, such as user and file information.
- **Socket.io**: Real-time notifications.
- **JWT (JSON Web Tokens)**: Authentication.

### Frontend

- **React**: User interface framework.
- **Tailwind CSS** (Planned): For styling components and creating responsive layouts.

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- SQLite3

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/rubi-storage.git
   cd rubi-storage

   ```

2. **Install Backend Dependencies**:

   ```bash
   cd backend
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
   npm start
   ```

5. **Install Frontend Dependencies (coming soon)**:
   ```bash
   cd ../frontend
   npm install
   ```

## API Endpoints

| Method | Endpoint                                      | Description                         |
| ------ | --------------------------------------------- | ----------------------------------- |
| POST   | `/api/register`                               | Register a new user                 |
| POST   | `/api/login`                                  | Login and receive a JWT token       |
| POST   | `/api/upload`                                 | Upload a new file                   |
| GET    | `/api/files`                                  | Retrieve all user-uploaded files    |
| GET    | `/api/shared-files`                           | Retrieve files shared with the user |
| DELETE | `/api/files/:id`                              | Delete a user-owned file            |
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
