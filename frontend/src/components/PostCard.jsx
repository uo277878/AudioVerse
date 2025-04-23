function PostCard({post}){
    return(
        <div className='bg-zinc-800 max-w-xl w-full p-6 rounded-md mt-2'>
            <div className="flex items-center space-x-4">
                <img src={post.user.profilePic} alt="Imagen de perfil" className="w-12 h-12 mt-4 rounded-full border-white border-2 border-opacity-100" />
                <div className="flex flex-col">
                    <p>{post.user.username}</p>
                    <p className="mt-2">{post.text}</p>
                </div>
                
            </div>
        </div>
    );
}

export default PostCard;