import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlaylistModal from '../components/PlaylistModal'

describe("PlaylistModal", () => {
	it("Renderiza correctamente", () => {
		render(
            <PlaylistModal isVisible={true} onClose={() => {}}>
                <div>Contenido del modal</div>
            </PlaylistModal>
        );

        expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
	})
})