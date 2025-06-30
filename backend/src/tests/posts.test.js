import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createPost, getPosts, likePost, deletePost } from '../controllers/postscontroller.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import { validationResult } from 'express-validator';

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

describe("Metodo createPost", () => {
    const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis()
	};
    it("Debería crear un nuevo post correctamente", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            dateBirth: '2001-05-23',
            role: 'user'
        });

        const req = {
            body: {
                userId: user._id.toString(),
                text: 'Este es un post de prueba',
                songId: 'song123',
                type: 'song'
            }
        };

        await createPost(req, res);

        expect(res.json).toHaveBeenCalledWith({
            newPost: expect.objectContaining({
                user: user._id,
                text: 'Este es un post de prueba',
                song: 'song123',
                item_type: 'song'
            })
        });

        const post = await Post.findOne({ user: user._id });
        expect(post).not.toBeNull();
        expect(post.text).toBe('Este es un post de prueba');
    });

    it("Debería responder 422 si faltan datos", async () => {
        validationResult.mockReturnValueOnce({
            isEmpty: () => false,
            array: () => [{ msg: 'El texto del post no puede estar vacío' }]
        });

        const user = await User.create({
            username: 'prueba2',
            email: 'prueba2@email.com',
            password: '123456',
            dateBirth: '2001-05-23',
            role: 'user'
        });

        const req = {
            body: {
                userId: user._id.toString(),
                text: '',
                songId: 'song123',
                type: 'song'
            }
        };
        
        await createPost(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: 'El texto del post no puede estar vacío' }]);
    });
});

describe("Metodo getPosts", () => {
    const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis()
	};
	it("Debería devolver los posts del usuario y sus seguidos", async () => {
		const user1 = await User.create({ username: 'prueba1', email: 'prueba1@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user' });
		const user2 = await User.create({ username: 'prueba2', email: 'prueba2@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user', followed: [user1._id] });

		const post1 = await Post.create({ user: user1._id, text: 'Post de prueba1' });
		const post2 = await Post.create({ user: user2._id, text: 'Post de prueba2' });

		const req = {
			query: {
				userId: user2._id.toString(),
				page: '1'
			}
		};

		await getPosts(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalled();
		const posts = res.json.mock.calls[0][0];
		expect(posts.length).toBe(2);
		expect(posts[0].text).toBe('Post de prueba2');
		expect(posts[1].text).toBe('Post de prueba1');
	});

	it("Debería devolver error 500 si falla", async () => {
		const req = { query: {} };
		await getPosts(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
	});
});

describe("Método likePost", () => {
    const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis()
	};
	it("Debería dar me gusta a un post", async () => {
		const user = await User.create({ username: 'prueba1', email: 'prueba1@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user' });
		const post = await Post.create({ user: user._id, text: 'Mi primer post', likes: 0, likedBy: [] });

		const req = {
			params: { id: post._id.toString() },
			body: { user: { id: user._id.toString() } }
		};

		await likePost(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalled();
		const updatedPost = res.json.mock.calls[0][0];
		expect(updatedPost.likes).toBe(1);
		expect(updatedPost.likedBy.map(id => id.toString())).toContain(user._id.toString());
	});

	it("Debería quitar el me gusta si ya lo tenía", async () => {
		const user = await User.create({ username: 'prueba1', email: 'prueba1@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user' });
		const post = await Post.create({ user: user._id, text: 'Post con me gusta', likes: 1, likedBy: [user._id] });

		const req = {
			params: { id: post._id.toString() },
			body: { user: { id: user._id.toString() } }
		};

		await likePost(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalled();
		const updatedPost = res.json.mock.calls[0][0];
		expect(updatedPost.likes).toBe(0);
		expect(updatedPost.likedBy).not.toContain(user._id.toString());
	});

	it("Debería responder 404 si no encuentra el post", async () => {
		const req = {
			params: { id: new mongoose.Types.ObjectId().toString() },
			body: { user: { id: new mongoose.Types.ObjectId().toString() } }
		};

		await likePost(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "No se ha encontrado el post" });
	});
});

describe("Metodo deletePost", () => {
    const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis(),
        sendStatus: vi.fn().mockReturnThis(),
	};
	it("Debería eliminar un post existente", async () => {
		const user = await User.create({ username: 'prueba1', email: 'prueba1@email.com', password: '123456', dateBirth: '2001-05-23', role: 'user' });
		const post = await Post.create({ user: user._id, text: 'Post para eliminar' });

		const req = {
			params: { id: post._id.toString() }
		};

		await deletePost(req, res);

		const deletedPost = await Post.findById(post._id);
		expect(deletedPost).toBeNull();
		expect(res.sendStatus).toHaveBeenCalledWith(204);
	});

	it("Debería devolver 404 si el post no existe", async () => {
		const req = {
			params: { id: new mongoose.Types.ObjectId().toString() }
		};

		await deletePost(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'Post no encontrado' });
	});
});