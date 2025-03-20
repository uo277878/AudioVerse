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
import UpdatePasswordPage from "./pages/UpdatePasswordPage"
import EditProfilePicPage from "./pages/EditProfilePicPage"
import UsersAdminPage from "./pages/UsersAdminPage"

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
              <Route path='/users/getAllUsers' element={<UsersAdminPage/>}/>
              <Route path='/users/:id' element={<UserPage/>}/>
              <Route path='/users/profile' element={<ProfilePage/>}/>
              <Route path='/users/profile/password' element={<UpdatePasswordPage/>}/>
              <Route path='/users/profile/image' element={<EditProfilePicPage/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
    
  )
}

export default App