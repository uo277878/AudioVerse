import { useForm } from "react-hook-form";
import { useUsers } from "../context/UserContext";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function ProfilePage(){
    const {register, handleSubmit, setValue} = useForm();
    const {updateUser} = useUsers();
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
                <form onSubmit={onSubmit}>
                    <input type="text" placeholder="Username" {... register("username")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
                    <input type="text" placeholder="Email" {... register("email")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"></input>
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

export default ProfilePage