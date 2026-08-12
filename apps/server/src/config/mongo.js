import mongoose from 'mongoose';

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("[db] MongoDB conectado");
        
    } catch (err) {
        console.log("[db] Error de conexion", err.message);
        process.exit(1);
    }
}