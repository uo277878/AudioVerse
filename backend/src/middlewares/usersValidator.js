import {check} from 'express-validator';

/**
 * Valida el texto de búsqueda de un usuario
 * - El texto no puede estar vacío
 */
const searchUserValidator = [
    check('input', 'El texto de búsqueda no puede estar vacío').trim().not().isEmpty(),
]

export {searchUserValidator};