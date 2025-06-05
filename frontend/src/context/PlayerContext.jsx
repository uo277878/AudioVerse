import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSpotify } from "./SpotifyAuthContext";

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

  const { accessToken, setAccessToken } = useSpotify();

  useEffect(() => {
    const loadSpotifySDK = () => {
      if (!document.getElementById("spotify-player")) {
        const script = document.createElement("script");
        script.id = "spotify-player";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log("Spotify SDK Ready (desde script load)");
        };
        document.body.appendChild(script);
      } else {
        if (window.Spotify) {
          console.log("Spotify SDK ya estaba cargado");
          window.onSpotifyWebPlaybackSDKReady?.();
        }
      }
    };

    loadSpotifySDK();
  }, []);

  useEffect(() => {
    console.log(accessToken);
    if (!accessToken || playerRef.current) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "AudioVerse Web Player",
        getOAuthToken: cb => cb(accessToken),
        volume: 0.5
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Reproductor listo:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
          method: "PUT",
          body: JSON.stringify({
            uris: ["spotify:track:3z8h0TU7ReDPLIbEnYhWZb"]
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }).catch(err => console.error("Error al reproducir:", err));
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        const current = state.track_window.current_track;
        setCurrentTrack(current);
      });

      player.addListener("initialization_error", e => console.error("init error", e));
      player.addListener("authentication_error", e => console.error("auth error", e));
      player.addListener("account_error", e => console.error("account error", e));
      player.addListener("playback_error", e => console.error("playback error", e));

      player.connect();
      playerRef.current = player;
    }

    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }
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
    console.log(playerRef);
    const state = await playerRef.current.getCurrentState();
    console.log("Estado: " + state);
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