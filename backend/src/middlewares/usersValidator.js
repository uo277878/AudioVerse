import {check} from 'express-validator';

const searchUserValidator = [
    check('input', 'El texto de búsqueda no puede estar vacío').trim().not().isEmpty(),
]

export {searchUserValidator};