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
  const [isPaused, setIsPaused] = useState(false);

  const { accessToken, setAccessToken } = useSpotify();

  useEffect(() => {
    const loadSpotifySDK = () => {
      if (!document.getElementById("spotify-player")) {
        const script = document.createElement("script");
        script.id = "spotify-player";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log("Spotify SDK Ready");
        };
        document.body.appendChild(script);
      } else {
        if (window.Spotify) {
          window.onSpotifyWebPlaybackSDKReady?.();
        }
      }
    };

    loadSpotifySDK();
  }, []);

  useEffect(() => {
    const setupPlayer = () => {
      if (!accessToken || playerRef.current) return;

      const player = new window.Spotify.Player({
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
        setIsPaused(state.paused);
      });

      player.addListener("initialization_error", e => console.error("init error", e));
      player.addListener("authentication_error", e => console.error("auth error", e));
      player.addListener("account_error", e => console.error("account error", e));
      player.addListener("playback_error", e => console.error("playback error", e));

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setupPlayer;
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
    <PlayerContext.Provider value={{ playTrack, currentTrack, togglePlay, isReady, isPaused }}>
      {children}
    </PlayerContext.Provider>
  );
};