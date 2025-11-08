import { makeAnswerService } from "./answer.service.js"

export const makeAnswerController = () => {
    const service = makeAnswerService()

    const createOrUpdate = async (request, response, next) => {
        try {
            const { sessionId } = request.session;
            const { questionId, answer } = request.body;

            const result = await service.createOrUpdate({ sessionId, questionId, answer });

            return success(response, result, 'Resposta salva com sucesso', 201);
        } catch (error) {
            next(error);
        }
    }

    return { createOrUpdate }
}