require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173',
            'http://localhost:3000',
            'https://medical-student-app-frontend.onrender.com',
  ],
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});