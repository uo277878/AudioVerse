import {check} from 'express-validator';
import moment from 'moment';

const singUpValidatorInsert = [
    check('username', 'El username es necesario').trim().not().isEmpty(),
    check('username', 'El username debe tener 3 o más caracteres').trim().isLength({min: 3}),
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('email', 'El email debe tener 5 o más caracteres').trim().isLength({min: 5}),
    check('password', 'La contraseña es necesaria').trim().not().isEmpty(),
    check('password', 'La contraseña debe tener 5 o más caracteres').trim().isLength({min: 5}),
    check('dateBirth', 'La fecha de nacimiento debe ser una fecha válida').isDate(),
    check('dateBirth', 'La fecha de nacimiento es obligatora').trim().not().isEmpty(),
    check('dateBirth').custom((value, { req }) => {
        const fecha = moment(value, 'YYYY-MM-DD');
        if (!fecha.isValid()) {
            throw new Error('La fecha de nacimiento no es válida');
        }
        const age = moment().diff(fecha, 'years');
        if (age < 16) {
            throw new Error('Debes tener al menos 16 años para registrarte');
        }
        return true;
    })
];

const loginValidator = [
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('password', 'La contraseña es necesaria').trim().not().isEmpty()
]

const updateProfileValidator = [
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('username', 'El nombre de usuario es necesario').trim().not().isEmpty()
]

export const updatePasswordValidator = [
    check("password", "La contraseña actual es obligatoria").not().isEmpty(),
    check("newPassword", "La nueva contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    check("repeatPassword", "Debes confirmar la nueva contraseña").not().isEmpty(),
    check("repeatPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("Las contraseñas no coinciden");
        }
        return true;
    })
];

export {loginValidator, singUpValidatorInsert, updateProfileValidator};