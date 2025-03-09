import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import ProtectedRoutes from "./ProtectedRoutes"
import TimeLinePage from "./pages/TimeLinePage"
import UserPage from "./pages/UserPage"
import ProfilePage from "./pages/ProfilePage"
import Navbar from "./components/Navbar"
import { UserProvider } from "./context/UserContext"

function App(){
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
        <Navbar/>
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/signup' element={<SignUpPage/>}/>
            <Route element={<ProtectedRoutes/>}>
              <Route path='/songs' element={<TimeLinePage/>}/>
              <Route path='/users/:id' element={<UserPage/>}/>
              <Route path='/users/profile' element={<ProfilePage/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
    
  )
}

export default App