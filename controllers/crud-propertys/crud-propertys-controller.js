import { deleteImage, imageUploadUtils } from "../../helpers/cloudinary.js";
import { Property } from "../../models/Property.js";

//* ------ Crear Propiedad
export const createProperty = async (req, res) => {
    try {
      // Extraemos los datos del cuerpo de la solicitud
      const { 
        title, description, type, operation, price, currency, location, features, images, status, publishedAt, owner 
      } = req.validatedData;
    
      // Creamos una nueva instancia del modelo con los datos proporcionados
      const newProperty = new Property({ 
        title, 
        description, 
        type, 
        operation, 
        price, 
        currency, 
        location, 
        features, 
        images, // Ahora es un array de { url, publicId }
        status, 
        publishedAt, 
        owner
      });
      
      // Guardamos la nueva propiedad en la base de datos
      await newProperty.save();
  
      // Respondemos con éxito
      res.status(201).json({
        success: true,
        message: "Propiedad agregada correctamente.",
        data: newProperty
      });
    } catch (error) {
      // Manejo de errores y respuesta al cliente
      console.error("Error al agregar la propiedad:", error.message);
      res.status(500).json({
        success: false,
        message: "Ocurrió un error en el servidor. Inténtelo nuevamente más tarde."
      });
    }
};

//* ------ Editar Propiedad
export const editProperty = async (req, res) => {
  try{

    const {id} = req.params;
    const {images, title, description, type, operation, price, currency, location, features, status} = req.validatedData;

    //- Verificamos si la propiedad existe
    const property = await Property.findById(id);


    console.log(property);
    

    if(!property) {
      return res.status(404).json({
        success: false,
        message: "La propiedad no existe."
      })
    }

    //-Actualizamos los campos
    property.images = images || property.images;
    property.title = title || property.title;
    property.description = description || property.description;
    property.type = type || property.type;
    property.operation = operation || property.operation;
    property.price = price || property.price;
    property.currency = currency || property.currency;
    property.location = location || property.location;
    property.features = features || property.features;
    property.status = status || property.status;

    await property.save();

    res.json({
      success: true,
      message: "Propiedad actualizada correctamente.",
    })


  }catch(error){
    console.error("Error al editar la propiedad:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al actualizar Propiedad",
    });
  }
}

//* ------ Eliminar Propiedad
export const deleteProperty = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el ID es válido
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido."
            });
        }

        // Buscar la propiedad
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "La propiedad no existe o ya ha sido eliminada."
            });
        }

        // Verificar autenticación
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "No estás autenticado. Inicia sesión para realizar esta acción."
            });
        }

        // Verificar permisos
        if (property.owner.toString() !== req.user._id) {
            return res.status(403).json({
                success: false,
                message: "No tienes autorización para eliminar esta propiedad."
            });
        }

        // Eliminar imágenes de Cloudinary
        if (property.images && property.images.length > 0) {
            const deletePromises = property.images.map(async (image) => {
                if (!image.publicId) {
                    throw new Error(`Falta publicId para la imagen: ${image.url}`);
                }
                return await deleteImage(image.publicId);
            });
            await Promise.all(deletePromises);
        }

        // Eliminar la propiedad de MongoDB
        await Property.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "La propiedad y sus imágenes han sido eliminadas correctamente."
        });
    } catch (error) {
        console.error("Error al eliminar la propiedad:", {
            message: error.message,
            stack: error.stack,
            id
        });
        return res.status(500).json({
            success: false,
            message: `Ocurrió un error en el servidor: ${error.message}`
        });
    }
};

//* ------ Subimos imagenes de las propiedades
export const uploadPropertyImages = async (req, res) => {
  try {

    if(!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se recibieron imágenes"
      })
    }

    //- Mapeamos cada archivo y lo convertimos a Base64
    const uploadPromise = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const url = `data:${file.mimetype};base64,${b64}`;
      const { url: secureUrl, publicId } = await imageUploadUtils(url); // Extraemos url y publicId
      return { url: secureUrl, publicId };
    });

    //- Esperamos que todas las imagenes se suban
    const result = await Promise.all(uploadPromise)

    res.status(200).json({
      success: true,
      result //-- Devuelve un array con los resultados de cada imagen subida
    })

  }catch(error) {
    res.status(500).json({
      success: false,
      message: "Ocurrió un error en el servidor al cargar imagenes. Inténtelo nuevamente"
    })
  }
}

//* ------ Tomamos nuestras propiedades pasandoles los filtros y el id
export const fetchSellerPropertys = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; // Si no se envía, por defecto es 1
      const limit = parseInt(req.query.limit) || 4; // Limite por defecto
      const skip = (page - 1) * limit; // Calculamos cuántos documentos omitir
      let type = req.query.type ? req.query.type.split(',') : [];
      let operation = req.query.operation ? req.query.operation.split(',') : [];
      const search = req.query.search || "";
      const sortParam = req.query.sortParam ? req.query.sortParam.split(",") : ["createdAt", "desc"];
      const province = req.query.province || "";
      const city = req.query.city || "";
      const idUser = req.user?.id || req.query.idUser;

      if (!idUser) {
        return res.status(400).json({
            success: false,
            message: "Falta el identificador del usuario."
        });
      }

      const parseRangeFilter = (param) => {
        if(!param) return null;
        const [min, max] = param.split(","); // Si param = "100,500", el resultado será ["100", "500"].
        return {
          min: min ? parseFloat(min) : null,
          max: max ? parseFloat(max) : null
          // Salida: { min: 100, max: 500 }
        }
      }

      const priceFilter = parseRangeFilter(req.query.priceFilter);
      const bedroomsFilter = parseRangeFilter(req.query.bedroomsFilter);
      const bathroomsFilter = parseRangeFilter(req.query.bathroomsFilter);
      const areaTotalFilter = parseRangeFilter(req.query.areaTotalFilter);
      const buildAreaFilter = parseRangeFilter(req.query.buildAreaFilter);

      const sortBy = {};
      sortBy[sortParam[0]] = sortParam[1] === "desc" ? -1 : 1;

      const filter = {
        title: { $regex: search, $options: "i" },
        owner: idUser
      };

      if (type.length > 0) filter.type = { $in: type };
      if (operation.length > 0) filter.operation = { $in: operation };
      
      if (province) filter["location.province"] = { $regex: province, $options: "i" };
      if (city) filter["location.city"] = { $regex: city, $options: "i" };

      //🟢 Aplicar filtros de rango
      const applyRangeFilter = (field, range) => {
        if (!range) return;
        filter[field] = {};
        if (range.min !== null) filter[field].$gte = range.min; // $gte (greater than or equal)
        if (range.max !== null) filter[field].$lte = range.max; // $lte (less than or equal)
      };

      applyRangeFilter("price", priceFilter);
      applyRangeFilter("features.bedrooms", bedroomsFilter);
      applyRangeFilter("features.bathrooms", bathroomsFilter);
      applyRangeFilter("features.area", areaTotalFilter);
      applyRangeFilter("features.builtArea", buildAreaFilter);

      // console.log("Filtro final de MongoDB:", filter);

      // Buscamos en la base de datos
      const propertys = await Property.find(filter)
        .populate('owner')
        .sort(sortBy)
        .skip(skip) 
        .limit(limit)
        .lean();
        
      const totalPropertys = await Property.countDocuments(filter);

      res.status(200).json({
          success: true,
          totalSellerPropertys: totalPropertys,
          page,
          limit,
          data: propertys
      });

  } catch (error) {
      console.error("Error en fetchPropertys:", error.message);
      res.status(500).json({
          success: false,
          message: error.message
      });
  }
};
