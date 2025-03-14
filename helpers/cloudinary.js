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
const upload = multer({ storage });

// Función para subir imágenes a Cloudinary.
const imageUploadUtils = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto', // Permite la subida de cualquier tipo de archivo.
        });
        return {
            url: result.secure_url, // URL pública de la imagen
            publicId: result.public_id // Identificador único para eliminarla después
        };
    } catch (error) {
        throw new Error("Error al subir la imagen a Cloudinary: " + error.message);
    }
};

// Función para eliminar imágenes de Cloudinary.
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error("Error al eliminar la imagen de Cloudinary: " + error.message);
    }
};

export {
    upload,
    imageUploadUtils,
    deleteImage
};