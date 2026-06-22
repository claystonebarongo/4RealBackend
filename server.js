const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// UPDATED: Dynamic CORS configuration for production
// Set 'FRONTEND_URL' in your Render environment variables to your live frontend link
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inspections', inspectionRoutes);

app.get('/', (req, res) => {
    res.send('4REAL Backend API is running smoothly...');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});