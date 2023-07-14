import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import homeRouter from './routes/home.js'
import stockRouter from './routes/stocks.js'
import authRouter from './routes/auth.js'
import paymentRouter from './routes/payment.js'
import webhookRouter from './routes/webhook.js'

dotenv.config();

const app = express();


app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())
app.use('/webhook', webhookRouter)
app.use(bodyParser.json({ limit: "30mb", extended: true }))

app.use('/', homeRouter)
app.use('/stocks', stockRouter)
app.use('/auth', authRouter)
app.use('/payment', paymentRouter)

const CONNECTION_URL = process.env.MONGODB
const PORT = process.env.PORT || 5000

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
  .catch((error) => console.log('Error:', error.message))