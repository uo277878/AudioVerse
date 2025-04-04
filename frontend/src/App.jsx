import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import ProtectedRoutes from "./ProtectedRoutes"
import TimeLinePage from "./pages/TimeLinePage"
import UserAdminPage from "./pages/UserAdminPage"
import ProfilePage from "./pages/ProfilePage"
import Navbar from "./components/Navbar"
import { UserProvider } from "./context/UserContext"
import UpdatePasswordPage from "./pages/UpdatePasswordPage"
import EditProfilePicPage from "./pages/EditProfilePicPage"
import UsersAdminPage from "./pages/UsersAdminPage"
import ErrorPage from "./pages/ErrorPage"
import SearchPage from "./pages/SearchPage"
import { SongProvider } from "./context/SongContext"
import CreatePlaylistPage from "./pages/CreatePlaylistPage"
import PlaylistsPage from "./pages/PlaylistsPage"
import FollowedPage from "./pages/FollowedPage"
import UserPage from "./pages/UserPage"

function App(){
  return (
    <AuthProvider>
      <UserProvider>
        <SongProvider>
          <BrowserRouter>
          <Navbar/>
            <Routes>
              <Route path='/' element={<HomePage/>}/>
              <Route path='/login' element={<LoginPage/>}/>
              <Route path='/signup' element={<SignUpPage/>}/>
              <Route path='/error' element={<ErrorPage/>}/>
              <Route element={<ProtectedRoutes/>}>
                <Route path='/songs' element={<TimeLinePage/>}/>
                <Route path='/search' element={<SearchPage/>}/>
                <Route path='/users/getAllUsers' element={<UsersAdminPage/>}/>
                <Route path='/users/followed' element={<FollowedPage/>}/>
                <Route path='/users/profile' element={<ProfilePage/>}/>
                <Route path='/users/profile/password' element={<UpdatePasswordPage/>}/>
                <Route path='/users/profile/image' element={<EditProfilePicPage/>}/>
                <Route path='/users/edit/:id' element={<UserAdminPage/>}/>
                <Route path='/users/:id' element={<UserPage/>}/>
                <Route path='/playlists/new' element={<CreatePlaylistPage/>}/>
                <Route path='/playlists/getAll' element={<PlaylistsPage/>}/>
              </Route>
            </Routes>
          </BrowserRouter>
        </SongProvider>
      </UserProvider>
    </AuthProvider>
    
  )
}

export default App