import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserAdminPage(){
    const {register, handleSubmit, setValue, formState: {errors}} = useForm();
    const {updateUser, errors: updateErrors} = useUsers();
    const {getUser} = useUsers();
    const {user} = useAuth();
    const params = useParams();
    const navigate = useNavigate();

    useEffect( () => {
        if(user.role != "admin"){
            navigate("/error");
        }
        async function loadUser(){
            if(params.id){
                const user = await getUser(params.id);
                setValue('username', user.username);
                setValue('email', user.email);
                setValue('rol', user.role);
            }
        }
        loadUser();
    }, []);

    const onSubmit = handleSubmit((data) => {
        if(params.id){
            updateUser(params.id, data);
            navigate("/users/getAllUsers");
        }
    });

    return (
        <div className="flex flex-col md:h-screen md:flex-row justify-center items-center">
            <div className="bg-zinc-800 max-w-xl w-full p-10 rounded-md">
                <h1 className='text-2xl mb-4 font-bold'>Edición del perfil</h1>
                {
                    updateErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form className="flex flex-col items-center mb-4" onSubmit={onSubmit}>
                    <div className="w-full">
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
                        <div className="flex items-center my-2">
                        <p className="mr-2">Rol:</p>
                            <label htmlFor="adminRadio" className="mr-2">Admin</label>
                            <input type="radio" id="adminRadio" value="admin" name="rol" {...register("rol")} />
                            <label htmlFor="userRadio" className="ml-4 mr-2">User</label>
                            <input type="radio" id="userRadio" value="user" name="rol" {...register("rol")} />
                        </div>
                        <div className="flex justify-end">
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

export default UserAdminPage