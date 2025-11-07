import { authService } from './auth.service.js';

export const authController = () => {
    const service = authService();

    const create = (_, response, next) => {
        try {
            const { accessToken } = service.createSession();
            return response.status(201).json({ accessToken });
        } catch (error) {
            return next(error);
        }
    };

    return { create };
};
