import mongoose from 'mongoose'

const PlaylistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pic:{
        type: String,
        required: true
    },
    followedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "User",
            default: []
        }
    ],
    numFollows:{
        type: Number,
        required: true,
        default: 0
    },
    songs: [
        {
            songId: {
                type: String,
                required: true
            },
            text: {
                type: String
            },
            likedBy: [{ 
                type: mongoose.Schema.Types.ObjectId, ref: 'User' 
            }],
        }
      ],
}, {
    timestamps: true
})

export default mongoose.model('Playlist', PlaylistSchema)