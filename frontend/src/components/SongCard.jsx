import Heart from 'react-heart';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import PlaylistModal from './PlaylistModal';
import { useSongs } from '../context/SongContext';

function SongCard({song, likedSongs}){
    const isLiked = likedSongs?.includes(song.id) || false; 
    const [active, setActive] = useState(isLiked);
    const {user} = useAuth();
    const {likeSong, dislikeSong} = useUsers();
    const [showModal, setShowModal] = useState(false);
    const { getAllByUser, playlists, addSongToPlaylist } = useSongs();
    const [selectedPlaylist, setSelectedPlaylist] = useState('');

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

    return(
        <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md ml-4 mb-4 ">
            <img src={song.images != null ? song.images[0].url : song.album.images[0].url}/>
            <p className="text-sm font-bold mt-2">{song.name}</p>
            <div className='w-14 mt-2 flex'>
                <Heart isActive={active} inactiveColor="white" onClick={() => handleClick(song.id)}/>
                <svg onClick={() => setShowModal(true)} className="h-14 w-14 ml-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/> 
                    <circle cx="18" cy="19" r="3" />  
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />  
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
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

export default SongCard;