import { createContext, useContext, useState, useEffect } from "react";
import { getTokenRequest, searchRequest, getTrackRequest, getAlbumRequest, getArtistRequest, 
    getPlaylistSpotifyRequest, createPlaylistRequest, getAllByUserRequest, getPlaylistRequest, 
    addSongToPlaylistRequest, removeSongPlaylistRequest, likeTextRequest, getTotalLikesAndLikedRequest,
    searchPlaylistsRequest, followPlaylistRequest, unfollowPlaylistRequest } from "../api/songs";

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

    const search = async (access_token, searchInput, orderBy) => {
        try{
            const res = await searchRequest(access_token, searchInput, orderBy);
            return res.data;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    
    const searchPlaylists = async (searchInput) => {
        try{
            const res = await searchPlaylistsRequest(searchInput);
            console.log(res);
            return res.data;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    const getTrack = async (token, id) => {
        try{
            const res = await getTrackRequest(token, id);
            console.log(res);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }
    
    const getArtist = async (token, id) => {
        try{
            const res = await getArtistRequest(token, id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }
    
    const getPlaylistSpotify = async (token, id) => {
        try{
            const res = await getPlaylistSpotifyRequest(token, id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }
    
    const getAlbum = async (token, id) => {
        try{
            const res = await getAlbumRequest(token, id);
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

    const addSongToPlaylist = async (playlist, id, txtSong) => {
        try{
            const res = await addSongToPlaylistRequest(playlist, id, txtSong)
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    const removeSongPlaylist = async (id, playlist) => {
        try{
            const res = await removeSongPlaylistRequest(id, playlist)
        } catch(error){
            console.error(error);
        }
    }

    const followPlaylist = async (playlistId, userId) => {
        try{
            const res = await followPlaylistRequest(playlistId, userId)
        } catch(error){
            console.error(error);
        }
    }

    const unfollowPlaylist = async (playlistId, userId) => {
        try{
            const res = await unfollowPlaylistRequest(playlistId, userId)
        } catch(error){
            console.error(error);
        }
    }

    const getAllByUser = async (user) => {
        try{
            const res = await getAllByUserRequest(user.id);
            setPlaylists(res.data);
        } catch(error){
            console.error(error);
        }
        
    }

    const getPlaylist = async (id) => {
        try{
            const res = await getPlaylistRequest(id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const likeText = async (playlistId, songId, userId) => {
        try{
            const res = await likeTextRequest(playlistId, songId, userId);
            console.log(res);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const getTotalLikesAndLiked = async (playlistId, songId, userId) => {
        try{
            const res = await getTotalLikesAndLikedRequest(playlistId, songId, userId);
            console.log(res);
            return res.data;
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
        <SongContext.Provider value={{songs, errors, playlists, getToken, search, searchPlaylists, getTrack, getPlaylistSpotify, getArtist, getAlbum, 
        createPlaylist, getAllByUser, getPlaylist, addSongToPlaylist, removeSongPlaylist, likeText, getTotalLikesAndLiked, followPlaylist, unfollowPlaylist}}>
            {children}
        </SongContext.Provider>
    ) 
}
