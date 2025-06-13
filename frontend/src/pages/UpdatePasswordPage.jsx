import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { toast, Zoom } from "react-toastify";

function UpdatePasswordPage(){
    const {register, handleSubmit, formState: {errors}} = useForm();
    const {updatePassword, errors: updatePassErrors} = useUsers();
    const { user } = useAuth();

    const onSubmit = handleSubmit(async (data) => {
        if(user){
            const res = await updatePassword(data);
            console.log(res);
            if(res){
                toast.success('Contraseña actualizada con éxito', {
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
            } else{
                toast.error('Se ha producido un error al actualizar la contraseña', {
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
        <div className='flex justify-center'>
            <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                <h1 className='text-2xl mb-4 font-bold'>Edición de contraseña</h1>
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
                    <div className="flex justify-between">
                        <Link to={`/users/profile`} className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                            Cancelar
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

export default UpdatePasswordPage