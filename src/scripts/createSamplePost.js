const { sequelize, User, Post, Media } = require("../models");

const createSamplePost = async () => {
    const now = new Date();

    try {
        const [user] = await User.findOrCreate({
            where: {
                email: "fotaza.demo@example.com"
            },
            defaults: {
                username: "fotaza_demo",
                email: "fotaza.demo@example.com",
                password: "demo_password_hash",
                biography: "Usuario de prueba para validar el flujo inicial de publicaciones.",
                avatar_url: null,
                role: "regular",
                status: "active",
                created_at: now,
                updated_at: now
            }
        });

        const [post] = await Post.findOrCreate({
            where: {
                user_id: user.id,
                title: "Primera publicación de prueba"
            },
            defaults: {
                user_id: user.id,
                title: "Primera publicación de prueba",
                description: "Contenido mínimo de ejemplo para validar el listado y detalle de publicaciones.",
                comments_enabled: true,
                status: "active",
                created_at: now,
                updated_at: now
            }
        });

        await Media.findOrCreate({
            where: {
                post_id: post.id,
                url: "https://example.com/media/fotaza-demo.jpg"
            },
            defaults: {
                post_id: post.id,
                type: "image",
                url: "https://example.com/media/fotaza-demo.jpg",
                license: "standard",
                watermark_text: "FOTAZA DEMO",
                created_at: now
            }
        });

        console.log(`Publicación de prueba lista con ID ${post.id}.`);
    } catch (error) {
        console.error("Error al crear la publicación de prueba.");
        throw error;
    } finally {
        await sequelize.close();
    }
};

createSamplePost();
