import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Pagination from '../components/Pagination'

describe("Pagination", () => {
	it("Renderiza correctamente", () => {
        render(
            <Pagination 
                itemsPerPage={5}
                currentPage={1}
                setCurrentPage={() => {}}
                totalItems={15}
            />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
	})
})