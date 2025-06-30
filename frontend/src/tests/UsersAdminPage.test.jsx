import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UsersAdminPage from '../pages/UsersAdminPage'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'

describe("UsersAdminPage", () => {
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
                            <UsersAdminPage />
                        </UserProvider>
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /No hay usuarios/i })).toBeInTheDocument()
	})
})