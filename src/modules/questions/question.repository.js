import { Question } from "../../models/Question.js"

export const makeQuestionRepoSequelize = () => {
    const findAll = async () => {
        const questions = await Question.findAll({
        });
        return questions.map(q => q.toJSON());
    }

    return {
        findAll
    }
}
