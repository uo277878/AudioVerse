import {useForm} from 'react-hook-form'
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function SignUpPage(){
    const {register, handleSubmit, formState: {errors}} = useForm();
    const {signup, isAuthenticated, errors: registerErrors, user} = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if(isAuthenticated){
            if(user.role == "admin"){
                navigate("/users/getAllUsers");
            } else{
                navigate("/home")
            }
        }
    }, [isAuthenticated, user])

    const actionSubmit = handleSubmit(async (values) => {
        signup(values);
    })

    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md'>
            <h1 className='text-2xl font-bold'>Registrarse</h1>
                {
                    registerErrors.map((error, i) => (
                        <div className='bg-red-600 p-2 text-white  my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form onSubmit={actionSubmit}>
                    <label htmlFor="username" className="sr-only">Email:</label>
                    <input type="text" {... register("username", {required: true})} 
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Username' id="username"
                    />
                    {
                        errors.username && <p className='text-red-600'>Username es obligatorio</p>
                    }
                    <label htmlFor="email" className="sr-only">Email:</label>
                    <input type="email" {... register("email", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Email' id="email"
                    />
                    {
                        errors.email && <p className='text-red-600'>Email es obligatorio</p>
                    }
                    <label htmlFor="date" className="sr-only">Email:</label>
                    <input type="date" {... register("dateBirth", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Fecha de nacimiento' id="date"
                    />
                    {
                        errors.dateBirth && <p className='text-red-600'>Fecha de nacimiento es obligatoria</p>
                    }
                    <label htmlFor="password" className="sr-only">Email:</label>
                    <input type="password" {... register("password", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Password' id="password"
                    />
                    {
                        errors.password && <p className='text-red-600'>Password es obligatoria</p>
                    }
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md my-2">
                        Registrarse
                    </button>
                </form>
                <p className='flex gap-x-2 justify-between'>
                    ¿Tienes una cuenta? <Link to="/login" className='text-sky-500'>Inicia sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default SignUpPage