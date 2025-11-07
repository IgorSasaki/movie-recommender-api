import { Router } from "express"
import { authController } from "../modules/auth/auth.controller.js"

export const authRouter = () => {
    const router = Router()
    const ctrl = authController()

    router.post('/session', ctrl.create)

    return router
}