import { Property } from "../../models/Property.js";
import User from "../../models/User.js";

export const fetchRelatorPropertys = async (req, res) => {
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
            owner: idUser
        };

        if (type.length > 0) filter.type = { $in: type };
        if (operation.length > 0) filter.operation = { $in: operation };
        
        if (province) filter["location.province"] = { $regex: province, $options: "i" };
        if (city) filter["location.city"] = { $regex: city, $options: "i" };

        //- Aplicar filtros de rango
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

        //- Buscamos en la base de datos las propiedades
        const propertys = await Property.find(filter)
            .populate('owner')
            .sort(sortBy)
            .skip(skip) 
            .limit(limit)
            .lean();

        //- Buscamos el relator
        const relator = await User.findById(idUser).select('name contact profileImage listedBy').lean()
          
        const totalPropertys = await Property.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalPropertys,
            page,
            limit,
            relator,
            data: propertys
        });

    } catch (error) {
        console.error("Error en fetchPropertys:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

