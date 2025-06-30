import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'
import { PostProvider } from '../context/PostContext'
import UserSearchCard from '../components/UserSearchCard'

describe("UserSearchCard", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user',
            followed: []
		}
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <SongProvider>
                        <UserProvider>
                            <PostProvider>
                                <UserSearchCard userSearch={mockUser} />
                            </PostProvider>
                        </UserProvider>
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByText('prueba1')).toBeInTheDocument();
	})
})