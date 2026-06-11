const { Op } = require("sequelize");
const { Post, Media, Tag, PostTag, Report, sequelize } = require("../models");
const {
    isSupabaseStorageConfigured,
    uploadPostImage: uploadPostImageToStorage,
    removePostImage
} = require("../services/mediaStorageService");

const ACTIVE_REPORT_STATUSES = ["pending", "active"];
const DEFAULT_MEDIA_LICENSE = "standard";
const MAX_MEDIA_LICENSE_LENGTH = 30;
const MAX_WATERMARK_LENGTH = 100;
const PRESET_MEDIA_LICENSES = new Set(["standard", "copyright", "cc-by", "cc-by-nc", "public-domain"]);

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const normalizeTagNames = (rawTags) => {
    if (!rawTags) {
        return [];
    }

    const uniqueTags = new Map();

    rawTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => {
            const normalizedKey = tag.toLowerCase();

            if (!uniqueTags.has(normalizedKey)) {
                uniqueTags.set(normalizedKey, tag);
            }
        });

    return Array.from(uniqueTags.values());
};

const hasInvalidTagLength = (rawTags) => normalizeTagNames(rawTags).some((tag) => tag.length > 50);

const normalizeMediaLicense = (licenseOption, customLicense) => {
    const trimmedCustomLicense = customLicense ? customLicense.trim() : "";
    const trimmedLicenseOption = licenseOption ? licenseOption.trim() : "";

    if (trimmedCustomLicense) {
        return trimmedCustomLicense;
    }

    return trimmedLicenseOption || DEFAULT_MEDIA_LICENSE;
};

const buildCreateValues = (overrides = {}) => {
    return {
        title: overrides.title ?? "",
        description: overrides.description ?? "",
        comments_enabled: overrides.comments_enabled ?? true,
        media_url: overrides.media_url ?? "",
        license_option: overrides.license_option ?? DEFAULT_MEDIA_LICENSE,
        license_custom: overrides.license_custom ?? "",
        watermark_text: overrides.watermark_text ?? "",
        tags: overrides.tags ?? ""
    };
};

const buildEditValues = (post, overrides = {}) => {
    const currentMedia = post.media && post.media.length ? post.media[0] : null;
    const currentLicense = currentMedia ? currentMedia.license : "";
    const usesPresetLicense = PRESET_MEDIA_LICENSES.has(currentLicense);

    return {
        title: overrides.title ?? post.title,
        description: overrides.description ?? (post.description || ""),
        comments_enabled: overrides.comments_enabled ?? post.comments_enabled,
        media_url: overrides.media_url ?? (currentMedia ? currentMedia.url : ""),
        license_option: overrides.license_option ?? (usesPresetLicense ? currentLicense : DEFAULT_MEDIA_LICENSE),
        license_custom: overrides.license_custom ?? (currentMedia && !usesPresetLicense ? currentLicense : ""),
        watermark_text: overrides.watermark_text ?? (currentMedia ? (currentMedia.watermark_text || "") : ""),
        tags: overrides.tags ?? (post.tags && post.tags.length ? post.tags.map((tag) => tag.name).join(", ") : "")
    };
};

const buildValuesFromRequest = (req) => {
    return {
        title: req.body.title ? req.body.title.trim() : "",
        description: req.body.description ? req.body.description.trim() : "",
        comments_enabled: req.body.comments_enabled === "on",
        media_url: req.body.media_url ? req.body.media_url.trim() : "",
        license_option: req.body.license_option ? req.body.license_option.trim() : DEFAULT_MEDIA_LICENSE,
        license_custom: req.body.license_custom ? req.body.license_custom.trim() : "",
        watermark_text: req.body.watermark_text ? req.body.watermark_text.trim() : "",
        tags: req.body.tags ? req.body.tags.trim() : ""
    };
};

const renderCreateForm = (res, error, values, statusCode = 400) => {
    return res.status(statusCode).render("posts/create", {
        title: "Crear publicación",
        error,
        values: buildCreateValues(values)
    });
};

const renderEditForm = (res, post, error, values, statusCode = 400) => {
    return res.status(statusCode).render("posts/edit", {
        title: "Editar publicación",
        error,
        post,
        values: buildEditValues(post, values)
    });
};

const getEditablePost = async (postId) => {
    return Post.findByPk(postId, {
        include: [
            {
                model: Media,
                as: "media"
            },
            {
                model: Tag,
                as: "tags",
                attributes: ["id", "name"],
                through: {
                    attributes: []
                }
            }
        ]
    });
};

const getActiveReportCount = async (postId) => {
    return Report.count({
        where: {
            post_id: postId,
            status: {
                [Op.in]: ACTIVE_REPORT_STATUSES
            }
        }
    });
};

const syncPostTags = async (postId, rawTags, transaction) => {
    const tagNames = normalizeTagNames(rawTags);

    await PostTag.destroy({
        where: {
            post_id: postId
        },
        transaction
    });

    for (const tagName of tagNames) {
        let tag = await Tag.findOne({
            where: {
                name: {
                    [Op.iLike]: tagName
                }
            },
            transaction
        });

        if (!tag) {
            tag = await Tag.create({
                name: tagName,
                created_at: new Date()
            }, { transaction });
        }

        await PostTag.findOrCreate({
            where: {
                post_id: postId,
                tag_id: tag.id
            },
            defaults: {
                post_id: postId,
                tag_id: tag.id
            },
            transaction
        });
    }
};

const resolveMediaSource = async (req) => {
    if (req.file) {
        if (!isSupabaseStorageConfigured()) {
            throw new Error("La subida de imágenes requiere configurar Supabase Storage en el servidor.");
        }

        return uploadPostImageToStorage({
            file: req.file,
            userId: req.currentUser.id
        });
    }

    return {
        publicUrl: req.body.media_url ? req.body.media_url.trim() : "",
        storagePath: null
    };
};

const cleanupUploadedMedia = async (uploadedMedia) => {
    if (!uploadedMedia || !uploadedMedia.storagePath) {
        return;
    }

    try {
        await removePostImage(uploadedMedia.storagePath);
    } catch (error) {
        console.error(error.message);
    }
};

const create = async (req, res, next) => {
    const values = buildValuesFromRequest(req);
    const license = normalizeMediaLicense(values.license_option, values.license_custom);
    const hasMediaSource = Boolean(values.media_url || req.file);
    let uploadedMedia = null;
    let transaction = null;

    try {
        if (req.fileUploadErrorMessage) {
            return renderCreateForm(res, req.fileUploadErrorMessage, values);
        }

        if (!values.title) {
            return renderCreateForm(res, "El título es obligatorio.", values);
        }

        if (hasInvalidTagLength(values.tags)) {
            return renderCreateForm(res, "Cada tag debe tener como máximo 50 caracteres.", values);
        }

        if (hasMediaSource && license.length > MAX_MEDIA_LICENSE_LENGTH) {
            return renderCreateForm(res, "La licencia no puede superar los 30 caracteres.", values);
        }

        if (hasMediaSource && values.watermark_text.length > MAX_WATERMARK_LENGTH) {
            return renderCreateForm(res, "La marca de agua no puede superar los 100 caracteres.", values);
        }

        uploadedMedia = await resolveMediaSource(req);
        transaction = await sequelize.transaction();

        const now = new Date();
        const post = await Post.create({
            user_id: req.currentUser.id,
            title: values.title,
            description: values.description || null,
            comments_enabled: values.comments_enabled,
            status: "active",
            created_at: now,
            updated_at: now
        }, { transaction });

        if (uploadedMedia.publicUrl) {
            await Media.create({
                post_id: post.id,
                type: "image",
                url: uploadedMedia.publicUrl,
                license,
                watermark_text: values.watermark_text || null,
                created_at: now
            }, { transaction });
        }

        await syncPostTags(post.id, values.tags, transaction);
        await transaction.commit();

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }

        await cleanupUploadedMedia(uploadedMedia);

        if (
            error.message === "La subida de imágenes requiere configurar Supabase Storage en el servidor."
            || error.message === "No se pudo subir la imagen a Supabase Storage."
        ) {
            return renderCreateForm(res, error.message, values);
        }

        return next(error);
    }
};

const update = async (req, res, next) => {
    const values = buildValuesFromRequest(req);
    const license = normalizeMediaLicense(values.license_option, values.license_custom);
    const hasMediaSource = Boolean(values.media_url || req.file);
    let uploadedMedia = null;
    let transaction = null;

    try {
        const postId = parsePostId(req.params.id);

        if (!postId) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const post = await getEditablePost(postId);

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const isOwner = post.user_id === req.currentUser.id;
        const isValidator = req.currentUser.role === "validator";

        if (!isOwner && !isValidator) {
            return res.status(403).json({
                message: "No tienes permisos para editar esta publicación."
            });
        }

        const activeReportCount = await getActiveReportCount(post.id);

        if (isOwner && activeReportCount > 0) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes editar esta publicación porque tiene denuncias activas.")}`);
        }

        if (req.fileUploadErrorMessage) {
            return renderEditForm(res, post, req.fileUploadErrorMessage, values);
        }

        if (!values.title) {
            return renderEditForm(res, post, "El título es obligatorio.", values);
        }

        if (hasInvalidTagLength(values.tags)) {
            return renderEditForm(res, post, "Cada tag debe tener como máximo 50 caracteres.", values);
        }

        if (hasMediaSource && license.length > MAX_MEDIA_LICENSE_LENGTH) {
            return renderEditForm(res, post, "La licencia no puede superar los 30 caracteres.", values);
        }

        if (hasMediaSource && values.watermark_text.length > MAX_WATERMARK_LENGTH) {
            return renderEditForm(res, post, "La marca de agua no puede superar los 100 caracteres.", values);
        }

        uploadedMedia = await resolveMediaSource(req);
        transaction = await sequelize.transaction();

        await post.update({
            title: values.title,
            description: values.description || null,
            comments_enabled: values.comments_enabled
        }, { transaction });

        const currentMedia = post.media && post.media.length ? post.media[0] : null;
        const finalMediaUrl = uploadedMedia.publicUrl;

        if (finalMediaUrl) {
            if (currentMedia) {
                await currentMedia.update({
                    url: finalMediaUrl,
                    license,
                    watermark_text: values.watermark_text || null
                }, { transaction });
            } else {
                await Media.create({
                    post_id: post.id,
                    type: "image",
                    url: finalMediaUrl,
                    license,
                    watermark_text: values.watermark_text || null,
                    created_at: new Date()
                }, { transaction });
            }
        } else if (currentMedia) {
            await currentMedia.destroy({ transaction });
        }

        await syncPostTags(post.id, values.tags, transaction);
        await transaction.commit();

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }

        await cleanupUploadedMedia(uploadedMedia);

        if (
            error.message === "La subida de imágenes requiere configurar Supabase Storage en el servidor."
            || error.message === "No se pudo subir la imagen a Supabase Storage."
        ) {
            const postId = parsePostId(req.params.id);
            const post = postId ? await getEditablePost(postId) : null;

            if (post) {
                return renderEditForm(res, post, error.message, values);
            }
        }

        return next(error);
    }
};

module.exports = {
    create,
    update
};
