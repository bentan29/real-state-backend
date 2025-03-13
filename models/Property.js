import mongoose, { Types } from "mongoose";
import z from 'zod'


//- Zod Crear
const PropertyZodCreate = z.object({
    title: z.string()
        .min(3, "El título debe tener al menos 3 caracteres")
        .max(100, "El título no puede exceder los 100 caracteres"),
    description: z.string()
        .min(10, "La descripción debe tener al menos 10 caracteres"),
    type: z.enum(["casa", "apartamento", "duplex", "oficina", "local_comercial", "cochera", "terreno", "campo", "galpon"]),
    operation: z.enum(["venta", "alquiler", "permuta"]),
    price: z.number()
        .positive("El precio debe ser mayor a 0"),
    currency: z.enum(["USD", "EUR", "ARS"], "Moneda no válida")
        .default("USD"),
    location: z.object({
        address: z.string().optional(),
        city: z.string(),
        province: z.string(),
        country: z.string().min(2, "El país debe tener al menos 2 caracteres").default('Uruguay'),
        coordinates: z
            .object({
                lat: z.number().min(-90).max(90, "Latitud no válida"),
                lng: z.number().min(-180).max(180, "Longitud no válida"),
            })
            .optional(), // Las coordenadas son opcionales
    }),
    features: z.object({
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        area: z.number().optional(),
        builtArea: z.number().optional(),
        garage: z.boolean().default(false),
    }),
    images: z.array(z.string().url("Debe ser una URL válida"))
        .optional(),
    status: z.enum(["disponible", "reservado", "vendido", "alquilado"], "Estado no válido")
        .default("disponible"),
    publishedAt: z.date()
        .default(new Date()),
    owner: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "El owner debe ser un ID válido de MongoDB",
    }),
    
});

//- Zod Editar
const PropertyZodEdit = z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(["casa", "apartamento", "duplex", "oficina", "local_comercial", "cochera", "terreno", "campo", "galpon"], "Tipo de propiedad no válido"),
    operation: z.enum(["venta", "alquiler", "permuta"], "Operación no válida"),
    price: z.number()
        .positive("El precio debe ser mayor a 0"),
    currency: z.enum(["USD", "EUR", "ARS"], "Moneda no válida")
        .default("USD"),
    location: z.object({
        address: z.string().optional(),
        city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
        province: z.string().min(2, "La provincia o departamento debe tener al menos 2 caracteres"),
        country: z.string().min(2, "El país debe tener al menos 2 caracteres").default('Uruguay'),
        coordinates: z
            .object({
                lat: z.number().min(-90).max(90, "Latitud no válida"),
                lng: z.number().min(-180).max(180, "Longitud no válida"),
            })
            .optional(), // Las coordenadas son opcionales
    }),
    features: z.object({
        bedrooms: z.number().nonnegative("El número de habitaciones no puede ser negativo").optional(),
        bathrooms: z.number().nonnegative("El número de baños no puede ser negativo").optional(),
        area: z.number().positive("El área debe ser mayor a 0"),
        builtArea: z.number().positive("El área construida debe ser mayor a 0").optional(),
        garage: z.boolean().default(false),
    }),
    images: z.array(z.string().url("Debe ser una URL válida"))
        .optional(),
    status: z.enum(["disponible", "reservado", "vendido", "alquilado"], "Estado no válido")
        .default("disponible"),
    publishedAt: z.date()
        .default(new Date()),
    owner: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "El owner debe ser un ID válido de MongoDB",
    }),
    
});

//- modelo mongoose
const PropertySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["casa", "apartamento", "duplex", "oficina", "local_comercial", "cochera", "terreno", "campo", "galpon", "todo"], required: true },
    operation: { type: String, enum: ["venta", "alquiler", "permuta"], required: true },
    price: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "EUR", "ARS"], default: "USD" },
    location: {
        address: { type: String },
        city: { type: String, required: true },
        province: { type: String, required: true },
        country: { type: String, default: "Uruguay" },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
    },
    features: {
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        area: { type: Number, default: 0 },
        builtArea: { type: Number, default: 0  },
        garage: { type: Boolean, default: false },
    },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["disponible", "reservado", "vendido", "alquilado"], default: "disponible" },
    publishedAt: { type: Date, default: Date.now },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Solo referencia al usuario
    listedBy: { 
        type: String, 
        enum: ["dueño", "inmobiliaria"],
    } // campo para identificar quién publica un dueño o una inmobiliaria, no es obligatorio
}, { timestamps: true });


export const Property = mongoose.model("Property", PropertySchema); //-modelo mongo
export {PropertyZodCreate, PropertyZodEdit}

