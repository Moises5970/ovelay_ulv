/**
 * mongodb.js - conexion a mongoDB
 * ODM (Object Document Mapper), permite mapear objetos en una base de datos de documentos,
  en este caso, MongoDB.
 * 
 * Esta función se llama UNA SOLA VEZ al arrancar el servidor.
  Mongoose mantiene un pool de conexiones internamente —
  no se abre y cierra la conexión en cada request.
 */

import mongoose from 'mongoose';

export async function connectDB() {
  try {
    /**
     * El URI se encuentra en el archivo .env, en caso de que no se encuentre, se mostrara un error de la falla.
     */
    const uri = process.env.MONGODB_URI;

    // Verifica si el URI esta disponible
    if (!uri) throw new Error('MONGODB_URI is not defined in .env');

    // conexion
    await mongoose.connect(uri);

    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (error) {
    console.log('❌ Error connecting to MongoDB: ', error.message);

    /**
     * process.exit(1) detiene a Node.js con codigo de error.
     * Si no se encuatra la BD, se detiene el servidor pues no teien sentido segir corriendo.
     */
    process.exit(1);
  }
}
