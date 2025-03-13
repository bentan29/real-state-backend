import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const dbConnect = async() => {
    try{
        await mongoose.connect(process.env.DB);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Detiene la aplicación si no se puede conectar
    }

    // Manejo de eventos
    mongoose.connection.on("connected", () => {
        console.log("MongoDB connection established.");
    });

    mongoose.connection.on("error", (err) => {
        console.log("Error with MongoDB connection:", err);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("MongoDB connection closed.");
    });
}


export default dbConnect;