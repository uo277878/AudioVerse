
function SongCard({song}){

    return(
        <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md ml-4 my-4 ">
            <img src={song.images[0].url}/>
            <p className="text-md font-bold mt-2">{song.name}</p>
        </div>
    );
}

export default SongCard;