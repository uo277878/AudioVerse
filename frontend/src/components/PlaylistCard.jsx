import { Link, useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useEffect } from "react";
import { useSongs } from "../context/SongContext";
import RemoveIcon from '@mui/icons-material/Remove';

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
            console.error(error);
        }
    }

    async function handleUnfollow(playlistId, userId){
        try{
            const res = await unfollowPlaylist(playlistId, userId);
            setIsFollowed(false);
        } catch(error){
            console.error(error);
        }
    }

    async function handleDeletePlaylist(id){
        try{
            const res = await removePlaylist(id);
            navigate(0);
        } catch(error){
            console.error(error);
        }
    }

    return(
        <div className="flex flex-col bg-zinc-700 max-w-xs w-full p-10 rounded-md mx-4 my-4 justify-between h-72 relative">
            {playlist.creator == user.id ? 
            <>
                <button className="absolute top-4 right-4 text-white hover:text-red-500" onClick={() => handleDeletePlaylist(playlist._id)}>
                    <RemoveIcon />
                </button>
            </> :
            <>
                {isFollowed ? 
                (
                    <button className="absolute top-2 right-2 text-white text-3xl hover:scale-110 transition-transform duration-200"
                    onClick={() => handleUnfollow(playlist._id, user.id)}>
                        <CiCircleCheck />
                    </button>
                ) : (
                    <button className="absolute top-2 right-2 text-white text-3xl hover:scale-110 transition-transform duration-200"
                    onClick={() => handleFollow(playlist._id, user.id)}>
                        <CiCirclePlus />
                    </button>
                )}
            </>}
            
            <img src={playlist.pic} className="w-full h-40 object-cover rounded-md"/>
            <div className="absolute mb-4 bottom-0 ">
                <Link to={`/playlists/${playlist._id}`} className="w-full text-lg font-bold mt-2 hover:underline">{playlist.name}</Link>
                <p className="w-full text-lg mt-2">Nº de canciones: <span className="font-bold">{playlist.songs.length}</span></p>
            </div>
        </div>
    );
}

export default PlaylistCard;