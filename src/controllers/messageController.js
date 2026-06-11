const { Message, Interest, Post, User } = require("../models");

const showChat = async (req, res, next) => {
    try {
        const interestId = Number.parseInt(req.params.interestId, 10);

        if (!Number.isInteger(interestId) || interestId <= 0) {
            return res.status(404).render("404", { title: "No encontrado" });
        }

        const interest = await Interest.findByPk(interestId, {
            include: [
                {
                    model: Post,
                    as: "post",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "username"]
                        }
                    ]
                }
            ]
        });

        if (!interest) {
            return res.status(404).render("404", { title: "No encontrado" });
        }

        // Solo el interesado o el autor del post pueden ver el chat
        const isParticipant = req.currentUser.id === interest.user_id
            || req.currentUser.id === interest.post.user_id;

        if (!isParticipant) {
            return res.status(403).send("No tienes permiso para acceder a este chat.");
        }

        const messages = await Message.findAll({
            where: { interest_id: interest.id },
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "username"]
                }
            ],
            order: [["created_at", "ASC"]]
        });

        return res.status(200).render("interests/chat", {
            title: "Conversación",
            interest,
            messages,
            isOwner: req.currentUser.id === interest.post.user_id,
            isInterested: req.currentUser.id === interest.user_id
        });
    } catch (error) {
        return next(error);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const interestId = Number.parseInt(req.params.interestId, 10);

        if (!Number.isInteger(interestId) || interestId <= 0) {
            return res.status(404).json({ error: "Interés no válido" });
        }

        const interest = await Interest.findByPk(interestId, {
            include: [
                {
                    model: Post,
                    as: "post",
                    attributes: ["id", "user_id"]
                }
            ]
        });

        if (!interest) {
            return res.status(404).json({ error: "Interés no encontrado" });
        }

        const isParticipant = req.currentUser.id === interest.user_id
            || req.currentUser.id === interest.post.user_id;

        if (!isParticipant) {
            return res.status(403).json({ error: "No tienes permiso" });
        }

        const content = req.body.content ? req.body.content.trim() : "";

        if (!content) {
            return res.status(400).json({ error: "El mensaje no puede estar vacío." });
        }

        await Message.create({
            interest_id: interest.id,
            sender_id: req.currentUser.id,
            content,
            created_at: new Date()
        });

        return res.redirect(`/interests/${interestId}/chat`);
    } catch (error) {
        return next(error);
    }
};

module.exports = { showChat, sendMessage };
