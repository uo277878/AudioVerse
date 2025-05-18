import { Link } from 'react-router-dom';

function WelcomePage(){
    return (
        <div className="flex flex-col h-screen items-center justify-center text-center gap-8">
            <h1 className="text-5xl font-bold">¡Únete a la comunidad de{" "}
            <span className="text-red-400">AudioVerse</span>!</h1>
            <Link to="/signup" className="bg-red-400 px-6 py-3 rounded-lg text-white text-lg font-semibold">Regístrate</Link>
            <p className='flex gap-x-2 justify-between text-lg'>
                ¿Ya tienes una cuenta? <Link to="/login" className='text-sky-500'>Inicia sesión</Link>
            </p>
        </div>
    )
}

export default WelcomePage