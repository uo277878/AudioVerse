import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UserPage from '../pages/UserPage'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongContext, SongProvider } from '../context/SongContext'
import { UserContext, UserProvider } from '../context/UserContext'

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '123' }),
    };
});

describe("UserPage", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user',
            songsLiked: [],
            profilePic: '',
            followed: []
		}
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <UserContext.Provider value={{
                        getUser: vi.fn().mockResolvedValue(mockUser),
                        follow: vi.fn(),
                        unfollow: vi.fn(),
                    }}>
                        <SongContext.Provider value={{
                            getTrack: vi.fn(),
                            getToken: vi.fn()
                        }}>
                            <UserPage />
                        </SongContext.Provider>
                    </UserContext.Provider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /Información del perfil/i })).toBeInTheDocument()
	})
})