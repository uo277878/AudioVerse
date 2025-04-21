import { useAuth } from "../context/AuthContext";

function HomePage(){
    const {user} = useAuth();
    console.log(user);
    return (
        <div className='flex items-center justify-center'>
            <div className='bg-zinc-800 max-w-xl w-full p-6 rounded-md'>
                <div className="flex items-center space-x-3">
                    <img src={user.profilePic} alt="Imagen de perfil" className="w-12 h-12 mt-4 rounded-full border-white border-2 border-opacity-100" />
                    <textarea id="mensajePost" rows="4" className="resize-none p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="¿En qué estás pensando?"></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-rose-500 text-white px-4 py-2 mt-4 rounded-md">
                        Guardar
                    </button>    
                </div>
            </div>
        </div>
            
    )
}

export default HomePage;