(function () {
    const updateCountLabel = (countNode, count) => {
        if (!countNode) {
            return;
        }

        const emptyLabel = countNode.dataset.emptyLabel || "Sin comentarios todavia";
        const singularLabel = countNode.dataset.singularLabel || "1 comentario";
        const pluralSuffix = countNode.dataset.pluralLabel || "comentarios";

        if (count <= 0) {
            countNode.textContent = emptyLabel;
            return;
        }

        if (count === 1) {
            countNode.textContent = singularLabel;
            return;
        }

        countNode.textContent = `${count} ${pluralSuffix}`;
    };

    const ensureEmptyState = (container) => {
        if (!container) {
            return;
        }

        const list = container.querySelector("[data-comment-list]");
        const hasComments = Boolean(list && list.querySelector("[data-comment-item]"));
        let emptyState = container.querySelector("[data-comment-empty-state]");

        if (hasComments) {
            if (emptyState) {
                emptyState.remove();
            }

            return;
        }

        if (emptyState) {
            return;
        }

        emptyState = document.createElement("p");
        emptyState.className = "text-muted";
        emptyState.setAttribute("data-comment-empty-state", "");
        emptyState.textContent = "Todavia no hay conversacion en esta publicacion.";
        container.appendChild(emptyState);
    };

    const bindDeleteComment = (form) => {
        if (!form || form.dataset.commentDeleteBound === "true") {
            return;
        }

        form.dataset.commentDeleteBound = "true";

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const submitButton = form.querySelector("button[type='submit']");
            const currentLabel = submitButton ? submitButton.textContent : "";
            const payload = new URLSearchParams(new FormData(form));

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Eliminando...";
            }

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    },
                    body: payload.toString()
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "No se pudo eliminar el comentario.");
                }

                const commentItem = form.closest("[data-comment-item]");
                const container = form.closest(".panel, .feed-card__body");
                const countNode = container ? container.querySelector("[data-comment-count]") : null;

                if (commentItem) {
                    commentItem.remove();
                }

                updateCountLabel(countNode, Number(data.remainingComments || 0));
                ensureEmptyState(container);
            } catch (error) {
                window.alert(error.message || "No se pudo eliminar el comentario.");

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = currentLabel;
                }
            }
        });
    };

    document.querySelectorAll("[data-comment-delete-form]").forEach(bindDeleteComment);
})();
