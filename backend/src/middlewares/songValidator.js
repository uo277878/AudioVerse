import {check} from 'express-validator';

/**
 * Valida el texto de búsqueda de una canción
 * - El texto no puede estar vacío
 */
const searchSongValidator = [
    check('input', 'El texto de búsqueda no puede estar vacío').trim().not().isEmpty(),
]

/**
 * Valida el formulario de creación de una playlist
 * - El nombre es necesario
 * - La descripción es necesaria
 */
const createPlaylistValidator = [
    check('name', 'El nombre es necesario').trim().not().isEmpty(),
    check('description', 'La descripción es necesaria').trim().not().isEmpty()
]

export {searchSongValidator, createPlaylistValidator};