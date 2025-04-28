import Heart from 'react-heart';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import PlaylistModal from './PlaylistModal';
import { useSongs } from '../context/SongContext';
import PostModal from './PostModal';
import { useForm } from 'react-hook-form';
import { usePosts } from '../context/PostContext';

function SongCard({song, likedSongs}){
    const isLiked = likedSongs?.includes(song.id) || false; 
    const {register, handleSubmit} = useForm();
    const {createPost} = usePosts();
    const [active, setActive] = useState(isLiked);
    const {user} = useAuth();
    const {likeSong, dislikeSong} = useUsers();
    const [showModal, setShowModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
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

    async function handleCreatePost(data){
        try {
            console.log(user.id);
            console.log(data.txtPost);
            console.log(song.id);
            const res = await createPost(user.id, data.txtPost, song.id);
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
            <div className='mt-2 flex'>
                <Heart className="w-6 h-6" isActive={active} inactiveColor="white" onClick={() => handleClick(song.id)}/>
                <svg onClick={() => setShowModal(true)} className="h-6 w-6 ml-2 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 
                    0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
                </svg>
                <svg onClick={() => setShowPostModal(true)} className="h-6 w-6 ml-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
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
            <PostModal isVisible={showPostModal} onClose={() => setShowPostModal(false)}>
                <form onSubmit={handleSubmit(handleCreatePost)}>
                    <textarea {...register("txtPost")} id="txtPost" rows="4" className="resize-none p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" defaultValue="¡Me encanta esta canción!"></textarea>
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