import { useEffect, useState } from "react";
import { useSongs } from "../context/SongContext";
import { useParams } from "react-router-dom";
import SongCard from "../components/SongCard";
import { useUsers } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";

function PlaylistPage(){
    const {getTrack, getToken, getPlaylist } = useSongs();
    const {getUser} = useUsers();
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
                console.error(error);
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
                console.error(error);
            }
        }
        getTokenFromSpotify();
    }, []);

    useEffect(() => {
        const loadSongs = async () => {
            if (playlist?.songs.length > 0 && accessToken) {
                const tracks = await Promise.all(
                    playlist.songs.map(id => getTrack(accessToken, id))
                );
                setSongs(tracks);
            }
        }
        loadSongs();
    }, [accessToken]);

    useEffect(() => {
        const loadCreator = async () => {
            const userPlaylist = await getUser(playlist.creator);
            setCreator(userPlaylist);
        }
        loadCreator();
    }, [playlist]);
    
    return (
        <div className='flex h-screen mx-8 justify-center'>
            <div className='bg-zinc-800 w-full p-10 rounded-md'>
                <div className="flex items-center space-x-8 ml-8 bg-zinc-900 md:w-1/2 p-10 rounded-md">
                    <img src={playlist?.pic} alt="Imagen de paylist" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl">{playlist?.name}</h1>
                        <div className="flex items-center space-x-3">
                            <img src={creator?.profilePic} alt="Imagen de perfil" className="w-12 h-12 mt-4 rounded-full border-white border-2 border-opacity-100" />
                            <h2 className="text-xl">{creator?.username}</h2>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    {songs.length > 0 && (
                        <>
                            <div className="grid md:grid-cols-5 sm:grid-cols-1 gap-3 p-4 mr-6">
                            {
                                songs.map(song => (
                                    <SongCard song={song} key={song.id} likedSongs={user.songsLiked}/>
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