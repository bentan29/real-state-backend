import jwt from 'jsonwebtoken'

const generarJWT = (uid, name) => {
    return new Promise((resolve, reject) => {
        //- Tomamos os valores que nos llegan
        const payload = { uid, name };
        // Generamos el jwt. pasandole el (paylod), (secretOrPrivateKey) seria una palabra unica secreta y rara, y ({cuando expira})
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h'
        }, (err, token) => { //-cuando se firma  el token pasa a este callbak y retorna error o el token
            if(err) {
                console.log(err);
                reject('Error: No se pudo Generar el token');
            }
            //-si sale correctamente
            resolve(token);
        })
    })
}


const verificarJWT = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_JWT_SEED, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

// Middleware para Express
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No se proporcionó token de autenticación. Inicia sesión."
        });
    }

    try {
        const decoded = await verificarJWT(token);
        req.user = decoded; // { uid, name }
        console.log("Usuario autenticado:", req.user); // Log para depurar
        next();
    } catch (error) {
        console.error("Error al verificar token:", error.message);
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado: " + error.message
        });
    }
};

export {
    generarJWT,
    verificarJWT,
    authMiddleware
}