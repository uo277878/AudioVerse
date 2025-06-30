import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoginPage from '../pages/LoginPage'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'

describe("LoginPage", () => {
	it("Renderiza correctamente", () => {
		render(
			<MemoryRouter>
				<AuthProvider>
					<LoginPage />
				</AuthProvider>
			</MemoryRouter>
		)
    
		expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
	});
});