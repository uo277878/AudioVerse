import Post from '../models/post.js';
import User from '../models/user.js';

export const createPost = async (req, res) => {
    try {
        const {userId, text, songId, type} = req.body;
        const post = new Post({
            user: userId,
            text,
            song: songId,
            item_type: type
        });
        const newPost = await post.save();
        res.json({newPost}); 
    } catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const getPosts = async (req, res) => {
    try{
        const userId = req.query.userId;
        const user = await User.findById(userId);
        const followedIds = user.followed;
        const page = parseInt(req.query.page) || 1;
        const max = 10;
        const p = (page - 1) * max;

        const posts = await Post.find({user: { $in: [...followedIds, userId] }})
        .sort({ createdAt: -1 })
        .skip(p)
        .limit(max)
        .populate('user', 'username profilePic')
        .exec();
        console.log(posts);
        res.json(posts);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}