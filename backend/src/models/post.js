import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    song:{
        type: String
    },
    text:{
        type: String,
        required: true
    },
    item_type:{
        type:String
    }
}, {
    timestamps: true
})

export default mongoose.model('Post', PostSchema)