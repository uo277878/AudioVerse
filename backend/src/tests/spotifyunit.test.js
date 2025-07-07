import { getToken, search, getTrack, getAlbum, getPlaylistSpotify, getArtist } from "../controllers/spotifycontroller";
import {vi, describe, it, expect, beforeEach} from "vitest";
import { validationResult } from "express-validator";

global.fetch = vi.fn();

vi.mock("express-validator", () => ({
    validationResult: vi.fn()
}));

describe("Método getToken", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver el token si la solicitud a Spotify es exitosa", async () => {
        const mockToken = "token";
        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({ access_token: mockToken }),
        });

        const req = {};

        await getToken(req, res);

        expect(fetch).toHaveBeenCalledWith("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: expect.any(URLSearchParams)
        });

        expect(res.json).toHaveBeenCalledWith(mockToken);
    });

    it("Debería devolver error 500 si fetch falla", async () => {
        fetch.mockRejectedValueOnce(new Error("Spotify API error"));

        const req = {};

        await getToken(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener el token" });
    });
});

describe("Método search", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 401 si no se proporciona token", async () => {
        const req = { 
            body: { 
                token: null,
                input: "test"
            } 
        };

        await search(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Token inválido" });
    });

    it("Debería devolver 422 si hay errores de validación", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "Campo input requerido" }]
        });

        const req = { 
            body: { 
                token: "abc123", 
                input: "" 
            } 
        };

        await search(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith([{ msg: "Campo input requerido" }]);
    });

    it("Debería devolver resultados ordenados por popularidad", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });

        const mockData = {
            artists: { items: [{ popularity: 10 }, { popularity: 90 }] },
            tracks: { items: [{ popularity: 5 }, { popularity: 95 }] },
        };

        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockData)
        });

        const req = {
            body: { 
                token: "abc123", 
                input: "test", 
                orderBy: "popularity" 
            }
        };

        await search(req, res);

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("q=test"), expect.objectContaining({
            headers: expect.objectContaining({ Authorization: "Bearer abc123" })
        }));

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            artists: { items: [{ popularity: 90 }, { popularity: 10 }] },
            tracks: { items: [{ popularity: 95 }, { popularity: 5 }] }
        });
    });

    it("Debería devolver resultados ordenados por fecha", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });

        const mockData = {
            albums: {
                items: [
                    { release_date: "2020-01-01" },
                    { release_date: "2023-01-01" }
                ]
            },
            tracks: {
                items: [
                    { album: { release_date: "2022-01-01" } },
                    { album: { release_date: "2024-01-01" } }
                ]
            }
        };

        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockData)
        });

        const req = {
            body: { 
                token: "abc123", input: "test", orderBy: "releaseDate" }
        };

        await search(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            albums: {
                items: [
                    { release_date: "2023-01-01" },
                    { release_date: "2020-01-01" }
                ]
            },
            tracks: {
                items: [
                    { album: { release_date: "2024-01-01" } },
                    { album: { release_date: "2022-01-01" } }
                ]
            }
        });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        fetch.mockRejectedValueOnce(new Error("Fallo en la API"));

        const req = {
            body: { 
                token: "abc123", 
                input: "test", 
                orderBy: "popularity" 
            }
        };

        await search(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ msg: "Error en la búsqueda de artistas" });
    });
});

describe("Método getTrack", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 400 si faltan parámetros", async () => {
        const req = {
            headers: {},
            params: {}
        };

        await getTrack(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Faltan parámetros" });
    });

    it("Debería devolver los datos del track si el token e id son válidos", async () => {
        const mockTrack = { name: "Canción de prueba", id: "123" };

        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockTrack)
        });

        const req = {
            headers: {
                authorization: "Bearer abc123"
            },
            params: {
                id: "123"
            }
        };

        await getTrack(req, res);

        expect(fetch).toHaveBeenCalledWith(
            "https://api.spotify.com/v1/tracks/123",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    Authorization: "Bearer abc123"
                })
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTrack);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        fetch.mockRejectedValueOnce(new Error("Fallo inesperado"));

        const req = {
            headers: {
                authorization: "Bearer abc123"
            },
            params: {
                id: "123"
            }
        };

        await getTrack(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error en la obtención de la canción" });
    });
});

describe("Método getAlbum", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 400 si faltan parámetros", async () => {
        const req = {
            headers: {},
            params: {}
        };

        await getAlbum(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Faltan parámetros" });
    });

    it("Debería devolver los datos del álbum si el token e id son válidos", async () => {
        const mockAlbum = { name: "Álbum de prueba", id: "abc123" };

        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockAlbum)
        });

        const req = {
            headers: {
                authorization: "Bearer testtoken"
            },
            params: {
                id: "abc123"
            }
        };

        await getAlbum(req, res);

        expect(fetch).toHaveBeenCalledWith(
            "https://api.spotify.com/v1/albums/abc123",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer testtoken"
                }
            }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockAlbum);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        fetch.mockRejectedValueOnce(new Error("Error en fetch"));

        const req = {
            headers: {
                authorization: "Bearer token"
            },
            params: {
                id: "id123"
            }
        };

        await getAlbum(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error en la obtención del album" });
    });
});

describe("Método getPlaylistSpotify", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 400 si faltan parámetros", async () => {
        const req = {
            headers: {},
            params: {}
        };

        await getPlaylistSpotify(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Faltan parámetros" });
    });

    it("Debería devolver los datos de la playlist si token e id son válidos", async () => {
        const mockPlaylist = { name: "Playlist de prueba", id: "playlist123" };

        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockPlaylist)
        });

        const req = {
            headers: {
                authorization: "Bearer validtoken"
            },
            params: {
                id: "playlist123"
            }
        };

        await getPlaylistSpotify(req, res);

        expect(fetch).toHaveBeenCalledWith(
            "https://api.spotify.com/v1/playlists/playlist123",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer validtoken"
                }
            }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockPlaylist);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        fetch.mockRejectedValueOnce(new Error("Fallo inesperado"));

        const req = {
            headers: {
                authorization: "Bearer token"
            },
            params: {
                id: "playlist321"
            }
        };

        await getPlaylistSpotify(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error en la obtención de la playlist" });
    });
});

describe("Método getArtist", () => {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 400 si faltan parámetros", async () => {
        const req = {
            headers: {},
            params: {}
        };

        await getArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Faltan parámetros" });
    });

    it("Debería devolver los datos del artista si token e id son válidos", async () => {
        const mockArtist = { name: "Artista de prueba", id: "artist123" };

        fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockArtist)
        });

        const req = {
            headers: {
                authorization: "Bearer testtoken"
            },
            params: {
                id: "artist123"
            }
        };

        await getArtist(req, res);

        expect(fetch).toHaveBeenCalledWith(
            "https://api.spotify.com/v1/artists/artist123",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer testtoken"
                }
            }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockArtist);
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        fetch.mockRejectedValueOnce(new Error("Error en fetch"));

        const req = {
            headers: {
                authorization: "Bearer token"
            },
            params: {
                id: "id123"
            }
        };

        await getArtist(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error en la obtención del artista" });
    });
});