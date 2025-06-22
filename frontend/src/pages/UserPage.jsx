import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSongs } from "../context/SongContext";
import SongCard from "../components/SongCard";
import { useAuth } from "../context/AuthContext";
import { toast, Zoom } from "react-toastify";

function UserPage(){
    const {register, setValue} = useForm();
    const {getUser, follow, unfollow} = useUsers();
    const {user} = useAuth(); 
    const [authUser, setAuthUser] = useState(null);
    const [authUserLikedSongs, setAuthUserLikedSongs] = useState([]);
    const {getTrack, getToken} = useSongs();
    const params = useParams();
    const [gotUser, setGotUser] = useState(null);
    const [accessToken, setAccessToken] = useState();
    const [lastSongsLiked, setLastSongsLiked] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect( () => {
        const getTokenFromSpotify = async () => {
            try{
                const token = await getToken();
                setAccessToken(token);
            } catch(error){
                toast.error('Se ha producido un error al obtener el token de Spotify', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Zoom,
                });
            }
        }
        getTokenFromSpotify();
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            if(params.id){
                const got = await getUser(params.id);
                setGotUser(got);
                setValue('username', got.username);
                setValue('email', got.email);
                if (got.songsLiked?.length > 0 && accessToken) {
                    const ultimas = got.songsLiked.slice(-3).reverse();
                    const tracks = await Promise.all(
                        ultimas.map(id => getTrack(accessToken, id))
                    );
                    setLastSongsLiked(tracks);
                }
            }
        }
        loadUser();
    }, [accessToken]);

    useEffect(() => {
        const loadAuthUser = async () => {
            if (user) {
                let gotUser = await getUser(user.id);
                setAuthUser(gotUser);
                setAuthUserLikedSongs(gotUser.songsLiked || []);
            }
        };
        loadAuthUser();
    }, [user]);

    useEffect(() => {
        if (authUser && gotUser) {
            const following = authUser.followed?.includes(gotUser._id);
            setIsFollowing(following);
        }
    }, [authUser, gotUser]);

    async function handleFollow(id){
        try {
            const res = await follow(user, id);
            setIsFollowing(true);
        } catch (error) {
            toast.error('Se ha producido un error al seguir al usuario', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Zoom,
            });
        }
    }

    async function handleUnfollow(id){
        try {
            const res = await unfollow(user, id);
            setIsFollowing(false);
        } catch (error) {
            toast.error('Se ha producido un error al dejar de seguir al usuario', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Zoom,
            });
        }
    }

    return (
        <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="bg-zinc-800 max-w-4xl w-full p-10 rounded-md">
                <div className="flex justify-between items-center">
                    <h1 className='text-2xl mb-4 font-bold'>Información del perfil</h1>
                    {user.role == "user" ? (
                        <>
                            {isFollowing ? (
                                <>
                                    <button className="bg-green-500 text-black p-2 mt-4 rounded-md text-center" onClick={() => handleUnfollow(gotUser._id)}>Siguiendo</button>
                                </>
                            ) : (
                                <>
                                    <button className="bg-white text-black p-2 mt-4 rounded-md text-center" onClick={() => handleFollow(gotUser._id)}>Seguir</button>
                                </>
                            )}
                        </>) :
                        (
                        <>
                        
                        </>
                        )}    
                </div>
                {gotUser ? (
                    <div>
                        <form className="flex flex-col md:flex-row items-center md:items-start mb-4" >
                        <div className="flex justify-center md:justify-start mb-4 mr-4 md:mb-0">
                            <img src={gotUser.profilePic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                        </div>
                        <div className="mt-4">
                            <p className="text-white px-4 py-2 my-2 text-xl">Username: <span className="font-bold">{gotUser.username}</span></p>
                            <p className="text-white px-4 py-2 my-2 text-xl">Email: <span className="font-bold">{gotUser.email}</span></p>
                        </div>
                        </form>
                        <h2 className="text-xl mt-6">Algunas canciones que le gustan...</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mt-4">
                        {
                            lastSongsLiked.map((song,i) => (
                                <SongCard song={song} key={i} likedSongs={authUserLikedSongs}/>
                            ))
                        }
                        </div>
                    </div>
                    
                ) : (
                    <h1 className="text-white">Cargando...</h1>
                )}
                
            </div>
        </div>
        
    )
}

export default UserPage