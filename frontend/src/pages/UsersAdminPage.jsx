import { useEffect } from "react";
import { useUsers } from "../context/UserContext";
import UserCard from "../components/UserCard";

function UsersAdminPage(){
    const { getUsersAdmin, users } = useUsers();

    useEffect(() =>{
        getUsersAdmin();
    }, []);

    if(users.lenght == 0){
        return (<h1>No hay usuarios</h1>);
    }

    return (
    <div className="grid grid-cols-3 gap-3">
        {
            users.map(user => (
                <UserCard user={user} key={user._id}/>
            ))
        }
    </div>);
}

export default UsersAdminPage;