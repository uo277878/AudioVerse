import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { useSongs } from "../context/SongContext";
import PlaylistCard from "../components/PlaylistCard";
import { Link } from "react-router-dom";

function PlaylistsPage(){
    const { getAllByUser, playlists } = useSongs();
    const {user} = useAuth();

    const [playlistsPerPage, setPlaylistsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPlaylists = playlists.length;
    const lastIndex = currentPage * playlistsPerPage;
    const firstIdex = lastIndex - playlistsPerPage;
    const currentPlaylists = playlists.slice(firstIdex, lastIndex);

    useEffect(() =>{
        if(user.role != "user"){
            navigate("/error");
        }
    }, []);

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
    
    return (
        <div className="mt-4 ml-4">
            <div className="flex justify-between items-center px-4 mb-2">
                <h1 className='text-2xl my-4 ml-4 font-bold'>Biblioteca de playlists</h1>
                <Link to={`/playlists/new`} className='bg-red-500 p-2 text-white ml-8'>+ Crear playlist</Link>
            </div>
            <hr className="h-1 bg-zinc-700 border-0"></hr>
            <div className="flex-grow">
            <div className="grid grid-cols-4 gap-3 p-4 mr-6">
                {
                    currentPlaylists.map(playlist => (
                        <PlaylistCard playlist={playlist} key={playlist._id}/>
                    ))
                }
            </div>
            </div>
            {playlists.length >= playlistsPerPage && (
                <div className="mt-6 self-center">
                    <Pagination itemsPerPage={playlistsPerPage} currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} totalItems={totalPlaylists}></Pagination>
                </div>
            )}
            
        </div>
    
    );
}

export default PlaylistsPage;