import { useEffect, useState } from "react";
import { useSongs } from "../context/SongContext";
import { useUsers } from "../context/UserContext";
import Heart from 'react-heart';
import { useAuth } from "../context/AuthContext";
import PlaylistModal from "./PlaylistModal";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { usePosts } from "../context/PostContext";
import { Link, useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast, Zoom } from "react-toastify";

function PostCard({post}){

    const {getToken, getTrack, getArtist, getPlaylistSpotify, getAlbum} = useSongs();
    const {likePost, deletePost} = usePosts();
    const [accessToken, setAccessToken] = useState(null);
    const [song, setSong] = useState(null);
    const {likeSong, dislikeSong} = useUsers();
    const {user} = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [likedSongs, setLikedSongs] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const { getAllByUser, playlists, addSongToPlaylist } = useSongs();
    const [color, setColor] = useState("");
    const [likedPost, setLikedPost] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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
        const loadSong = async () => {
            if (post.song && post.item_type != null && accessToken) {
                if(post.item_type == "track"){
                    const item = await getTrack(accessToken, post.song);
                    setSong(item);
                    setColor("bg-green-600");
                } 
                else if(post.item_type == "artist"){
                    const item = await getArtist(accessToken, post.song);
                    setSong(item);
                    setColor("bg-zinc-600");
                } else if(post.item_type == "playlist"){
                    const item = await getPlaylistSpotify(accessToken, post.song);
                    setSong(item);
                    setColor("bg-blue-600");
                } else if(post.item_type == "album"){
                    const item = await getAlbum(accessToken, post.song);
                    setSong(item);
                    setColor("bg-yellow-600");
                }
            }
        }
        loadSong();
    }, [accessToken]);

    useEffect(() => {
        if(user){
            setLikedSongs(user.songsLiked);
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
                    toast.error('Se ha producido un error al obtener las playlists del usuario', {
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
            toast.error('Se ha producido un error al hacer click en el corazón', {
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

    useEffect(() => {
        if (user && post.likedBy?.includes(user.id)) {
            setLikedPost(true);
        } else {
            setLikedPost(false);
        }
    }, [post, user]);

    async function handleLike(id, user){
        try{
            console.log(user);
            const res = await likePost(id, user);
            setLikedPost(res.data.likedBy.includes(user.id));
        } catch(error){
            toast.error('Se ha producido un error al dar me gusta al post', {
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

    async function handleSaveToPlaylist() {
        if (!selectedPlaylist) return;
        try {
            const res = await addSongToPlaylist(selectedPlaylist, song.id);
            if(res.status == 200){
                setShowModal(false);
            } 
        } catch (error) {
            toast.error('Se ha producido un error al añadir la canción a la playlist', {
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

    async function handleDeletePost(id){
        try{
            const res = await deletePost(id);
            navigate(0);
        } catch(error){
            toast.error('Se ha producido un error al eliminar el post', {
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

    return(
        <div className='bg-zinc-800 max-w-2xl w-full p-6 rounded-md mt-2'>
            <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                    <img src={post.user.profilePic} alt="Imagen de perfil" className="w-16 h-16 mt-4 rounded-full border-white border-2 border-opacity-100" />
                    <div className="flex flex-col mt-3">
                        <Link to={`/users/${post.user._id}`} className='text-lg font-bold hover:underline'>{post.user.username}</Link>
                        <p className="mt-2 text-lg">{post.text}</p>
                    </div>
                </div>
                {post.user._id == user.id && (
                    <button className=" text-white hover:text-red-500" onClick={() => handleDeletePost(post._id)}>
                        <FaRegTrashAlt className="w-5 h-5" />
                    </button>
                )}
            </div>
            {song && (
                    <div className={`relative flex items-center space-x-4 my-4 p-4 ${color} rounded`}>
                        <img src={song.images != null ? song.images[0].url : song.album.images[0].url} alt="Portada de la canción" className="w-20 h-20 rounded" />
                        <div className="flex flex-col">
                            <p className="text-white font-semibold text-lg">{song.name}</p>
                            { (post.item_type == "track" || post.item_type == "album") && (
                                <p className="text-white text-lg">{song.artists.map(a => a.name).join(", ")}</p>
                            )}
                            {
                                post.item_type == "track" && (
                                <div className='absolute bottom-4 right-4 flex'>
                                    <svg onClick={() => setShowModal(true)} className="h-6 w-6 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 
                                    0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
                                    </svg>
                                    <Heart className="w-6 h-6 ml-2" isActive={isLiked} inactiveColor="white" onClick={() => handleClick(song.id)}/>
                                </div>
                            )}
                            
                        </div>
                    </div>
                )}
                <div className="flex justify-end">
                    <button className="text-white flex items-center space-x-1" onClick={() => handleLike(post._id, user)}>
                        <ThumbUpIcon className={`${likedPost ? 'text-rose-400 mr-2' : 'text-rose-200 mr-2' }`}/> {post.likes}
                    </button>
                </div>
                
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