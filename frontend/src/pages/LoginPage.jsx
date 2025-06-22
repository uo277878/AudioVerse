import {useForm} from 'react-hook-form'
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage(){

    const {register, handleSubmit, formState: {errors}} = useForm();
    const {login, errors: loginErrors, isAuthenticated, user} = useAuth();
    const navigate = useNavigate();

    const actionSubmit = handleSubmit(data => {
        login(data);
    })

    useEffect(() => {
        if(isAuthenticated){
            if(user.role == "admin"){
                navigate("/users/getAllUsers");
            } else{
                navigate("/home")
            }
        }
    }, [isAuthenticated, user])

    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md'>
                <h1 className='text-2xl font-bold'>Iniciar sesión</h1>
                {
                    loginErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form onSubmit={actionSubmit}>
                    <label htmlFor="email" className="sr-only">Email:</label>
                    <input type="email" {... register("email", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Email' id="email"
                    />
                    {
                        errors.email && <p className='text-red-500'>Email es obligatorio</p>
                    }
                    <label htmlFor="password" className="sr-only">Contraseña:</label>
                    <input type="password" {... register("password", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Password' id="password"
                    />
                    {
                        errors.password && <p className='text-red-500'>Password es obligatoria</p>
                    }
                    <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-md my-2">
                        Iniciar sesión
                    </button>
                </form>
                <p className='flex gap-x-2 justify-between'>
                    ¿No tienes una cuenta? <Link to="/signup" className='text-sky-500'>Regístrate</Link>
                </p>
            </div>
        </div>
        
    )
}

export default LoginPage