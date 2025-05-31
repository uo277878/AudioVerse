import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import WelcomePage from "./pages/WelcomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import ProtectedRoutes from "./ProtectedRoutes"
import UserAdminPage from "./pages/UserAdminPage"
import ProfilePage from "./pages/ProfilePage"
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
import PlaylistPage from "./pages/PlaylistPage"
import SearchUsersPage from "./pages/SearchUsersPage"
import HomePage from "./pages/HomePage"
import { PostProvider } from "./context/PostContext"
import AuthLayout from "./components/AuthLayout"
import { PlayerProvider } from "./context/PlayerContext";
import PlayerBar from "./components/PlayerBar";

function App(){
  return (
    <SongProvider>
    <PlayerProvider>
      <AuthProvider>
        <UserProvider>
          <PostProvider>
            <BrowserRouter>
              <Routes>
                <Route path='/' element={<WelcomePage/>}/>
                <Route path='/login' element={<LoginPage/>}/>
                <Route path='/signup' element={<SignUpPage/>}/>
                <Route path='/error' element={<ErrorPage/>}/>
                <Route element={<ProtectedRoutes/>}>
                  <Route element={<AuthLayout/>}>
                    <Route path='/home' element={<HomePage/>}/>
                    <Route path='/search' element={<SearchPage/>}/>
                    <Route path='/users/getAllUsers' element={<UsersAdminPage/>}/>
                    <Route path='/users/followed' element={<FollowedPage/>}/>
                    <Route path='/users/profile' element={<ProfilePage/>}/>
                    <Route path='/users/profile/password' element={<UpdatePasswordPage/>}/>
                    <Route path='/users/profile/image' element={<EditProfilePicPage/>}/>
                    <Route path='/users/edit/:id' element={<UserAdminPage/>}/>
                    <Route path='/users/search' element={<SearchUsersPage/>}/>
                    <Route path='/users/:id' element={<UserPage/>}/>
                    <Route path='/playlists/new' element={<CreatePlaylistPage/>}/>
                    <Route path='/playlists/getAllByUser/:id' element={<PlaylistsPage/>}/>
                    <Route path='/playlists/:id' element={<PlaylistPage/>}/>
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </PostProvider>
        </UserProvider>
      </AuthProvider>
    </PlayerProvider>
    </SongProvider>
    
  )
}

export default App