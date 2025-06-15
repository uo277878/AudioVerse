import { useEffect, useState } from "react";
import { useSongs } from "../context/SongContext";
import { useParams } from "react-router-dom";
import SongCard from "../components/SongCard";
import { useUsers } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { toast, Zoom } from "react-toastify";

function PlaylistPage(){
    const {getTrack, getToken, getPlaylist } = useSongs();
    const {getUser, likedSongs} = useUsers();
    const {user} = useAuth();
    const params = useParams();
    const [playlist, setPlaylist] = useState();
    const [accessToken, setAccessToken] = useState();
    const [songs, setSongs] = useState([]);
    const [creator, setCreator] = useState();

    useEffect(() => {
        async function getAndSetPlaylist(){
            try{
                if(params.id){
                    const pl = await getPlaylist(params.id);
                    setPlaylist(pl);
                }
            } catch(error){
                toast.error('Se ha producido un error al obtener la playlist', {
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
        getAndSetPlaylist();
    }, []);

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
        const loadSongs = async () => {
            if (playlist?.songs.length > 0 && accessToken) {
                const tracks = await Promise.all(
                    playlist.songs.map(async (song) => {
                        const id = song[0];
                        const text = song.text;
                        const likedBy = song.likedBy;
                        const track = await getTrack(accessToken, song.songId);
                        return {track, text, likedBy};
                    })
                );
                setSongs(tracks);
            }
        }
        loadSongs();
    }, [playlist, accessToken]);

    useEffect(() => {
        const loadCreator = async () => {
            const userPlaylist = await getUser(playlist.creator);
            setCreator(userPlaylist);
        }
        loadCreator();
    }, [playlist]);
    
    return (
        <div className='flex min-h-screen px-4 sm:px-8 justify-center'>
            <div className='bg-zinc-800 w-full max-w-7xl p-4 sm:p-10 rounded-md'>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 bg-zinc-900 p-4 sm:p-10 rounded-md">
                    <img src={playlist?.pic} alt="Imagen de playlist" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-white border-2 border-opacity-100" />
                    <div className="flex flex-col mt-4 sm:mt-0">
                        <h1 className="text-2xl sm:text-4xl">{playlist?.name}</h1>
                        <h2 className="text-md sm:text-xl mt-2 sm:mt-4 text-zinc-300">{playlist?.description}</h2>
                        <div className="flex items-center space-x-3 mt-4">
                            <img src={creator?.profilePic} alt="Imagen de perfil" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-white border-2 border-opacity-100" />
                            <h2 className="text-md sm:text-lg mt-1 sm:mt-2 text-white">{creator?.username}<span className="text-zinc-300"> - Fecha de creación: {new Date(playlist?.createdAt).toLocaleDateString()}</span></h2>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    {songs.length > 0 && likedSongs && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 p-4 mr-6">
                            {
                                songs.map(({track, text}) => (
                                    <SongCard song={track} key={track.id} likedSongs={likedSongs} text={text}/>
                                ))
                            }
                            </div>
                        </>
                    )}
                    {songs.length == 0 && (
                      <>
                        <h1 className="text-3xl">Todavía no hay ninguna canción</h1>
                      </>  
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaylistPage;