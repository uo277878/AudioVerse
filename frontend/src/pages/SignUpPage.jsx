import {useForm} from 'react-hook-form'
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function SignUpPage(){
    const {register, handleSubmit, formState: {errors}} = useForm();
    const {signup, isAuthenticated, errors: registerErrors} = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if(isAuthenticated){
            navigate('/users');
        }
    }, [isAuthenticated])

    const actionSubmit = handleSubmit(async (values) => {
        signup(values);
    })

    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md'>
            <h1 className='text-2xl font-bold'>Registrarse</h1>
                {
                    registerErrors.map((error, i) => (
                        <div className='bg-red-500 p-2 text-white  my-2' key={i}>
                            {error.msg}
                        </div>
                    ))
                }
                <form onSubmit={actionSubmit}>
                    <input type="text" {... register("username", {required: true})} 
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Username'
                    />
                    {
                        errors.username && <p className='text-red-500'>Username es obligatorio</p>
                    }
                    <input type="email" {... register("email", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Email'
                    />
                    {
                        errors.email && <p className='text-red-500'>Email es obligatorio</p>
                    }
                    <input type="password" {... register("password", {required: true})}
                        className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
                        placeholder='Password'
                    />
                    {
                        errors.password && <p className='text-red-500'>Password es obligatoria</p>
                    }
                    <button type="submit">
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