import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, logout } from '../controllers/authcontroller.js';
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

beforeEach(() => {
    vi.clearAllMocks();
});

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

	it("Debería crear un nuevo usuario y una playlist por defecto", async () => {
		vi.spyOn(User, 'findOne').mockResolvedValue(null);
		vi.spyOn(User.prototype, 'save').mockResolvedValue({
            _id: '123',
            username: req.body.username,
            email: req.body.email,
            role: 'user'
        });
		
		vi.spyOn(Playlist.prototype, 'save').mockResolvedValue({});

		await signup(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            id: '123',
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user'
        }));

        expect(res.status).toHaveBeenCalledWith(200);
        expect(User.findOne).toHaveBeenCalledTimes(2); 
        expect(User.prototype.save).toHaveBeenCalledTimes(1);
        expect(Playlist.prototype.save).toHaveBeenCalledTimes(1);
	});

	it("Debería devolver error si el username ya existe", async () => {
		const req = {
			body: {
				username: 'prueba1',
				email: 'prueba1@email.com',
				password: '123456',
				dateBirth: '2001-05-23'
			}
		};

		User.findOne = vi.fn()
			.mockResolvedValueOnce({ username: 'prueba1' })
			.mockResolvedValueOnce(null); 

		await signup(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ msg: "El nombre de usuario ya existe" });
	});

	it("Debería devolver error si el email ya existe", async () => {
		const req = {
			body: {
				username: 'prueba1',
				email: 'prueba1@email.com',
				password: '123456',
				dateBirth: '2001-05-23'
			}
		};

		User.findOne = vi.fn()
			.mockResolvedValueOnce(null) 
			.mockResolvedValueOnce({ email: 'prueba1@email.com' }); 

		await signup(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ msg: "El email ya existe" });
	});
});

describe("Metodo login", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis()
    };

    const req = {
        body: {
            email: 'prueba1@email.com',
            password: '123456'
        }
    };

    it("Debería loguear correctamente con credenciales válidas", async () => {
        const mockUser = {
            _id: '123',
            username: 'prueba2',
            email: 'prueba2@email.com',
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
            id: '123',
            username: 'prueba2',
            email: 'prueba2@email.com',
            role: 'user',
            profilePic: 'pic-url',
            followed: [],
            songsLiked: [],
            createdAt: '2024-06-29'
        }));
        expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
    });

    it("Debería devolver error si el email no existe", async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: "Credenciales incorrectas" });
    });

    it("Debería devolver error si la contraseña es incorrecta", async () => {
        const mockUser = {
            _id: '123',
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: 'hashed-password'
        };

        vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: "Credenciales incorrectas" });
    });

    it("Debería devolver error de validación si hay errores en los datos", async () => {
        validationResult.mockReturnValueOnce({
            isEmpty: () => false,
            array: () => [{ msg: "Email es requerido" }]
        });

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Email es requerido" }]);
    });

    it("Debería manejar errores internos con status 500", async () => {
        vi.spyOn(User, 'findOne').mockRejectedValue(new Error("Error en la BD"));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error en la BD" });
    });
});

describe("Metodo logout", () => {
    const res = {
        cookie: vi.fn().mockReturnThis(),
        sendStatus: vi.fn().mockReturnThis()
    };

    it("Debería borrar la cookie token y devolver 200", () => {
        const req = {};

        logout(req, res);

        expect(res.cookie).toHaveBeenCalledWith('token', '', {
            expires: expect.any(Date)
        });

        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
});