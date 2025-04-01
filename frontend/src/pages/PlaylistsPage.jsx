import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { useSongs } from "../context/SongContext";
import PlaylistCard from "../components/PlaylistCard";
import { Link } from "react-router-dom";

function PlaylistsPage(){
    const { getAllPlaylists, playlists } = useSongs();
    const {user} = useAuth();

    const [playlistsPerPage, setPlaylistsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPlaylists = playlists.length;
    const lastIndex = currentPage * playlistsPerPage;
    const firstIdex = lastIndex - playlistsPerPage;
    const currentPlaylists = playlists.slice(firstIdex, lastIndex);

    useEffect(() => {
        if(user){
            async function getPlaylists(){
                try{
                    const pl = await getAllPlaylists(user);
                    console.log(pl);
                } catch(error){
                    console.error(error);
                }
            }
            getPlaylists();
        }
        
    }, []);
    
    return (
        <div className="mt-6">
            <Link to={`/playlists/new`} className='bg-red-500 p-2 text-white ml-8'>+ Crear playlist</Link>
            <div className="grid grid-cols-5 gap-3 p-4 mr-6">
            {
                currentPlaylists.map(playlist => (
                    <PlaylistCard playlist={playlist} key={playlist._id}/>
                ))
            }
            </div>
            <Pagination itemsPerPage={playlistsPerPage} currentPage={currentPage} 
            setCurrentPage={setCurrentPage} totalItems={totalPlaylists}></Pagination>
        </div>
    
    );
}

export default PlaylistsPage;