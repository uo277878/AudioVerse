import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { toast, Zoom } from "react-toastify";

function ProfilePage(){
    const {register, handleSubmit, setValue, formState: {errors}} = useForm();
    const {updateProfile, errors: updateErrors, updateProfilePic} = useUsers();
    const { user, setUser } = useAuth();
    const [profilePic, setProfilePic] = useState(user?.profilePic || "");

    useEffect(() => {
        if(user){
            console.log(user);
            setValue('username', user.username);
            setValue('email', user.email);
            setProfilePic(user.profilePic);
        }
    }, [user]);

    const onSubmit = handleSubmit((data) => {
        if(user){
            const res = updateProfile(user, data);
            console.log(res);
            if(res){
                toast.success('Perfil actualizado con éxito', {
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
            } else {
                toast.error('Se ha producido un error al actualizar el perfil', {
                    position: "top-right",
                    autoClose: 5000,
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

    return (
        <div className="flex flex-col md:h-screen md:flex-row justify-center items-center">
            <div className="bg-zinc-800 max-w-xl w-full p-10 rounded-md">
                <h1 className='text-2xl mb-4 font-bold'>Información de su perfil</h1>
                {
                    updateErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form className="flex flex-col md:flex-row items-center md:items-start mb-4" onSubmit={onSubmit}>
                    <div className="w-full md:w-1/4 flex justify-center md:justify-start mr-4 mb-4 md:mb-0">
                        <div className="relative inline-block">
                            <img src={user.profilePic} alt="Imagen de perfil" className="w-32 h-32 mt-4 rounded-full border-white border-2 border-opacity-100" />
                            <Link to="/users/profile/image" className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-rose-500 text-white p-2 rounded-full">
                                <HiOutlinePencilAlt className="w-6 h-6" />
                            </Link>
                        </div>
                        
                    </div>
                    <div className="w-full md:w-3/4">
                        <input type="text" placeholder="Username" {... register("username", {required: true})} 
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                        {
                            errors.username && <p className='text-red-500'>Username es obligatorio</p>
                        }
                        <input type="text" placeholder="Email" {... register("email", {required: true})} 
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                        {
                            errors.email && <p className='text-red-500'>Email es obligatorio</p>
                        }
                        <div className="flex justify-between">
                            <Link to="/users/profile/password" className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                                Editar contraseña
                            </Link>
                            <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                                Guardar
                            </button>
                        </div>
                        <p className="text-white mt-2">Parte de Audioverse desde el <b>{new Date(user.createdAt).toLocaleDateString()}</b></p>
                    </div>
                    
                </form>
            </div>
        </div>
        
    )
}

export default ProfilePage