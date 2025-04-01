import { createContext, useContext, useState, useEffect } from "react";
import { getTokenRequest, searchRequest, createPlaylistRequest, getAllPlaylistsRequest } from "../api/songs";

const SongContext = createContext();

export const useSongs = () => {
    const context = useContext(SongContext)
    if(!context){
        throw new Error("useSongs debería estar dentro de un provider");
    }
    return context;
}
export const SongProvider = ({children}) => {
    const [errors, setErrors] = useState([]);
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const getToken = async () => {
        try{
            const res = await getTokenRequest();
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const search = async (access_token, searchInput) => {
        try{
            const res = await searchRequest(access_token, searchInput);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const createPlaylist = async (user, data) => {
        try{
            const res = await createPlaylistRequest(user, data)
        } catch(error){
            console.error(error);
        }
    }

    const getAllPlaylists = async (user) => {
            try{
                const res = await getAllPlaylistsRequest(user);
                setPlaylists(res.data);
            } catch(error){
                console.error(error);
            }
            
        }

    useEffect(() => {
            if(errors.length > 0){
                const timer = setTimeout(() => {
                    setErrors([]);
                }, 5000)
                return () => clearTimeout(timer);
            }
        }, [errors])

    return (
        <SongContext.Provider value={{songs, errors, playlists, getToken, search, createPlaylist, getAllPlaylists}}>
            {children}
        </SongContext.Provider>
    ) 
}
