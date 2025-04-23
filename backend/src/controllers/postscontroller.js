import Post from '../models/post.js';
import User from '../models/user.js';

export const createPost = async (req, res) => {
    try {
        const {userId, text} = req.body;
        const post = new Post({
            user: userId,
            text
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

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const posts = await Post.find({user: { $in: [...followedIds, userId] }, createdAt: { $gte: start, $lte: end }})
        .sort({ createdAt: -1 })
        .populate('user', 'username profilePic')
        .exec();
        res.json(posts);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}