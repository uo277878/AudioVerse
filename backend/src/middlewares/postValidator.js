import {check} from 'express-validator';

const createPostValidator = [
    check('input', 'El texto del post no puede estar vacío').trim().not().isEmpty(),
]

export {createPostValidator};