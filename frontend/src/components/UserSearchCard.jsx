import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useUsers } from "../context/UserContext";
import { useState } from "react";

function UserSearchCard({userSearch}){
    const {user} = useAuth();
    const {follow, unfollow} = useUsers();
    const [isFollowing, setIsFollowing] = useState(user.followed.includes(userSearch._id));

    async function handleFollow(id){
        try {
            const res = await follow(user, id);
            setIsFollowing(true);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleUnfollow(id){
        try {
            const res = await unfollow(user, id);
            setIsFollowing(false);
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <div className="bg-zinc-900 max-w-md w-full p-6 rounded-md ml-4 my-4 ">
            <div className="flex justify-between">
                <div className="flex gap-x-2 items-center">
                    <img src={userSearch.profilePic} alt="Imagen de perfil" className="w-20 h-20 mt-4 rounded-full border-white border-2 border-opacity-100 mr-2" />
                    <div className="flex flex-col">
                        <Link to={`/users/${userSearch._id}`} className='text-2xl font-bold hover:underline'>{userSearch.username}</Link>
                        {isFollowing ? (
                            <>
                                <button className="bg-green-500 text-black p-2 mt-4 rounded-md text-center" onClick={() => handleUnfollow(userSearch._id)}>Siguiendo</button>
                            </>
                        ) : (
                            <>
                                <button className="bg-white text-black p-2 mt-4 rounded-md text-center" onClick={() => handleFollow(userSearch._id)}>Seguir</button>
                            </>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export default UserSearchCard;