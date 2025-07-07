import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPost, getPosts, likePost, deletePost } from '../controllers/postscontroller.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

vi.mock('../models/user.js', () => ({
    default: {
        findById: vi.fn(),
    }
}));

vi.mock('../models/post.js', () => {
    const m = vi.fn(); 
    m.find = vi.fn();
    m.findById = vi.fn();
    m.findByIdAndUpdate = vi.fn();
    m.findByIdAndDelete = vi.fn();
    m.create = vi.fn();
    return { default: m };
});

vi.mock('express-validator', () => ({
    validationResult: vi.fn(() => ({
        isEmpty: () => true,
        array: () => []
    }))
}));

describe("Metodo createPost", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería crear un post correctamente", async () => {
        const req = {
            body: {
                userId: '123',
                text: 'Esto es un post',
                songId: '678',
                type: 'song'
            },
        };

        const savedPost = {
            _id: '234',
            user: '123',
            text: 'Esto es un post',
            song: '678',
            item_type: 'song'
        };

        const saveMock = vi.fn().mockResolvedValue(savedPost);
        Post.mockImplementation(() => ({
            save: saveMock
        }));

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        await createPost(req, res);

        expect(validationResult).toHaveBeenCalledWith(req);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ newPost: savedPost });
    });

    it("Debería devolver un error 422 si faltan datos", async () => {
        const req = { body: {} };

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "Error de validación" }],
        });

        await createPost(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Error de validación" }]);
    });

    it("Debería devolver error 500 si falla", async () => {
        const req = {
            body: {
                userId: '123',
                text: 'Hola mundo',
                songId: '456',
                type: 'post',
            },
        };

        const saveMock = vi.fn().mockRejectedValue(new Error("Error interno"));
        Post.mockImplementation(() => ({
            save: saveMock,
        }));

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });

        await createPost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ msg: "Error interno" });
    });
});

describe("Metodo getPosts", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver todos los posts", async () => {
        const req = {
            query: { userId: '123', page: '1' }
        };

        User.findById.mockResolvedValue({
            _id: '123',
            followed: ['456']
        });

        const posts = [{ _id: '1' }, { _id: '2' }];

        const execMock = vi.fn().mockResolvedValue(posts);
        const populateMock = vi.fn(() => ({ exec: execMock }));
        const limitMock = vi.fn(() => ({ populate: populateMock }));
        const skipMock = vi.fn(() => ({ limit: limitMock }));
        const sortMock = vi.fn(() => ({ skip: skipMock }));

        Post.find.mockReturnValue({
            sort: sortMock
        });

        await getPosts(req, res);

        expect(User.findById).toHaveBeenCalledWith('123');
        expect(Post.find).toHaveBeenCalledWith({ user: { $in: ['456', '123'] } });
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(skipMock).toHaveBeenCalledWith(0); 
        expect(limitMock).toHaveBeenCalledWith(10);
        expect(populateMock).toHaveBeenCalledWith('user', '_id username profilePic');
        expect(execMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(posts);
    });

    it("Debe responder con error 500 si falla", async () => {
        const req = { query: { userId: '123' } };
        User.findById.mockRejectedValue(new Error("Error"));

        await getPosts(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});

describe("Metodo likePost", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería dar me gusta a un post", async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const postId = new mongoose.Types.ObjectId().toString();
        
        const req = {
            params: { id: postId },
            body: { user: { id: userId } }
        };

        Post.findById.mockResolvedValue({ likedBy: [], _id: postId });

        const populatedPost = {
            _id: postId,
            likes: 1,
            likedBy: [userId],
            user: {
                _id: userId,
                username: 'prueba',
                profilePic: '',
            },
        };

        const populateMock = vi.fn().mockResolvedValue(populatedPost);

        Post.findByIdAndUpdate.mockReturnValue({
            populate: populateMock,
        });

        await likePost(req, res);

        expect(Post.findById).toHaveBeenCalledWith(postId);
        expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
            postId,
            { $push: { likedBy: userId }, $inc: { likes: 1 } },
            { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            likes: 1,
            likedBy: [userId]
        }));
    });

    it("Debería quitar me gusta si ya lo tenía", async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const postId = new mongoose.Types.ObjectId().toString();

        const req = {
            params: { id: postId },
            body: { user: { id: userId } }
        };

        Post.findById.mockResolvedValue({
            _id: postId,
            likedBy: [userId],
            likes: 1
        });

        const populatedPost = {
            _id: postId,
            likes: 0,
            likedBy: [],
            user: {
                _id: userId,
                username: 'prueba',
                profilePic: '',
            },
        };

        Post.findByIdAndUpdate.mockReturnValue({
            populate: vi.fn().mockResolvedValue(populatedPost)
        });

        await likePost(req, res);

        expect(Post.findById).toHaveBeenCalledWith(postId);
        expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
            postId,
            { $pull: { likedBy: userId }, $inc: { likes: -1 } },
            { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            likes: 0,
            likedBy: []
        }));
    });

    it("Debería responder 404 si no encuentra el post", async () => {
        const req = {
            params: { id: '123' },
            body: { user: { id: '456' } }
        };

        Post.findById.mockResolvedValue(null);

        await likePost(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No se ha encontrado el post" });
    });

    it("Debería responder 500 si hay error", async () => {
        const req = {
            params: { id: '123' },
            body: { user: { id: '456' } }
        };

        Post.findById.mockRejectedValue(new Error("Error inesperado"));

        await likePost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error al darle like al post" });
    });
});

describe("Metodo deletePost", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería eliminar un post correctamente si existe", async () => {
        const req = { params: { id: '123' } };

        Post.findByIdAndDelete.mockResolvedValue({ _id: '123' });

        await deletePost(req, res);

        expect(Post.findByIdAndDelete).toHaveBeenCalledWith('123');
        expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("Debería devolver error 404 si no se encuentra el post", async () => {
        const req = { params: { id: '123' } };

        Post.findByIdAndDelete.mockResolvedValue(null);

        await deletePost(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Post no encontrado" });
    });
});