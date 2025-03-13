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
                reject(null);
            } else {
                resolve(decoded);
            }
        });
    });
};

export {
    generarJWT,
    verificarJWT
}