import {check} from 'express-validator';

/**
 * Valida el formulario de creación de un post
 * - El texto no puede estar vacío
 */
const createPostValidator = [
    check('text', 'El texto del post no puede estar vacío').trim().not().isEmpty(),
]

export {createPostValidator};