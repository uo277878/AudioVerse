import {check} from 'express-validator';

const searchSongValidator = [
    check('input', 'El texto de búsqueda no puede estar vacío').trim().not().isEmpty(),
]

const createPlaylistValidator = [
    check('name', 'El nombre es necesario').trim().not().isEmpty(),
    check('description', 'La descripción es necesaria').trim().not().isEmpty()
]

export {searchSongValidator, createPlaylistValidator};