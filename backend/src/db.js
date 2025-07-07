import mongoose from 'mongoose'
import dotenv from "dotenv";

dotenv.config();

/**
 * Se conecta a la base de datos de MongoDB Atlas
 */
export const connectDb = async() => {
    try{
        const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
        await mongoose.connect(uri);
        console.log("DB connected")
    } catch(error){
        console.log(error);
    }
};
