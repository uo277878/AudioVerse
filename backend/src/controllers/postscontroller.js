import Post from '../models/post.js';
import User from '../models/user.js';
import {validationResult} from "express-validator";

export const createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
            return;
        }
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
        return res.status(500).json({ msg: error.message });
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
        .populate('user', '_id username profilePic')
        .exec();
        console.log(posts);
        res.json(posts);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}

export const likePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const userId = req.body.user.id;
        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({message: "No se ha encontrado el post"});
        }

        let updated;
        if(post.likedBy.includes(userId)){
            updated = await Post.findByIdAndUpdate(postId, {$pull: {likedBy: userId}, $inc: {likes: -1}}, {new: true}).populate('user', 'username profilePic');
        } else{
            updated = await Post.findByIdAndUpdate(postId, {$push: {likedBy: userId}, $inc: {likes: 1}}, {new: true}).populate('user', 'username profilePic');
        }

        res.json(updated);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error al darle like al post" });
    }
}