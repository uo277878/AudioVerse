import { useEffect, useState } from "react";
import { useSongs } from "../context/SongContext";
import SongCard from "../components/SongCard";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
 
function SearchPage(){
    const {user} = useAuth();
    const [searchInput, setSearchInput] = useState("");
    const [accessToken, setAccessToken] = useState();
    const [filter, setFilter] = useState("tracks");
    const [items, setItems] = useState({
        artists: [],
        albums: [],
        playlists: [],
        tracks: []
    });
    const {getToken, search} = useSongs();

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const filteredItems = items[filter].filter(i => i !== null);
    const totalItems = filteredItems?.length ||0;
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = filteredItems.slice(firstIndex, lastIndex);

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

    async function handleSearch(){
        try {
            const res = await search(accessToken, searchInput);
            setItems({
                artists: res.artists?.items || [],
                albums: res.albums?.items || [],
                playlists: res.playlists?.items || [],
                tracks: res.tracks?.items || []
            });
            console.log(items);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    }

    return (
        <div className='flex min-h-screen justify-center'>
            <div className='bg-zinc-800 w-full p-10 rounded-md mx-8 my-8'>
                <div className="relative">
                    <input className="w-full bg-transparent placeholder:text-white text-white text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 hover:border-slate-300"
                        placeholder="Introduce tu búsqueda" onKeyDown={event => {
                            if(event.key == "Enter"){
                                handleSearch();
                            }
                        }}  onChange={event => setSearchInput(event.target.value)}/>
                    <button onClick={handleSearch} className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-slate-700"
                        type="button">
                        Buscar
                    </button> 
                </div>
                {items.length == 0 && <h1 className='text-xl mt-4 font-bold'>No se encuentra ningún resultado</h1>}
                <div className="flex flex-row justify-center mt-4">
                    <p className="mt-4">Filtrar por:</p>
                    <button onClick={() => setFilter("artists")} className='bg-red-500 p-2 text-white my-2 mx-4'>Artistas</button>
                    <button onClick={() => setFilter("tracks")} className='bg-red-500 p-2 text-white my-2 mx-4'>Canciones</button>
                    <button onClick={() => setFilter("playlists")} className='bg-red-500 p-2 text-white my-2 mx-4'>Listas</button>
                    <button onClick={() => setFilter("albums")} className='bg-red-500 p-2 text-white my-2 mx-4'>Álbumes</button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                {
                    currentItems.map(song => (
                        <SongCard song={song} key={song.id} likedSongs={user.songsLiked}/>
                    ))
                }
                </div>
                <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} 
            setCurrentPage={setCurrentPage} totalItems={totalItems}></Pagination>
            </div>
        </div>
    )
}

export default SearchPage;