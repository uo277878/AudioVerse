import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import MatchUsers from "../components/MatchUsers";
import { toast, Zoom } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { PiUsersThreeDuotone } from "react-icons/pi";

function HomePage(){
    const {user} = useAuth();
    const {register, handleSubmit} = useForm();
    const {createPost, posts, getPosts, errors: postErrors} = usePosts();
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const [showMatch, setShowMatch] = useState(false);

    const onSubmit = handleSubmit(async (data) => {
        try{
            const res = await createPost(user.id, data.txtPost, null, null);
            console.log(res);
            if(res.newPost){
                toast.success('Post creado con éxito', { 
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Zoom,
                });
                setTimeout(() => {
                    navigate(0);
                }, 3000);
            }
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
        
    });

    useEffect(() =>{
        getPosts(user, page);
        console.log(posts);
    }, [page]);

    const handleScroll = () => {
        if(window.innerHeight+ document.documentElement.scrollTop + 1 > document.documentElement.scrollHeight){
            setPage((prev) => prev + 1);
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative">
            <MatchUsers visib="hidden lg:block fixed top-20 right-4"/>
            <button onClick={() => setShowMatch(true)} className="fixed bottom-6 right-6 z-50 bg-rose-500 text-white p-4 rounded-full shadow-lg lg:hidden">
                <PiUsersThreeDuotone size={24} />
                <span className="sr-only">Abrir matches</span>
            </button>
            {showMatch && (
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center lg:hidden">
                    <div className="bg-zinc-800 w-72 p-4 max-h-[90vh] overflow-y-auto shadow-lg border-l border-zinc-700">
                        <div className="flex justify-end items-center mb-4">
                            <button onClick={() => setShowMatch(false)} className="text-white text-lg">X</button>
                        </div>
                        <MatchUsers visib=""/>
                    </div>
                </div>
            )}
            <div className="lg:pr-72">
                <div className="flex justify-center">
                    <h1 className="text-2xl my-4 font-bold">Para ti</h1>
                </div>
                <hr className="h-1 bg-zinc-700 border-0 mb-4"></hr>
                {
                    postErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form className='flex items-center justify-center' onSubmit={onSubmit}>
                    <div className='bg-zinc-800 max-w-2xl w-full p-6 rounded-md'>
                        <div className="flex items-center space-x-3">
                            <img src={user.profilePic} alt="Imagen de perfil" className="w-16 h-16 mt-4 rounded-full border-white border-2 border-opacity-100" />
                            <label htmlFor="txtPost" className="sr-only">Email:</label>
                            <input {...register("txtPost")} id="txtPost" className="p-3 w-full text-lg text-gray-900 bg-gray-50 rounded-lg border
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="¿En qué estás pensando?"></input>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-rose-500 text-white px-4 py-2 mt-4 rounded-md">
                                Publicar
                            </button>    
                        </div>
                    </div>
                </form>
                {(user?.followed?.length == 0 && posts?.length == 0) && <h1 className='text-xl mt-6 font-bold flex flex-col items-center justify-center'>¡Empieza a seguir a gente para ver sus posts aquí!</h1>}
                {posts && (
                    <>
                        <div className="flex flex-col items-center justify-center">
                        {
                            posts.map(post => (
                                <PostCard post={post} key={post._id}/>
                            ))
                        }
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default HomePage;