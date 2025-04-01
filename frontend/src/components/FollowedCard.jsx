import { Link } from "react-router-dom";

function FollowedCard({user}){
    return(
        <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md ml-4 my-4 ">
            <div className="flex justify-between">
                <img src={user.profilePic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <Link to={`/users/${user._id}`} className='bg-red-500 p-2 text-white self-start'>Ver perfil</Link>
            </div>
        </div>
    );
}

export default FollowedCard;