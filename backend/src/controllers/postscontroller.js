import Post from '../models/post.js';

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
        const posts = await Post.find();
        res.json(posts);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}