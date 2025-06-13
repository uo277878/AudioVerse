import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useUsers } from "../context/UserContext";
import { useState } from "react";
import { useMemo } from "react";
import { toast, Zoom } from "react-toastify";

function UserSearchCard({userSearch}){
    const {user} = useAuth();
    const {follow, unfollow} = useUsers();
    const [isFollowing, setIsFollowing] = useState(user.followed.includes(userSearch._id));

    const matchCount = useMemo(() => {
        if (!userSearch?.songsLiked || !user?.songsLiked) {
            return 0;
        }
        const authUserLiked = new Set(user.songsLiked.map(id => id.toString()));
        return userSearch.songsLiked.filter(songId => authUserLiked.has(songId.toString())).length;
    }, [userSearch?.songsLiked, user?.songsLiked]);

    async function handleFollow(id){
        try {
            const res = await follow(user, id);
            setIsFollowing(true);
        } catch (error) {
            toast.error('Se ha producido un error al seguir al usuario', {
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

    async function handleUnfollow(id){
        try {
            const res = await unfollow(user, id);
            setIsFollowing(false);
        } catch (error) {
            toast.error('Se ha producido un error al dejar de seguir al usuario', {
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

    return(
        <div className="bg-zinc-900 max-w-md w-full p-6 rounded-md ml-4 my-4 ">
            <div className="flex justify-between">
                <div className="flex gap-x-2 items-center">
                    <img src={userSearch.profilePic} alt="Imagen de perfil" className="w-20 h-20 mt-4 rounded-full border-white border-2 border-opacity-100 mr-2" />
                    <div className="flex flex-col">
                        <Link to={`/users/${userSearch._id}`} className='text-2xl font-bold hover:underline'>{userSearch.username}</Link>
                        {user.role == "user" ? (
                            <>
                            {isFollowing ? (
                                <>
                                    <button className="bg-green-500 text-black p-2 mt-4 rounded-md text-center" onClick={() => handleUnfollow(userSearch._id)}>Siguiendo</button>
                                </>
                            ) : (
                                <>
                                    <button className="bg-white text-black p-2 mt-4 rounded-md text-center" onClick={() => handleFollow(userSearch._id)}>Seguir</button>
                                </>
                            )}
                            </>
                        ) :
                        (<></>)}
                    </div>
                </div>
            </div>
            {user.role == "user" ? (
                <>
                    <p className="text-white mt-2">Canciones en común: <span className="font-bold">{matchCount}</span></p>
                </>
            ) : (<></>)}
        </div>
    );
}

export default UserSearchCard;