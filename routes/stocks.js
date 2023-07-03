import express from 'express';

import { getStock, getStocks } from '../controllers/stocks.js'

const router = express.Router();

router.get('/:id', getStock)

router.get('/', getStocks)

export default router;