import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import { useEffect } from "react";
import PostCard from "../components/PostCard";

function HomePage(){
    const {user} = useAuth();
    const {register, handleSubmit} = useForm();
    const {createPost, posts, getPosts} = usePosts();

    const onSubmit = handleSubmit(async (data) => {
        createPost(user.id, data.txtPost, null);
    });

    useEffect(() =>{
        getPosts(user);
    }, []);

    return (
        <div>
            <form className='flex items-center justify-center' onSubmit={onSubmit}>
                <div className='bg-zinc-800 max-w-xl w-full p-6 rounded-md'>
                    <div className="flex items-center space-x-3">
                        <img src={user.profilePic} alt="Imagen de perfil" className="w-12 h-12 mt-4 rounded-full border-white border-2 border-opacity-100" />
                        <textarea {...register("txtPost")} id="txtPost" rows="4" className="resize-none p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="¿En qué estás pensando?"></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-rose-500 text-white px-4 py-2 mt-4 rounded-md">
                            Guardar
                        </button>    
                    </div>
                </div>
            </form>
            <div className="flex flex-col items-center justify-center">
            {
                posts.map(post => (
                    <PostCard post={post} key={post._id}/>
                ))
            }
            </div>
        </div>
    )
}

export default HomePage;