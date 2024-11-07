import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"

function App(){
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<h1>Home</h1>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignUpPage/>}/>
        <Route path='/users' element={<h1>Listado de usuarios</h1>}/>
        <Route path='/add-user' element={<h1>Añadir usuario</h1>}/>
        <Route path='/users/:id' element={<h1>Usuario</h1>}/>
        <Route path='/profile' element={<h1>Mi perfil</h1>}/>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    
  )
}

export default App