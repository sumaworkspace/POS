import express from 'express';
import cors from 'cors';
import aiRouter from './routes/ai';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import customersRouter from './routes/customers';
import ordersRouter from './routes/orders';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
