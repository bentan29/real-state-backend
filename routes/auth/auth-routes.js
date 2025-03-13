import express from 'express'
import { checkSession, editUser, imageUpload, loginUser, logoutUser, registerUser } from '../../controllers/auth/auth-controller.js';
import validateWithZod from '../../middleware/validationZod.js';
import { loginZodSchema, UserZodCreate, UserZodEdit } from '../../models/User.js';
import { upload } from '../../helpers/cloudinary.js';

const router = express.Router();

//- registrar
router.post(
    '/register',
    validateWithZod(UserZodCreate),
    registerUser
);

//- login
router.post('/login',
    validateWithZod(loginZodSchema),
    loginUser);

//- logout
router.post('/logout', logoutUser);

//- editar usuario
router.put(
    '/editUser/:id',
    validateWithZod(UserZodEdit),
    editUser);

//- verificar session mediante un token
router.get("/check-session", checkSession);

//- cargar imagen de perfil
router.post(
    "/upload-image", 
    upload.single('my_file'), // `upload.single('my_file')`: Middleware de Multer para procesar un solo archivo con el nombre del campo 'my_file'.
    imageUpload
)

export default router;