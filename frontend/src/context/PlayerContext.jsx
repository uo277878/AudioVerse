import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSongs } from "./SongContext";

const PlayerContext = createContext();

export const usePlayer = () => {
    const context = useContext(PlayerContext)
    if(!context){
        throw new Error("usePlayer debería estar dentro de un provider");
    }
    return context;
}

export const PlayerProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const playerRef = useRef(null);

  const { getToken } = useSongs();
  const [accessToken, setAccessToken] = useState();

  useEffect(() => {
    const getTokenFromSpotify = async () => {
      const token = await getToken();
      setAccessToken(token);
    };
    getTokenFromSpotify();
  }, []);

  useEffect(() => {
    if (!accessToken) {
        return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
            name: "AudioVerse Web Player",
            getOAuthToken: cb => cb(accessToken),
            volume: 0.5
        });

        player.addListener("ready", ({ device_id }) => {
            setDeviceId(device_id);
            setIsReady(true);
        });

        player.addListener("player_state_changed", (state) => {
            if (!state) return;
            const current = state.track_window.current_track;
            setCurrentTrack(current);
        });

        player.addListener("initialization_error", e => console.error(e));
        player.addListener("authentication_error", e => console.error(e));
        player.addListener("account_error", e => console.error(e));
        player.addListener("playback_error", e => console.error(e));

        player.connect();
        playerRef.current = player;
        };
  }, [accessToken]);

  const playTrack = async (uri) => {
    if (!deviceId || !accessToken) {
        return;
    }
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        body: JSON.stringify({ uris: [uri] }),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
  };

  const pause = () => playerRef.current?.pause();
  const resume = () => playerRef.current?.resume();
  const togglePlay = async () => {
        const state = await playerRef.current.getCurrentState();
        if (!state) {
            return;
        }
        if (state.paused) {
            resume();
        } else {
            pause();
        }
    };

  return (
    <PlayerContext.Provider value={{ playTrack, currentTrack, togglePlay, isReady }}>
      {children}
    </PlayerContext.Provider>
  );
};