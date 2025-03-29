import { useForm } from "react-hook-form";
import { useSongs } from "../context/SongContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CreatePlaylistPage(){
    const {register, handleSubmit} = useForm();
    const {createPlaylist, errors: updateErrors} = useSongs();
    const { user } = useAuth();
    const [playlistPic, setPlaylistPic] = useState("https://res.cloudinary.com/dtlhuysrz/image/upload/v1743288198/default_playlist_udkb5x.png");
    const [previewPic, setPreviewPic] = useState("https://res.cloudinary.com/dtlhuysrz/image/upload/v1743288198/default_playlist_udkb5x.png");
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
            setPlaylistPic(playlistPic);
            setPreviewPic(previewPic);
        }, []);

    const onSubmit = handleSubmit(async (data) => {
        if(user){
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("creator", user._id);
            formData.append("pic", previewPic); 
            createPlaylist(user, data);
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPic(reader.result); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelar= () => {
        setPreviewPic(playlistPic);
        setSelectedFile(null);
        navigate("/playlist/getAll");
    }

    return (
        <div className='flex items-center justify-center'>
            <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md'>
                <form className="w-full flex flex-col justify-center items-center" onSubmit={onSubmit}>
                    <h1 className='text-2xl font-bold'>Crea una playlist</h1>
                    <img src={previewPic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                    <input type="file" {...register("pic")} onChange={handleImageChange} className="w-full text-white md:ml-20 py-2 my-4 rounded-md"/>
                    <input type="name" {... register("name", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Nombre'
                    />
                    <div className="flex">
                        <button type="submit" onClick={handleCancelar} className="bg-rose-500 text-white px-4 py-2 rounded-md my-2 mr-4">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePlaylistPage;