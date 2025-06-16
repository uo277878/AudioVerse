import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import { useUsers } from "../context/UserContext";
import UserSearchCard from "../components/UserSearchCard";
import { useAuth } from "../context/AuthContext";
import { useSongs } from "../context/SongContext";
import PlaylistCard from "../components/PlaylistCard";
import { toast, Zoom } from "react-toastify";
import { useForm } from "react-hook-form";
 
function SearchUsersPage(){
    const { register } = useForm();
    const {searchUsers, errors: searchErrors} = useUsers();
    const {searchPlaylists, errors: playlistErrors} = useSongs();
    const [searchInput, setSearchInput] = useState("");
    const [items, setItems] = useState([]);
    const {user} = useAuth();
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = items.length;
    const lastIndex = currentPage * itemsPerPage;
    const firstIdex = lastIndex - itemsPerPage;
    const currentItems = items.slice(firstIdex, lastIndex);
    const [filter, setFilter] = useState("users");
    const [orderBy, setOrderBy] = useState("");

    async function handleSearch(filtro){
        try {
            if(filtro == "users"){
                const res = await searchUsers(searchInput, orderBy, user);
                console.log(res);
                if(Array.isArray(res.users)){
                    setItems(res.users.filter(u => u._id != user.id));
                    setCurrentPage(1);
                } else{
                    setItems([]);
                }
            } else{
                const res = await searchPlaylists(searchInput);
                console.log(res);
                if(Array.isArray(res)){
                    setItems(res);
                    setCurrentPage(1);
                } else{
                    setItems([]);
                }
            }
            
        } catch (error) {
            toast.error('Se ha producido un error al buscar', {
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

    useEffect(() => {
        if(searchErrors.length > 0 || playlistErrors > 0){
            setItems([]);
        }
    }, [searchErrors, playlistErrors]);

    return (
        <div className='flex min-h-screen justify-center'>
            <div className='bg-zinc-800 w-full p-10 rounded-md mx-8 my-8 flex flex-col'>
                <div className="flex justify-center">
                    <h1 className="text-2xl mb-4 font-bold">Buscador de Audioverse</h1>
                </div>
                <div className="relative">
                    <input {...register("input")} className="w-full bg-transparent placeholder:text-white text-white text-sm md:text-xl border border-slate-200 rounded-md pl-3 pr-28 py-2 hover:border-slate-300"
                        placeholder="Introduce tu búsqueda" onKeyDown={event => {
                            if(event.key == "Enter"){
                                handleSearch(filter);
                            }
                        }}  onChange={event => setSearchInput(event.target.value)}/>
                    <button onClick={() => {handleSearch(filter)}} className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm md:text-xl text-white hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-slate-700"
                        type="button">
                        Buscar
                    </button> 
                </div>
                {
                    searchErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white  my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                {
                    playlistErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white  my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <p className="text-sm md:text-base">Filtrar por:</p>
                        <button onClick={() => {
                            setFilter("users"); 
                            handleSearch("users");
                        }} className={`${filter === "users" ? "bg-red-700" : "bg-red-500"} px-3 py-1 text-white rounded-3xl text-sm`}>Usuarios</button>
                        <button onClick={() => {
                            setFilter("playlists"); 
                            handleSearch("playlists");
                        }} className={`${filter === "playlists" ? "bg-red-700" : "bg-red-500"} px-3 py-1 text-white rounded-3xl text-sm`}>Playlists</button>
                    </div>
                    {(filter == "users") && (user.role == "user") && (
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <p className="mt-3 text-sm md:text-base">Ordenar por:</p>
                            <button
                                onClick={() => {
                                        setOrderBy(orderBy === "matches" ? "" : "matches"); 
                                        handleSearch(filter);
                                    }
                                }
                                className={`${orderBy === "matches" ? "bg-red-700" : "bg-red-500"} px-3 py-1 text-white rounded-3xl text-sm`}>
                                Matches
                            </button>
                        </div>
                    )}
                </div>
                {items.length == 0 && <h1 className='text-xl mt-4 font-bold'>No se encuentra ningún resultado</h1>}
                <div className="flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                        {filter == "users" ? (
                            <>
                                {
                                    currentItems.map(user => (
                                        <UserSearchCard userSearch={user} key={user._id} />
                                    ))
                                }
                            </>
                        ) : (
                            <>
                                {
                                    currentItems.map(playlist => (
                                        <PlaylistCard playlist={playlist} key={playlist._id} />
                                    ))
                                }
                            </>
                        )}
                    </div>
                </div>
                {items.length >= itemsPerPage && (
                    <div className="mt-6 self-center w-full max-w-sm sm:max-w-md text-sm scale-95">
                        <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} totalItems={totalItems}></Pagination>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchUsersPage;