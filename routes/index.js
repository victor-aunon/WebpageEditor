import express from 'express'

import { homePage } from '../controllers/pagesController.js';

const router = express.Router()

// Defining routes
router.get('/', homePage)

export default router;
