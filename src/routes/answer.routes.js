import { Router } from "express"
import { ensureAuth } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { answerSchemas } from "../modules/answer/answer.schemas.js"
import { makeAnswerController } from "../modules/answer/answer.controller.js"

export const answerRouter = () => {
    const router = Router()
    const ctrl = makeAnswerController()

    router.use(ensureAuth)

    router.post("/", validate({ body: answerSchemas.createOrUpdate }), ctrl.createOrUpdate)

    return router
}