import { usePlayer } from "../context/PlayerContext";

export default function PlayerBar() {
  const { currentTrack, togglePlay, isReady } = usePlayer();

  if (!isReady) return null;

  return (
    <div className="fixed bottom-0 w-full bg-zinc-900 text-white px-4 py-3 shadow-lg flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        {currentTrack?.album?.images?.[0]?.url && (
          <img src={currentTrack.album.images[0].url} alt="cover" className="w-12 h-12 rounded" />
        )}
        <div>
          <p className="font-semibold">{currentTrack?.name}</p>
          <p className="text-sm text-gray-300">
            {currentTrack?.artists?.map(a => a.name).join(", ")}
          </p>
        </div>
      </div>
      <button onClick={togglePlay} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white ml-4">
        ⏯️
      </button>
    </div>
  );
}
