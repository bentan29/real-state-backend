import { imageUploadUtils } from "../../helpers/cloudinary.js";
import { generarJWT, verificarJWT } from "../../helpers/jwt.js";
import User from "../../models/User.js";
import bcrypt from 'bcryptjs'

//* --------- Registrar usuario
const registerUser = async(req, res) => {
    const { contact, password } = req.validatedData;

    if (!contact.email) {
        return res.status(400).json({
            success: false,
            message: "El correo electrónico es obligatorio"
        });
    }

    try{
        const checkUser = await User.findOne({"contact.email": contact.email})
        if(checkUser) {
            return res.status(400).json({
                success: false,
                message: "Usuario ya existe"
            })
        }

        //- Nuevo usuario
        const newUser = new User({
            ...req.validatedData,
            profileImage: req.validatedData.profileImage // Asignando la URL de la imagen
        });

        //- Encriptamos contraseña
        const salt = bcrypt.genSaltSync();
        newUser.password = bcrypt.hashSync(password, salt);

        //- Guardamos en BD
        await newUser.save();
        //- Generaos el jwt
        const token = await generarJWT(newUser.id, newUser.name);

        //- Enviamos el token como una cookie segura
        res.cookie("token", token, {
            httpOnly: true, // 🔐 Protege contra XSS
            secure: process.env.NODE_ENV === "production", // 🔐 Solo HTTPS en producción
            sameSite: "strict", // 🔐 Previene CSRF
            maxAge: 3600000, // 1 hora
        });

        //- respuesta ok, usuario nuevo creado
        res.status(201).json({
            success: true,
            message: `Usuario ${newUser.name} Creado con Exito`,
            uid: newUser.id,
            name: newUser.name,
        })

    }catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Hubo algun error al registrar"
        })
    }
}

//* --------- Editar usuario
const editUser = async(req, res) => {
    try {
        const {id} = req.params;
        const { name, contact, profileImage, bannerImage, listedBy } = req.validatedData;

        //- Verificamos si el usuario existe
        const user = await User.findById(id);
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        //- Actualizamos los campos con los que vienen o los que tenian antes
        user.name = name || user.name;
        user.contact.email = contact?.email || user.contact.email;
        user.contact.phone = contact?.phone || user.contact.phone;
        user.contact.address = contact?.address || user.contact.address;
        user.profileImage = profileImage || user.profileImage;
        user.bannerImage = bannerImage || user.bannerImage;
        user.listedBy = listedBy || user.listedBy;

        await user.save();

        res.json({
            success: true,
            message: `Usuario ${user.name} actualizado con exito`,
            // data: user
        })

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar usuario",
        });
    }
}


//* --------- Login usuario
const loginUser = async(req, res) => {

    const { contact, password } = req.body;

    try{
        const user = await User.findOne({ "contact.email": contact.email });

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "Usuario no existe"
            })
        }

        //- Confiramar los passwords, comparamos pass que escribimos con el de la BD
        const validPassword = bcrypt.compareSync(password, user.password);

        if(!validPassword) {
            return res.status(400).json({
                success: false,
                message: "Password incorrecto"
            })
        }

        //-Generamos un token
        const token = await generarJWT(user.id, user.name);

        //- Enviamos el token en una cookie segura
        res.cookie("token", token, {
            httpOnly: true, // 🔐 No accesible desde JS
            secure: process.env.NODE_ENV === "production", // 🔐 Solo HTTPS en producción
            sameSite: "strict", // 🔐 Protección contra CSRF
            maxAge: 3600000, // 1 hora
        });

        //- Respuesta ok
        res.json({
            success: true,
            message: `Bienvenido ${user.name}`,
            // uid: user.id,
            // name: user.name,
        })

    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Hubo algun error en el Login"
        })
    }
}


//* --------- Logout usuario (Eliminar cookie)
const logoutUser = (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  
    res.status(200).json({
      success: true,
      message: "Sesión cerrada con éxito",
    });
};


//* --------- Verificar sesión del usuario.. Lo estamos llamando desde app.jsx del front React
const checkSession = async (req, res) => {
    try {
        const token = req.cookies?.token; // 🔥 Obtenemos el token desde la cookie

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No hay sesión activa",
            });
        }

        //- Verificamos el token
        const decoded = await verificarJWT(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Sesión inválida",
            });
        }

        //- Buscamos al usuario en la base de datos
        const user = await User.findById(decoded.uid).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        //- Enviamos la información del usuario
        res.json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Error en la verificación de sesión:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar sesión",
        });
    }
};


//* --------- Cargar imagen a cloudinary
const imageUpload = async(req, res) => {
    try {
        //- Convertimos el archivo recibido en un string codificado en Base64.
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        //- Creamos un URL en formato Data URI, nescesario para subirlo a Cloudinary.
        const url = "data:" + req.file.mimetype + ";base64," + b64;

        //- Llamamos a la función de utilidad para subir la imagen a Cloudinary.
        const result = await imageUploadUtils(url)

        res.json({
            success: true,
            result
        })

    }catch(error) {
        console.error("Error al cargar imagen:", error);
        res.json({
            success: false,
            message: "Error al cargar imagen",
        })
    }
}


export {
    registerUser,
    editUser,
    loginUser,
    logoutUser,
    checkSession,
    imageUpload
}