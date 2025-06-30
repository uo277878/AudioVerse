import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlayerPage from '../pages/PlayerPage'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'
import { PlayerProvider } from '../context/PlayerContext'
import { SpotifyProvider } from '../context/SpotifyAuthContext'

describe("PlayerPage", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user'
		}
		render(
			<MemoryRouter>
                <SpotifyProvider>
                    <PlayerProvider>
                        <AuthContext.Provider value={{ user: mockUser }}> 
                            <SongProvider>
                                <UserProvider>
                                    <PlayerPage />
                                </UserProvider>
                            </SongProvider>
                        </AuthContext.Provider>
                    </PlayerProvider>
                </SpotifyProvider>
            </MemoryRouter>
		)

		expect(screen.getByText(/Cargando reproductor.../i)).toBeInTheDocument()
	})
})