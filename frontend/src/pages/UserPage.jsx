import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSongs } from "../context/SongContext";
import SongCard from "../components/SongCard";

function UserPage(){
    const {register, setValue} = useForm();
    const {getUser} = useUsers();
    const {getTrack, getToken} = useSongs();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState();
    const [songsLiked, setSongsLiked] = useState([]);

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
                const gotUser = await getUser(params.id);
                setUser(gotUser);
                setValue('username', gotUser.username);
                setValue('email', gotUser.email);
                if (gotUser.songsLiked?.length > 0 && accessToken) {
                    const tracks = await Promise.all(
                        gotUser.songsLiked.map(id => getTrack(accessToken, id))
                    );
                    setSongsLiked(tracks);
                }
            }
        }
        loadUser();
        console.log(songsLiked);
    }, [accessToken]);

    return (
        <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="bg-zinc-800 max-w-3xl w-full p-10 rounded-md">
                <h1 className='text-2xl mb-4 font-bold'>Información del perfil</h1>
                {user ? (
                    <div>
                        <form className="flex flex-col md:flex-row items-center md:items-start mb-4" >
                        <div className="w-full md:w-1/4 flex justify-center md:justify-start mr-4 mb-4 md:mb-0">
                            <img src={user.profilePic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                        </div>
                        <div className="w-full md:w-3/4">
                            <input type="text" placeholder="Username" {... register("username")} 
                            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" readOnly></input>
                            <input type="text" placeholder="Email" {... register("email")} 
                            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" readOnly></input>
                        </div>
                        </form>
                        <h2 className="text-xl mt-6">Algunas canciones que me gustan...</h2>
                        <div className="grid grid-cols-4">
                        {
                            songsLiked.map((song,i) => (
                                <SongCard song={song} key={i} />
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