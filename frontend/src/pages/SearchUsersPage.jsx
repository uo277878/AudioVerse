import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import { useUsers } from "../context/UserContext";
import UserSearchCard from "../components/UserSearchCard";
import { useAuth } from "../context/AuthContext";
 
function SearchUsersPage(){
    const {searchUsers, errors: searchErrors} = useUsers();
    const [searchInput, setSearchInput] = useState("");
    const [users, setUsers] = useState([]);
    const {user} = useAuth();
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalUsers = users.length;
    const lastIndex = currentPage * usersPerPage;
    const firstIdex = lastIndex - usersPerPage;
    const currentUsers = users.slice(firstIdex, lastIndex);

    async function handleSearch(){
        try {
            const res = await searchUsers(searchInput);
            if(Array.isArray(res.users)){
                setUsers(res.users.filter(u => u._id != user.id));
                setCurrentPage(1);
            } else{
                setUsers([]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if(searchErrors.length > 0){
            setUsers([]);
        }
    }, [searchErrors]);

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
                                handleSearch();
                            }
                        }}  onChange={event => setSearchInput(event.target.value)}/>
                    <button onClick={handleSearch} className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-xl text-white hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-slate-700"
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
                {users.length == 0 && <h1 className='text-xl mt-4 font-bold'>No se encuentra ningún resultado</h1>}
                <div className="flex-grow">
                    <div className="grid grid-cols-4 gap-3 mt-4">
                        {
                            currentUsers.map(user => (
                                <UserSearchCard userSearch={user} key={user._id} />
                            ))
                        }
                    </div>
                </div>
                
                {users.length >= usersPerPage && (
                    <div className="mt-6 self-center">
                        <Pagination itemsPerPage={usersPerPage} currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} totalItems={totalUsers}></Pagination>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchUsersPage;