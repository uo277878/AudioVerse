import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { signup, login, logout } from '../controllers/authcontroller.js';
import User from '../models/user.js';
import Playlist from '../models/playlist.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
	default: {
		hash: vi.fn(async (password) => `hashed-${password}`),
		compare: vi.fn(async (password, hashed) => {
			return hashed === `hashed-${password}`;
		})
	}
}));

vi.mock('../libs/jwt.js', () => ({
	createToken: vi.fn(async ({ id }) => `token-${id}`)
}));

vi.mock('express-validator', () => ({
		validationResult: vi.fn(() => ({
			isEmpty: () => true,
			array: () => []
	}))
}));

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

beforeEach(async () => {
	await User.deleteMany({});
	await Playlist.deleteMany({});
	vi.clearAllMocks();
});

describe("Metodo signup", () => {
	const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			cookie: vi.fn().mockReturnThis()
		};
	it("Debería crear un nuevo usuario y una playlist por defecto", async () => {
		const req = {
			body: {
				username: 'prueba1',
				email: 'prueba1@email.com',
				password: '123456',
				dateBirth: '2001-05-23'
			}
		};

		await signup(req, res);

		expect(res.cookie).toHaveBeenCalledWith('token', expect.stringContaining('token-'));
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				id: expect.any(Object),
				username: 'prueba1',
				email: 'prueba1@email.com',
				role: 'user'
			})
		);

		const user = await User.findOne({ email: 'prueba1@email.com' });
		expect(user).not.toBeNull();

		const playlist = await Playlist.findOne({ creator: user._id });
		expect(playlist).not.toBeNull();
		expect(playlist.name).toBe('Canciones que me gustan');
	});
});

describe("Metodo login", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis()
	};

	it("Debería responder 422 si faltan datos", async () => {
		validationResult.mockReturnValueOnce({
			isEmpty: () => false,
			array: () => [{ msg: 'Email es requerido' }]
		});

		const req = {
			body: {
				email: '',
				password: ''
			}
		};
		
		await login(req, res);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith([{ msg: 'Email es requerido' }]);
	});

	it("Debería responder 200 y devolver datos del usuario si login es correcto", async () => {
		const hashedPassword = await bcrypt.hash('123456', 10);

		const user = new User({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: hashedPassword,
			dateBirth: '2001-05-23',
			role: 'user',
			profilePic: '',
			followed: [],
			songsLiked: []
		});
		await user.save();

		const req = {
			body: {
				email: "prueba1@email.com",
				password: "123456"
			}
		}

		await login(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({username: 'prueba1', email: 'prueba1@email.com'}));
	});
});