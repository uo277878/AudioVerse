import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getUsers, createUser, getUser, updateProfile, updateUser, updatePassword,
    getFollowedUsers, deleteUser, profile, passwordPage, searchUser, followUser, unfollowUser,
    likeSong, dislikeSong, getLikedSongs } from '../controllers/userscontroller.js';
import User from '../models/user.js';
import Playlist from '../models/playlist.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

vi.mock('../models/user.js');
vi.mock('../models/playlist.js');

vi.mock('express-validator', () => ({
    validationResult: vi.fn(() => ({
        isEmpty: () => true,
        array: () => []
    }))
}));

vi.mock('bcryptjs', () => ({
	default: {
		hash: vi.fn(async (id) => `token-${id}`),
		compare: vi.fn()
	},
	hash: vi.fn(async (id) => `token-${id}`),
	compare: vi.fn()
}));

describe("Método getUsers", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver la lista de usuarios", async () => {
        const usuarios = [
            { username: 'prueba1' },
            { username: 'prueba2' }
        ];

        vi.spyOn(User, 'find').mockResolvedValue(usuarios);

        const req = {};

        await getUsers(req, res);

        expect(User.find).toHaveBeenCalledWith();
        expect(res.json).toHaveBeenCalledWith(usuarios);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería devolver error 500 si falla la consulta", async () => {
        vi.spyOn(User, 'find').mockRejectedValue(new Error('DB error'));

        const req = {};

        await getUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});

describe("Método createUser", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Debería crear un usuario y devolverlo", async () => {
        const req = {
            body: {
                username: 'prueba1',
                email: 'prueba1@email.com',
                password: '123456',
                role: 'user',
                dateBirth: '2001-05-23'
            }
        };

        const userSaveMock = {
            _id: "mockedId",
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user',
            dateBirth: '2001-05-23',
            password: 'hashedpassword'
        };

        const saveMock = vi.fn().mockResolvedValue(userSaveMock);

        vi.spyOn(User.prototype, 'save').mockImplementation(saveMock);

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(saveMock).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            newUser: expect.objectContaining({
                username: 'prueba1',
                email: 'prueba1@email.com'
            })
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        vi.spyOn(User.prototype, 'save').mockRejectedValue(new Error("Error de prueba"));

        const req = {
            body: {
                username: 'userErr',
                email: 'error@email.com',
                password: '123456',
                role: 'user',
                dateBirth: '2001-05-23'
            }
        };

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error de prueba" });
    });
});

describe("Método getUser", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver un usuario si existe", async () => {
        const userMock = {
            _id: "123",
            username: 'prueba1',
            email: 'prueba1@email.com',
        };

        vi.spyOn(User, 'findById').mockResolvedValue(userMock);

        const req = { 
            params: { 
                id: "123" 
            } 
        };

        await getUser(req, res);

        expect(User.findById).toHaveBeenCalledWith("123");
        expect(res.json).toHaveBeenCalledWith(userMock);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería responder 404 si no existe", async () => {
        vi.spyOn(User, 'findById').mockResolvedValue(null);

        const req = { 
            params: { 
                id: "invalido" 
            } 
        };

        await getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería responder 500 si hay error", async () => {
        vi.spyOn(User, 'findById').mockRejectedValue(new Error("Error"));

        const req = { 
            params: { 
                id: "id" 
            } 
        };

        await getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});

describe("Método updateProfile", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Debería actualizar el perfil correctamente", async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const userMock = {
            _id: userId,
            username: 'prueba1',
            email: 'prueba1@email.com',
            save: vi.fn().mockResolvedValue({
                _id: userId,
                username: 'prueba2',
                email: 'prueba2@email.com',
            })
        };

        vi.spyOn(User, 'findById').mockResolvedValue(userMock);
        vi.spyOn(User, 'findOne').mockResolvedValue(null);

        const req = {
            user: { id: userId },
            body: {
                username: 'prueba2',
                email: 'prueba2@email.com'
            }
        };

        User.findByIdAndUpdate = vi.fn().mockResolvedValue({
            _id: userId,
            username: 'prueba2',
            email: 'prueba2@email.com'
        });
        await updateProfile(req, res);

        expect(User.findByIdAndUpdate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            username: 'prueba2',
            email: 'prueba2@email.com'
        }));
    });

    it("Debería devolver error si username existe", async () => {
        const userId = "123";

        const conflict = { _id: "id", username: 'prueba2' };

        vi.spyOn(User, 'findById').mockResolvedValue({ _id: userId, save: vi.fn() });
        vi.spyOn(User, 'findOne').mockResolvedValue(conflict);

        const req = {
            user: { id: userId },
            body: { username: 'prueba2', email: 'nuevo@email.com' }
        };

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Nombre de usuario no disponible" });
    });

    it("Debería devolver error si email existe", async () => {
        const userId = "123";

        const conflict = { _id: "id", email: 'email@email.com' };

        vi.spyOn(User, 'findById').mockResolvedValue({ _id: userId, save: vi.fn() });
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(conflict);

        const req = {
            user: { id: userId },
            body: { 
                username: 'nuevo', 
                email: 'email@email.com' 
            }
        };

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({ msg: "Email no disponible" });
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        User.findByIdAndUpdate = vi.fn().mockResolvedValue(null);

        const req = {
            user: { id: userId },
            body: { 
                username: 'prueba10', 
                email: 'prueba10@email.com' 
            }
        };

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 422 si hay errores de validación", async () => {
        vi.spyOn(User, 'findById').mockResolvedValue({});

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
});

describe("Método updateUser", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería actualizar el perfil correctamente", async () => {
        const req = {
            params: { id: 'userId' },
            body: {
                username: 'prueba2',
                email: 'prueba2@email.com'
            }
        };

        validationResult.mockReturnValue({
            isEmpty: () => true
        });

        User.findOne.mockResolvedValue(null);

        User.findByIdAndUpdate.mockResolvedValue({
            _id: 'userId',
            username: 'prueba2',
            email: 'prueba2@email.com',
            role: 'user'
        });

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 'userId',
            username: 'prueba2',
            email: 'prueba2@email.com',
            role: 'user'
        });
    });

    it("Debería devolver error si el username ya existe", async () => {
        const req = {
            params: { id: "userId" },
            body: {
                username: "prueba2",
                email: "nuevo@email.com",
            },
        };

        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        User.findById = vi.fn().mockResolvedValue({}); 
        User.findOne = vi.fn().mockResolvedValue({}); 

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Nombre de usuario no disponible",
        });
    });

    it("Debería devolver error si el email ya existe", async () => {
        const req = {
            params: { id: "id" },
            body: {
                username: "prueba1",
                email: "prueba1@email.com",
            },
        };

        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        User.findById = vi.fn().mockResolvedValue({}); 
        User.findOne = vi.fn().mockImplementation(({ email }) => {
            return email ? {} : null;
        }); 

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Email no disponible",
        });
    });

    it("Debería devolver error 422 si hay errores de validación", async () => {
        const req = {
            params: { id: "id" },
            body: {},
        };

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "El email no es válido" }],
        });

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "El email no es válido" }]);
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        const req = {
            params: { id: new mongoose.Types.ObjectId() },
            body: {
                username: "prueba1",
                email: "prueba1@email.com",
            },
        };

        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        User.findOne.mockResolvedValue(null);
        User.findByIdAndUpdate.mockResolvedValue(null);

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Usuario no encontrado",
        });
    });
});

describe("Método updatePassword", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería actualizar la contraseña correctamente", async () => {
        const user = {
            _id: 'id',
            password: 'hashedPassword',
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user',
            save: vi.fn()
        };

        validationResult.mockReturnValue({
            isEmpty: () => true
        });

        User.findById.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true); 
        bcrypt.hash.mockResolvedValue('newHashedPassword'); 

        const req = {
            user: { id: 'id' },
            body: {
                password: '123456',
                newPassword: 'nueva123'
            }
        };

        await updatePassword(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword');
        expect(bcrypt.hash).toHaveBeenCalledWith('nueva123', 10);
        expect(user.save).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            username: 'prueba1',
            email: 'prueba1@email.com'
        }));
    });

    it("Debería devolver error si la contraseña actual es incorrecta", async () => {
        const user = {
            _id: 'id',
            password: 'hashedPassword'
        };

        validationResult.mockReturnValue({
            isEmpty: () => true
        });

        User.findById.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        const req = {
            user: { id: 'id' },
            body: {
                password: 'incorrecta',
                newPassword: 'nueva123'
            }
        };

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: "La contraseña actual es incorrecta" });
    });

    it("Debería devolver error si el usuario no existe", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true
        });

        User.findById.mockResolvedValue(null);

        const req = {
            user: { id: 'id' },
            body: {
                password: '123456',
                newPassword: 'nueva123'
            }
        };

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 422 si hay errores de validación", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "El password es requerido" }]
        });

        const req = {
            user: { id: 'id' },
            body: {}
        };

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "El password es requerido" }]);
    });
});

describe("Método getFollowedUsers", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver la lista de usuarios seguidos", async () => {
        const mockFollowedUsers = [
            { _id: 'user2', username: 'user2' },
            { _id: 'user3', username: 'user3' },
        ];

        const populateMock = vi.fn().mockResolvedValue({
            followed: mockFollowedUsers
        });

        User.findById.mockReturnValue({ populate: populateMock });

        const req = {
            params: { id: 'id' },
        };

        await getFollowedUsers(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(populateMock).toHaveBeenCalledWith('followed');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ followed: mockFollowedUsers });
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        const populateMock = vi.fn().mockResolvedValue(null);
        User.findById.mockReturnValue({ populate: populateMock });

        const req = { 
            params: { 
                id: 'id' 
            } 
        };

        await getFollowedUsers(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(populateMock).toHaveBeenCalledWith('followed');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 500 si ocurre un error inesperado", async () => {
        User.findById.mockRejectedValue(new Error("DB error"));

        const req = { 
            params: { 
                id: 'id' 
            } 
        };
        await getFollowedUsers(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });
});

describe("Método deleteUser", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        sendStatus: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería eliminar un usuario correctamente", async () => {
        const mockUser = { _id: 'id', username: 'prueba1' };

        User.findByIdAndDelete.mockResolvedValueOnce(mockUser);

        const req = { 
            params: { 
                id: 'id' 
            } 
        };

        await deleteUser(req, res);

        expect(User.findByIdAndDelete).toHaveBeenCalledWith('id');
        expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        User.findByIdAndDelete.mockResolvedValue(null);

        const req = { 
            params: { 
                id: 'id' 
            } 
        };

        await deleteUser(req, res);

        expect(User.findByIdAndDelete).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 404 si ocurre un error (ID inválido)", async () => {
        User.findByIdAndDelete.mockRejectedValue(new Error('Error en la DB'));

        const req = { 
            params: { 
                id: 'invalido' 
            } 
        };

        await deleteUser(req, res);

        expect(User.findByIdAndDelete).toHaveBeenCalledWith('invalido');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });
});

describe("Método profile", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver el perfil del usuario correctamente", async () => {
        const mockUser = {
            _id: 'id',
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user',
            createdAt: '2024-05-01T10:00:00Z'
        };

        User.findById.mockResolvedValue(mockUser);

        const req = { 
            user: { 
                id: 'id' 
            } 
        };

        await profile(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 'id',
            username: 'prueba1',
            email: 'prueba1@email.com',
            role: 'user',
            createdAt: '2024-05-01T10:00:00Z'
        });
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        User.findById.mockResolvedValue(null);

        const req = { 
            user: { 
                id: 'id' 
            } 
        };

        await profile(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 500 si ocurre un error en la base de datos", async () => {
        User.findById.mockRejectedValue(new Error('DB error'));

        const req = { 
            user: { 
                id: 'id' 
            } 
        };

        await profile(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener el perfil" });
    });
});

describe("Método passwordPage", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver correctamente los datos del usuario con la contraseña", async () => {
        const mockUser = {
            _id: 'id',
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
        };

        User.findById.mockResolvedValue(mockUser);

        const req = { 
            user: { 
                id: 'id' 
            } 
        };

        await passwordPage(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 'id',
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
        });
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        User.findById.mockResolvedValue(null);

        const req = { 
            user: { 
                id: 'id' 
            } 
        };

        await passwordPage(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 500 si ocurre un error en la base de datos", async () => {
        User.findById.mockRejectedValue(new Error("DB error"));

        const req = { 
            user: { 
                id: 'id' 
            } 
        };

        await passwordPage(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener el perfil" });
    });
});

describe("Método searchUser", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });
        vi.clearAllMocks();
    });

    it("Debería devolver los usuarios que coinciden con la búsqueda", async () => {
		const authUser = { _id: "id", songsLiked: [] };

		User.findById.mockResolvedValue(authUser);

		User.find.mockResolvedValue([
            { _id: "id1", username: "prueba2", songsLiked: [] },
            { _id: "id2", username: "prueba3", songsLiked: [] },
        ]);

        const req = {
			body: {
				input: "prueba",
				orderBy: "",
				userAuth: { id: "id" },
			},
		};

		await searchUser(req, res);

		expect(User.findById).toHaveBeenCalledWith("id");
		expect(User.find).toHaveBeenCalledWith({
			username: { $regex: /prueba/i },
			_id: { $ne: "id" },
			role: { $ne: "admin" },
		});

        expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			users: [
				{ _id: "id1", username: "prueba2", songsLiked: [] },
				{ _id: "id2", username: "prueba3", songsLiked: [] },
			],
		});
	});

    it("Debería ordenar los usuarios por matches en canciones", async () => {
        validationResult.mockReturnValueOnce({ isEmpty: () => true });

        const songId = 'song123';

        const mockUsers = [
            { _id: '1', username: 'prueba1', songsLiked: [songId], role: 'user', toJSON() { return this; } },
            { _id: '2', username: 'prueba2', songsLiked: [songId, songId], role: 'user', toJSON() { return this; } },
            { _id: '3', username: 'prueba3', songsLiked: [], role: 'user', toJSON() { return this; } }
        ];

        User.find.mockResolvedValue(mockUsers);

        const req = {
            body: {
                input: 'prueba',
                orderBy: 'matches',
                userAuth: { id: '1' }
            }
        };

        await searchUser(req, res);

        const response = res.json.mock.calls[0][0].users;

        expect(User.find).toHaveBeenCalled();
        expect(response.length).toBe(3); 

        expect(response[0].matchCount).toBeGreaterThanOrEqual(response[1].matchCount);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
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
                userAuth: { id: '1' }
            }
        };

        await searchUser(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Input inválido" }]);
    });
});

describe("Método followUser", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería permitir seguir a un usuario correctamente", async () => {
        const userToFollow = { _id: 'id' };
        const authUser = {
            _id: 'id2',
            followed: [],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById
            .mockResolvedValueOnce(userToFollow) 
            .mockResolvedValueOnce(authUser);    

        const req = {
            params: { id: 'id' },
            body: { user: { id: 'id2' } },
        };

        await followUser(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(User.findById).toHaveBeenCalledWith('id2');
        expect(authUser.save).toHaveBeenCalled();

        expect(authUser.followed).toContain('id');

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ authUser });
    });

    it("No debería duplicar la relación si ya lo sigue", async () => {
        const userToFollow = { _id: 'id' };
        const authUser = {
            _id: 'id2',
            followed: ['id'],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById
            .mockResolvedValueOnce(userToFollow)
            .mockResolvedValueOnce(authUser);

        const req = {
            params: { id: 'id' },
            body: { user: { id: 'id2' } },
        };

        await followUser(req, res);

        expect(authUser.followed.length).toBe(1);
        expect(authUser.save).not.toHaveBeenCalled(); 

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ authUser });
    });

    it("Debería devolver error 404 si el usuario a seguir no existe", async () => {
        User.findById.mockResolvedValueOnce(null); 

        const req = {
            params: { id: 'id' },
            body: { user: { id: 'id2' } },
        };

        await followUser(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario a seguir no encontrado" });
    });

    it("Debería devolver error 500 si ocurre un problema en la base de datos", async () => {
        User.findById.mockRejectedValue(new Error('DB error'));

        const req = {
            params: { id: 'id' },
            body: { user: { id: 'id2' } },
        };

        await followUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "No se ha podido seguir a este usuario" });
    });
});

describe("Método unfollowUser", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería dejar de seguir a un usuario correctamente", async () => {
        const userToUnfollowId = new mongoose.Types.ObjectId();
        const authUserId = new mongoose.Types.ObjectId();

        const userToUnfollow = { _id: userToUnfollowId };
        const authUser = {
            _id: authUserId,
            followed: [userToUnfollowId],
            save: vi.fn().mockImplementation(function () {
                return Promise.resolve(this);
            }),
        };

        User.findById
            .mockResolvedValueOnce(userToUnfollow)
            .mockResolvedValueOnce(authUser);

        const req = {
            params: { 
                id: userToUnfollowId.toString() 
            },
            body: { 
                user: { 
                    id: authUserId.toString() 
                } 
            },
        };

        await unfollowUser(req, res);

        expect(User.findById).toHaveBeenCalledWith(userToUnfollowId.toString());
        expect(User.findById).toHaveBeenCalledWith(authUserId.toString());

        expect(authUser.followed.map(id => id.toString())).not.toContain(userToUnfollowId.toString());
        expect(authUser.save).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ authUser });
    });

    it("No debería fallar si el usuario no está en la lista de seguidos", async () => {
        const userToUnfollowId = new mongoose.Types.ObjectId();
        const authUserId = new mongoose.Types.ObjectId();

        const userToUnfollow = { _id: userToUnfollowId };
        const authUser = {
            _id: authUserId,
            followed: [],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById
            .mockResolvedValueOnce(userToUnfollow)
            .mockResolvedValueOnce(authUser);

        const req = {
            params: { 
                id: userToUnfollowId.toString() 
            },
            body: { 
                user: { 
                    id: authUserId.toString() 
                } 
            },
        };

        await unfollowUser(req, res);

        expect(authUser.followed).toEqual([]);
        expect(authUser.save).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ authUser });
    });

    it("Debería devolver error 404 si el usuario a dejar de seguir no existe", async () => {
        User.findById.mockResolvedValueOnce(null); 

        const req = {
            params: { 
                id: 'id' 
            },
            body: { 
                user: { 
                    id: 'id2' 
                } 
            },
        };

        await unfollowUser(req, res);

        expect(User.findById).toHaveBeenCalledWith('id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario a dejar de seguir no encontrado" });
    });

    it("Debería devolver error 500 si ocurre un problema en la base de datos", async () => {
        User.findById.mockRejectedValue(new Error('DB error'));

        const req = {
            params: { 
                id: 'id' 
            },
            body: { 
                user: { 
                    id: 'id2' 
                } 
            },
        };

        await unfollowUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "No se ha podido dejar de seguir a este usuario" });
    });
});

describe("Método likeSong", () => {
    const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería darle like a una canción correctamente", async () => {
        const songId = '1234';
        const userId = new mongoose.Types.ObjectId();

        const user = {
            _id: userId,
            songsLiked: [],
            save: vi.fn().mockResolvedValue(),
        };

        const playlist = {
            _id: new mongoose.Types.ObjectId(),
            songs: [],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById = vi.fn().mockResolvedValue(user);
        Playlist.findOne = vi.fn().mockResolvedValue(playlist);

        const req = {
            body: {
                user: { id: userId.toString() },
                id: songId,
            },
        };

        await likeSong(req, res);

        expect(user.songsLiked).toContain(songId);
        expect(playlist.songs.some(s => s.songId === songId)).toBe(true);
        expect(user.save).toHaveBeenCalled();
        expect(playlist.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("No debería duplicar si ya tiene la canción en liked", async () => {
        const songId = '1234';
        const userId = new mongoose.Types.ObjectId();

        const user = {
            _id: userId,
            songsLiked: [songId],
            save: vi.fn().mockResolvedValue(),
        };

        const playlist = {
            _id: new mongoose.Types.ObjectId(),
            songs: [{ songId, text: '', likedBy: [] }],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById = vi.fn().mockResolvedValue(user);
        Playlist.findOne = vi.fn().mockResolvedValue(playlist);

        const req = {
            body: {
                user: { id: userId.toString() },
                id: songId,
            },
        };

        await likeSong(req, res);

        expect(user.songsLiked.filter(s => s === songId).length).toBe(1);
        expect(playlist.songs.filter(s => s.songId === songId).length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(406);
    });

    it("Debería devolver error 404 si el usuario no existe", async () => {
        User.findById = vi.fn().mockResolvedValue(null);

        const req = {
            body: {
                user: { 
                    id: new mongoose.Types.ObjectId().toString() 
                },
                id: '1234',
            },
        };

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("Debería devolver error 404 si la playlist no existe", async () => {
        const userId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            songsLiked: [],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById = vi.fn().mockResolvedValue(user);
        Playlist.findOne = vi.fn().mockResolvedValue(null);

        const req = {
            body: {
                user: { id: userId.toString() },
                id: '1234',
            },
        };

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist 'Canciones que me gustan' no encontrada",
        });
    });
});

describe("Método dislikeSong", () => {
    const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería eliminar correctamente el like de una canción", async () => {
        const songId = '1234';
        const userId = new mongoose.Types.ObjectId();

        const user = {
            _id: userId,
            songsLiked: [songId],
            save: vi.fn().mockResolvedValue(),
        };

        const playlist = {
            _id: new mongoose.Types.ObjectId(),
            songs: [{ songId, text: '', likedBy: [] }],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById = vi.fn().mockResolvedValue(user);
        Playlist.findOne = vi.fn().mockResolvedValue(playlist);

        const req = {
            body: {
                user: { id: userId.toString() },
                id: songId,
            },
        };

        await dislikeSong(req, res);

        expect(user.songsLiked).not.toContain(songId);
        expect(playlist.songs.length).toBe(0);
        expect(user.save).toHaveBeenCalled();
        expect(playlist.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("No debería hacer nada si el usuario no tiene la canción en songsLiked", async () => {
        const songId = '1234';
        const userId = new mongoose.Types.ObjectId();

        const user = {
            _id: userId,
            songsLiked: [],
            save: vi.fn().mockResolvedValue(),
        };

        const playlist = {
            _id: new mongoose.Types.ObjectId(),
            songs: [{ songId, text: '', likedBy: [] }],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById = vi.fn().mockResolvedValue(user);
        Playlist.findOne = vi.fn().mockResolvedValue(playlist);

        const req = {
            body: {
                user: { 
                    id: userId.toString() 
                },
                id: songId,
            },
        };

        await dislikeSong(req, res);

        expect(user.songsLiked).not.toContain(songId);
        expect(playlist.songs.length).toBe(0);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("No debería fallar si la playlist no existe", async () => {
        const songId = '1234';
        const userId = new mongoose.Types.ObjectId();

        const user = {
            _id: userId,
            songsLiked: [songId],
            save: vi.fn().mockResolvedValue(),
        };

        User.findById = vi.fn().mockResolvedValue(user);
        Playlist.findOne = vi.fn().mockResolvedValue(null);

        const req = {
            body: {
                user: { id: userId.toString() },
                id: songId,
            },
        };

        await dislikeSong(req, res);

        expect(user.songsLiked).not.toContain(songId);
        expect(user.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Método getLikedSongs", () => {
	const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
    };

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("Debería devolver las canciones que le gustan al usuario", async () => {
		const mockUser = {
			_id: "id",
			songsLiked: ["1234", "5678"]
		};

		const req = {
			params: { 
                id: mockUser._id 
            }
		};

		vi.spyOn(User, "findById").mockReturnValue({
			populate: vi.fn().mockResolvedValue(mockUser)
		});

		await getLikedSongs(req, res);

		expect(User.findById).toHaveBeenCalledWith("id");
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ songsLiked: ["1234", "5678"] });
	});

    it("Debería devolver 404 si el usuario no existe", async () => {
        const req = {
            params: { 
                id: "id" 
            }
        };

        vi.spyOn(User, "findById").mockReturnValue({
            populate: vi.fn().mockResolvedValue(null)
        });

        await getLikedSongs(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

	it("Debería devolver error 500 si falla la consulta", async () => {
		const req = {
			params: { 
                id: "id" 
            }
		};

		vi.spyOn(User, "findById").mockImplementation(() => {
			throw new Error("DB error");
		});

		await getLikedSongs(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
	})
});