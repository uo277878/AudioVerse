import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom"

function ProfilePage(){
    const {register, handleSubmit, setValue, formState: {errors}} = useForm();
    const {updateUser, errors: updateErrors} = useUsers();
    const { user } = useAuth();

    useEffect(() => {
        if(user){
            setValue('username', user.username);
            setValue('email', user.email);
        }
    }, []);

    const onSubmit = handleSubmit((data) => {
        console.log(data);
        if(user){
            updateUser(user, data);
        }
    });

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