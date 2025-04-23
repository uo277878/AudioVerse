import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";

function UpdatePasswordPage(){
    const {register, handleSubmit, formState: {errors}} = useForm();
    const {updatePassword, errors: updatePassErrors} = useUsers();
    const { user } = useAuth();

    const onSubmit = handleSubmit((data) => {
        if(user){
            updatePassword(data);
        }
    });

    return (
        <div className='flex justify-center'>
            <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                {
                    updatePassErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form onSubmit={onSubmit}>
                    <input type="password" placeholder="Password" {... register("password", {required: true})} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                    {
                        errors.password && <p className='text-red-500'>La contraseña es obligatoria</p>
                    }
                    <input type="password" placeholder="Nueva password" {... register("newPassword", {required: true})} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                    {
                        errors.newPassword && <p className='text-red-500'>La nueva contraseña es obligatoria</p>
                    }
                    <input type="password" placeholder="Repita la password" {... register("repeatPassword", {required: true})} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                    {
                        errors.repeatPassword && <p className='text-red-500'>Es necesario repetir la nueva contraseña</p>
                    }
                    <div className="flex justify-end">
                        <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
    )
}

export default UpdatePasswordPage