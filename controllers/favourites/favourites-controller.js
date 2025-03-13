import { Favourite } from "../../models/Favourite.js";
import { Property } from "../../models/Property.js";

//- Tomamos todos nuestros favoritos
export const fetchAllMyFavourites = async(req, res) => {
    try {
        const {userId} = req.params;
        
        if(!userId) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionó el id del usuario"
            })
        }
         
        //-Buscamos si tenemos el modelo de favorito en BD
        const favourite = await Favourite.findOne({user: userId})
            .populate('items.propertyId')

        if(!favourite) {
            return res.status(404).json({
                success: false,
                message: "No hay favoritos para este usuario"
            })
        }

        //- Filtramos los items de favoritos para excluir los que no tengan un propertyId valido
        const validFavourites = favourite.items.filter(item => item.propertyId);
        // Si se eliminaron items inválidos (sin propertyId), actualizamos favoritos
        if(validFavourites.length < favourite.items.length) {
            favourite.items = validFavourites //- asignamos los favoritos validos
            await favourite.save();
        }

        res.status(200).json({
            success: true,
            data: favourite
        })

    } catch (error) {
        // Capturamos cualquier error inesperado y devolvemos un error 500 (Internal Server Error)
        console.error(error); // Registramos el error en el servidor
        res.status(500).json({
            success : false,
            message: "Error tomando los favoritos" // Mensaje de error general
        });
    }
}

//- Creamos nuevo favorito
export const saveFavourite = async(req, res) => {
    try{
        const {userId, propertyId} = req.body;

        if(!userId || !propertyId) {
            return res.status(400).json({
                success: false,
                message: 'Falta información'
            });
        }

        //-Chequeamos que exista la propiedad
        const property = await Property.findById(propertyId)

        if(!property) {
            return res.status(404).json({
                success: false,
                message: 'La propiedad no existe'
            })
        }

        //- Buscamos si ya existen nuestros favoritos
        let favourite = await Favourite.findOne({user: userId})
        //- Si no existe creamos un modelo
        if(!favourite) {
            favourite = new Favourite({user: userId, items: []})
        }

        //- Buscamos si ya tenemos agregada la propiedad en favoritos
        const isFavourite = favourite.items.some(item => item.propertyId.toString() === propertyId)

        if (isFavourite) { //---- Si ya está en favoritos, la eliminamos
            favourite.items = favourite.items.filter(item => item.propertyId.toString() !== propertyId);
        } else { //--- Si no está en favoritos, la agregamos
            favourite.items.push({propertyId});
        }

        await favourite.save();

        res.status(200).json({
            success: true,
            message: 'Accion realizada con éxito',
        })

    }catch(error){
        console.error(error);
        res.status(500).json({
            success : false,
            message: "Error al intentar agregar o quitar de favoritos"
        })
    }

}

//- Borramos de favoritos
export const deleteFavourite = async(req, res) => {}