import { uploadProfileImage } from "../controllers/uploadcontroller";
import User from '../models/user.js';
import { vi, describe, it, expect, beforeEach } from "vitest";
import {v2 as cloudinary} from "cloudinary";

vi.mock("cloudinary", () => ({
    v2: {
        config: vi.fn(),
        uploader: {
            upload: vi.fn().mockResolvedValue({ secure_url: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/profile_pictures/newpic.jpg" }),
            destroy: vi.fn().mockResolvedValue({ result: "ok" }),
        },
    }
}));

describe("Método uploadProfileImage", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Debería devolver 400 si no se envía ninguna imagen", async () => {
        const req = {
            files: null,
        };

        await uploadProfileImage(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: "No se ha subido ninguna imagen" });
    });

    it("Debería devolver 401 si el formato de la imagen no es válido", async () => {
        const req = {
            files: {
                image: {
                    mimetype: "image/gif",
                },
            },
        };

        await uploadProfileImage(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Formato de imagen no permitido. Solo JPG y PNG" });
    });

    it("Debería devolver 402 si la imagen es mayor de 2MB", async () => {
        const req = {
            files: {
                image: {
                    mimetype: "image/png",
                    size: 3 * 1024 * 1024,
                },
            },
        };

        await uploadProfileImage(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({ msg: "La imagen debe ser menor de 2MB" });
    });

    it("Debería devolver 404 si el usuario no existe", async () => {
        vi.spyOn(User, "findById").mockResolvedValue(null);

        const req = {
            user: { id: "123" },
            files: {
                image: {
                    mimetype: "image/jpeg",
                    size: 500000,
                },
            },
        };

        await uploadProfileImage(req, res);

        expect(User.findById).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ msg: "Usuario no encontrado" });
    });

    it("Debería subir la imagen, reemplazar la anterior si existe y devolver la nueva URL", async () => {
        const mockUser = {
            profilePic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/profile_pictures/oldpic.jpg",
            save: vi.fn(),
        };

        vi.spyOn(User, "findById").mockResolvedValue(mockUser);

        const req = {
            user: { id: "123" },
            files: {
                image: {
                    mimetype: "image/jpeg",
                    size: 500000,
                    tempFilePath: "/tmp/image.jpg",
                },
            },
        };

        const mockUploadResult = {
            secure_url: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/profile_pictures/newpic.jpg",
        };

        cloudinary.uploader.upload = vi.fn().mockResolvedValue(mockUploadResult);
        cloudinary.uploader.destroy = vi.fn().mockResolvedValue({ result: "ok" });

        await uploadProfileImage(req, res);

        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("profile_pictures/oldpic");
        expect(cloudinary.uploader.upload).toHaveBeenCalledWith("/tmp/image.jpg", {
            folder: "profile_pictures",
        });
        expect(mockUser.profilePic).toBe(mockUploadResult.secure_url);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ profilePic: mockUploadResult.secure_url });
    });

    it("Debería devolver 500 si ocurre un error inesperado", async () => {
        vi.spyOn(User, "findById").mockImplementation(() => {
            throw new Error("DB error");
        });

        const req = {
            user: { id: "123" },
            files: {
                image: {
                    mimetype: "image/png",
                    size: 1000000,
                    tempFilePath: "/tmp/image.png",
                },
            },
        };

        await uploadProfileImage(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: "Error al subir la imagen" }));
    });
});