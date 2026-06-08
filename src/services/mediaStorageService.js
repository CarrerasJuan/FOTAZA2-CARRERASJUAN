const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const requiredEnvironmentVariables = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_STORAGE_BUCKET"
];

const imageExtensionsByMimeType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
};

const isSupabaseStorageConfigured = () => requiredEnvironmentVariables.every((variableName) => Boolean(process.env[variableName]));

const getMissingSupabaseVariables = () => {
    return requiredEnvironmentVariables.filter((variableName) => !process.env[variableName]);
};

const getSupabaseClient = () => {
    const missingVariables = getMissingSupabaseVariables();

    if (missingVariables.length) {
        throw new Error(`Faltan variables de entorno para Supabase Storage: ${missingVariables.join(", ")}`);
    }

    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

const uploadFile = async ({ file, userId, folder }) => {
    const client = getSupabaseClient();
    const extension = imageExtensionsByMimeType[file.mimetype];

    if (!extension) {
        throw new Error("El tipo de archivo de imagen no es compatible.");
    }

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET;
    const storagePath = `${folder}/${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await client.storage.from(bucketName).upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false
    });

    if (uploadError) {
        throw new Error(`No se pudo subir el archivo a Supabase Storage.`);
    }

    const { data } = client.storage.from(bucketName).getPublicUrl(storagePath);

    return {
        publicUrl: data.publicUrl,
        storagePath
    };
};

const uploadPostImage = async ({ file, userId }) => {
    return uploadFile({ file, userId, folder: "posts" });
};

const removePostImage = async (storagePath) => {
    if (!storagePath || !isSupabaseStorageConfigured()) {
        return;
    }

    const client = getSupabaseClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET;
    const { error } = await client.storage.from(bucketName).remove([storagePath]);

    if (error) {
        throw new Error("No se pudo eliminar la imagen de Supabase Storage.");
    }
};

const uploadAvatar = async ({ file, userId }) => {
    if (!file || !file.buffer) {
        throw new Error("No se proporcionó un archivo de avatar válido.");
    }

    return uploadFile({ file, userId, folder: "posts" });
};

const removeAvatar = async (storagePath) => {
    if (!storagePath || !isSupabaseStorageConfigured()) {
        return;
    }

    const client = getSupabaseClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET;
    const { error } = await client.storage.from(bucketName).remove([storagePath]);

    if (error) {
        throw new Error("No se pudo eliminar el avatar de Supabase Storage.");
    }
};

module.exports = {
    isSupabaseStorageConfigured,
    uploadPostImage,
    removePostImage,
    uploadAvatar,
    removeAvatar
};
