require("dotenv").config({ override: true, quiet: true });

const {
    sequelize,
    User,
    Post,
    Media,
    Comment,
    Rating,
    Follow,
    Notification,
    Interest,
    Collection,
    CollectionItem,
    Tag,
    PostTag,
    NotificationComment,
    NotificationRating,
    NotificationFollow
} = require("../models");

const seedDemoData = async () => {
    const transaction = await sequelize.transaction();

    try {
        const ana = await User.create({
            username: "ana_fotaza",
            email: "ana.fotaza@example.com",
            password: "fotaza123",
            biography: "Autora de pruebas para navegacion general del sistema.",
            avatar_url: "https://i.pravatar.cc/300?img=32",
            role: "regular",
            status: "active",
            created_at: "2026-05-20 10:00:00",
            updated_at: "2026-05-20 10:00:00"
        }, { transaction });

        const validator = await User.create({
            username: "validador_fotaza",
            email: "validador.fotaza@example.com",
            password: "validator123",
            biography: "Usuario de prueba con rol de validador.",
            avatar_url: "https://i.pravatar.cc/300?img=12",
            role: "validator",
            status: "active",
            created_at: "2026-05-20 10:05:00",
            updated_at: "2026-05-20 10:05:00"
        }, { transaction });

        const bruno = await User.create({
            username: "bruno_comunidad",
            email: "bruno.comunidad@example.com",
            password: "comunidad123",
            biography: "Usuario de prueba para interacciones sociales basicas.",
            avatar_url: "https://i.pravatar.cc/300?img=15",
            role: "regular",
            status: "active",
            created_at: "2026-05-20 10:10:00",
            updated_at: "2026-05-20 10:10:00"
        }, { transaction });

        const postAna = await Post.create({
            user_id: ana.id,
            title: "Atardecer en la costa",
            description: "Publicacion de ejemplo para validar listado, detalle, comentarios y perfil.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-21 18:30:00",
            updated_at: "2026-05-21 18:30:00"
        }, { transaction });

        const postBruno = await Post.create({
            user_id: bruno.id,
            title: "Arquitectura urbana",
            description: "Contenido de prueba para seguir autores, guardar intereses y revisar notificaciones.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 09:15:00",
            updated_at: "2026-05-22 09:15:00"
        }, { transaction });

        const postValidator = await Post.create({
            user_id: validator.id,
            title: "Retrato editorial",
            description: "Publicacion de prueba asociada al usuario con rol de validador.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 16:45:00",
            updated_at: "2026-05-22 16:45:00"
        }, { transaction });

        await Media.bulkCreate([
            {
                post_id: postAna.id,
                type: "image",
                url: "https://picsum.photos/id/10/1200/800",
                license: "standard",
                watermark_text: "ANA",
                created_at: "2026-05-21 18:30:00"
            },
            {
                post_id: postBruno.id,
                type: "image",
                url: "https://picsum.photos/id/1011/1200/800",
                license: "standard",
                watermark_text: "BRUNO",
                created_at: "2026-05-22 09:15:00"
            },
            {
                post_id: postValidator.id,
                type: "image",
                url: "https://picsum.photos/id/1027/1200/800",
                license: "standard",
                watermark_text: "VALIDADOR",
                created_at: "2026-05-22 16:45:00"
            }
        ], { transaction });

        const commentBrunoOnAna = await Comment.create({
            post_id: postAna.id,
            user_id: bruno.id,
            content: "Muy buena luz y buena composicion general.",
            status: "active",
            created_at: "2026-05-22 11:00:00",
            updated_at: "2026-05-22 11:00:00"
        }, { transaction });

        const commentAnaOnBruno = await Comment.create({
            post_id: postBruno.id,
            user_id: ana.id,
            content: "Buen encuadre para una publicacion de prueba.",
            status: "active",
            created_at: "2026-05-22 12:10:00",
            updated_at: "2026-05-22 12:10:00"
        }, { transaction });

        const ratingBrunoOnAna = await Rating.create({
            post_id: postAna.id,
            user_id: bruno.id,
            points: 5,
            created_at: "2026-05-22 11:05:00"
        }, { transaction });

        const ratingValidatorOnAna = await Rating.create({
            post_id: postAna.id,
            user_id: validator.id,
            points: 4,
            created_at: "2026-05-22 11:08:00"
        }, { transaction });

        const ratingAnaOnBruno = await Rating.create({
            post_id: postBruno.id,
            user_id: ana.id,
            points: 4,
            created_at: "2026-05-22 12:15:00"
        }, { transaction });

        await Follow.bulkCreate([
            {
                follower_id: bruno.id,
                following_id: ana.id,
                created_at: "2026-05-22 10:40:00"
            },
            {
                follower_id: ana.id,
                following_id: bruno.id,
                created_at: "2026-05-22 10:45:00"
            }
        ], { transaction });

        const interestBrunoOnAna = await Interest.create({
            user_id: bruno.id,
            post_id: postAna.id,
            created_at: "2026-05-22 13:00:00"
        }, { transaction });

        const interestAnaOnBruno = await Interest.create({
            user_id: ana.id,
            post_id: postBruno.id,
            created_at: "2026-05-22 13:05:00"
        }, { transaction });

        const collectionAna = await Collection.create({
            user_id: ana.id,
            name: "Inspiracion",
            created_at: "2026-05-22 13:20:00",
            updated_at: "2026-05-22 13:20:00"
        }, { transaction });

        const collectionBruno = await Collection.create({
            user_id: bruno.id,
            name: "Urbanas",
            created_at: "2026-05-22 13:25:00",
            updated_at: "2026-05-22 13:25:00"
        }, { transaction });

        await CollectionItem.bulkCreate([
            {
                collection_id: collectionAna.id,
                post_id: postBruno.id,
                created_at: "2026-05-22 13:30:00"
            },
            {
                collection_id: collectionBruno.id,
                post_id: postAna.id,
                created_at: "2026-05-22 13:35:00"
            }
        ], { transaction });

        const [tagPaisaje, tagCosta, tagUrbano, tagRetrato] = await Promise.all([
            Tag.create({ name: "paisaje", created_at: "2026-05-21 18:31:00" }, { transaction }),
            Tag.create({ name: "costa", created_at: "2026-05-21 18:31:00" }, { transaction }),
            Tag.create({ name: "urbano", created_at: "2026-05-22 09:16:00" }, { transaction }),
            Tag.create({ name: "retrato", created_at: "2026-05-22 16:46:00" }, { transaction })
        ]);

        await PostTag.bulkCreate([
            { post_id: postAna.id, tag_id: tagPaisaje.id },
            { post_id: postAna.id, tag_id: tagCosta.id },
            { post_id: postBruno.id, tag_id: tagUrbano.id },
            { post_id: postValidator.id, tag_id: tagRetrato.id }
        ], { transaction });

        const notificationCommentAna = await Notification.create({
            user_id: ana.id,
            actor_id: bruno.id,
            type: "comment",
            is_read: false,
            created_at: "2026-05-22 11:00:00"
        }, { transaction });

        const notificationRatingAna = await Notification.create({
            user_id: ana.id,
            actor_id: validator.id,
            type: "rating",
            is_read: false,
            created_at: "2026-05-22 11:08:00"
        }, { transaction });

        const notificationFollowAna = await Notification.create({
            user_id: ana.id,
            actor_id: bruno.id,
            type: "follow",
            is_read: true,
            created_at: "2026-05-22 10:40:00"
        }, { transaction });

        const notificationCommentBruno = await Notification.create({
            user_id: bruno.id,
            actor_id: ana.id,
            type: "comment",
            is_read: false,
            created_at: "2026-05-22 12:10:00"
        }, { transaction });

        const notificationRatingBruno = await Notification.create({
            user_id: bruno.id,
            actor_id: ana.id,
            type: "rating",
            is_read: true,
            created_at: "2026-05-22 12:15:00"
        }, { transaction });

        await NotificationComment.bulkCreate([
            {
                notification_id: notificationCommentAna.id,
                comment_id: commentBrunoOnAna.id
            },
            {
                notification_id: notificationCommentBruno.id,
                comment_id: commentAnaOnBruno.id
            }
        ], { transaction });

        await NotificationRating.bulkCreate([
            {
                notification_id: notificationRatingAna.id,
                rating_id: ratingValidatorOnAna.id
            },
            {
                notification_id: notificationRatingBruno.id,
                rating_id: ratingAnaOnBruno.id
            }
        ], { transaction });

        await NotificationFollow.create({
            notification_id: notificationFollowAna.id,
            follower_id: bruno.id
        }, { transaction });

        await transaction.commit();

        return {
            users: {
                ana,
                validator,
                bruno
            },
            posts: {
                postAna,
                postBruno,
                postValidator
            },
            interests: {
                interestBrunoOnAna,
                interestAnaOnBruno
            },
            ratings: {
                ratingBrunoOnAna,
                ratingValidatorOnAna,
                ratingAnaOnBruno
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

if (require.main === module) {
    seedDemoData()
        .then(async () => {
            console.log("Seed demo cargado correctamente con Sequelize.");
            await sequelize.close();
        })
        .catch(async (error) => {
            console.error("Error al cargar el seed demo.");
            console.error(error.message);
            await sequelize.close();
            process.exit(1);
        });
}

module.exports = {
    seedDemoData
};
