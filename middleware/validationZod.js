// Middleware para validar el cuerpo de la solicitud usando Zod
const validateWithZod = (schema) => (req, res, next) => {

    console.log("Datos recibidos:", req.body); // 🔍 Revisa qué datos llegan al backend

    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
        
        // Procesar los errores para obtener un objeto más limpio
        const formattedErrors = Object.entries(validationResult.error.format()).reduce((acc, [key, value]) => {
            if (key !== '_errors') {
                acc[key] = value._errors; // Extraemos solo los mensajes de error
            }
            return acc;
        }, {});

        return res.status(400).json({
            success: false,
            message: 'Invalid data provided!',
            errors: formattedErrors, // Errores detallados
        });
    }

    // Si es válido, almacenar los datos validados en req.validatedData
    req.validatedData = validationResult.data;
    next(); // Pasar al siguiente middleware o controlador
};

export default validateWithZod;