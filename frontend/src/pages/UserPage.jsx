import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSongs } from "../context/SongContext";
import SongCard from "../components/SongCard";
import { useAuth } from "../context/AuthContext";

function UserPage(){
    const {register, setValue} = useForm();
    const {getUser} = useUsers();
    const {user} = useAuth(); 
    const [authUserLikedSongs, setAuthUserLikedSongs] = useState([]);
    const {getTrack, getToken} = useSongs();
    const params = useParams();
    const [gotUser, setGotUser] = useState(null);
    const [accessToken, setAccessToken] = useState();
    const [lastSongsLiked, setLastSongsLiked] = useState([]);

    useEffect( () => {
        const getTokenFromSpotify = async () => {
            try{
                const token = await getToken();
                setAccessToken(token);
            } catch(error){
                console.error(error);
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
                const authUser = await getUser(user.id);
                setAuthUserLikedSongs(authUser.songsLiked || []);
            }
        };
        loadAuthUser();
    }, [user]);

    return (
        <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="bg-zinc-800 max-w-4xl w-full p-10 rounded-md">
                <h1 className='text-2xl mb-4 font-bold'>Información del perfil</h1>
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
                        <h2 className="text-xl mt-6">Algunas canciones que me gustan...</h2>
                        <div className="grid grid-cols-3 gap-3 mt-4">
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