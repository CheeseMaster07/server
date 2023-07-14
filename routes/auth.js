import express from 'express';

import { getRecentUser, login, register, checkTokenExpired } from '../controllers/auth.js'
import auth from '../middleware/auth.js'

const router = express.Router();


router.get('/:id', getRecentUser)
router.post('/login', login)
router.post('/register', register)
router.post('/checkTokenExpired', auth, checkTokenExpired)

export default router;