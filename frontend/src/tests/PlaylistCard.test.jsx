import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlaylistCard from '../components/PlaylistCard'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'

describe("PlaylistCard", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user'
		}
        const mockPlaylist = {
			_id: '123',
			name: 'Mi playlist de prueba',
			description: 'description',
            pic: '', 
			songs: [{ id: 1 }, { id: 2 }, { id: 3 }], 
			creator: '12',
			followedBy: []
		}
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <SongProvider>
                        <UserProvider>
                            <PlaylistCard playlist={mockPlaylist} />
                        </UserProvider>
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByText('Mi playlist de prueba')).toBeInTheDocument();
	})
})