# Garbage Management System

A comprehensive waste management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that provides both admin and user interfaces for efficient waste collection management.

## Features

### User Features
- **User Registration & Authentication**: Secure user registration and login system
- **Waste Report Submission**: Submit waste collection requests with detailed information
- **Report Management**: View, track, and manage all submitted reports
- **Real-time Notifications**: Get instant updates on report status changes
- **Profile Management**: Update personal information and preferences
- **Schedule Management**: Set preferred waste collection schedules
- **Feedback System**: Rate and provide feedback on completed services
- **Data Filtering**: Filter and search through historical reports

### Admin Features
- **Dashboard Analytics**: Comprehensive overview of system statistics
- **User Management**: Manage all registered users and their accounts
- **Report Management**: Handle and assign waste collection reports
- **Staff Assignment**: Assign reports to collection staff
- **Broadcast Notifications**: Send system-wide announcements
- **Analytics & Reports**: Detailed analytics and reporting tools
- **Real-time Monitoring**: Monitor system activity in real-time

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **Socket.io**: Real-time communication
- **Express Validator**: Input validation

### Frontend
- **React.js**: User interface library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library
- **React Toastify**: Toast notifications
- **Chart.js**: Data visualization
- **React Hook Form**: Form management

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd garbage-management-system
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/garbage-management
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```

### Running Both Servers

From the root directory, you can run both servers simultaneously:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/change-password` - Change password

### Waste Management
- `POST /api/waste/report` - Create waste report
- `GET /api/waste/reports` - Get user reports
- `GET /api/waste/reports/:id` - Get specific report
- `PUT /api/waste/reports/:id` - Update report
- `DELETE /api/waste/reports/:id` - Cancel report
- `POST /api/waste/reports/:id/feedback` - Submit feedback

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user
- `POST /api/admin/notifications/broadcast` - Send broadcast
- `GET /api/admin/analytics` - Get analytics data

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/stats` - Get user statistics

## Database Schema

### User Model
- Basic info (name, email, phone, address)
- Role-based access (user/admin)
- Preferences (notifications, waste schedule)
- Profile settings

### WasteReport Model
- Report details (type, description, location)
- Status tracking (pending, assigned, in-progress, completed)
- Scheduling information
- Feedback and ratings

### Notification Model
- Notification content (title, message, type)
- Read status tracking
- Category classification
- Metadata storage

## Usage

### For Users
1. Register an account or login
2. Navigate to "Report Issue" to submit waste collection requests
3. Track your reports in "My Reports"
4. Receive notifications for status updates
5. Provide feedback on completed services

### For Admins
1. Login with admin credentials
2. Access the admin dashboard for system overview
3. Manage users and their accounts
4. Handle and assign waste reports
5. Monitor system analytics and performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Future Enhancements

- Mobile application development
- GPS tracking for collection vehicles
- Advanced analytics and reporting
- Integration with external waste management services
- Multi-language support
- Advanced scheduling algorithms
- Payment integration for premium services 