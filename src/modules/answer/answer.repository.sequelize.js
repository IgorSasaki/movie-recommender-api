import { Answer } from "../../models/Answer.js";
import { Question } from "../../models/Question.js";

export const makeAnswerRepoSequelize = () => {
    const upsert = async ({ sessionId, questionId, answer }) => {
        const [answerRecord, created] = await Answer.upsert(
            {
                sessionId,
                questionId,
                answer
            },
            {
                returning: true
            }
        );

        const result = await Answer.findByPk(answerRecord.id, {
            include: [
                {
                    model: Question,
                    as: 'question',
                    attributes: ['text']
                }
            ]
        });

        return result.toJSON();
    }

    const findById = async (id) => {
        const answer = await Answer.findByPk(id, {
            include: [
                {
                    model: Question,
                    as: 'question',
                    attributes: ['id', 'text', 'options']
                }
            ]
        });

        return answer ? answer.toJSON() : null;
    }

    const deleteBySession = async (sessionId) => {
        return await Answer.destroy({ where: { sessionId } });
    }

    const countBySession = async (sessionId) => {
        return await Answer.count({ where: { sessionId } });
    }

    return {
        upsert,
        findById,
        deleteBySession,
        countBySession
    }
}