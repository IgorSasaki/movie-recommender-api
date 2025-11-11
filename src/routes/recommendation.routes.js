import { Router } from "express"
import { recommendationController } from "../modules/recommendations/recommendation.controller.js"
import { ensureAuth } from "../middlewares/auth.js"

export const recommendationRouter = () => {
    const router = Router()
    const ctrl = recommendationController()

    router.get("/", ensureAuth, ctrl.getRecommendations)

    return router
}