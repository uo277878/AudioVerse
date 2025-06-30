import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SignUpPage from '../pages/SignUpPage'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'

describe("SignUpPage", () => {
	it("Renderiza correctamente", () => {
		render(
			<MemoryRouter>
				<AuthProvider>
					<SignUpPage />
				</AuthProvider>
			</MemoryRouter>
		)
    
		expect(screen.getByRole('heading', { name: /Registrarse/i })).toBeInTheDocument()
	});
});