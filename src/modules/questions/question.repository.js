import { Question } from "../../models/Question.js"

export const makeQuestionRepoSequelize = () => {
    const findAll = async () => {
        const questions = await Question.findAll({
        });
        return questions.map(q => q.toJSON());
    }

    const findById = async (id) => {
        const question = await Question.findByPk(id);
        return question ? question.toJSON() : null;
    }

    return {
        findAll, findById
    }
}
