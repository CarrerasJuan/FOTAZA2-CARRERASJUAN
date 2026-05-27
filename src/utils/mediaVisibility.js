const PUBLIC_MEDIA_LICENSES = new Set(["standard", "public-domain", "cc-by"]);
const RESTRICTED_MEDIA_LICENSES = new Set(["copyright", "cc-by-nc"]);

const normalizeLicenseValue = (license) => (license ? license.trim().toLowerCase() : "");

const isRestrictedMediaForAnonymous = (media) => {
    if (!media) {
        return false;
    }

    const license = normalizeLicenseValue(media.license);

    if (!license) {
        return false;
    }

    if (RESTRICTED_MEDIA_LICENSES.has(license)) {
        return true;
    }

    if (PUBLIC_MEDIA_LICENSES.has(license)) {
        return false;
    }

    return true;
};

const applyMediaVisibilityToPost = (post, isAuthenticated) => {
    if (!post) {
        return post;
    }

    const primaryMedia = post.media && post.media.length ? post.media[0] : null;
    const isRestricted = !isAuthenticated && isRestrictedMediaForAnonymous(primaryMedia);

    post.primaryMedia = primaryMedia;
    post.isMediaRestrictedForAnonymous = isRestricted;
    post.canShowPrimaryMedia = Boolean(primaryMedia) && !isRestricted;
    post.mediaRestrictionMessage = isRestricted ? "Contenido disponible solo para usuarios registrados." : null;

    if (typeof post.setDataValue === "function") {
        post.setDataValue("primaryMedia", post.primaryMedia);
        post.setDataValue("isMediaRestrictedForAnonymous", post.isMediaRestrictedForAnonymous);
        post.setDataValue("canShowPrimaryMedia", post.canShowPrimaryMedia);
        post.setDataValue("mediaRestrictionMessage", post.mediaRestrictionMessage);
    }

    return post;
};

const applyMediaVisibilityToPosts = (posts, isAuthenticated) => posts.map((post) => applyMediaVisibilityToPost(post, isAuthenticated));

module.exports = {
    applyMediaVisibilityToPost,
    applyMediaVisibilityToPosts,
    isRestrictedMediaForAnonymous
};
