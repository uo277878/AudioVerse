import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WelcomePage from '../pages/WelcomePage'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'

describe("WelcomePage", () => {
	it("Renderiza correctamente", () => {
		render(
			<MemoryRouter>
                <AuthProvider>
                    <SongProvider>
                        <WelcomePage />
                    </SongProvider>
                </AuthProvider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /AudioVerse/i })).toBeInTheDocument()
	})
})