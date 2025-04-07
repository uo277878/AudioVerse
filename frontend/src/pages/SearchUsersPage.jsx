import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import UserCard from "../components/UserCard";
import { useUsers } from "../context/UserContext";
 
function SearchUsersPage(){
    const {searchUsers} = useUsers();
    const [searchInput, setSearchInput] = useState("");
    const [users, setUsers] = useState([]);

    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalUsers = users.length;
    const lastIndex = currentPage * usersPerPage;
    const firstIdex = lastIndex - usersPerPage;
    const currentUsers = users.slice(firstIdex, lastIndex);

    async function handleSearch(){
        try {
            const res = await searchUsers(searchInput);
            setUsers(res.users);
        } catch (error) {
            console.error(error);
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
                    currentUsers.map(user => (
                        <UserCard user={user} key={user.id} />
                    ))
                }
                </div>
                <Pagination itemsPerPage={usersPerPage} currentPage={currentPage} 
            setCurrentPage={setCurrentPage} totalItems={totalUsers}></Pagination>
            </div>
        </div>
    )
}

export default SearchUsersPage;