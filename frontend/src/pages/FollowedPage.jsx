import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { useUsers } from "../context/UserContext";
import FollowedCard from "../components/FollowedCard";
import { useNavigate } from 'react-router-dom';

function FollowedPage(){

    const {user} = useAuth();
    const [users, setUsers] = useState([]);
    const {getFollowedUsers} = useUsers();
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalUsers = users.length;
    const lastIndex = currentPage * usersPerPage;
    const firstIdex = lastIndex - usersPerPage;
    const currentUsers = users.slice(firstIdex, lastIndex);
    const navigate = useNavigate();

    useEffect(() =>{
        if(user.role != "user"){
            navigate("/error");
        }
    }, []);

    useEffect(() => {
        async function getFollowed(){
            const res = await getFollowedUsers(user);
            setUsers(res.followed);
        }
        getFollowed();
    }, [user]);

    return (
        <div className="ml-4 mt-4">
            <h1 className='text-2xl my-4 ml-4 font-bold'>Personas a las que sigues</h1>
            <hr className="h-1 bg-zinc-700 border-0"></hr>
            <div className="flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-4">
                {
                    currentUsers.map((user) => (
                        <FollowedCard user={user} key={user._id}/>
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
    )
}

export default FollowedPage;