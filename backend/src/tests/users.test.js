import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/user.js';
import Post from '../models/post.js';
import Playlist from '../models/playlist.js';
import { getUsers, createUser, getUser, updateProfile, updateUser, updatePassword, getFollowedUsers, 
    deleteUser, profile, passwordPage, searchUser, followUser, unfollowUser, likeSong, dislikeSong, getLikedSongs } from '../controllers/userscontroller.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

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
    await Post.deleteMany({});
    await User.deleteMany({});
    vi.clearAllMocks();
});

describe("Metodo getUsers", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };
	it("Debería devolver la lista de usuarios", async () => {
		await User.create([
			{ username: 'prueba1', email: 'prueba1@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user' },
			{ username: 'prueba2', email: 'prueba2@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user' }
		]);

		const req = {};

		await getUsers(req, res);

		expect(res.json).toHaveBeenCalled();
		const users = res.json.mock.calls[0][0];
		expect(users).toHaveLength(2);
        const usernames = users.map(u => u.username);
		expect(usernames).toContain('prueba1');
        expect(usernames).toContain('prueba2');
	});

	it("Debería devolver error 500 si falla la consulta", async () => {
		const originalFind = User.find;
		User.find = vi.fn(() => { throw new Error('DB error'); });

		const req = {};

		await getUsers(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });

		User.find = originalFind;
	});
});

describe("Metodo createUser", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };
	it("Debería crear un usuario y devolverlo en la respuesta", async () => {
		const req = {
			body: {
				username: 'prueba1',
				email: 'prueba1@email.com',
				password: '123456',
				role: 'user',
				dateBirth: '2001-05-23'
		    }
		};

		await createUser(req, res);

		expect(res.json).toHaveBeenCalled();
		const respuesta = res.json.mock.calls[0][0];
		expect(respuesta).toHaveProperty('newUser');
		expect(respuesta.newUser).toHaveProperty('username', 'prueba1');
		expect(respuesta.newUser).toHaveProperty('email', 'prueba1@email.com');

		expect(respuesta.newUser.password).not.toBe('123456');
	});

	it("Debería manejar errores y responder con status 500", async () => {
		const originalSave = User.prototype.save;
		User.prototype.save = vi.fn(() => { throw new Error("Error de prueba"); });

		const req = {
			body: {
				username: 'userErr',
				email: 'error@email.com',
				password: '123456',
				role: 'user',
				dateBirth: '2001-05-23'
			}
		};

		const res = {
			json: vi.fn(),
			status: vi.fn().mockReturnThis()
		};

		await createUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Error de prueba" });

		User.prototype.save = originalSave;
	});
});

describe("Metodo getUser", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };

	it("Debería devolver un usuario si existe", async () => {
		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = { params: { id: user._id.toString() } };

		await getUser(req, res);

		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			username: 'prueba1',
			email: 'prueba1@email.com'
		}));
	});

	it("Debería responder 404 si el usuario no existe", async () => {
		const idInexistente = new mongoose.Types.ObjectId();

		const req = { params: { id: idInexistente.toString() } };

		await getUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

	it("Debería responder 404 si el id no es válido o hay un error", async () => {
		const req = { params: { id: 'idInvalido' } };

		await getUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

});

describe("Metodo updateProfile", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis()
	};

	it("Debería actualizar el perfil correctamente", async () => {
		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			user: { id: user._id },
			body: {
				username: 'prueba2',
				email: 'prueba2@email.com'
			}
		};

		await updateProfile(req, res);

		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			username: 'prueba2',
			email: 'prueba2@email.com'
		}));
	});

	it("Debería devolver error si el username ya existe", async () => {
		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const user2 = await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			user: { id: user1._id },
			body: {
				username: 'prueba2',
				email: 'prueba3@email.com'
			}
		};

		await updateProfile(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ msg: "Nombre de usuario no disponible" });
	});

	it("Debería devolver error si el email ya existe", async () => {
		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const user2 = await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			user: { id: user1._id },
			body: {
				username: 'prueba3',
				email: 'prueba2@email.com' 
			}
		};

		await updateProfile(req, res);

		expect(res.status).toHaveBeenCalledWith(402);
		expect(res.json).toHaveBeenCalledWith({ msg: "Email no disponible" });
	});

	it("Debería devolver error 422 si hay errores de validación", async () => {
		validationResult.mockReturnValueOnce({
			isEmpty: () => false,
			array: () => [{ msg: "Email inválido" }]
		});

		const req = {
			user: { id: 'id' },
			body: {}
		};

		await updateProfile(req, res);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith([{ msg: "Email inválido" }]);
	});

	it("Debería devolver error 404 si el usuario no existe", async () => {
		const req = {
			user: { id: new mongoose.Types.ObjectId() },
			body: {
				username: 'prueba1',
				email: 'prueba1@email.com'
			}
		};

		await updateProfile(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

});

describe("Metodo updateUser", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis()
	};

	it("Debería actualizar el perfil correctamente", async () => {
		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: user._id },
			body: {
				username: 'prueba2',
				email: 'prueba2@email.com'
			}
		};

		await updateUser(req, res);

		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			username: 'prueba2',
			email: 'prueba2@email.com'
		}));
	});

	it("Debería devolver error si el username ya existe", async () => {
		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const user2 = await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: user1._id },
			body: {
				username: 'prueba2',
				email: 'prueba3@email.com'
			}
		};

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ msg: "Nombre de usuario no disponible" });
	});

	it("Debería devolver error si el email ya existe", async () => {
		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const user2 = await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: user1._id },
			body: {
				username: 'prueba3',
				email: 'prueba2@email.com' 
			}
		};

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(402);
		expect(res.json).toHaveBeenCalledWith({ msg: "Email no disponible" });
	});

	it("Debería devolver error 422 si hay errores de validación", async () => {
		validationResult.mockReturnValueOnce({
			isEmpty: () => false,
			array: () => [{ msg: "El email no es válido" }]
		});

		const req = {
			params: { id: 'id' },
			body: {}
		};

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith([{ msg: "El email no es válido" }]);
	});

	it("Debería devolver error 404 si el usuario no existe", async () => {
		const req = {
			params: { id: new mongoose.Types.ObjectId() },
			body: {
				username: 'prueba1',
				email: 'prueba1@email.com'
			}
		};

		await updateUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});
});

describe("Metodo updatePassword", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	it("Debería actualizar la contraseña correctamente", async () => {
		const passwordOriginal = await bcrypt.hash('123456', 10);

		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: passwordOriginal,
			role: 'user',
			dateBirth: '2001-05-23'
		});

		validationResult.mockReturnValueOnce({
			isEmpty: () => true,
		});

		const req = {
			user: { id: user._id },
			body: {
				password: '123456',
				newPassword: 'nueva123'
			},
		};

		await updatePassword(req, res);

		const updatedUser = await User.findById(user._id);

		const isMatch = await bcrypt.compare('nueva123', updatedUser.password);

		expect(isMatch).toBe(true);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			username: 'prueba1',
			email: 'prueba1@email.com',
		}));
	});

	it("Debería devolver error si la contraseña actual es incorrecta", async () => {
		const passwordOriginal = await bcrypt.hash('123456', 10);

		const user = await User.create({
			username: 'prueba1',
			email: 'prueba@email.com',
			password: passwordOriginal,
			role: 'user',
			dateBirth: '2001-05-23'
		});

		validationResult.mockReturnValueOnce({
			isEmpty: () => true,
		});

		const req = {
			user: { id: user._id },
			body: {
				password: 'incorrecta',
				newPassword: 'nueva123'
			},
		};

		await updatePassword(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ msg: "La contraseña actual es incorrecta" });
    });

	it("Debería devolver error si el usuario no existe", async () => {
		validationResult.mockReturnValueOnce({
			isEmpty: () => true,
		});

		const req = {
			user: { id: new mongoose.Types.ObjectId() },
			body: {
				password: '123456',
				newPassword: 'nueva123'
			},
		};

		await updatePassword(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

	it("Debería devolver error 422 si hay errores de validación", async () => {
		validationResult.mockReturnValueOnce({
			isEmpty: () => false,
			array: () => [{ msg: "El password es requerido" }],
		});

		const req = {
			user: { id: 'id' },
			body: {},
		};

		await updatePassword(req, res);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith([{ msg: "El password es requerido" }]);
	});
});

describe("Metodo getFollowedUsers", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

	it("Debería devolver la lista de usuarios seguidos", async () => {
		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const user2 = await User.create({
			username: 'user2',
			email: 'user2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
		});

		const user3 = await User.create({
			username: 'user3',
			email: 'user3@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2000-01-01'
		});

		user1.followed = [user2._id, user3._id];
		await user1.save();

		const req = {
			params: { id: user1._id },
		};

		await getFollowedUsers(req, res);

		expect(res.json).toHaveBeenCalledWith({
			followed: expect.arrayContaining([
				expect.objectContaining({ _id: user2._id }),
				expect.objectContaining({ _id: user3._id }),
			]),
		});
	});

	it("Debería devolver error 404 si el usuario no existe", async () => {
		const req = {
			params: { id: new mongoose.Types.ObjectId() },
		};

		await getFollowedUsers(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

	it("Debería devolver error 500 si ocurre un error en la base de datos", async () => {
		const req = {
			params: { id: 'id' },
		};

		await getFollowedUsers(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});
});

describe("Metodo deleteUser", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		sendStatus: vi.fn().mockReturnThis(),
	};

	it("Debería eliminar un usuario correctamente", async () => {
		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: user._id },
		};

		await deleteUser(req, res);

		const userExists = await User.findById(user._id);
		expect(userExists).toBeNull();
		expect(res.sendStatus).toHaveBeenCalledWith(204);
	});

	it("Debería devolver error 404 si el usuario no existe", async () => {
		const req = {
			params: { id: new mongoose.Types.ObjectId() },
		};

		await deleteUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

	it("Debería devolver error 404 si ocurre un error (ID inválido)", async () => {
		const req = {
			params: { id: 'id' },
		};

		await deleteUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});
});

describe("Metodo profile", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	it("Debería devolver el perfil del usuario correctamente", async () => {
		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-01-23'
		});

		const req = {
			user: { id: user._id },
		};

		await profile(req, res);

		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			id: user._id,
			username: 'prueba1',
			email: 'prueba1@email.com'
		}));
	});

	it("Debería devolver error 404 si el usuario no existe", async () => {
		const req = {
			user: { id: new mongoose.Types.ObjectId() },
		};

		await profile(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

	it("Debería devolver error 500 si ocurre un error en la base de datos", async () => {
		const req = {
			user: { id: 'id' },
		};

		await profile(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener el perfil" });
	});
});

describe("Metodo passwordPage", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	it("Debería devolver correctamente los datos del usuario con la contraseña", async () => {
		const user = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			user: { id: user._id },
		};

		await passwordPage(req, res);

		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			id: user._id,
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user'
		}));
	});

	it("Debería devolver error 404 si el usuario no existe", async () => {
		const req = {
			user: { id: new mongoose.Types.ObjectId() },
		};

		await passwordPage(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});

	it("Debería devolver error 500 si ocurre un error en la base de datos", async () => {
		const req = {
			user: { id: 'id' },
		};

		await passwordPage(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener el perfil" });
	});
});

describe("Metodo searchUser", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	it("Debería devolver los usuarios que coincidan con la búsqueda", async () => {
		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		await User.create({
			username: 'prueba3',
			email: 'prueba3@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			body: {
				input: 'prueba',
				orderBy: '',
				userAuth: { id: user1._id }
			}
		};

		await searchUser(req, res);

		const response = res.json.mock.calls[0][0].users;

		expect(response.length).toBe(2);
	});

	it("Debería ordenar los usuarios por matches en canciones", async () => {
		const songId = new mongoose.Types.ObjectId();

		const user1 = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
			songsLiked: [songId]
		});

		await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
			songsLiked: [songId] 
		});

		await User.create({
			username: 'prueba3',
			email: 'prueba3@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
			songsLiked: [] 
		});

		const req = {
			body: {
				input: 'prueba',
				orderBy: 'matches',
 				userAuth: { id: user1._id }
			}
		};

		await searchUser(req, res);

		const response = res.json.mock.calls[0][0].users;

		expect(response.length).toBe(2);
		expect(response[0].username).toBe('prueba2');
		expect(response[1].username).toBe('prueba3');
		expect(response[0].matchCount).toBeGreaterThanOrEqual(response[1].matchCount);
	});

	it("Debería devolver error 422 si hay errores de validación", async () => {
		validationResult.mockReturnValueOnce({
			isEmpty: () => false,
			array: () => [{ msg: "Input inválido" }]
		});

		const req = {
			body: {
				input: '',
				orderBy: '',
				userAuth: { id: 'id' }
			}
		};

		await searchUser(req, res);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith([{ msg: "Input inválido" }]);
	});
});

describe("Metodo followUser", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	it("Debería permitir seguir a un usuario correctamente", async () => {
		const userToFollow = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const authUser = await User.create({
			username: 'usuarioAuth',
			email: 'auth@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: userToFollow._id },
			body: { user: { id: authUser._id } },
		};

		await followUser(req, res);

		const updatedAuthUser = await User.findById(authUser._id);

		expect(updatedAuthUser.followed).toContainEqual(userToFollow._id);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			authUser: expect.objectContaining({
				_id: authUser._id,
				followed: expect.arrayContaining([userToFollow._id])
			})
		}));
	});

	it("No debería duplicar la relación si ya lo sigue", async () => {
		const userToFollow = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const authUser = await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
			followed: [userToFollow._id]
		});

		const req = {
			params: { id: userToFollow._id },
			body: { user: { id: authUser._id } },
		};

		await followUser(req, res);

		const updatedAuthUser = await User.findById(authUser._id);

		expect(updatedAuthUser.followed.length).toBe(1);
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("Debería devolver error 404 si el usuario a seguir no existe", async () => {
		const authUser = await User.create({
			username: 'usuarioAuth',
			email: 'auth@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: new mongoose.Types.ObjectId() }, 
			body: { user: { id: authUser._id } },
		};

		await followUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'Usuario a seguir no encontrado' });
	});

	it("Debería devolver error 500 si ocurre un problema en la base de datos", async () => {
		const req = {
			params: { id: 'id1' }, 
			body: { user: { id: 'id2' } },
		};

		await followUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "No se ha podido seguir a este usuario" });
	});
});

describe("Metodo unfollowUser", () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	it("Debería dejar de seguir a un usuario correctamente", async () => {
		const userToUnfollow = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const authUser = await User.create({
			username: 'prueba2',
			email: 'prueba2@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
			followed: [userToUnfollow._id],
		});

		const req = {
			params: { id: userToUnfollow._id },
			body: { user: { id: authUser._id } },
		};

		await unfollowUser(req, res);

		const updatedAuthUser = await User.findById(authUser._id);

		expect(updatedAuthUser.followed).not.toContainEqual(userToUnfollow._id);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
			authUser: expect.objectContaining({
				_id: authUser._id,
				followed: [],
			})
		}));
	});

	it("No debería fallar si el usuario no está en la lista de seguidos", async () => {
		const userToUnfollow = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const authUser = await User.create({
			username: 'usuarioAuth',
			email: 'auth@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23',
			followed: [], 
		});

		const req = {
			params: { id: userToUnfollow._id },
			body: { user: { id: authUser._id } },
		};

		await unfollowUser(req, res);

		const updatedAuthUser = await User.findById(authUser._id);

		expect(updatedAuthUser.followed).toEqual([]);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalled();
	});

	it("Debería devolver error 404 si el usuario a dejar de seguir no existe", async () => {
		const authUser = await User.create({
			username: 'prueba1',
			email: 'prueba1@email.com',
			password: '123456',
			role: 'user',
			dateBirth: '2001-05-23'
		});

		const req = {
			params: { id: new mongoose.Types.ObjectId() }, 
			body: { user: { id: authUser._id } },
		};

		await unfollowUser(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario a dejar de seguir no encontrado" });
	});

	it("Debería devolver error 500 si ocurre un problema en la base de datos", async () => {
		const req = {
			params: { id: 'id' }, 
			body: { user: { id: 'id2' } },
		};

		await unfollowUser(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "No se ha podido dejar de seguir a este usuario" });
	});
});

describe("Metodo likeSong", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    it("Debería darle like a una canción correctamente", async () => {
        const songId = '1234';

        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23',
            songsLiked: [],
        });

        const playlist = await Playlist.create({
            name: "Canciones que me gustan",
            description: "Playlist que guarda todas las canciones que me gustan",
            creator: user._id,
			pic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png",
            songs: []
        });

        const req = {
            body: {
                user: { id: user._id },
                id: songId
            }
        };

        await likeSong(req, res);

        const updatedUser = await User.findById(user._id);
        const updatedPlaylist = await Playlist.findById(playlist._id);

        expect(updatedUser.songsLiked).toContain(songId);
        expect(updatedPlaylist.songs.some(s => s.songId === songId)).toBe(true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            user: expect.objectContaining({
                _id: user._id,
                songsLiked: expect.arrayContaining([songId])
            })
        }));
    });

    it("No debería duplicar si ya tiene la canción en liked", async () => {
        const songId = '1234';

        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23',
            songsLiked: [songId],
        });

        const playlist = await Playlist.create({
            name: "Canciones que me gustan",
			description: "Playlist que guarda todas las canciones que me gustan",
            creator: user._id,
			pic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png",
            songs: [{ songId, text: "", likedBy: [] }]
        });

        const req = {
            body: {
                user: { id: user._id },
                id: songId
            }
        };

        await likeSong(req, res);

        const updatedUser = await User.findById(user._id);
        const updatedPlaylist = await Playlist.findById(playlist._id);

        expect(updatedUser.songsLiked.filter(s => s === songId).length).toBe(1);
        expect(updatedPlaylist.songs.filter(s => s.songId === songId).length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalled();
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        const req = {
            body: {
                user: { id: new mongoose.Types.ObjectId() },
                id: '1234'
            }
        };

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 404 si la playlist no existe", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23',
            songsLiked: []
        });

        const req = {
            body: {
                user: { id: user._id },
                id: '1234'
            }
        };

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist 'Canciones que me gustan' no encontrada" });
    });
});

describe("Metodo dislikeSong", () => {
    const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
    };

    it("Debería eliminar correctamente el like de una canción", async () => {
        const songId = '1234';

        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23',
            songsLiked: [songId],
        });

        const playlist = await Playlist.create({
            name: "Canciones que me gustan",
			description: "Playlist que guarda todas las canciones que me gustan",
            creator: user._id,
			pic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png",
            songs: [{ songId, text: "", likedBy: [] }]
        });

        const req = {
            body: {
                user: { id: user._id },
                id: songId,
            },
        };

        await dislikeSong(req, res);

		const updatedUser = await User.findById(user._id);
        const updatedPlaylist = await Playlist.findById(playlist._id);

        expect(updatedUser.songsLiked).not.toContain("1234");
        expect(updatedPlaylist.songs.length).toBe(0);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("No debería hacer nada si el usuario no tiene la canción en songsLiked", async () => {
		const songId = '1234';

        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23'
        });

        const playlist = await Playlist.create({
            name: "Canciones que me gustan",
			description: "Playlist que guarda todas las canciones que me gustan",
            creator: user._id,
			pic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png",
            songs: [{ songId, text: "", likedBy: [] }]
        });

        const req = {
            body: {
                user: { id: user._id  },
                id: songId,
            },
        };

        await dislikeSong(req, res);

		const updatedUser = await User.findById(user._id);
        const updatedPlaylist = await Playlist.findById(playlist._id);

        expect(updatedUser.songsLiked).not.toContain("1234");
        expect(updatedPlaylist.songs.length).toBe(0); 
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("No debería fallar si la playlist no existe", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23',
			songsLiked: ["1234"]
        });

        const req = {
            body: {
                user: { id: user._id },
                id: "1234",
            }
        };

        await dislikeSong(req, res);

		const updatedUser = await User.findById(user._id);

        expect(updatedUser.songsLiked).not.toContain("1234");
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Metodo getLikedSongs", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };
	it("Debería devolver las canciones que le gustan al usuario", async () => {
		const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
			dateBirth: '2001-05-23',
			songsLiked: ["1234", "5678"]
        });

		const req = {
			params: { id: user._id },
		};

		await getLikedSongs(req, res);

		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ songsLiked: ["1234", "5678"] }));
		expect(res.status).toHaveBeenCalledWith(200);
		const result = res.json.mock.calls[0][0];
		expect(result.songsLiked).toHaveLength(2);
		expect(result.songsLiked).toContain('1234');
        expect(result.songsLiked).toContain('5678');
	});

	it("Debería devolver error 500 si falla la consulta", async () => {
		vi.spyOn(User, 'findById').mockImplementation(() => {
			throw new Error('Error DB');
		});

		const req = {
			params: { id: new mongoose.Types.ObjectId().toString() },
		};

		await getLikedSongs(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	});
});