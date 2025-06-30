import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FollowedPage from '../pages/FollowedPage'
import { AuthContext } from '../context/AuthContext'
import { UserContext } from '../context/UserContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'

describe("FollowedPage", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user',
			followed: []
		}
		const getFollowedUsers = vi.fn(async () => {
			return { followed: [] } 
		}); 
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <SongProvider>
                        <UserContext.Provider value={{ getFollowedUsers: getFollowedUsers }}>
                            <FollowedPage />
                        </UserContext.Provider>
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /Personas a las que sigues/i })).toBeInTheDocument()
	})
})