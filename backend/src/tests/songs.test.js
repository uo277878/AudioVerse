import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createPlaylist, removePlaylist, addSongToPlaylist, removeSongPlaylist, followPlaylist, 
    unfollowPlaylist, getAllByUser, getPlaylist, searchPlaylist, likeText, getTotalLikesAndLiked
 } from "../controllers/songscontroller";
import Playlist from '../models/playlist.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import { validationResult } from "express-validator";
import { vi, describe, it, beforeAll, afterAll, beforeEach, expect, afterEach } from "vitest";

vi.mock("express-validator", () => ({
    validationResult: vi.fn(),
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

describe("Método createPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería crear una playlist con imagen por defecto", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });

        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
            dateBirth: '2001-05-23'
        });

        const req = {
            body: {
                name: "Mi Playlist",
                description: "Una playlist de prueba",
                creator: user._id
            }
        };

        await createPlaylist(req, res);

        const respuesta = res.json.mock.calls[0][0];

        expect(res.json).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(respuesta).toHaveProperty("newPlaylist");
        expect(respuesta.newPlaylist).toHaveProperty("name", "Mi Playlist");
        expect(respuesta.newPlaylist).toHaveProperty("description", "Una playlist de prueba");
        expect(respuesta.newPlaylist).toHaveProperty("creator", user._id);
        expect(respuesta.newPlaylist).toHaveProperty("pic");

        const stored = await Playlist.findOne({ name: "Mi Playlist" });
        expect(stored).not.toBeNull();
        expect(stored.creator).toStrictEqual(user._id);
    });

    it("Debería manejar errores y responder con status 500", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });

        const req = {
            body: {
                name: "Playlist con error",
                description: "Desc",
                creator: "userError"
            },
            files: {
                pic: {
                    size: 100000,
                    mimetype: "image/jpeg",
                    tempFilePath: "/ruta/falsa.jpg"
                }
            }
        };

        const cloudinary = await import("cloudinary");
        cloudinary.uploader.upload = vi.fn(() => {
            throw new Error("Error en Cloudinary");
        });

        await createPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ msg: "Error en Cloudinary" });
    });
});

describe("Método removePlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn()
    };

    it("Debería eliminar una playlist existente y devolver 204", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
            dateBirth: '2001-05-23'
        });

        const playlist = await Playlist.create({
            name: "Playlist a eliminar",
            description: "Descripción",
            creator: user._id,
            pic: "url"
        });

        const req = {
            params: {
                id: playlist._id
            }
        };

        await removePlaylist(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(204);

        const existe = await Playlist.findById(playlist._id);
        expect(existe).toBeNull();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = {
            params: {
                id: new mongoose.Types.ObjectId().toString()
            }
        };

        await removePlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist no encontrada" });
    });

    it("Debería devolver 500 si el ID no es válido", async () => {
        const req = {
            params: {
                id: "invalido"
            }
        };

        await removePlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe("Método addSongToPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn()
    };

    it("Debería añadir una canción a la playlist", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
            dateBirth: '2001-05-23'
        });

        const playlist = await Playlist.create({
            name: "Mi Playlist",
            description: "desc",
            creator: user._id,
            pic: "url",
            songs: [],
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                songId: "123",
                txtSong: "Me encanta esta canción",
            },
        };

        await addSongToPlaylist(req, res);

        const updatedPlaylist = await Playlist.findById(playlist._id);
        expect(updatedPlaylist.songs.length).toBe(1);
        expect(updatedPlaylist.songs[0].songId).toBe("123");
        expect(updatedPlaylist.songs[0].text).toBe("Me encanta esta canción");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: expect.objectContaining({
                _id: playlist._id,
                songs: expect.arrayContaining([
                    expect.objectContaining({ songId: "123" }),
                ]),
            }),
        });
    });

    it("Debería devolver 402 si falta playlistId", async () => {
        const req = {
            body: {
                songId: "123",
                txtSong: "Texto",
            },
        };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "No se ha seleccionado ninguna playlist",
        });
    });

    it("Debería devolver 403 si falta txtSong", async () => {
        const req = {
            body: {
                playlistId: "123",
                songId: "Texto",
            },
        };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            msg: "No se ha proporcionado un texto para la canción",
        });
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = {
            body: {
                playlistId: new mongoose.Types.ObjectId().toString(),
                songId: "123",
                txtSong: "Texto",
            },
        };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Playlist no encontrada",
        });
    });

    it("Debería devolver 405 si falta songId", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
            dateBirth: '2001-05-23'
        });
        
        const playlist = await Playlist.create({
            name: "Playlist",
            creator: user._id,
            description: "desc",
            pic: "url",
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                txtSong: "Texto",
            },
        };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Id de canción inválido",
        });
    });

    it("Debería devolver 406 si la canción ya está en la playlist", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
            dateBirth: '2001-05-23'
        });

        const playlist = await Playlist.create({
            name: "Playlist",
            creator: user._id,
            description: "desc",
            pic: "url",
            songs: [{ songId: "123", text: "Texto", likedBy: [] }],
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                songId: "123",
                txtSong: "Texto",
            },
        };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist ya contiene esa canción",
        });
    });
});

describe("Método removeSongPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería eliminar una canción de la playlist correctamente", async () => {
        const user = await User.create({
            username: 'prueba1',
            email: 'prueba1@email.com',
            password: '123456',
            role: 'user',
            dateBirth: '2001-05-23'
        });

        const playlist = await Playlist.create({
            name: "Mi Playlist",
            creator: user._id,
            description: "desc",
            pic: "url",
            songs: [{ songId: "song1", text: "Texto", likedBy: [] }],
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                songId: "song1",
            },
        };

        await removeSongPlaylist(req, res);

        const updatedPlaylist = await Playlist.findById(playlist._id);
        expect(updatedPlaylist.songs.length).toBe(0);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: expect.objectContaining({
                _id: playlist._id,
            }),
        });
    });

    it("Debería eliminar la canción y actualizar el songsLiked si es 'Canciones que me gustan'", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });

        const playlist = await Playlist.create({
            name: "Canciones que me gustan",
            creator: user._id,
            description: "desc",
            pic: "url",
            songs: [{ songId: "song1", text: "Letra", likedBy: [] }],
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                songId: "song1",
            },
        };

        await removeSongPlaylist(req, res);

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.songsLiked).not.toContain("song1");

        const updatedPlaylist = await Playlist.findById(playlist._id);
        expect(updatedPlaylist.songs.length).toBe(0);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = {
            body: {
                playlistId: new mongoose.Types.ObjectId().toString(),
                songId: "song1",
            },
        };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Playlist no encontrada",
        });
    });

    it("debería devolver 404 si no se proporciona songId", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const playlist = await Playlist.create({
            name: "Nueva playlist",
            description: "desc",
            creator: user._id,
            pic: "url",
            songs: [],
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
            },
        };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Id de canción inválido",
        });
    });

    it("Debería devolver 404 si la canción no está en la playlist", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const playlist = await Playlist.create({
            name: "Nueva playlist",
            description: "desc",
            creator: user._id,
            pic: "url",
            songs: [],
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                songId: "invalido",
            },
        };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist no contiene esa canción",
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        const req = {
            body: null
        };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error al eliminar la canción de la playlist",
        });
    });
});

describe("Método followPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería permitir a un usuario seguir una playlist correctamente", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });

        const user2 = await User.create({
            username: "prueba2",
            email: "prueba2@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });

        const playlist = await Playlist.create({
            name: "Mi Playlist",
            description: "desc",
            pic: "url",
            creator: user._id,
            followedBy: [],
            numFollows: 0,
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                userId: user2._id,
            },
        };

        await followPlaylist(req, res);

        const updatedPlaylist = await Playlist.findById(playlist._id);
        console.log(updatedPlaylist);

        expect(updatedPlaylist.followedBy).toContainEqual(user2._id);
        expect(updatedPlaylist.numFollows).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: expect.objectContaining({
                _id: playlist._id,
            }),
        });
    });

    it("Debería devolver 402 si el usuario ya sigue la playlist", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const user2 = await User.create({
            username: "prueba2",
            email: "prueba2@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const playlist = await Playlist.create({
            name: "Ya seguida",
            description: "desc",
            pic: "url",
            creator: user._id,
            followedBy: [user2._id],
            numFollows: 1,
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                userId: user2._id,
            },
        };

        await followPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist ya está seguida por este usuario",
        });
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const req = {
            body: {
                playlistId: new mongoose.Types.ObjectId().toString(),
                userId: user._id,
            },
        };

        await followPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist no encontrada",
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        
        const req = {
            body: null
        };

        await followPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error",
        });
    });
});

describe("Método unfollowPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería permitir que un usuario deje de seguir una playlist", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const user2 = await User.create({
            username: "prueba2",
            email: "prueba2@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const playlist = await Playlist.create({
            name: "Playlist para dejar de seguir",
            description: "desc",
            pic: "url",
            creator: user._id,
            followedBy: [user2._id],
            numFollows: 1,
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                userId: user2.id,
            },
        };

        await unfollowPlaylist(req, res);

        const updated = await Playlist.findById(playlist._id);

        expect(updated.followedBy).not.toContain(user2._id);
        expect(updated.numFollows).toBe(0);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: expect.objectContaining({
                _id: playlist._id,
            }),
        });
    });

    it("Debería devolver 402 si el usuario no sigue la playlist", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const playlist = await Playlist.create({
            name: "No seguida",
            description: "desc",
            pic: "url",
            creator: user._id,
            followedBy: [],
            numFollows: 0,
        });

        const req = {
            body: {
                playlistId: playlist._id.toString(),
                userId: user._id,
            },
        };

        await unfollowPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist no es seguida por este usuario",
        });
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });
        const req = {
            body: {
                playlistId: new mongoose.Types.ObjectId().toString(),
                userId: user._id,
            },
        };

        await unfollowPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist no encontrada",
        });
    });

    it("debería devolver 500 si ocurre un error inesperado", async () => {
        const req = {
            body: null
        };

        await unfollowPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error",
        });
    });
});

describe("Método getAllByUser", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería devolver las playlists creadas o seguidas por el usuario", async () => {
        const user = await User.create({
            username: "prueba1",
            email: "prueba1@email.com",
            password: "123456",
            role: "user",
            songsLiked: ["song1"],
            dateBirth: "2001-05-23"
        });

        const playlists = await Playlist.create([
            { name: "Playlist 1", creator: user._id, description: "desc", pic: "url" },
            { name: "Playlist 2", creator: user._id, description: "desc", pic: "url" },
        ]);

        const otraPlaylist = await Playlist.create({
            name: "Playlist 3",
            creator: new mongoose.Types.ObjectId(),
            description: "desc",
            pic: "url",
            followedBy: [user._id],
        });

        const req = { params: { id: user._id.toString() } };

        await getAllByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ name: "Playlist 1" }),
                expect.objectContaining({ name: "Playlist 2" }),
                expect.objectContaining({ name: "Playlist 3" }),
            ])
        );
    });

    it("Debería devolver 404 si el usuario no existe", async () => {
        const req = {
            params: { id: new mongoose.Types.ObjectId().toString() },
        };

        await getAllByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "No se ha encontrado ningún usuario con ese id",
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        const req = {
            params: null,
        };

        await getAllByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error",
        });
    });
});

describe("Método getPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería devolver la playlist si existe", async () => {
        const playlist = await Playlist.create({
            name: "Nueva playlist", 
            creator: new mongoose.Types.ObjectId(),
            description: "desc",
            pic: "url"
        });

        const req = {
            params: { id: playlist._id.toString() },
        };

        await getPlaylist(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: "Nueva playlist" }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = {
            params: { id: new mongoose.Types.ObjectId().toString() },
        };

        await getPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist no encontrada" });
    });

    it("debería devolver 500 si ocurre un error inesperado", async () => {
        const req = null;

        await getPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});

describe("Método searchPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería devolver playlists que coincidan con el input", async () => {
        await Playlist.create({ 
            name: "Rock Clásico", 
            creator: new mongoose.Types.ObjectId(),
            description: "desc",
            pic: "url"
        });
        await Playlist.create({ 
            name: "Pop", 
            creator: new mongoose.Types.ObjectId(),
            description: "desc",
            pic: "url"
        });

        validationResult.mockReturnValue({ isEmpty: () => true });

        const req = { body: { input: "rock" } };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: "Rock Clásico" })
        ]));
    });

    it("Debería devolver 404 si no hay playlists que coincidan", async () => {
        await Playlist.create({ 
            name: "Jazz", 
            creator: new mongoose.Types.ObjectId(),
            description: "desc",
            pic: "url"
        });

        validationResult.mockReturnValue({ isEmpty: () => true });

        const req = { body: { input: "reggaeton" } };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No se encuentran playlists para ese input" });
    });

    it("Debería devolver 400 si no se proporciona input", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });

        const req = { body: {} };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "El texto de búsqueda es necesario" });
    });

    it("Debería devolver 422 si hay errores de validación", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "Error de validación" }],
        });
        const req = { body: { input: "" } };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Error de validación" }]);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        validationResult.mockImplementation(() => {
            throw new Error('Error inesperado');
        });

        const req = { body: {} };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});

describe("Método likeText", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    it("Debería dar like a un texto de canción correctamente", async () => {
        const userId = new mongoose.Types.ObjectId();
        const songId = "123";
        const playlist = await Playlist.create({
            name: "Playlist 1",
            creator: userId,
            description: "desc",
            pic: "url",
            songs: [
                { songId, text: "Texto", likedBy: [] }
            ]
        });

        const req = {
            body: {
                playlistId: playlist._id,
                songId,
                userId
            }
        };

        await likeText(req, res);

        const updated = await Playlist.findById(playlist._id);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            _id: playlist._id,
            songs: expect.arrayContaining([
                expect.objectContaining({
                    songId,
                    likedBy: expect.arrayContaining([userId])
                })
            ])
        }));
        expect(updated.songs[0].likedBy).toContainEqual(userId);
    });

    it("Debería quitar el like si el usuario ya dio like", async () => {
        const userId = new mongoose.Types.ObjectId();
        const songId = "123";
        const playlist = await Playlist.create({
            name: "Playlist",
            creator: userId,
            description: "desc",
            pic: "url",
            songs: [
                { songId, text: "Texto", likedBy: [userId] }
            ]
        });

        const req = {
            body: {
                playlistId: playlist._id,
                songId,
                userId
            }
        };

        await likeText(req, res);

        const updated = await Playlist.findById(playlist._id);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(updated.songs[0].likedBy).not.toContainEqual(userId);
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = {
            body: {
                playlistId: new mongoose.Types.ObjectId(),
                songId: "123",
                userId: new mongoose.Types.ObjectId()
            }
        };

        await likeText(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist no encontrada" });
    });

    it("Debería devolver 404 si la canción no se encuentra en la playlist", async () => {
        const userId = new mongoose.Types.ObjectId();
        const playlist = await Playlist.create({
            name: "Playlist",
            creator: userId,
            description: "desc",
            pic: "url",
            songs: [
                { songId: "id", text: "Texto", likedBy: [] }
            ]
        });

        const req = {
            body: {
                playlistId: playlist._id,
                songId: "id2",
                userId
            }
        };

        await likeText(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No se encontró la canción en la playlist" });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        const req = {
            body: {
                playlistId: "invalido",
                songId: "123",
                userId: new mongoose.Types.ObjectId()
            }
        };

        await likeText(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});

describe("Método getTotalLikesAndLiked", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    it("Debería devolver totalLikes y liked: true si el usuario dio like", async () => {
        const userId = new mongoose.Types.ObjectId();
        const songId = "song123";
        const playlist = await Playlist.create({
            name: "Playlist",
            creator: userId,
            description: "desc",
            pic: "url",
            songs: [{
                songId,
                text: "Texto",
                likedBy: [userId]
            }]
        });

        const req = {
            query: {
                playlistId: playlist._id.toString(),
                songId,
                userId: userId.toString()
            }
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ liked: true, totalLikes: 1 });
    });

    it("Debería devolver liked: false si el usuario no ha dado like", async () => {
        const userId = new mongoose.Types.ObjectId();
        const songId = "song456";
        const playlist = await Playlist.create({
            name: "Playlist",
            creator: userId,
            description: "desc",
            pic: "url",
            songs: [{
                songId,
                text: "Texto",
                likedBy: []
            }]
        });

        const req = {
            query: {
                playlistId: playlist._id.toString(),
                songId,
                userId: userId.toString()
            }
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ liked: false, totalLikes: 0 });
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = {
            query: {
                playlistId: new mongoose.Types.ObjectId(),
                songId: "123",
                userId: new mongoose.Types.ObjectId().toString()
            }
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist no encontrada" });
    });

    it("Debería devolver 404 si la canción no existe en la playlist", async () => {
        const userId = new mongoose.Types.ObjectId();
        const playlist = await Playlist.create({
            name: "Playlist",
            creator: userId,
            description: "desc",
            pic: "url",
            songs: [{
                songId: "id",
                text: "Texto",
                likedBy: []
            }]
        });

        const req = {
            query: {
                playlistId: playlist._id.toString(),
                songId: "id2",
                userId: userId.toString()
            }
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No se encontró la canción en la playlist" });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        const req = {
            query: {
                playlistId: "error",
                songId: "songId",
                userId: "userId"
            }
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Se ha producido un error" });
    });
});