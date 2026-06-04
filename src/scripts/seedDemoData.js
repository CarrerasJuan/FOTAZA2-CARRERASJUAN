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
    NotificationFollow,
    NotificationInterest
} = require("../models");

const seedDemoData = async () => {
    const transaction = await sequelize.transaction();

    try {
        const ana = await User.create({
            username: "ana_ledesma",
            email: "ana.fotaza@test.com",
            password: "Fotaza123!",
            biography: "Fotografa de paisaje y viajes, enfocada en luz natural y escenas costeras.",
            avatar_url: "https://i.pravatar.cc/300?img=32",
            role: "regular",
            status: "active",
            created_at: "2026-05-20 10:00:00",
            updated_at: "2026-05-20 10:00:00"
        }, { transaction });

        const bruno = await User.create({
            username: "bruno_comunidad",
            email: "bruno.fotaza@test.com",
            password: "Fotaza123!",
            biography: "Autor de retrato urbano y fotografia social con base en San Luis.",
            avatar_url: "https://i.pravatar.cc/300?img=15",
            role: "regular",
            status: "active",
            created_at: "2026-05-20 10:10:00",
            updated_at: "2026-05-20 10:10:00"
        }, { transaction });

        const clara = await User.create({
            username: "clara_estudio",
            email: "clara.fotaza@test.com",
            password: "Fotaza123!",
            biography: "Trabaja entre estudio y fotografia de producto para marcas artesanales.",
            avatar_url: "https://i.pravatar.cc/300?img=47",
            role: "regular",
            status: "active",
            created_at: "2026-05-20 10:20:00",
            updated_at: "2026-05-20 10:20:00"
        }, { transaction });

        const tomas = await User.create({
            username: "tomas_editorial",
            email: "tomas.fotaza@test.com",
            password: "Fotaza123!",
            biography: "Fotografo editorial y usuario validador con interes en retrato y arquitectura.",
            avatar_url: "https://i.pravatar.cc/300?img=12",
            role: "validator",
            status: "active",
            created_at: "2026-05-20 10:30:00",
            updated_at: "2026-05-20 10:30:00"
        }, { transaction });

        const postAtardecer = await Post.create({
            user_id: ana.id,
            title: "Atardecer en la costa",
            description: "Serie capturada al final de la tarde con luz calida y un horizonte despejado.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-21 18:30:00",
            updated_at: "2026-05-21 18:30:00"
        }, { transaction });

        const postMontana = await Post.create({
            user_id: ana.id,
            title: "Paisaje de montana",
            description: "Vista abierta de la sierra despues de una manana fria y con neblina baja.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 08:10:00",
            updated_at: "2026-05-22 08:10:00"
        }, { transaction });

        const postRetrato = await Post.create({
            user_id: bruno.id,
            title: "Retrato urbano en San Luis",
            description: "Retrato espontaneo en vereda con textura de pared y contraste suave de tarde.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 09:15:00",
            updated_at: "2026-05-22 09:15:00"
        }, { transaction });

        const postMercado = await Post.create({
            user_id: bruno.id,
            title: "Texturas de mercado",
            description: "Escena documental de mercado con puestos, carteles y circulacion cotidiana en blanco y negro.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 10:25:00",
            updated_at: "2026-05-22 10:25:00"
        }, { transaction });

        const postProducto = await Post.create({
            user_id: clara.id,
            title: "Sesion de producto artesanal",
            description: "Composicion de piezas ceramicas con fondo neutro para catalogo y campana digital.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 11:40:00",
            updated_at: "2026-05-22 11:40:00"
        }, { transaction });

        const postEstudio = await Post.create({
            user_id: clara.id,
            title: "Luz de estudio",
            description: "Esquema de iluminacion continua para retrato editorial de perfil corto.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 16:20:00",
            updated_at: "2026-05-22 16:20:00"
        }, { transaction });

        const postArquitectura = await Post.create({
            user_id: tomas.id,
            title: "Arquitectura moderna",
            description: "Lineas limpias, reflejos en vidrio y encuadre frontal de un edificio contemporaneo.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-22 16:45:00",
            updated_at: "2026-05-22 16:45:00"
        }, { transaction });

        const postNaturaleza = await Post.create({
            user_id: tomas.id,
            title: "Naturaleza serrana",
            description: "Recorrido visual entre senderos, vegetacion baja y luz lateral sobre la piedra.",
            comments_enabled: true,
            status: "active",
            created_at: "2026-05-23 08:30:00",
            updated_at: "2026-05-23 08:30:00"
        }, { transaction });

        await Media.bulkCreate([
            {
                post_id: postAtardecer.id,
                type: "image",
                url: "/images/demo/paisaje-costero.webp",
                license: "standard",
                watermark_text: "ANA LEDESMA",
                created_at: "2026-05-21 18:30:00"
            },
            {
                post_id: postMontana.id,
                type: "image",
                url: "/images/demo/paisaje-serrano-neblina.webp",
                license: "cc-by",
                watermark_text: "ANA LEDESMA",
                created_at: "2026-05-22 08:10:00"
            },
            {
                post_id: postRetrato.id,
                type: "image",
                url: "/images/demo/retrato-luz-natural.webp",
                license: "standard",
                watermark_text: "BRUNO",
                created_at: "2026-05-22 09:15:00"
            },
            {
                post_id: postMercado.id,
                type: "image",
                url: "/images/demo/documental-blanco-negro.webp",
                license: "standard",
                watermark_text: "BRUNO",
                created_at: "2026-05-22 10:25:00"
            },
            {
                post_id: postProducto.id,
                type: "image",
                url: "/images/demo/producto-editorial.webp",
                license: "copyright",
                watermark_text: "CLARA ESTUDIO",
                created_at: "2026-05-22 11:40:00"
            },
            {
                post_id: postEstudio.id,
                type: "image",
                url: "/images/demo/retrato-estudio-editorial.webp",
                license: "standard",
                watermark_text: "CLARA ESTUDIO",
                created_at: "2026-05-22 16:20:00"
            },
            {
                post_id: postArquitectura.id,
                type: "image",
                url: "/images/demo/detalle-arquitectonico.webp",
                license: "cc-by-nc",
                watermark_text: "TOMAS",
                created_at: "2026-05-22 16:45:00"
            },
            {
                post_id: postNaturaleza.id,
                type: "image",
                url: "/images/demo/naturaleza-serrana.webp",
                license: "standard",
                watermark_text: "TOMAS",
                created_at: "2026-05-23 08:30:00"
            }
        ], { transaction });

        const commentBrunoOnAtardecer = await Comment.create({
            post_id: postAtardecer.id,
            user_id: bruno.id,
            content: "Muy buena composición, me gustó el encuadre y la calma que transmite.",
            status: "active",
            created_at: "2026-05-22 11:00:00",
            updated_at: "2026-05-22 11:00:00"
        }, { transaction });

        const commentClaraOnRetrato = await Comment.create({
            post_id: postRetrato.id,
            user_id: clara.id,
            content: "La luz quedó excelente en esta toma y el fondo acompaña muy bien al sujeto.",
            status: "active",
            created_at: "2026-05-22 12:10:00",
            updated_at: "2026-05-22 12:10:00"
        }, { transaction });

        const commentTomasOnProducto = await Comment.create({
            post_id: postProducto.id,
            user_id: tomas.id,
            content: "Me interesa esta imagen como referencia visual para una campaña de objetos pequeños.",
            status: "active",
            created_at: "2026-05-22 13:10:00",
            updated_at: "2026-05-22 13:10:00"
        }, { transaction });

        const commentAnaOnArquitectura = await Comment.create({
            post_id: postArquitectura.id,
            user_id: ana.id,
            content: "Gran contraste entre líneas, reflejos y cielo. La perspectiva quedó muy sólida.",
            status: "active",
            created_at: "2026-05-22 17:05:00",
            updated_at: "2026-05-22 17:05:00"
        }, { transaction });

        const ratingBrunoOnAtardecer = await Rating.create({
            post_id: postAtardecer.id,
            user_id: bruno.id,
            points: 5,
            created_at: "2026-05-22 11:05:00"
        }, { transaction });

        const ratingTomasOnAtardecer = await Rating.create({
            post_id: postAtardecer.id,
            user_id: tomas.id,
            points: 4,
            created_at: "2026-05-22 11:08:00"
        }, { transaction });

        const ratingAnaOnRetrato = await Rating.create({
            post_id: postRetrato.id,
            user_id: ana.id,
            points: 4,
            created_at: "2026-05-22 12:15:00"
        }, { transaction });

        const ratingClaraOnArquitectura = await Rating.create({
            post_id: postArquitectura.id,
            user_id: clara.id,
            points: 5,
            created_at: "2026-05-22 17:12:00"
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
            },
            {
                follower_id: clara.id,
                following_id: tomas.id,
                created_at: "2026-05-22 11:15:00"
            },
            {
                follower_id: tomas.id,
                following_id: clara.id,
                created_at: "2026-05-22 11:18:00"
            }
        ], { transaction });

        const interestBrunoOnAtardecer = await Interest.create({
            user_id: bruno.id,
            post_id: postAtardecer.id,
            created_at: "2026-05-22 13:00:00"
        }, { transaction });

        const interestAnaOnRetrato = await Interest.create({
            user_id: ana.id,
            post_id: postRetrato.id,
            created_at: "2026-05-22 13:05:00"
        }, { transaction });

        const interestTomasOnProducto = await Interest.create({
            user_id: tomas.id,
            post_id: postProducto.id,
            created_at: "2026-05-22 13:15:00"
        }, { transaction });

        const collectionAna = await Collection.create({
            user_id: ana.id,
            name: "Paisajes favoritos",
            created_at: "2026-05-22 13:20:00",
            updated_at: "2026-05-22 13:20:00"
        }, { transaction });

        const collectionBruno = await Collection.create({
            user_id: bruno.id,
            name: "Inspiración urbana",
            created_at: "2026-05-22 13:25:00",
            updated_at: "2026-05-22 13:25:00"
        }, { transaction });

        const collectionClara = await Collection.create({
            user_id: clara.id,
            name: "Referencias para campañas",
            created_at: "2026-05-22 13:28:00",
            updated_at: "2026-05-22 13:28:00"
        }, { transaction });

        await CollectionItem.bulkCreate([
            {
                collection_id: collectionAna.id,
                post_id: postNaturaleza.id,
                created_at: "2026-05-22 13:30:00"
            },
            {
                collection_id: collectionAna.id,
                post_id: postArquitectura.id,
                created_at: "2026-05-22 13:32:00"
            },
            {
                collection_id: collectionBruno.id,
                post_id: postArquitectura.id,
                created_at: "2026-05-22 13:35:00"
            },
            {
                collection_id: collectionBruno.id,
                post_id: postEstudio.id,
                created_at: "2026-05-22 13:36:00"
            },
            {
                collection_id: collectionClara.id,
                post_id: postRetrato.id,
                created_at: "2026-05-22 13:38:00"
            },
            {
                collection_id: collectionClara.id,
                post_id: postAtardecer.id,
                created_at: "2026-05-22 13:40:00"
            }
        ], { transaction });

        const [
            tagRetrato,
            tagPaisaje,
            tagUrbana,
            tagNaturaleza,
            tagProducto,
            tagArquitectura,
            tagBlancoNegro,
            tagEditorial
        ] = await Promise.all([
            Tag.create({ name: "retrato", created_at: "2026-05-21 18:31:00" }, { transaction }),
            Tag.create({ name: "paisaje", created_at: "2026-05-21 18:32:00" }, { transaction }),
            Tag.create({ name: "urbana", created_at: "2026-05-21 18:33:00" }, { transaction }),
            Tag.create({ name: "naturaleza", created_at: "2026-05-21 18:34:00" }, { transaction }),
            Tag.create({ name: "producto", created_at: "2026-05-21 18:35:00" }, { transaction }),
            Tag.create({ name: "arquitectura", created_at: "2026-05-21 18:36:00" }, { transaction }),
            Tag.create({ name: "blanco-y-negro", created_at: "2026-05-21 18:37:00" }, { transaction }),
            Tag.create({ name: "editorial", created_at: "2026-05-21 18:38:00" }, { transaction })
        ]);

        await PostTag.bulkCreate([
            { post_id: postAtardecer.id, tag_id: tagPaisaje.id },
            { post_id: postAtardecer.id, tag_id: tagNaturaleza.id },
            { post_id: postMontana.id, tag_id: tagPaisaje.id },
            { post_id: postMontana.id, tag_id: tagNaturaleza.id },
            { post_id: postRetrato.id, tag_id: tagRetrato.id },
            { post_id: postRetrato.id, tag_id: tagUrbana.id },
            { post_id: postMercado.id, tag_id: tagUrbana.id },
            { post_id: postMercado.id, tag_id: tagBlancoNegro.id },
            { post_id: postProducto.id, tag_id: tagProducto.id },
            { post_id: postProducto.id, tag_id: tagEditorial.id },
            { post_id: postEstudio.id, tag_id: tagEditorial.id },
            { post_id: postEstudio.id, tag_id: tagRetrato.id },
            { post_id: postArquitectura.id, tag_id: tagArquitectura.id },
            { post_id: postArquitectura.id, tag_id: tagUrbana.id },
            { post_id: postNaturaleza.id, tag_id: tagNaturaleza.id },
            { post_id: postNaturaleza.id, tag_id: tagPaisaje.id }
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
            actor_id: tomas.id,
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

        const notificationInterestAna = await Notification.create({
            user_id: ana.id,
            actor_id: bruno.id,
            type: "interest",
            is_read: false,
            created_at: "2026-05-22 13:00:00"
        }, { transaction });

        const notificationCommentBruno = await Notification.create({
            user_id: bruno.id,
            actor_id: clara.id,
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

        const notificationCommentClara = await Notification.create({
            user_id: clara.id,
            actor_id: tomas.id,
            type: "comment",
            is_read: false,
            created_at: "2026-05-22 13:10:00"
        }, { transaction });

        const notificationFollowClara = await Notification.create({
            user_id: clara.id,
            actor_id: tomas.id,
            type: "follow",
            is_read: true,
            created_at: "2026-05-22 11:18:00"
        }, { transaction });

        const notificationInterestClara = await Notification.create({
            user_id: clara.id,
            actor_id: tomas.id,
            type: "interest",
            is_read: false,
            created_at: "2026-05-22 13:15:00"
        }, { transaction });

        const notificationCommentTomas = await Notification.create({
            user_id: tomas.id,
            actor_id: ana.id,
            type: "comment",
            is_read: false,
            created_at: "2026-05-22 17:05:00"
        }, { transaction });

        const notificationRatingTomas = await Notification.create({
            user_id: tomas.id,
            actor_id: clara.id,
            type: "rating",
            is_read: false,
            created_at: "2026-05-22 17:12:00"
        }, { transaction });

        await NotificationComment.bulkCreate([
            {
                notification_id: notificationCommentAna.id,
                comment_id: commentBrunoOnAtardecer.id
            },
            {
                notification_id: notificationCommentBruno.id,
                comment_id: commentClaraOnRetrato.id
            },
            {
                notification_id: notificationCommentClara.id,
                comment_id: commentTomasOnProducto.id
            },
            {
                notification_id: notificationCommentTomas.id,
                comment_id: commentAnaOnArquitectura.id
            }
        ], { transaction });

        await NotificationRating.bulkCreate([
            {
                notification_id: notificationRatingAna.id,
                rating_id: ratingTomasOnAtardecer.id
            },
            {
                notification_id: notificationRatingBruno.id,
                rating_id: ratingAnaOnRetrato.id
            },
            {
                notification_id: notificationRatingTomas.id,
                rating_id: ratingClaraOnArquitectura.id
            }
        ], { transaction });

        await NotificationFollow.bulkCreate([
            {
                notification_id: notificationFollowAna.id,
                follower_id: bruno.id
            },
            {
                notification_id: notificationFollowClara.id,
                follower_id: tomas.id
            }
        ], { transaction });

        await NotificationInterest.bulkCreate([
            {
                notification_id: notificationInterestAna.id,
                interest_id: interestBrunoOnAtardecer.id
            },
            {
                notification_id: notificationInterestClara.id,
                interest_id: interestTomasOnProducto.id
            }
        ], { transaction });

        await transaction.commit();

        return {
            users: {
                ana,
                bruno,
                clara,
                tomas
            },
            posts: {
                postAtardecer,
                postMontana,
                postRetrato,
                postMercado,
                postProducto,
                postEstudio,
                postArquitectura,
                postNaturaleza
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
