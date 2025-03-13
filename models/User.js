import mongoose from 'mongoose';
import z from 'zod';

//- Zod Login
const loginZodSchema = z.object({
    contact: z.object({
        email: z.string().email(),
    }),
    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(20, "La contraseña no puede superar los 20 caracteres"),
})

//- Zod Create
const UserZodCreate = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(50, "El nombre no puede superar los 50 caracteres"),
    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(100, "La contraseña no puede superar los 100 caracteres"),
    contact: z.object({
        email: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }).default({ phone: "", address: "" }), // 🔹 Garantiza que contact siempre tenga valores
    profileImage: z.string()
        .url("La imagen de perfil debe ser una URL válida")
        .optional(),
    bannerImage: z.string()
        .url("La imagen del banner debe ser una URL válida")
        .optional(),
    role: z.enum(['user', 'admin'], {
        errorMap: () => ({ message: "El rol debe ser 'user' o 'admin'" }),
    }).default('user'),
    listedBy: z.enum(['propietario', 'inmobiliaria', 'agente'], {
        errorMap: () => ({ message: "Debe ser 'propietario', 'inmobiliaria' o 'agente'" })
    }).optional(),
    createdAt: z.date().default(() => new Date()),
});

//- Zod Edit
const UserZodEdit = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(50, "El nombre no puede superar los 50 caracteres"),
    contact: z.object({
        email: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }).default({ phone: "", address: "" }), // 🔹 Garantiza que contact siempre tenga valores
    profileImage: z.string()
        .url("La imagen de perfil debe ser una URL válida")
        .optional(),
    bannerImage: z.string()
        .url("La imagen del banner debe ser una URL válida")
        .optional(),
    role: z.enum(['user', 'admin'], {
        errorMap: () => ({ message: "El rol debe ser 'user' o 'admin'" }),
    }).default('user'),
    listedBy: z.enum(['propietario', 'inmobiliaria', 'agente'])
        .nullable()
        .optional()
        .default(null),
    createdAt: z.date().default(() => new Date()),
});

//- Mongoose Schema
const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    password: { type: String, required: true },
    contact: {
        email: { 
            type: String, 
            required: [true, 'El correo electrónico es obligatorio'], 
            unique: true 
        },
        phone: { type: String },
        address: { type: String },
    },
    profileImage: { type: String },
    bannerImage: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    listedBy: { type: String, enum: ['propietario', 'inmobiliaria', 'agente'], default: null },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
export { UserZodCreate, UserZodEdit, loginZodSchema };
