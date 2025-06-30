import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SongCard from '../components/SongCard'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'
import { PostProvider } from '../context/PostContext'

describe("SongCard", () => {
    it("Renderiza correctamente", () => {
        const mockUser = {
            _id: '123',
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user',
        }

        const mockSong = {
            id: '123',
            name: 'Canción de prueba',
            type: 'track',
            images: [{ url: 'https://test.image/song.jpg' }],
            album: { images: [{ url: 'https://test.image/album.jpg' }] },
            popularity: 50,
            uri: 'spotify:track:123',
        }

        const likedSongs = []

        render(
            <MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <SongProvider>
                        <UserProvider>
                            <PostProvider>
                                <SongCard song={mockSong} likedSongs={likedSongs} text={null} />
                            </PostProvider>
                        </UserProvider>
                    </SongProvider>
                </AuthContext.Provider>
            </MemoryRouter>
        )

        expect(screen.getByText('Canción de prueba')).toBeInTheDocument()
    })
})