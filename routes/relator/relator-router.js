import express from 'express'
import { fetchRelatorPropertys } from '../../controllers/relator/relator-controller.js';

const router = express.Router();

router.get('/get', fetchRelatorPropertys)

export default router;