import { Property } from "../../models/Property.js";

//- Tomamos las propiedades pasandoles los filtros
export const fetchPropertys = async (req, res) => {
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

        const parseRangeFilter = (param) => {
          if (!param) return null;
          const [min, max] = param.split(","); // Si param = "100,500", el resultado será ["100", "500"].
          return {
              min: min ? parseFloat(min) : null,
              max: max ? parseFloat(max) : null,
              // Salida: { min: 100, max: 500 }
          };
        };
        
        const priceFilter = parseRangeFilter(req.query.priceFilter);
        const bedroomsFilter = parseRangeFilter(req.query.bedroomsFilter);
        const bathroomsFilter = parseRangeFilter(req.query.bathroomsFilter);
        const areaTotalFilter = parseRangeFilter(req.query.areaTotalFilter);
        const buildAreaFilter = parseRangeFilter(req.query.buildAreaFilter);
        // console.log({ priceFilter, bedroomsFilter, bathroomsFilter, areaTotalFilter, buildAreaFilter });
    
        const sortBy = {};
        sortBy[sortParam[0]] = sortParam[1] === "desc" ? -1 : 1;

        const filter = {
          title: { $regex: search, $options: "i" },
        };

        if (type.length > 0) filter.type = { $in: type };
        if (operation.length > 0) filter.operation = { $in: operation };
        
        if (province) filter["location.province"] = { $regex: province, $options: "i" };
        if (city) filter["location.city"] = { $regex: city, $options: "i" };

        //🟢 Aplicar filtros de rango
        const applyRangeFilter = (field, range) => {
          if (!range) return;
          filter[field] = {};
          if (range.min !== null) filter[field].$gte = range.min;
          if (range.max !== null) filter[field].$lte = range.max;
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
            totalPropertys,
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


//- Detalles de cada propiedad
export const getPropertyDetails = async (req, res) => {
  try {
    // Extraemos el ID de la propiedad de la URL
    const propertyId  = req.params.id;
    // const property = await Property.findById(propertyId).populate('owner')
    const property = await Property.findById(propertyId).populate('owner')

    if(!property) return res.status(404).json({
      success: false,
      message: "Propiedad no encontrada"
    })

    res.status(200).json({
      success: true,
      data: property
    })


  }catch (error) {
    console.error("Error en getPropertyDetails:", error.message);
    res.status(500).json({
        success: false,
        message: error.message
    });
  }
}


//- Crear Propiedad
// export const createProperty = async (req, res) => {
//     try {
//       // Extraemos los datos del cuerpo de la solicitud
//       const { title, description, type, operation, price, currency, location, features, images, status, publishedAt, owner } = req.body;
  
//       // Validamos que alls los campos obligatorios estén presentes
//       // if (!title || !description || !type || !operation || !price || !location?.address || !location?.city || !location?.province || !location?.country || !features?.area || !owner?.name || !owner?.contact?.phone) {
//       //   return res.status(400).json({
//       //     success: false,
//       //     message: "Faltan campos obligatorios en la solicitud."
//       //   });
//       // }
  
//       // Creamos una nueva instancia del modelo con los datos proporcionados
//       const newProperty = new Property({ 
//         title, description, type, operation, price, currency, location, features, images, status, publishedAt, owner
//       });
  
//       // Guardamos la nueva propiedad en la base de datos
//       await newProperty.save();
  
//       // Respondemos con éxito
//       res.status(201).json({
//         success: true,
//         message: "Propiedad agregada correctamente.",
//         data: newProperty
//       });
//     } catch (error) {
//       // Manejo de errores y respuesta al cliente
//       console.error("Error al agregar la propiedad:", error.message);
//       res.status(500).json({
//         success: false,
//         message: "Ocurrió un error en el servidor. Inténtelo nuevamente más tarde."
//       });
//     }
// };
  
