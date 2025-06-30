import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, logout, verifyToken } from '../controllers/authcontroller.js';
import User from '../models/user.js';
import Playlist from '../models/playlist.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { createToken } from '../libs/jwt.js';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken');
vi.mock('../models/user.js');
vi.mock('../models/playlist.js');

vi.mock('../libs/jwt.js', () => ({
	createToken: vi.fn(() => 'mocked-token')
}));

vi.mock('bcryptjs', () => ({
	default: {
		hash: vi.fn(async (id) => `token-${id}`),
		compare: vi.fn()
	},
	hash: vi.fn(async (id) => `token-${id}`),
	compare: vi.fn()
}));

vi.mock('express-validator', () => ({
	validationResult: vi.fn(() => ({
		isEmpty: () => true,
		array: () => []
	}))
}));

describe("Metodo signup", () => {
	const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis()
    };

	const req = {
		body: {
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			dateBirth: '2001-05-23'
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("Debería crear un nuevo usuario y una playlist por defecto", async () => {
		vi.spyOn(User, 'findOne').mockResolvedValue(null);
		vi.spyOn(User.prototype, 'save').mockResolvedValue({
            _id: 'user-id',
            username: req.body.username,
            email: req.body.email,
            role: 'user'
        });
		
		vi.spyOn(Playlist.prototype, 'save').mockResolvedValue({});

		await signup(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            id: 'user-id',
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user'
        }));

        expect(User.findOne).toHaveBeenCalledTimes(2); 
        expect(User.prototype.save).toHaveBeenCalledTimes(1);
        expect(Playlist.prototype.save).toHaveBeenCalledTimes(1);
	});

	it('debería devolver error si el username ya existe', async () => {
		const req = {
			body: {
				username: 'prueba',
				email: 'otro@email.com',
				password: '123456',
				dateBirth: '2000-01-01'
			}
		};

		User.findOne = vi.fn()
			.mockResolvedValueOnce({ username: 'prueba' })
			.mockResolvedValueOnce(null); 

		await signup(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ msg: 'El nombre de usuario ya existe' });
	});

	it('debería devolver error si el email ya existe', async () => {
		const req = {
			body: {
				username: 'nuevo',
				email: 'prueba@email.com',
				password: '123456',
				dateBirth: '2000-01-01'
			}
		};

		User.findOne = vi.fn()
			.mockResolvedValueOnce(null) 
			.mockResolvedValueOnce({ email: 'prueba@email.com' }); 

		await signup(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ msg: 'El email ya existe' });
	});
});

describe('Método login', () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis()
    };

    const req = {
        body: {
            email: 'prueba@email.com',
            password: '123456'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Debería loguear correctamente con credenciales válidas', async () => {
        const mockUser = {
            _id: 'user-id',
            username: 'prueba',
            email: 'prueba@email.com',
            password: 'hashed-password',
            role: 'user',
            profilePic: 'pic-url',
            followed: [],
            songsLiked: [],
            createdAt: '2024-06-29'
        };

        vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        await login(req, res);

        expect(res.cookie).toHaveBeenCalledWith('token', 'mocked-token');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            id: 'user-id',
            username: 'prueba',
            email: 'prueba@email.com',
            role: 'user',
            profilePic: 'pic-url',
            followed: [],
            songsLiked: [],
            createdAt: '2024-06-29'
        }));
        expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
    });

    it('Debería devolver error si el email no existe', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales incorrectas' });
    });

    it('Debería devolver error si la contraseña es incorrecta', async () => {
        const mockUser = {
            _id: 'user-id',
            username: 'prueba',
            email: 'prueba@email.com',
            password: 'hashed-password'
        };

        vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales incorrectas' });
    });

    it('Debería devolver error de validación si hay errores en los datos', async () => {
        validationResult.mockReturnValueOnce({
            isEmpty: () => false,
            array: () => [{ msg: 'Email es requerido' }]
        });

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: 'Email es requerido' }]);
    });

    it('Debería manejar errores internos con status 500', async () => {
        vi.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
});

describe('Método logout', () => {
    const res = {
        cookie: vi.fn().mockReturnThis(),
        sendStatus: vi.fn().mockReturnThis()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('✔️ Debería borrar la cookie token y devolver 200', () => {
        const req = {};

        logout(req, res);

        expect(res.cookie).toHaveBeenCalledWith('token', '', {
            expires: expect.any(Date)
        });

        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
});

describe('Método verifyToken', () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    };

    const req = {
        cookies: {
            token: 'mocked-token'
        }
    };

    const mockUserData = {
        _id: 'user-id',
        username: 'prueba',
        email: 'prueba@email.com',
        role: 'user',
        profilePic: 'pic-url',
        followed: [],
        songsLiked: [],
        createdAt: '2024-06-29'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('✔️ Debería devolver datos del usuario si el token es válido', async () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, { id: 'user-id' });
        });

        vi.spyOn(User, 'findById').mockResolvedValue(mockUserData);

        await verifyToken(req, res);

        expect(jwt.verify).toHaveBeenCalledWith(
            'mocked-token',
            process.env.TOKEN_SECRET,
            expect.any(Function)
        );

        expect(User.findById).toHaveBeenCalledWith('user-id');

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            id: 'user-id',
            username: 'prueba',
            email: 'prueba@email.com',
            role: 'user'
        }));
    });

    it('❌ Debería devolver 401 si no hay token', async () => {
        const reqWithoutToken = { cookies: {} };

        await verifyToken(reqWithoutToken, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('❌ Debería devolver 401 si el token es inválido', async () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        await verifyToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('❌ Debería devolver 401 si el usuario no se encuentra', async () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, { id: 'user-id' });
        });

        vi.spyOn(User, 'findById').mockResolvedValue(null);

        await verifyToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Unauthorized' });
    });
});