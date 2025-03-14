import express from 'express'
import { fetchPropertys,  getPropertyDetails } from '../../controllers/propertys/property-controllers.js';
import { createProperty, deleteProperty, editProperty, fetchSellerPropertys, uploadPropertyImages } from '../../controllers/crud-propertys/crud-propertys-controller.js';
import { upload } from '../../helpers/cloudinary.js';
import validateWithZod from '../../middleware/validationZod.js';
import { PropertyZodCreate, PropertyZodEdit } from '../../models/Property.js';
import { authMiddleware } from '../../helpers/jwt.js';

const router = express.Router();

//*---- Rutas publicas ---------------------
router.get('/get', fetchPropertys)
router.get('/getPropertyDetails/:id', getPropertyDetails)

// Middleware de autenticación para rutas privadas
router.use(authMiddleware); // Protege todas las rutas siguientes

//*---- Rutas privadas --------------------
//---- Crud ----

//- Crear
router.post(
    '/seller/create',
    validateWithZod(PropertyZodCreate),
    createProperty
)

//- Editar
router.put(
    '/seller/edit/:id',
    validateWithZod(PropertyZodEdit),
    editProperty
)

//- Eliminar
router.delete('/seller/delete/:id', deleteProperty)

//- subir imagenes
router.post(
    '/seller/upload-images', 
    upload.array('my_files'), 
    uploadPropertyImages
)

//- Tomamos solamente todas las propiedades del vendedor
router.get('/seller/get', fetchSellerPropertys)

export default router;