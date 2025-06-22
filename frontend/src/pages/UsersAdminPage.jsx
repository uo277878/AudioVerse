import { useEffect, useState } from "react";
import { useUsers } from "../context/UserContext";
import UserCard from "../components/UserCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import { toast, Zoom } from "react-toastify";

function UsersAdminPage(){
    const { getUsersAdmin, users, searchUsers, errors: searchErrors } = useUsers();
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
        try {
            const res = await searchUsers(searchInput, null, user);
            if(Array.isArray(res.users)){
                let sinAdmin = res.users.filter(u => u.role != "admin");
                setItems(sinAdmin);
                setCurrentPage(1);
            } else{
                setItems([]);
            }
        } catch (error) {
            toast.error('Se ha producido un error al buscar a los usuarios', {
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

    useEffect(() =>{
        if(user.role != "admin"){
            navigate("/error");
        }
        getUsersAdmin().then(() => {
            const sinAdmin = users.filter(u => u.role != "admin");
            setItems(sinAdmin);
        });
    }, []);

    useEffect(() => {
        const sinAdmin = users.filter(u => u.role !== "admin");
        setItems(sinAdmin);
    }, [users]);

    if(users.length == 0){
        return (<h1>No hay usuarios</h1>);
    }

    return (
        <div>
            <h1 className='text-2xl my-4 ml-4 font-bold'>Usuarios del sistema</h1>
            <hr className="h-1 bg-zinc-700 border-0 mb-6"></hr>
            <div className="relative">
                <label htmlFor="busqueda" className="sr-only">Email:</label>
                <input className="w-full bg-transparent placeholder:text-white text-white text-sm md:text-xl border border-slate-200 rounded-md pl-3 pr-28 py-2 hover:border-slate-300"
                    placeholder="Introduce tu búsqueda" id="busqueda" onKeyDown={event => {
                        if(event.key == "Enter"){
                            handleSearch();
                        }
                    }}  onChange={event => setSearchInput(event.target.value)}/>
                <button onClick={() => {handleSearch()}} className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm md:text-xl text-white hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-slate-700"
                    type="button">
                    Buscar
                </button> 
            </div>
            {
                searchErrors.map((error, i) => (
                    <div className='bg-red-600 p-2 text-white  my-2' key={i}>
                        {error.msg}
                    </div>
                ))
            }
            {items.length == 0 && <h1 className='text-xl mt-4 font-bold'>No se encuentra ningún resultado</h1>}
            <div className="flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {
                    currentUsers.map(user => (
                        <UserCard user={user} key={user._id}/>
                    ))
                }
                </div>
            </div>
            {users.length >= usersPerPage && (
                <div className="mt-6 self-center w-full max-w-sm sm:max-w-md text-sm scale-95">
                    <Pagination itemsPerPage={usersPerPage} currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} totalItems={totalUsers}></Pagination>
                </div>
            )}
        </div>
    
    );
}

export default UsersAdminPage;