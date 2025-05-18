import { useEffect, useState } from "react";
import { useUsers } from "../context/UserContext";
import UserCard from "../components/UserCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";

function UsersAdminPage(){
    const { getUsersAdmin, users } = useUsers();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [usersPerPage, setUsersPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const totalUsers = users.length;
    const lastIndex = currentPage * usersPerPage;
    const firstIdex = lastIndex - usersPerPage;
    const currentUsers = users.slice(firstIdex, lastIndex);

    useEffect(() =>{
        getUsersAdmin();
        if(user.role != "admin"){
            navigate("/error");
        }
    }, []);

    if(users.length == 0){
        return (<h1>No hay usuarios</h1>);
    }

    return (
        <div>
            <h1 className='text-2xl my-4 ml-4 font-bold'>Usuarios del sistema</h1>
            <hr className="h-1 bg-zinc-700 border-0"></hr>
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