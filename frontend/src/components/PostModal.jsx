import React from "react";

const PostModal = ({isVisible, onClose, children}) => {
    if(!isVisible) return null;

    const handleClose = (e) => {
        if(e.target.id === "wrapper"){
            onClose();
        }
    }

    return (
        <div id="wrapper" className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
            onClick={handleClose}>
            <div className="w-[600px] flex flex-col">
                <div className="bg-zinc-800 p-2 rounded">
                    <div className="flex justify-end mb-2">
                        <button className="text-white text-xl" onClick={() => onClose()}>X</button>
                    </div>
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostModal;