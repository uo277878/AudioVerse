import { useEffect, useState } from "react";
import { useUsers } from "../context/UserContext";
import UserCard from "../components/UserCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";

function UsersAdminPage(){
    const { getUsersAdmin, users, searchUsers } = useUsers();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState("");
    const [usersPerPage, setUsersPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState([]);
    const totalUsers = items.length;
    const lastIndex = currentPage * usersPerPage;
    const firstIdex = lastIndex - usersPerPage;
    const currentUsers = items.slice(firstIdex, lastIndex);

    async function handleSearch(){
        if(searchInput){
            try {
                const res = await searchUsers(searchInput, null, user);
                console.log(res);
                if(Array.isArray(res.users)){
                    setItems(res.users);
                    setCurrentPage(1);
                } else{
                    setItems([]);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    useEffect(() =>{
        getUsersAdmin().then(() => {
            setItems(users); 
        });
        if(user.role != "admin"){
            navigate("/error");
        }
    }, []);

    useEffect(() => {
        setItems(users);
    }, [users]);

    if(users.length == 0){
        return (<h1>No hay usuarios</h1>);
    }

    return (
        <div>
            <h1 className='text-2xl my-4 ml-4 font-bold'>Usuarios del sistema</h1>
            <hr className="h-1 bg-zinc-700 border-0"></hr>
            <div className="relative">
                <input className="w-full bg-transparent placeholder:text-white text-white text-xl border border-slate-200 rounded-md pl-3 pr-28 py-2 hover:border-slate-300"
                    placeholder="Introduce tu búsqueda" onKeyDown={event => {
                        if(event.key == "Enter"){
                            handleSearch();
                        }
                    }}  onChange={event => setSearchInput(event.target.value)}/>
                <button onClick={() => {handleSearch()}} className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-xl text-white hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-slate-700"
                    type="button">
                    Buscar
                </button> 
            </div>
            <div className="flex-grow">
                <div className="grid grid-cols-3 gap-3">
                {
                    currentUsers.map(user => (
                        <UserCard user={user} key={user._id}/>
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
    
    );
}

export default UsersAdminPage;