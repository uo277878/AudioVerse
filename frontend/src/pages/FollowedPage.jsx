import { useEffect, useState } from "react";
import UserCard from "../components/UserCard";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { useUsers } from "../context/UserContext";
import FollowedCard from "../components/FollowedCard";

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

    useEffect(() => {
        async function getFollowed(){
            const res = await getFollowedUsers(user);
            setUsers(res.followed);
        }
        getFollowed();
    }, [user]);

    return (
        <div>
            <div className="grid grid-cols-3 gap-3">
            {
                currentUsers.map((user) => (
                    <FollowedCard user={user} key={user._id}/>
                ))
            }
            </div>
            <Pagination itemsPerPage={usersPerPage} currentPage={currentPage} 
            setCurrentPage={setCurrentPage} totalItems={totalUsers}></Pagination>
        </div>
    )
}

export default FollowedPage;