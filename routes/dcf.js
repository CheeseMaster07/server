import express from 'express';

import { dcf } from '../controllers/dcf.js'

const router = express.Router();

router.post('/', dcf)

export default router;