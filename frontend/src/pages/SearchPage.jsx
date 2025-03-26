import { useEffect, useState } from "react";
import { useSongs } from "../context/SongContext";
import SongCard from "../components/SongCard";
 
function SearchPage(){
    const [searchInput, setSearchInput] = useState("");
    const [accessToken, setAccessToken] = useState();
    const [albums, setAlbums] = useState([]);
    const {getToken, search} = useSongs();

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
            setAlbums(res.items);
            console.log(albums);
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
                <div className="grid grid-cols-5 gap-3">
                {
                    albums.map(song => (
                        <SongCard song={song} key={song.id}/>
                    ))
                }
            </div>
            </div>
        </div>
    )
}

export default SearchPage;