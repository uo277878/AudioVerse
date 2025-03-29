import mongoose from 'mongoose'

const PlaylistSchema = new mongoose.Schema({
    name:{
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
    songs: [
        {
          type: String,
          required: true
        }
      ],
}, {
    timestamps: true
})

export default mongoose.model('Playlist', PlaylistSchema)