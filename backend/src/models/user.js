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
    profilePic:{
        type: String,
        required: false
    },
    role:{
        type: String,
        required: true,
    },
    dateBirth:{
        type: Date,
        required: true
    },
    followed: [
        {
          type: String,
          required: true,
          ref: "User"
        }
    ],
    songsLiked: [
        {
          type: String,
          required: true
        }
    ]
}, {
    timestamps: true
})

export default mongoose.model('User', UserSchema)