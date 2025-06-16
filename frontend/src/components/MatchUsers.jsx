import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUsers } from "../context/UserContext";
import { Link } from "react-router-dom";
import { toast, Zoom } from "react-toastify";

function MatchUsers({visib  = ""}){
    const {user} = useAuth();
    const [matchUsers, setMatchUsers] = useState([]);
    const { getUsersAdmin, users } = useUsers();

    useEffect(() => {
        getUsersAdmin();
    }, []);

    useEffect(() => {

        try {
            const authUserLiked = new Set(user.songsLiked.map(id => id.toString()));
            const followed = new Set(user.followed.map(id => id.toString()));
            const filtered = users.filter(u => u._id != user.id && !followed.has(u._id.toString()));
            const matched = filtered
            .map(u => {
                const matchCount = u.songsLiked?.filter(songId =>
                    authUserLiked.has(songId.toString())
                ).length || 0;

                return { ...u, matchCount };
            })
            .filter(u => u.matchCount >= 2);
            setMatchUsers(matched);
        } catch (error) {
            toast.error('Se ha producido un error al obtener usuarios recomendados', {
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
    }, [user, users]);
    return (
        <div className={`bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow-lg ${visib}`}>
            <h2 className="text-white text-xl font-semibold mb-4">Usuarios recomendados</h2>
            {matchUsers.length === 0 ? (
                <p className="text-gray-400">Sin recomendaciones todavía</p>
            ) : (
                matchUsers.slice(0, 6).map(u => (
                    <div key={u._id} className="flex items-center mb-4">
                        <img src={u.profilePic} alt={u.username} className="w-10 h-10 rounded-full mr-3 border border-white" />
                        <div className="text-white">
                            <Link to={`/users/${u._id}`} className='font-bold hover:underline'>{u.username}</Link>
                            <p className="text-sm text-gray-400">{u.matchCount} matches</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default MatchUsers;