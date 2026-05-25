BEGIN;

INSERT INTO "users" ("id", "username", "email", "password", "biography", "avatar_url", "role", "status", "created_at", "updated_at")
VALUES
  (1, 'ana_fotaza', 'ana.fotaza@example.com', '$2b$10$Sn7JmgLlidwndUaFbtAEQ.xzuiJCS1DrKSbNvCz3IYUAvR0rVoZR6', 'Autora de pruebas para navegacion general del sistema.', 'https://i.pravatar.cc/300?img=32', 'regular', 'active', '2026-05-20 10:00:00', '2026-05-20 10:00:00'),
  (2, 'validador_fotaza', 'validador.fotaza@example.com', '$2b$10$1zue7QPqx0HEIFbZyJNz7.lmCLwdrR4pHzmjcnmHqZ08lfMi4WcfG', 'Usuario de prueba con rol de validador.', 'https://i.pravatar.cc/300?img=12', 'validator', 'active', '2026-05-20 10:05:00', '2026-05-20 10:05:00'),
  (3, 'bruno_comunidad', 'bruno.comunidad@example.com', '$2b$10$rXz2kbAZVqaObA3IYWNuq.LjxgDnUT14GlNhKyMSOl8I3a6j4joZK', 'Usuario de prueba para interacciones sociales basicas.', 'https://i.pravatar.cc/300?img=15', 'regular', 'active', '2026-05-20 10:10:00', '2026-05-20 10:10:00');

INSERT INTO "posts" ("id", "user_id", "title", "description", "comments_enabled", "status", "created_at", "updated_at")
VALUES
  (1, 1, 'Atardecer en la costa', 'Publicacion de ejemplo para validar listado, detalle, comentarios y perfil.', true, 'active', '2026-05-21 18:30:00', '2026-05-21 18:30:00'),
  (2, 3, 'Arquitectura urbana', 'Contenido de prueba para seguir autores, guardar intereses y revisar notificaciones.', true, 'active', '2026-05-22 09:15:00', '2026-05-22 09:15:00'),
  (3, 2, 'Retrato editorial', 'Publicacion de prueba asociada al usuario con rol de validador.', true, 'active', '2026-05-22 16:45:00', '2026-05-22 16:45:00');

INSERT INTO "media" ("id", "post_id", "type", "url", "license", "watermark_text", "created_at")
VALUES
  (1, 1, 'image', 'https://picsum.photos/id/10/1200/800', 'standard', 'ANA', '2026-05-21 18:30:00'),
  (2, 2, 'image', 'https://picsum.photos/id/1011/1200/800', 'standard', 'BRUNO', '2026-05-22 09:15:00'),
  (3, 3, 'image', 'https://picsum.photos/id/1027/1200/800', 'standard', 'VALIDADOR', '2026-05-22 16:45:00');

INSERT INTO "comments" ("id", "post_id", "user_id", "content", "status", "created_at", "updated_at")
VALUES
  (1, 1, 3, 'Muy buena luz y buena composicion general.', 'active', '2026-05-22 11:00:00', '2026-05-22 11:00:00'),
  (2, 2, 1, 'Buen encuadre para una publicacion de prueba.', 'active', '2026-05-22 12:10:00', '2026-05-22 12:10:00');

INSERT INTO "ratings" ("id", "post_id", "user_id", "points", "created_at")
VALUES
  (1, 1, 3, 5, '2026-05-22 11:05:00'),
  (2, 1, 2, 4, '2026-05-22 11:08:00'),
  (3, 2, 1, 4, '2026-05-22 12:15:00');

INSERT INTO "follows" ("follower_id", "following_id", "created_at")
VALUES
  (3, 1, '2026-05-22 10:40:00'),
  (1, 3, '2026-05-22 10:45:00');

INSERT INTO "interests" ("id", "user_id", "post_id", "created_at")
VALUES
  (1, 3, 1, '2026-05-22 13:00:00'),
  (2, 1, 2, '2026-05-22 13:05:00');

INSERT INTO "collections" ("id", "user_id", "name", "created_at", "updated_at")
VALUES
  (1, 1, 'Inspiracion', '2026-05-22 13:20:00', '2026-05-22 13:20:00'),
  (2, 3, 'Urbanas', '2026-05-22 13:25:00', '2026-05-22 13:25:00');

INSERT INTO "collection_items" ("collection_id", "post_id", "created_at")
VALUES
  (1, 2, '2026-05-22 13:30:00'),
  (2, 1, '2026-05-22 13:35:00');

INSERT INTO "tags" ("id", "name", "created_at")
VALUES
  (1, 'paisaje', '2026-05-21 18:31:00'),
  (2, 'costa', '2026-05-21 18:31:00'),
  (3, 'urbano', '2026-05-22 09:16:00'),
  (4, 'retrato', '2026-05-22 16:46:00');

INSERT INTO "post_tags" ("post_id", "tag_id")
VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 4);

INSERT INTO "notifications" ("id", "user_id", "actor_id", "type", "is_read", "created_at")
VALUES
  (1, 1, 3, 'comment', false, '2026-05-22 11:00:00'),
  (2, 1, 2, 'rating', false, '2026-05-22 11:08:00'),
  (3, 1, 3, 'follow', true, '2026-05-22 10:40:00'),
  (4, 3, 1, 'comment', false, '2026-05-22 12:10:00'),
  (5, 3, 1, 'rating', true, '2026-05-22 12:15:00');

INSERT INTO "notification_comments" ("notification_id", "comment_id")
VALUES
  (1, 1),
  (4, 2);

INSERT INTO "notification_ratings" ("notification_id", "rating_id")
VALUES
  (2, 2),
  (5, 3);

INSERT INTO "notification_follows" ("notification_id", "follower_id")
VALUES
  (3, 3);

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX("id"), 1), true) FROM "users";
SELECT setval(pg_get_serial_sequence('posts', 'id'), COALESCE(MAX("id"), 1), true) FROM "posts";
SELECT setval(pg_get_serial_sequence('media', 'id'), COALESCE(MAX("id"), 1), true) FROM "media";
SELECT setval(pg_get_serial_sequence('comments', 'id'), COALESCE(MAX("id"), 1), true) FROM "comments";
SELECT setval(pg_get_serial_sequence('ratings', 'id'), COALESCE(MAX("id"), 1), true) FROM "ratings";
SELECT setval(pg_get_serial_sequence('reports', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('interests', 'id'), COALESCE(MAX("id"), 1), true) FROM "interests";
SELECT setval(pg_get_serial_sequence('collections', 'id'), COALESCE(MAX("id"), 1), true) FROM "collections";
SELECT setval(pg_get_serial_sequence('tags', 'id'), COALESCE(MAX("id"), 1), true) FROM "tags";
SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE(MAX("id"), 1), true) FROM "notifications";

COMMIT;
