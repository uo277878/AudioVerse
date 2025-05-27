import { Link } from "react-router-dom";

function PlaylistCard({playlist}){
    if (!playlist || !Array.isArray(playlist.songs)) {
        return null; 
    }
    return(
        <div className="flex flex-col bg-zinc-700 max-w-xs w-full p-10 rounded-md mx-4 my-4 justify-between h-72 relative">
            <img src={playlist.pic} className="w-full h-40 object-cover rounded-md"/>
            <div className="absolute mb-4 bottom-0 ">
                <Link to={`/playlists/${playlist._id}`} className="w-full text-lg font-bold mt-2 hover:underline">{playlist.name}</Link>
                <p className="w-full text-lg mt-2">Nº de canciones: <span className="font-bold">{playlist.songs.length}</span></p>
            </div>
        </div>
    );
}

export default PlaylistCard;