import cloudinary from 'cloudinary'
import multer from 'multer'

// Configuramos Cloudinary con las credenciales necesarias.
cloudinary.config({
    cloud_name: 'dti8bnedp',
    api_key: '912947953999593',
    api_secret: 'vtWo9cB2MprQJlICPL-wIqOSIkk',
})

// Definimos el almacenamiento de Multer en memoria para procesar los archivos antes de subirlos.
const storage = new multer.memoryStorage();

// Función utilitaria para cargar imágenes en Cloudinary.
const imageUploadUtils = async(file) => {
    const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto', // Permite la subida de cualquier tipo de archivo (imágenes, videos, etc.).
    })
    return result;
}

const upload = multer({storage});

export {
    upload, 
    imageUploadUtils
}