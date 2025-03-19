import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function EditProfilePicPage(){
    const {register, handleSubmit, setValue} = useForm();
    const {updateUser, updateProfilePic} = useUsers();
    const { user, setUser } = useAuth();
    const [profilePic, setProfilePic] = useState(user?.profilePic || "");
    const [previewPic, setPreviewPic] = useState(user?.profilePic || "");
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(user){
            setValue('username', user.username);
            setValue('email', user.email);
            setValue('image', user.profilePic);
            setProfilePic(user.profilePic);
            setPreviewPic(user.profilePic);
        }
    }, [user]);

    const onSubmit = handleSubmit(async (data) => {
        if (user) {
            try {
                let newProfilePic = profilePic;
                if (selectedFile) {
                    const res = await updateProfilePic(selectedFile);
                    if (res.data.profilePic) {
                        newProfilePic = res.data.profilePic;
                    }
                }

                await updateUser(user, { ...data, profilePic: newProfilePic });
                setUser((prevUser) => ({ ...prevUser, profilePic: newProfilePic }));
                navigate('/users/profile');
            } catch (error) {
                console.error("Error al actualizar la imagen de perfil:", error);
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
        setPreviewPic(profilePic);
        setSelectedFile(null);
        navigate("/users/profile");
    }

    return (
        <div className="flex justify-center">
            <div className="bg-zinc-800 max-w-xl w-full p-10 rounded-md">
                <form className="w-full flex flex-col justify-center items-center" onSubmit={onSubmit}>
                    <div className="w-full flex flex-col justify-center items-center mr-4 mb-4 md:mb-0">
                        <img src={previewPic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                        <input type="file" {...register("image")} onChange={handleImageChange} className="w-full text-white md:ml-20 py-2 my-4 rounded-md"/>
                        <div className="flex">
                            <button type="submit" onClick={handleCancelar} className="bg-rose-500 text-white px-4 py-2 rounded-md my-2 mr-4">
                                Cancelar
                            </button>
                            <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                                Guardar
                            </button>
                        </div>
                    </div>
                    
                </form>
            </div>
        </div>
        
    )
}

export default EditProfilePicPage