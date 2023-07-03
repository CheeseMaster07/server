import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import homeRouter from './routes/home.js'
import stockRouter from './routes/stocks.js'


const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())

app.use('/', homeRouter)
app.use('/stocks', stockRouter)

const CONNECTION_URL = 'mongodb+srv://gabbepabbe:1x3YYY8910@cluster0.dvzxzlr.mongodb.net/?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5000

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
  .catch((error) => console.log('Error:', error.message))