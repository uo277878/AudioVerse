import { usePlayer } from "../context/PlayerContext";
import { FaPlay, FaPause } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

function PlayerPage() {
  const { currentTrack, togglePlay, isReady, isPaused, playTrack } = usePlayer();
  const location = useLocation();
  const started = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uri = params.get("uri");
    if (uri && !started.current) {
      playTrack(uri);
      started.current = true;
    }
  }, [location.search, playTrack]);

  return (
    <div className='flex h-screen items-center text-center justify-center'>
      <div className='bg-zinc-800 max-w-lg w-full p-10 rounded-md flex flex-col items-center'>
        {!isReady && <p>Cargando el reproductor...</p>}
        {isReady && currentTrack && (
          <div className="space-y-4">
            <img src={currentTrack.album.images[0].url} alt="Portada de la canción" className="w-64 h-64 object-cover rounded-lg shadow-lg" />
            <h2 className="text-2xl">{currentTrack.name}</h2>
            <p>{currentTrack.artists.map(artist => artist.name).join(", ")}</p>
          </div>
        )}
        <button onClick={togglePlay} className="mt-6 text-xl px-6 py-3 rounded-lg bg-zinc-900 text-rose-300 hover:text-rose-200" >
          {isPaused ? <FaPlay/> : <FaPause/>}
        </button>
      </div>
    </div>
  );
}

export default PlayerPage;
