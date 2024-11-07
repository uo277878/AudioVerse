import {check} from 'express-validator';

const singUpValidatorInsert = [
    check('username', 'El username es necesario').trim().not().isEmpty(),
    check('username', 'El username debe tener 3 o más caracteres').trim().isLength({min: 3}),
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('email', 'El email debe tener 5 o más caracteres').trim().isLength({min: 5}),
    check('password', 'La contraseña es necesaria').trim().not().isEmpty(),
    check('password', 'La contraseña debe tener 5 o más caracteres').trim().isLength({min: 5}),
    check('role', 'Role is required').trim().not().isEmpty()
]

const loginValidator = [
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('password', 'La contraseña es necesaria').trim().not().isEmpty()
]

export {loginValidator, singUpValidatorInsert};