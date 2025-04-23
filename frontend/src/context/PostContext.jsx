import { createContext, useContext, useState, useEffect } from "react";
import {createPostRequest, getPostsRequest}  from "../api/posts";

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
    
    const createPost = async (userId, text) => {
        try{
            const res = await createPostRequest(userId, text);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const getPosts = async (user) => {
        try{
            const res = await getPostsRequest(user);
            console.log(res);
            setPosts(res.data);
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
            <PostContext.Provider value={{posts, createPost, getPosts}}>
                {children}
            </PostContext.Provider>
        ) 
}