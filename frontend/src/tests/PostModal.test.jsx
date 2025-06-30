import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostModal from '../components/PostModal'

describe("PostModal", () => {
	it("Renderiza correctamente", () => {
		render(
            <PostModal isVisible={true} onClose={() => {}}>
                <div>Contenido del modal</div>
            </PostModal>
        );

        expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
	})
})