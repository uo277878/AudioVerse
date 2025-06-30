import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'
import { PostProvider } from '../context/PostContext'

describe("Navbar", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user'
		}
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true, logout: () => {} }}>
                    <SongProvider>
                        <PostProvider>
                            <UserProvider>
                                <Navbar />
                            </UserProvider>
                        </PostProvider>
                        
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByText('Mis seguidos')).toBeInTheDocument();
	})
})