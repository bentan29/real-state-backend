import express from 'express'
import { fetchAllMyFavourites, saveFavourite } from '../../controllers/favourites/favourites-controller.js';

const router = express.Router();

//- Tomamos todos los favoritos
router.get('/fetchAll/:userId', fetchAllMyFavourites)

//- guardar nuevo favorito
router.post('/save', saveFavourite)


export default router;