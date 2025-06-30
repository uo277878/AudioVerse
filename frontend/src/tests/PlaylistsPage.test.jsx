import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlaylistsPage from '../pages/PlaylistsPage'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'

describe("PlaylistsPage", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user'
		}
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <SongProvider>
                        <UserProvider>
                            <PlaylistsPage />
                        </UserProvider>
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /Biblioteca de playlists/i })).toBeInTheDocument()
	})
})