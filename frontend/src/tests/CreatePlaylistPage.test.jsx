import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CreatePlaylistPage from '../pages/CreatePlaylistPage'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'

describe("CreatePlaylistPage", () => {
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
                        <CreatePlaylistPage />
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /Crea una playlist/i })).toBeInTheDocument()
	})
})