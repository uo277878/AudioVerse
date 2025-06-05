import { usePlayer } from "../context/PlayerContext";

function PlayerPage() {
  const { currentTrack, togglePlay, isReady } = usePlayer();

  return (
    <div>
      {!isReady && <p>Cargando el reproductor...</p>}
      {isReady && currentTrack && (
        <div className="space-y-4">
          <img src={currentTrack.album.images[0].url} alt="Portada" className="w-64 h-64 object-cover" />
          <h2 className="text-2xl">{currentTrack.name}</h2>
          <p>{currentTrack.artists.map(artist => artist.name).join(", ")}</p>
        </div>
      )}
      <button onClick={togglePlay} className="mt-6 px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600" >
        Reproducir / Pausar
      </button>
    </div>
  );
}

export default PlayerPage;
