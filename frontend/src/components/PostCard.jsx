import { useEffect, useState } from "react";
import { useSongs } from "../context/SongContext";
import { useUsers } from "../context/UserContext";
import Heart from 'react-heart';
import { useAuth } from "../context/AuthContext";
import PlaylistModal from "./PlaylistModal";

function PostCard({post}){

    const {getToken, getTrack} = useSongs();
    const [accessToken, setAccessToken] = useState(null);
    const [song, setSong] = useState(null);
    const {likeSong, dislikeSong} = useUsers();
    const {user} = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [likedSongs, setLikedSongs] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const { getAllByUser, playlists, addSongToPlaylist } = useSongs();

    useEffect(() => {
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
        const loadSong = async () => {
            if (post.song && accessToken) {
                const track = await getTrack(accessToken, post.song);
                setSong(track);
            }
        }
        loadSong();
    }, [accessToken]);

    useEffect(() => {
        if(user){
            setLikedSongs(user.songsLiked);
            console.log(likedSongs);
            console.log(post);
            if(likedSongs?.includes(post.song)){
                setIsLiked(true);
            } else{
                setIsLiked(false);
            }
        }
    }, [song]);

    useEffect(() => {
        if(user){
            async function getPlaylists(){
                try{
                    const pl = await getAllByUser(user);
                } catch(error){
                    console.error(error);
                }
            }
            getPlaylists();
        }
    }, []);

    async function handleClick(id){
        try{
            setIsLiked(!isLiked);
            if(isLiked == false){
                const res = await likeSong(user, id);
                console.log(res);
            } else{
                const res = await dislikeSong(user, id);
            }

        } catch(error){
            console.error(error);
        }
    }

    async function handleSaveToPlaylist() {
        if (!selectedPlaylist) return;
        try {
            const res = await addSongToPlaylist(selectedPlaylist, song.id);
            if(res.status == 200){
                setShowModal(false);
            } else{

            }
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <div className='bg-zinc-800 max-w-xl w-full p-6 rounded-md mt-2'>
            <div className="flex items-center space-x-4">
                <img src={post.user.profilePic} alt="Imagen de perfil" className="w-12 h-12 mt-4 rounded-full border-white border-2 border-opacity-100" />
                <div className="flex flex-col">
                    <p>{post.user.username}</p>
                    <p className="mt-2">{post.text}</p>
                </div>
            </div>
            {song && (
                    <div className="flex items-center space-x-4 mt-4 p-4 bg-zinc-700 rounded">
                        <img src={song.album.images[0].url} alt="Portada de la canción" className="w-16 h-16 rounded" />
                        <div className="flex flex-col">
                            <p className="text-white font-semibold">{song.name}</p>
                            <p className="text-gray-400 text-sm">{song.artists.map(a => a.name).join(", ")}</p>
                            <div className='mt-2 flex'>
                                <Heart className="w-6 h-6" isActive={isLiked} inactiveColor="white" onClick={() => handleClick(song.id)}/>
                                <svg onClick={() => setShowModal(true)} className="h-6 w-6 ml-2 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 
                                    0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            <PlaylistModal isVisible={showModal} onClose={() => setShowModal(false)}>
                <select className="w-full p-2 rounded bg-zinc-700 text-white" value={selectedPlaylist} 
                onChange={(e) => setSelectedPlaylist(e.target.value)}>
                    <option value="">-- Selecciona una playlist --</option>
                    {playlists.map((playlist) => (
                        <option key={playlist._id} value={playlist._id}>
                            {playlist.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleSaveToPlaylist} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                    Guardar
                </button>
            </PlaylistModal>
        </div>
    );
}

export default PostCard;