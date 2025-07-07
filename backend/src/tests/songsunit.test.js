import { createPlaylist, removePlaylist, addSongToPlaylist, removeSongPlaylist, followPlaylist, 
    unfollowPlaylist, getAllByUser, getPlaylist, searchPlaylist, likeText, getTotalLikesAndLiked
 } from "../controllers/songscontroller";
import Playlist from '../models/playlist.js';
import User from '../models/user.js';
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("express-validator", () => ({
  validationResult: vi.fn(),
}));

vi.mock('../models/playlist.js');
vi.mock('../models/user.js');

describe("Método createPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver errores de validación si los hay", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "Nombre requerido" }],
        });

        const req = {
            body: {},
        };

        await createPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Nombre requerido" }]);
    });

    it("Debería devolver error si la imagen supera los 2MB", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        const req = {
            files: {
                pic: {
                    size: 3 * 1024 * 1024, 
                },
            },
        };

        await createPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La imagen debe ser menor de 2MB",
        });
    });

    it("Debería devolver error si el tipo de imagen no es válido", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        const req = {
            files: {
                pic: {
                size: 1 * 1024 * 1024,
                    mimetype: "application/pdf",
                    tempFilePath: "/tmp/test.pdf",
                },
            },
        };

        await createPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Formato de imagen no permitido. Solo JPG y PNG",
        });
    });

    it("Debería subir la imagen, crear la playlist y devolverla", async () => {
        const req = {
            body: {
                name: "Mi Playlist",
                creator: "123",
                description: "Una playlist genial",
            },
            files: {
                pic: {
                    size: 500000,
                    tempFilePath: "/tmp/playlist.jpg",
                    mimetype: "image/jpeg"
                }
            }
        };

        const saveMock = vi.fn().mockResolvedValue({
            name: "Mi Playlist",
            creator: "123",
            description: "Una playlist genial",
            pic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/playlist.jpg"
        });

        vi.spyOn(Playlist.prototype, 'save').mockImplementation(saveMock);

        cloudinary.uploader.upload = vi.fn().mockResolvedValue({
            secure_url: "https://res.cloudinary.com//dtlhuysrz/image/upload/v1743524882/playlist.jpg"
        });

        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        await createPlaylist(req, res);

        expect(saveMock).toHaveBeenCalled();
        expect(cloudinary.uploader.upload).toHaveBeenCalledWith("/tmp/playlist.jpg", {
            folder: "playlist_pictures",
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            newPlaylist: expect.objectContaining({
                name: "Mi Playlist",
                creator: "123",
                description: "Una playlist genial",
                pic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/playlist.jpg"
            })
        });
    });

    it("Debería crear la playlist con imagen por defecto si no se subió ninguna", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        const req = {
            body: {
                name: "Mi Playlist",
                description: "Playlist sin imagen",
                creator: "123",
            },
        };

        const defaultUrl = "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png";

        const saveMock = vi.fn().mockResolvedValue({
            name: "Mi Playlist",
            creator: "123",
            description: "Playlist sin imagen",
            pic: defaultUrl,
        });

        vi.spyOn(Playlist.prototype, 'save').mockImplementation(saveMock);

        cloudinary.uploader.upload = vi.fn().mockResolvedValue({
            secure_url: defaultUrl,
        });

        await createPlaylist(req, res);

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(defaultUrl, {
            folder: "playlist_pictures",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            newPlaylist: expect.objectContaining({
                name: "Mi Playlist",
                pic: defaultUrl,
            }),
        });
    });

    it("Debería devolver error 500 si ocurre una excepción", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        const req = {
            files: {
                pic: {
                    size: 100000,
                    mimetype: "image/jpeg",
                    tempFilePath: "/tmp/fail.jpg",
                },
            },
            body: {
                name: "Playlist",
                creator: "user",
                description: "desc",
            },
        };

        cloudinary.uploader.upload = vi.fn().mockRejectedValue(new Error("Fallo en Cloudinary"));

        await createPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Fallo en Cloudinary",
        });
    });
});

describe("Método removePlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería eliminar la playlist si existe y devolver 204", async () => {
        const req = { params: { id: "123" } };

        const playlistMock = {
            _id: "123",
            name: "Mi Playlist"
        };

        Playlist.findByIdAndDelete.mockResolvedValue(playlistMock);

        await removePlaylist(req, res);

        expect(Playlist.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = { params: { id: "invalido" } };

        Playlist.findByIdAndDelete.mockResolvedValue(null);

        await removePlaylist(req, res);

        expect(Playlist.findByIdAndDelete).toHaveBeenCalledWith("invalido");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist no encontrada"
        });
    });

    it("Debería devolver 500 si ocurre un error en la base de datos", async () => {
        const req = { params: { id: "id" } };

        Playlist.findByIdAndDelete.mockRejectedValue(new Error("Error de DB"));

        await removePlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Error de DB"
        });
    });
});

describe("Método addSongToPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 402 si no se proporciona playlistId", async () => {
        const req = { body: { songId: "s1", txtSong: "Texto" } };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "No se ha seleccionado ninguna playlist"
        });
    });

    it("Debería devolver 403 si no se proporciona txtSong", async () => {
        const req = { body: { playlistId: "p1", songId: "s1" } };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            msg: "No se ha proporcionado un texto para la canción"
        });
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        const req = { body: { playlistId: "p1", songId: "s1", txtSong: "Texto" } };

        Playlist.findById.mockResolvedValue(null);

        await addSongToPlaylist(req, res);

        expect(Playlist.findById).toHaveBeenCalledWith("p1");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Playlist no encontrada"
        });
    });

    it("Debería devolver 405 si no se proporciona songId", async () => {
        const playlistMock = { songs: [] };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { body: { playlistId: "p1", txtSong: "Texto" } };

        await addSongToPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Id de canción inválido"
        });
    });

    it("Debería agregar la canción si no existe en la playlist", async () => {
        const playlistMock = {
            songs: [],
            save: vi.fn().mockResolvedValue(true)
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = {
            body: {
                playlistId: "p1",
                songId: "s1",
                txtSong: "Texto"
            }
        };

        await addSongToPlaylist(req, res);

        expect(playlistMock.save).toHaveBeenCalled();
        expect(playlistMock.songs.length).toBe(1);
        expect(playlistMock.songs[0]).toEqual({
            songId: "s1",
            text: "Texto",
            likedBy: []
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: playlistMock
        });
    });

    it("Debería devolver 406 si la canción ya existe en la playlist", async () => {
        const playlistMock = {
            songs: [{ songId: "s1", text: "ya existe", likedBy: [] }],
            save: vi.fn()
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = {
            body: {
                playlistId: "p1",
                songId: "s1",
                txtSong: "Texto"
            }
        };

        await addSongToPlaylist(req, res);

        expect(playlistMock.save).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist ya contiene esa canción"
        });
    });
});

describe("Método removeSongPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        Playlist.findById.mockResolvedValue(null);

        const req = { body: { songId: "s1", playlistId: "p1" } };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Playlist no encontrada"
        });
    });

    it("Debería devolver 404 si no se proporciona songId", async () => {
        Playlist.findById.mockResolvedValue({});

        const req = { body: { playlistId: "p1" } };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Id de canción inválido"
        });
    });

    it("Debería devolver 404 si la canción no está en la playlist", async () => {
        const playlistMock = {
            songs: [{ songId: "s1" }],
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { body: { playlistId: "p1", songId: "s2" } };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist no contiene esa canción"
        });
    });

    it("Debería eliminar la canción correctamente si está en la playlist", async () => {
        const playlistMock = {
            songs: [{ songId: "s1" }],
            name: "Otra playlist",
            save: vi.fn().mockResolvedValue(true),
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { body: { playlistId: "p1", songId: "s1" } };

        await removeSongPlaylist(req, res);

        expect(playlistMock.songs.length).toBe(0);
        expect(playlistMock.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ playlist: playlistMock });
    });

    it("Debería eliminar también de 'songsLiked' si la playlist es 'Canciones que me gustan'", async () => {
        const userMock = {
            songsLiked: {
                pull: vi.fn(),
            },
            save: vi.fn().mockResolvedValue(true),
        };

        const playlistMock = {
            songs: [{ songId: "s1" }],
            name: "Canciones que me gustan",
            creator: "123",
            save: vi.fn().mockResolvedValue(true),
        };

        Playlist.findById.mockResolvedValue(playlistMock);
        User.findById.mockResolvedValue(userMock);

        const req = { body: { playlistId: "p1", songId: "s1" } };

        await removeSongPlaylist(req, res);

        expect(userMock.songsLiked.pull).toHaveBeenCalledWith("s1");
        expect(userMock.save).toHaveBeenCalled();
        expect(playlistMock.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ playlist: playlistMock });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        Playlist.findById.mockRejectedValue(new Error("Fallo inesperado"));

        const req = { body: { playlistId: "p1", songId: "s1" } };

        await removeSongPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error al eliminar la canción de la playlist"
        });
    });
});

describe("Método followPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        Playlist.findById.mockResolvedValue(null);

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
        };

        await followPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist no encontrada",
        });
    });

    it("Debería devolver 402 si el usuario ya sigue la playlist", async () => {
        Playlist.findById.mockResolvedValue({
            followedBy: ["456"],
        });

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
        };

        await followPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist ya está seguida por este usuario",
        });
    });

    it("Debería seguir la playlist correctamente si no la sigue aún", async () => {
        const saveMock = vi.fn().mockResolvedValue();

        const playlistMock = {
            followedBy: [],
            numFollows: 0,
            save: saveMock,
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
        };

        await followPlaylist(req, res);

        expect(playlistMock.followedBy).toContain("456");
        expect(playlistMock.numFollows).toBe(1);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: playlistMock,
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        Playlist.findById.mockRejectedValue(new Error("Fallo inesperado"));

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        Playlist.findById.mockResolvedValue(null);

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
        };

        await unfollowPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist no encontrada",
        });
    });

    it("Debería devolver 402 si el usuario no sigue la playlist", async () => {
        Playlist.findById.mockResolvedValue({
            followedBy: ["789"],
        });

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
        };

        await unfollowPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            msg: "La playlist no es seguida por este usuario",
        });
    });

    it("Debería dejar de seguir la playlist correctamente", async () => {
        const pullMock = vi.fn(function(userId) {
            const index = this.followedBy.indexOf(userId);
                if (index !== -1) {
                    this.followedBy.splice(index, 1);
                }
            }
        );

        const saveMock = vi.fn().mockResolvedValue();

        const playlistMock = {
            followedBy: ["456", "789"],
            numFollows: 2,
            pull: pullMock,
            save: saveMock,
        };

        playlistMock.followedBy.pull = pullMock.bind(playlistMock);

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
        };

        await unfollowPlaylist(req, res);

        expect(pullMock).toHaveBeenCalledWith("456");
        expect(playlistMock.numFollows).toBe(1);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            playlist: playlistMock,
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        Playlist.findById.mockRejectedValue(new Error("Fallo inesperado"));

        const req = {
            body: {
                playlistId: "123",
                userId: "456",
            },
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si el usuario no existe", async () => {
        User.findById.mockResolvedValue(null);

        const req = {
            params: {
                id: "123",
            },
        };

        await getAllByUser(req, res);

        expect(User.findById).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "No se ha encontrado ningún usuario con ese id",
        });
    });

    it("Debería devolver las playlists del usuario (creadas o seguidas)", async () => {
        const user = { _id: "123" };
        const playlists = [
            { _id: "p1", creator: "123" },
            { _id: "p2", followedBy: ["123"] },
        ];

        User.findById.mockResolvedValue(user);
        Playlist.find.mockResolvedValue(playlists);

        const req = {
            params: {
                id: "123",
            },
        };

        await getAllByUser(req, res);

        expect(User.findById).toHaveBeenCalledWith("123");
        expect(Playlist.find).toHaveBeenCalledWith({
            $or: [{ creator: "123" }, { followedBy: "123" }],
        });
        expect(res.json).toHaveBeenCalledWith(playlists);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        User.findById.mockRejectedValue(new Error("Error inesperado"));

        const req = {
            params: {
                id: "123",
            },
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        Playlist.findById.mockResolvedValue(null);

        const req = { 
            params: { 
                id: "123" 
            } 
        };

        await getPlaylist(req, res);

        expect(Playlist.findById).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Playlist no encontrada",
        });
    });

    it("Debería devolver la playlist si existe", async () => {
        const playlist = {
            _id: "123",
            name: "Mi Playlist",
            songs: [],
        };

        Playlist.findById.mockResolvedValue(playlist);

        const req = { 
            params: { 
                id: "123" 
            } 
        };

        await getPlaylist(req, res);

        expect(Playlist.findById).toHaveBeenCalledWith("123");
        expect(res.json).toHaveBeenCalledWith(playlist);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        Playlist.findById.mockRejectedValue(new Error("Error inesperado"));

        const req = { 
            params: { 
                id: "123" 
            } 
        };

        await getPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error",
        });
    });
});

describe("Método searchPlaylist", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 422 si hay errores de validación", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "Input requerido" }],
        });

        const req = { 
            body: {} 
        };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Input requerido" }]);
    });

    it("Debería devolver 400 si no se proporciona input", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        const req = { 
            body: {} 
        };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "El texto de búsqueda es necesario",
        });
    });

    it("Debería devolver 404 si no hay playlists coincidentes", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        Playlist.find.mockResolvedValue([]);

        const req = { 
            body: { 
                input: "rock" 
            } 
        };

        await searchPlaylist(req, res);

        expect(Playlist.find).toHaveBeenCalledWith({
            name: { $regex: "rock", $options: "i" },
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "No se encuentran playlists para ese input",
        });
    });

    it("Debería devolver las playlists coincidentes", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        const playlistsMock = [
            { _id: "1", name: "Rock" },
            { _id: "2", name: "Rock Clásico" },
        ];

        Playlist.find.mockResolvedValue(playlistsMock);

        const req = { 
            body: { 
                input: "rock" 
            } 
        };

        await searchPlaylist(req, res);

        expect(Playlist.find).toHaveBeenCalledWith({
            name: { $regex: "rock", $options: "i" },
        });
        expect(res.json).toHaveBeenCalledWith(playlistsMock);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });

        Playlist.find.mockRejectedValue(new Error("Fallo DB"));

        const req = { 
            body: { 
                input: "rock" 
            } 
        };

        await searchPlaylist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error",
        });
    });
});
describe("Método likeText", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        Playlist.findById.mockResolvedValue(null);

        const req = { 
            body: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await likeText(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist no encontrada" });
    });

    it("Debería devolver 404 si la canción no está en la playlist", async () => {
        const playlistMock = {
            songs: [{ songId: "s2", likedBy: [] }],
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            body: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await likeText(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "No se encontró la canción en la playlist",
        });
    });

    it("Debería agregar el like si el usuario no ha dado like", async () => {
        const saveMock = vi.fn();
        const playlistMock = {
        songs: [{ songId: "s1", likedBy: [] }],
            save: saveMock,
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            body: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await likeText(req, res);

        expect(playlistMock.songs[0].likedBy).toContain("u1");
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(playlistMock);
    });

    it("Debería quitar el like si el usuario ya lo había dado", async () => {
        const saveMock = vi.fn();
        const pullMock = vi.fn(function (id) {
            const index = this.indexOf(id);
                if (index > -1) {
                    this.splice(index, 1);
                }
            }
        );

        const playlistMock = {
            songs: [
                {
                    songId: "s1",
                    likedBy: ["u1"],
                },
            ],
            save: saveMock,
        };

        playlistMock.songs[0].likedBy.pull = pullMock.bind(playlistMock.songs[0].likedBy);

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            body: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await likeText(req, res);

        expect(pullMock).toHaveBeenCalledWith("u1");
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(playlistMock);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        Playlist.findById.mockRejectedValue(new Error("Error inesperado"));

        const req = { 
            body: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
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
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 404 si la playlist no existe", async () => {
        Playlist.findById.mockResolvedValue(null);

        const req = { 
            query: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Playlist no encontrada" });
    });

    it("Debería devolver 404 si la canción no está en la playlist", async () => {
        const playlistMock = {
            songs: [],
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            query: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "No se encontró la canción en la playlist",
        });
    });

    it("Debería devolver liked: true si el usuario ha dado like", async () => {
        const playlistMock = {
            songs: [{
                songId: "s1",
                likedBy: ["u1", "u2"],
            }],
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            query: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ liked: true, totalLikes: 2 });
    });

    it("Debería devolver liked: false si el usuario no ha dado like", async () => {
        const playlistMock = {
            songs: [{
                songId: "s1",
                likedBy: ["u2", "u3"],
            }],
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            query: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ liked: false, totalLikes: 2 });
    });

    it("Debería devolver liked: false y totalLikes 0 si no hay likes", async () => {
        const playlistMock = {
            songs: [{
                songId: "s1",
                likedBy: [],
            }],
        };

        Playlist.findById.mockResolvedValue(playlistMock);

        const req = { 
            query: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ liked: false, totalLikes: 0 });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        Playlist.findById.mockRejectedValue(new Error("Error inesperado"));

        const req = { 
            query: { 
                playlistId: "p1", 
                songId: "s1", 
                userId: "u1" 
            } 
        };

        await getTotalLikesAndLiked(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Se ha producido un error",
        });
    });
});