import { useUsers } from "../context/UserContext";
import { Link } from "react-router-dom";

function UserCard({user}){
    const {deleteUser} = useUsers();

    return(
        <div className="bg-zinc-800 max-w-md p-10 rounded-md mx-auto my-4 ">
            <div className="flex justify-between">
                <Link to={`/users/edit/${user._id}`} className='text-2xl font-bold hover:underline'>{user.username}</Link>
                <div className="flex gap-x-2 items-center">
                    <button className='bg-red-500 p-2 text-white my-2' onClick={() => deleteUser(user._id)}>Eliminar</button>
                </div>
            </div>
            <p className="text-white">{user.email}</p>
            <p className="text-white">Fecha de nacimiento: {new Date(user.dateBirth).toLocaleDateString()}</p>
            <p className="text-white">Dado de alta el: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    );
}

export default UserCard;