import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ErrorPage from '../pages/ErrorPage'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { SongProvider } from '../context/SongContext'

describe("ErrorPage", () => {
	it("Renderiza correctamente", () => {
		render(
			<MemoryRouter>
                <AuthProvider>
                    <SongProvider>
                        <ErrorPage />
                    </SongProvider>
                </AuthProvider>
			</MemoryRouter>
		)

		expect(screen.getByRole('heading', { name: /No se puede acceder a esta página/i })).toBeInTheDocument()
	})
})