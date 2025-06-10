import { useForm } from "react-hook-form";
import { useSongs } from "../context/SongContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Zoom } from "react-toastify";

function CreatePlaylistPage(){
    const {register, handleSubmit, formState: {errors}} = useForm();
    const {createPlaylist, errors: createErrors} = useSongs();
    const { user } = useAuth();
    const [playlistPic, setPlaylistPic] = useState("https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png");
    const [previewPic, setPreviewPic] = useState("https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png");
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() =>{
        if(user.role != "user"){
            navigate("/error");
        }
    }, []);

    useEffect(() => {
        setPlaylistPic(playlistPic);
        setPreviewPic(previewPic);
    }, []);

    const onSubmit = handleSubmit(async (data) => {
        if(user){
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("creator", user._id);
            if (selectedFile) {
                formData.append("pic", selectedFile);
            } else {
                formData.append("pic", playlistPic);
            }
            const res = await createPlaylist(user, data);
            console.log(res);
            if(res.newPlaylist){
                toast.success('Playlist creada con éxito', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Zoom,
                });
            }
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
        navigate("/playlists/getAllByUser/" + user.id);
    }

    return (
        <div className='flex items-center justify-center'>
            <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md'>
                <form className="w-full flex flex-col justify-center items-center" onSubmit={onSubmit}>
                    <h1 className='text-2xl font-bold'>Crea una playlist</h1>
                    <img src={previewPic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                    <input type="file" {...register("pic")} onChange={handleImageChange} className="w-full text-white md:ml-20 py-2 my-4 rounded-md"/>
                    {
                        createErrors.map((error, i) => (
                            <div className='bg-red-500 p-2 text-white my-2' key={i}>
                                {error.msg}
                            </div>
                        ))
                    }
                    <input type="name" {... register("name", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Nombre'
                    />
                    {
                        errors.name && <p className='text-red-500'>Nombre es obligatorio</p>
                    }
                    <textarea type="description" {... register("description", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2 resize-none'
                        placeholder='Descripción'
                        rows="4"
                    />
                    {
                        errors.description && <p className='text-red-500'>Descripción es obligatoria</p>
                    }
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