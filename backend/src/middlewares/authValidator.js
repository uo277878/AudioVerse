import {check} from 'express-validator';
import moment from 'moment';

/**
 * Valida el formulario de creación de un usuario.
 * - El nombre no puede estar vacío y debe tener 3 o más caracteres
 * - El email no puede estar vacío y debe tener 5 o más caracteres
 * - La contraseña es necesaria y debe tener 5 o más caracteres
 * - La fecha de nacimiento es obligatoria y debe ser una fecha válida. 
 *  Además, es obligatorio tener al menos 16 años
 */
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

/**
 * Valida el formulario de incio de sesión de un usuario.
 * - El email no puede estar vacío 
 * - La contraseña es necesaria
 */
const loginValidator = [
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('password', 'La contraseña es necesaria').trim().not().isEmpty()
]

/**
 * Valida el formulario de actualización del perfil de un usuario.
 * - El email no puede estar vacío
 * - La contraseña es necesaria
 */
const updateProfileValidator = [
    check('email', 'El email es necesario').trim().not().isEmpty(),
    check('username', 'El nombre de usuario es necesario').trim().not().isEmpty()
]

/**
 * Valida el formulario de actualzación de la contraseña
 * - La contraseña actual es obligatoria
 * - La nueva contraseña debe tener al menos 6 caracteres
 * - Se debe confirmar la nueva contraseña y ambos campos deben coincidir
 */
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