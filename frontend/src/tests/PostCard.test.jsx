import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostCard from '../components/PostCard'
import { AuthContext } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'
import { UserProvider } from '../context/UserContext'
import { PostProvider } from '../context/PostContext'

describe("PostCard", () => {
	it("Renderiza correctamente", () => {
        const mockUser = {
			_id: '123',
			username: 'prueba1',
			email: 'prueba1@email.com',
			role: 'user'
		}
        const mockPost = {
			_id: '123',
			user: '1234',
            text: 'Nueva publicación',
            song: '12345',
            item_type: 'song'
		}
		render(
			<MemoryRouter>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <SongProvider>
                        <UserProvider>
                            <PostProvider>
                                <PostCard post={mockPost} />
                            </PostProvider>
                        </UserProvider>
                    </SongProvider>
                </AuthContext.Provider>
			</MemoryRouter>
		)

		expect(screen.getByText('Nueva publicación')).toBeInTheDocument();
	})
})