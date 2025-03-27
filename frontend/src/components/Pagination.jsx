import React from "react";

function Pagination({itemsPerPage, currentPage, setCurrentPage, totalItems}){
    
    const pageNumbers = [];

    for(let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++){
        pageNumbers.push(i);
    }

    return (
        <div className="flex items-center justify-center">
            {
                pageNumbers.map((page, index) => {
                    return <button key={index} onClick={() => setCurrentPage(page)} className={page == currentPage ? "border-white border-2 border-opacity-100 mx-4 px-4 py-2 bg-red-400 text-black font-bold" : "border-white border-2 border-opacity-100 mx-4 px-4 py-2"}>{page}</button>
                })
            }
        </div>
    );
}

export default Pagination;