import './config/env.js';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import productRoutes from './routes/productRoute.js';
import userRoutes from './routes/userRoute.js';
import orderRoutes from './routes/orderRoute.js';
import uploadRoutes from './routes/uploadRoute.js';
import paymentRoutes from './routes/paymentRoute.js';
import wishlistRoutes from './routes/wishlistRoute.js';
import carouselRoutes from './routes/carouselRoute.js';
import dashboardRoutes from './routes/dashboardRoute.js';
import contactRoutes from './routes/contactRoute.js';

const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Body parser
// Body parser
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl === '/api/payment/webhook') {
        req.rawBody = buf;
      }
    },
  }),
);

app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);

// const __dirname = path.resolve(); // Set __dirname to current directory
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));
