import express from 'express';

import { payment, cancelPayment, getProductAndPrice, clientSecret } from '../controllers/payment.js'

const router = express.Router();

router.post('/', payment)
router.post('/cancel', cancelPayment)
router.get('/', getProductAndPrice)
router.get('/client-secret', clientSecret)

export default router;