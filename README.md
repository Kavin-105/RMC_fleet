RMC Fleet Management System
A comprehensive fleet management system for Ready Mix Concrete (RMC) transit mixers. This application helps fleet owners manage vehicles, drivers, expenses, documents, and daily checklists efficiently.

🚀 Features
Vehicle Management - Track and manage transit mixer fleet
Driver Management - Manage driver profiles, assignments, and compliance
Expense Tracking - Monitor and categorize vehicle expenses
Document Management - Track vehicle documents and expiry dates
Daily Checklists - Ensure vehicle safety with mandatory daily inspections
Two-way Driver-Vehicle Sync - Automatic synchronization of assignments
Role-based Access - Separate dashboards for owners and drivers
📋 Prerequisites
Before running this project, make sure you have the following installed:

Node.js (v16 or higher) - Download here
MongoDB - Choose one:
Option 1: Local MongoDB - Download here
Option 2: MongoDB Atlas (Cloud) - Sign up free
Git (Optional) - For cloning the repository
🛠️ Installation & Setup
Step 1: Clone or Download the Project
# If using Git
git clone <repository-url>
cd RMC

# Or download and extract the ZIP file
Step 2: Install Backend Dependencies
cd backend
npm install
Step 3: Install Frontend Dependencies
cd ..
npm install
Step 4: Set Up Environment Variables
Create a .env file in the backend folder:

cd backend
# Windows PowerShell
New-Item .env

# Or create manually
Add the following content to backend/.env:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/rmc_fleet
JWT_SECRET=rmc_fleet_secret_key_2026
JWT_EXPIRE=7d
For MongoDB Atlas (Cloud Database):

PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rmc_fleet?retryWrites=true&w=majority
JWT_SECRET=rmc_fleet_secret_key_2026
JWT_EXPIRE=7d
Step 5: Start MongoDB (If Using Local)
Windows:

MongoDB service should start automatically
Or start manually: Open Command Prompt as Administrator and run:
net start MongoDB
Check if MongoDB is running:

mongosh
# Should connect to MongoDB shell
🚦 Running the Application
Option 1: Run Backend and Frontend Separately
Terminal 1 - Start Backend Server:

cd backend
npm run dev
You should see:

Server running on port 5000
MongoDB Connected: localhost
Terminal 2 - Start Frontend Development Server:

# From project root (not in backend folder)
npm run dev
You should see:

VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
Option 2: Run Both Concurrently (Optional)
Install concurrently package (if not already installed):

npm install concurrently --save-dev
Add to root package.json scripts:

"scripts": {
  "dev:all": "concurrently \"npm run dev --prefix backend\" \"npm run dev\""
}
Then run:

npm run dev:all
📊 Seed Initial Data (Optional)
To populate the database with sample data:

cd backend
node seed.js
This creates:

Sample owner account (owner@rmc.com / password123)
Sample driver account
Sample vehicles and data
🌐 Access the Application
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
API Health Check: http://localhost:5000/api/health
👤 Default Login Credentials (After Seeding)
Owner Account:

Email: owner@rmc.com
Password: password123
Driver Account:

Mobile: 9876543210
Password: driver123
📁 Project Structure
RMC/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication & middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── seed.js             # Database seeding script
│   ├── server.js           # Entry point
│   └── .env                # Environment variables
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
└── package.json            # Frontend dependencies
🔧 Available Scripts
Backend (run from /backend folder)
npm run dev         # Start development server with nodemon
npm start           # Start production server
node seed.js        # Seed database with sample data
Frontend (run from root folder)
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
🐛 Troubleshooting
Backend won't start - Port already in use
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
MongoDB connection error
Local MongoDB:

# Check if MongoDB is running
net start MongoDB

# Or start MongoDB manually
mongod
MongoDB Atlas:

Verify connection string in .env
Check IP whitelist in Atlas dashboard
Ensure correct username/password
Frontend can't connect to backend
Ensure backend is running on port 5000
Check API URL in src/services/api.js
Verify CORS settings in backend
Collections not created
Collections are created automatically when first used
Start the application and register a user
Or run the seed script: node seed.js
🔐 Environment Variables
Backend .env file:
Variable	Description	Example
PORT	Backend server port	5000
MONGODB_URI	MongoDB connection string	mongodb://localhost:27017/rmc_fleet
JWT_SECRET	Secret key for JWT tokens	rmc_fleet_secret_key_2026
JWT_EXPIRE	JWT token expiration	7d
📦 Tech Stack
Frontend:

React 18
Vite
React Router
Axios
Lucide React (Icons)
React Hot Toast
Backend:

Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
bcryptjs
🚀 Deployment
Frontend (Vercel/Netlify)
npm run build
# Deploy the 'dist' folder
Backend (Heroku/Railway/Render)
Set environment variables
Deploy backend folder
Use MongoDB Atlas for production database
📝 API Endpoints
Authentication
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
Vehicles
GET /api/vehicles - Get all vehicles
POST /api/vehicles - Create vehicle
PUT /api/vehicles/:id - Update vehicle
DELETE /api/vehicles/:id - Delete vehicle
PUT /api/vehicles/:id/assign-driver - Assign driver
Drivers
GET /api/drivers - Get all drivers
POST /api/drivers - Create driver
PUT /api/drivers/:id - Update driver
DELETE /api/drivers/:id - Delete driver
Expenses
GET /api/expenses - Get all expenses
POST /api/expenses - Create expense
PUT /api/expenses/:id - Update expense
Documents
GET /api/documents - Get all documents
POST /api/documents - Create document
Checklists
GET /api/checklists - Get all checklists
POST /api/checklists - Create checklist
GET /api/checklists/today - Get today's checklist
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is licensed under the MIT License.

👨‍💻 Support
For support, email your-email@example.com or open an issue in the repository.

Happy Coding! 🚛💨
