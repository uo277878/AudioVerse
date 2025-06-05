import { createContext, useContext, useState, useEffect } from "react";
import {createPostRequest, getPostsRequest, likePostRequest}  from "../api/posts";

const PostContext = createContext();

export const usePosts = () => {
    const context = useContext(PostContext)
    if(!context){
        throw new Error("usePosts debería estar dentro de un provider");
    }
    return context;
}
export const PostProvider = ({children}) => {
    const [errors, setErrors] = useState([]);
    const [posts, setPosts] = useState([]);
    
    const createPost = async (userId, text, songId, type) => {
        try{
            const res = await createPostRequest(userId, text, songId, type);
            return res.data;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
        }
    }

    const getPosts = async (user, page) => {
        try{
            const res = await getPostsRequest(user, page);
            setPosts(prev => {
                const todos = [...prev, ...res.data];
                const sinDuplicados = Array.from(new Map(todos.map(p => [p._id, p])).values());
                return sinDuplicados;
            });
        } catch(error){
            console.error(error);
        }
        
    }

    const likePost = async (id, user) => {
        try{
            const res = await likePostRequest(id, user);
            setPosts(prev =>
                prev.map(post => post._id === res.data._id ? res.data : post)
            );
            return res;
        } catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
                if(errors.length > 0){
                    const timer = setTimeout(() => {
                        setErrors([]);
                    }, 5000)
                    return () => clearTimeout(timer);
                }
            }, [errors])
    
        return (
            <PostContext.Provider value={{posts, errors, createPost, getPosts, likePost}}>
                {children}
            </PostContext.Provider>
        ) 
}