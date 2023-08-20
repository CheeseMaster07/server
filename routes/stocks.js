import express from 'express';

import { getStock, getStocks, getSectorsandIndustries } from '../controllers/stocks.js'

const router = express.Router();

router.get('/sectors-industries', getSectorsandIndustries)

router.get('/:id', getStock)

router.get('/', getStocks)



export default router;