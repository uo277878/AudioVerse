import { Link } from "react-router-dom";

function FollowedCard({user}){
    return(
        <div className="bg-zinc-700 max-w-md w-full p-10 rounded-md ml-4 my-4 ">
            <div className="flex flex-row">
                <img src={user.profilePic} alt="Imagen de perfil" className="w-20 h-20 mt-4 rounded-full border-white border-2 border-opacity-100" />
                <div className="ml-6 flex items-center">
                    <Link to={`/users/${user._id}`} className='text-2xl font-bold hover:underline'>{user.username}</Link>
                </div>
            </div>
        </div>
    );
}

export default FollowedCard;