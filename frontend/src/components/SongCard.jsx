import Heart from 'react-heart';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';

function SongCard({song, likedSongs}){
    const isLiked = likedSongs?.includes(song.id) || false; 
    const [active, setActive] = useState(isLiked);
    const {user} = useAuth();
    const {likeSong, dislikeSong} = useUsers();

    async function handleClick(id){
        try{
            setActive(!active);
            if(active == false){
                const res = await likeSong(user, id);
            } else{
                const res = await dislikeSong(user, id);
            }
        } catch(error){
            console.error(error);
        }
        
    }

    return(
        <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md ml-4 mb-4 ">
            <img src={song.images != null ? song.images[0].url : song.album.images[0].url}/>
            <p className="text-sm font-bold mt-2">{song.name}</p>
            <div className='w-8 mt-2'>
                <Heart isActive={active} onClick={() => handleClick(song.id)}/>
            </div>
        </div>
    );
}

export default SongCard;