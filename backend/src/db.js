import mongoose from 'mongoose'

export const connectDb = async() => {
    try{
        await mongoose.connect('mongodb+srv://uo277878:ingenieriainformatica2001@cluster0.hjchjtv.mongodb.net/audioverse?retryWrites=true&w=majority');
        console.log("DB connected")
    } catch(error){
        console.log(error);
    }
};
