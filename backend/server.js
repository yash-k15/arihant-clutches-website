import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoute.js';

dotenv.config();

const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

const app = express();

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
