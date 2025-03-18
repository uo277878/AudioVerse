import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function ProfilePage(){
    const {register, handleSubmit, setValue, formState: {errors}} = useForm();
    const {updateUser, errors: updateErrors, updateProfilePic} = useUsers();
    const { user, setUser } = useAuth();
    const [profilePic, setProfilePic] = useState(user?.profilePic || "");

    useEffect(() => {
        if(user){
            setValue('username', user.username);
            setValue('email', user.email);
            setValue('image', user.profilePic);
            console.log(user);
            setProfilePic(user.profilePic);
        }
    }, [user]);

    const onSubmit = handleSubmit((data) => {
        console.log(data);
        if(user){
            updateUser(user, data);
        }
    });

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        console.log(file);
        if (file) {
            try {
                const res = await updateProfilePic(file);
                console.log(res);
                const data = res.json();
                if (data.profilePic) {
                    setProfilePic(data.profilePic);
                    setUser((prevUser) => ({ ...prevUser, profilePic: data.profilePic }));
                }
                console.log(profilePic);
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className='flex justify-center'>
            <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                {
                    updateErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form onSubmit={onSubmit}>
                <div className="mb-4">
                        <label className="block text-white mb-2">Foto de perfil</label>
                        <input
                            type="file"
                            {...register("image")}
                            onChange={handleImageChange}
                            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
                        />
                        <img src={user.profilePic} alt="Imagen de perfil" className="w-32 h-32 object-cover mt-4 rounded-full" />
                    </div>
                    <input type="text" placeholder="Username" {... register("username", {required: true})} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                    {
                        errors.username && <p className='text-red-500'>Username es obligatorio</p>
                    }
                    <input type="text" placeholder="Email" {... register("email", {required: true})} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
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
                </form>
            </div>
        </div>
        
    )
}

export default ProfilePage