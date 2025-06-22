import { Link, useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useEffect } from "react";
import { useSongs } from "../context/SongContext";
import { FaRegTrashAlt } from "react-icons/fa";

function PlaylistCard({playlist}){
    const [isFollowed, setIsFollowed] = useState(false);
    const {user} = useAuth();
    const {followPlaylist, unfollowPlaylist, removePlaylist} = useSongs();
    const navigate = useNavigate();

    if (!playlist || !Array.isArray(playlist.songs)) {
        return null; 
    }

    useEffect(() => {
        if(user){
            if(playlist?.followedBy?.includes(user.id)){
                setIsFollowed(true);
            } else{
                setIsFollowed(false);
            }
        }
    }, [playlist]);

    async function handleFollow(playlistId, userId){
        try{
            const res = await followPlaylist(playlistId, userId);
            setIsFollowed(true);
        } catch(error){
            toast.error('Se ha producido un error al seguir la playlist', {
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

    async function handleUnfollow(playlistId, userId){
        try{
            const res = await unfollowPlaylist(playlistId, userId);
            setIsFollowed(false);
        } catch(error){
            toast.error('Se ha producido un error al dejar de seguir la playlist', {
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

    async function handleDeletePlaylist(id){
        try{
            const res = await removePlaylist(id);
            navigate(0);
        } catch(error){
            toast.error('Se ha producido un error al eliminar la playlist', {
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
        <div className="flex flex-col bg-zinc-700 max-w-xs w-full p-10 rounded-md mx-4 my-4 justify-between h-72 relative">
            {playlist.creator == user.id ? 
                (<button className="absolute top-4 right-4 text-white hover:text-red-500" onClick={() => handleDeletePlaylist(playlist._id)}>
                    <FaRegTrashAlt />
                    <span className="sr-only">Eliminar canción</span>
                </button>)
            :
            (user.role == "user" && (
                isFollowed ? 
                    (
                        <button className="absolute top-2 right-2 text-white text-3xl hover:scale-110 transition-transform duration-200"
                        onClick={() => handleUnfollow(playlist._id, user.id)}>
                            <CiCircleCheck />
                            <span className="sr-only">Eliminar playlist de biblioteca</span>
                        </button>
                    ) : (
                        <button className="absolute top-2 right-2 text-white text-3xl hover:scale-110 transition-transform duration-200"
                        onClick={() => handleFollow(playlist._id, user.id)}>
                            <CiCirclePlus />
                            <span className="sr-only">Añadir playlist a biblioteca</span>
                        </button>
                    )
                )
            )}
            
            <img src={playlist.pic} alt="Foto de la playlist" className="w-full h-40 object-cover rounded-md"/>
            <div className="absolute bottom-4 left-0 right-0 px-4">
                <Link to={`/playlists/${playlist._id}`} 
                className="block w-full text-md md:text-lg font-bold mt-2 hover:underline overflow-hidden text-ellipsis whitespace-nowrap">{playlist.name}</Link>
                <p className="w-full text-md md:text-lg mt-2">Nº de canciones: <span className="font-bold">{playlist.songs.length}</span></p>
            </div>
        </div>
    );
}

export default PlaylistCard;