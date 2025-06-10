import {check} from 'express-validator';

const createPostValidator = [
    check('text', 'El texto del post no puede estar vacío').trim().not().isEmpty(),
]

export {createPostValidator};