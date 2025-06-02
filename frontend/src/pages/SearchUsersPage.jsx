import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import { useUsers } from "../context/UserContext";
import UserSearchCard from "../components/UserSearchCard";
import { useAuth } from "../context/AuthContext";
import { useSongs } from "../context/SongContext";
import PlaylistCard from "../components/PlaylistCard";
 
function SearchUsersPage(){
    const {searchUsers, errors: searchErrors} = useUsers();
    const {searchPlaylists} = useSongs();
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
        if(searchInput){
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
                console.error(error);
            }
        }
    }

    useEffect(() => {
        if(searchErrors.length > 0){
            setItems([]);
        }
    }, [searchErrors]);

    useEffect(() => {
        if (searchInput !== "") {
            console.log(searchInput);
            handleSearch(filter);
        }
    }, [orderBy]);

    return (
        <div className='flex min-h-screen justify-center'>
            <div className='bg-zinc-800 w-full p-10 rounded-md mx-8 my-8 flex flex-col'>
                <div className="flex justify-center">
                    <h1 className="text-2xl mb-4 font-bold">Buscador de Audioverse</h1>
                </div>
                <div className="relative">
                    <input className="w-full bg-transparent placeholder:text-white text-white text-xl border border-slate-200 rounded-md pl-3 pr-28 py-2 hover:border-slate-300"
                        placeholder="Introduce tu búsqueda" onKeyDown={event => {
                            if(event.key == "Enter"){
                                handleSearch(filter);
                            }
                        }}  onChange={event => setSearchInput(event.target.value)}/>
                    <button onClick={() => {handleSearch(filter)}} className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-xl text-white hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-slate-700"
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
                {items.length == 0 && <h1 className='text-xl mt-4 font-bold'>No se encuentra ningún resultado</h1>}
                <div className="flex flex-row justify-center mt-4">
                    <div className="flex items-center gap-2">
                        <p className="text-xl">Filtrar por:</p>
                        <button onClick={() => {
                            setFilter("users"); 
                            handleSearch("users");
                        }} className={`${filter === "users" ? "bg-red-700" : "bg-red-500"} p-2 text-white my-2 mx-3 rounded-3xl`}>Usuarios</button>
                        <button onClick={() => {
                            setFilter("playlists"); 
                            handleSearch("playlists");
                        }} className={`${filter === "playlists" ? "bg-red-700" : "bg-red-500"} p-2 text-white my-2 mr-2 rounded-3xl`}>Playlists</button>
                    </div>
                    {(filter == "users") && (
                        <div className="flex items-center gap-2 ml-4">
                            <p className="text-xl">Ordenar por:</p>
                            <button
                                onClick={() => setOrderBy(orderBy === "matches" ? "" : "matches")}
                                className={`${orderBy === "matches" ? "bg-red-700" : "bg-red-500"} p-2 text-white my-2 mx-3 rounded-3xl`}>
                                Matches
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="grid grid-cols-4 gap-3 mt-4">
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
                    <div className="mt-6 self-center">
                        <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} totalItems={totalItems}></Pagination>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchUsersPage;