import { HttpError } from "../../utils/httpError.js";
import { makeQuestionRepoSequelize } from "../questions/question.repository.js";
import { makeAnswerRepoSequelize } from "./answer.repository.sequelize.js";

export const makeAnswerService = () => {
    const answerRepo = makeAnswerRepoSequelize();
    const questionRepo = makeQuestionRepoSequelize();

    const createOrUpdate = async ({ sessionId, questionId, answer }) => {
        if (!Array.isArray(answer) || answer.length === 0) {
            throw new HttpError(400, 'The answer must be a non-empty array');
        }

        const question = await questionRepo.findById(questionId);
        if (!question) {
            throw new HttpError(400, 'Question not found');
        }

        const invalidOptions = answer.filter(opt => !question.options.includes(opt));
        if (invalidOptions.length > 0) {
            throw new HttpError(400, `Invalid answer options: ${invalidOptions.join(', ')}`);
        }

        return await answerRepo.upsert({ sessionId, questionId, answer });
    }

    return { createOrUpdate }
}