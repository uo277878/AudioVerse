import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique:true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        required: true,
    },
    creationDate:{
        type: Date,
        required: true,
        default: new Date()
    }
}, {
    timestamps: true
})

export default mongoose.model('User', UserSchema)