import Heart from 'react-heart';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import PlaylistModal from './PlaylistModal';
import { useSongs } from '../context/SongContext';
import PostModal from './PostModal';
import { useForm } from 'react-hook-form';
import { usePosts } from '../context/PostContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFire } from '@fortawesome/free-solid-svg-icons'
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { FaPlay } from "react-icons/fa";
import { toast, Zoom } from "react-toastify";
import { FaRegTrashAlt } from "react-icons/fa";


function SongCard({song, likedSongs, text}){
    const { register: registerPlaylist, handleSubmit: handleSubmitPlaylist } = useForm();
    const { register: registerPost, handleSubmit: handleSubmitPost } = useForm();
    const {createPost, errors: postErrors} = usePosts();
    const [active, setActive] = useState(false);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const {user} = useAuth();
    const {likeSong, dislikeSong} = useUsers();
    const [showModal, setShowModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const { getAllByUser, playlists, addSongToPlaylist, removeSongPlaylist, likeText, getTotalLikesAndLiked ,errors: songErrors } = useSongs();
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [defaultValue, setDefaultValue] = useState("");
    const [textLiked, setTextLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);

    const location = useLocation();
    const isPlaylistPage = location.pathname.includes('/playlists/');
    const { id: playlistId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if(user){
            async function getPlaylists(){
                try{
                    const pl = await getAllByUser(user);
                    console.log(pl);
                    const filtered = pl.filter(p => p.name != "Canciones que me gustan");
                    setFilteredPlaylists(filtered);
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
    }, [user]);

    useEffect(() => {
        let isLiked = false;
        if(likedSongs.length > 0){
            isLiked = likedSongs?.includes(song.id);
        }
        if(song.type == "album"){
            setDefaultValue("¡Me encanta este álbum!");
        } else if(song.type == "artist"){
            setDefaultValue("¡Me encanta este artista!");
        } else if(song.type == "playlist"){
            setDefaultValue("¡Me encanta esta playlist!");
        } else if(song.type == "track"){
            setDefaultValue("¡Me encanta esta canción!");
        }
        setActive(isLiked);
    }, [likedSongs, song.id]);

    useEffect(() => {
        async function getLikes(){
            const res = await getTotalLikesAndLiked(playlistId, song.id, user.id);
            console.log(res);
            setTotalLikes(res.totalLikes);
            setTextLiked(res.liked);
        }
        if(isPlaylistPage){
            getLikes();
        }
    }, [song]);

    async function handleClick(id){
        try{
            const newActive = !active;
            setActive(newActive);
            if(newActive){
                const res = await likeSong(user, id);
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

    async function handleSaveToPlaylist(data) {
        try {
            const res = await addSongToPlaylist(selectedPlaylist, song.id, data.txtSong);
            if(res.playlist){
                toast.success('Canción añadida a la playlist con éxito', {
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
                setShowModal(false);
            }
        } catch (error) {
            toast.error('Se ha producido un error al guardar la canción en la playlist', {
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

    async function handleCreatePost(data){
        try {
            const res = await createPost(user.id, data.text, song.id, song.type);
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
                setShowPostModal(false);
            }
        } catch (error) {
            toast.error('Se ha producido un error al crear el post', {
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

    async function handleDeleteSong(id){
        try{
            const res = await removeSongPlaylist(id, playlistId);
            navigate(0);
        } catch(error){
            toast.error('Se ha producido un error al eliminar la canción de la playlist', {
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

    async function handleLikeText(){
        try{
            const res = await likeText(playlistId, song.id, user.id);
            const songCard = res.songs.find(s => s.songId === song.id);
            if (songCard) {
                setTextLiked(songCard.likedBy.includes(user.id));
                setTotalLikes(songCard.likedBy.length);
            }
        } catch(error){
            toast.error('Se ha producido un error al darle me gusta al texto', {
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

    async function handlePlay(){
        navigate(`/player?uri=${encodeURIComponent(song.uri)}`);
    }

    return(
        <div className={`relative bg-zinc-700 ${isPlaylistPage ? 'w-full max-w-full flex flex-col md:flex-row items-start gap-4' : 'max-w-md'} p-6 md:p-10 rounded-md ml-4 mb-4`}>
            
            {isPlaylistPage && (
                <button className="absolute top-4 right-4 text-white hover:text-red-500" onClick={() => handleDeleteSong(song.id)}>
                    <FaRegTrashAlt />
                </button>
            )}
            <img src={song.images != null ? song.images[0].url : song.album.images[0].url} className={`rounded ${isPlaylistPage ? 'w-28 h-28 mr-4 flex-shrink-0' : ''}`}/>
            <div className={`${isPlaylistPage ? 'flex flex-col justify-center space-y-2' : ''}`}>
                <p className="text-xl font-bold mt-2">{song.name}</p>
                {text && isPlaylistPage && (
                    <div className="flex flex-col gap-1 mt-2">
                        <p className="text-xl text-gray-300 italic break-words">“{text}”</p>
                        <button onClick={handleLikeText} className="flex items-center text-white w-fit">
                            <ThumbUpIcon className={`${textLiked ? 'text-rose-400' : 'text-rose-200'} mr-1`} />
                            <span>{totalLikes}</span>
                        </button>
                    </div>
                )}
                {user.role != "admin" && (
                    <div className='mt-5 flex items-center space-x-4'>
                        {song.type == "track"  && (
                            <>
                            <Heart className="w-8 h-8" style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px'}} 
                            isActive={active} inactiveColor="white" activeColor="red" onClick={() => handleClick(song.id)}/>
                            <button onClick={() => setShowModal(true)} className="text-rose-300 hover:text-rose-200">
                                <svg className="h-7 w-7" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 
                                    0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
                                </svg>
                            </button>
                            <button onClick={handlePlay} className="text-rose-300 hover:text-rose-200">
                                <FaPlay className='w-6 h-6'/>
                            </button>
                            </>
                        )}
                        <button onClick={() => setShowPostModal(true)} className='text-rose-300 hover:text-rose-200'>
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/> 
                                    <circle cx="18" cy="19" r="3" />  
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />  
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                        
                        {song.popularity > 60 && 
                            <FontAwesomeIcon icon={faFire} className='h-8 w-8 absolute top-3 left-1 text-orange-500'/>
                        }
                    </div>
                )}
            </div>

            <PlaylistModal isVisible={showModal} onClose={() => setShowModal(false)}>
                {
                    songErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <select className="w-full p-2 rounded bg-zinc-700 text-white text-xl" value={selectedPlaylist} 
                onChange={(e) => setSelectedPlaylist(e.target.value)}>
                    <option value="">-- Selecciona una playlist --</option>
                    {filteredPlaylists.map((playlist) => (
                        <option key={playlist._id} value={playlist._id}>
                            {playlist.name}
                        </option>
                    ))}
                </select>
                <form onSubmit={handleSubmitPlaylist(handleSaveToPlaylist)}>
                    <span className="block my-2 text-sm text-gray-500 dark:text-neutral-500">50 caracteres</span>
                    <textarea {...registerPlaylist("txtSong", {required: true})}  rows="3" maxLength={50} 
                    className="resize-none p-3 w-full text-xl text-gray-900 bg-gray-50 rounded-lg border
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="¿Por qué añades esta canción?"></textarea>
                    <button type="submit" className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                        Guardar
                    </button>
                </form>
                
            </PlaylistModal>
            <PostModal isVisible={showPostModal} onClose={() => setShowPostModal(false)}>
                {
                    postErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form onSubmit={handleSubmitPost(handleCreatePost)}>
                    <textarea {...registerPost("text")} rows="4" className="resize-none p-3 w-full text-md md:text-lg text-gray-900 bg-gray-50 rounded-lg border
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" defaultValue={defaultValue}></textarea>
                    <div className="flex items-center mb-4">
                        <img src={song.images != null ? song.images[0].url : song.album.images[0].url} className="w-12 h-12 rounded mr-3" />
                        <p className="text-white font-bold">{song.name}</p>
                    </div>
                    <button type="submit" className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                        Guardar
                    </button>
                </form>
            </PostModal>
        </div>
    );
}

export default SongCard;