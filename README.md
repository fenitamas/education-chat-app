# 🎓 EduChat - Modern Educational Chat Platform

A full-stack educational chat application built with Next.js (frontend) and Express.js (backend), featuring real-time communication, study groups, and resource sharing.

## 🏗️ Project Structure

```
education-chat-app/
├── client/                 # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React components
│   │   └── styles/        # CSS and styling
│   ├── package.json       # Frontend dependencies
│   ├── next.config.mjs    # Next.js configuration
│   └── tailwind.config.js # Tailwind CSS configuration
├── server/                 # Backend (Express.js)
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── .git/                  # Git repository
└── .gitignore            # Git ignore rules
```

## 🚀 Features

### Frontend (Client)
- **Modern UI/UX**: Built with Next.js 15 and Tailwind CSS
- **Real-time Chat**: Socket.IO integration for instant messaging
- **Responsive Design**: Mobile-first approach
- **Authentication**: Login/Register with JWT
- **Study Groups**: Create and join collaborative learning spaces
- **Resource Sharing**: Upload and share educational materials
- **Q&A Forum**: Interactive question and answer system

### Backend (Server)
- **Express.js API**: RESTful API endpoints
- **Socket.IO**: Real-time communication
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure user authentication
- **File Upload**: Support for images and documents
- **Rate Limiting**: API protection against abuse
- **Email Notifications**: Password reset and alerts

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **Tailwind CSS 4** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animation library
- **React Icons** - Icon library

### Backend
- **Express.js** - Node.js web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd education-chat-app
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
```

### 3. Install Backend Dependencies
```bash
cd ../server
npm install
```

### 4. Environment Setup
```bash
# In server folder
cp env.example .env
# Edit .env with your configuration
```

### 5. Start Development Servers

#### Frontend (Client)
```bash
cd client
npm run dev
# Frontend will run on http://localhost:3000
```

#### Backend (Server)
```bash
cd server
npm run dev
# Backend will run on http://localhost:5000
```

## 🔧 Configuration

### Frontend Configuration
- Edit `client/next.config.mjs` for Next.js settings
- Modify `client/tailwind.config.js` for styling customization
- Update `client/src/app/layout.js` for global layout changes

### Backend Configuration
- Configure database connection in `server/.env`
- Set JWT secret and expiration
- Configure email settings for notifications
- Adjust rate limiting and security settings

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Join Study Groups**: Browse and join existing groups
3. **Start Chatting**: Real-time communication with group members
4. **Share Resources**: Upload and share educational materials
5. **Ask Questions**: Use the Q&A forum for help
6. **Collaborate**: Work together on projects and assignments

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
npm start
```

### Backend Deployment
```bash
cd server
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production email settings
- Set strong JWT secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ for the educational community**
