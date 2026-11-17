
import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const postsContainer = document.getElementById("postsContainer");

if (!postsContainer) {
    console.error("Posts container was not found in index.html");
} else {

    function formatDate(timestamp) {
        if (!timestamp) return "";

        try {
            const date = timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

            if (isNaN(date.getTime())) return "";

            return date.toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        } catch (error) {
            return "";
        }
    }

    function createPostCard(post) {
        const card = document.createElement("article");
        card.className = "post-card";

        // Post image
        if (post.image && post.image.trim() !== "") {
            const image = document.createElement("img");

            image.src = post.image;
            image.alt = post.title || "Twende Adventure update";
            image.className = "post-image";
            image.loading = "lazy";

            image.onerror = () => {
                image.remove();
            };

            card.appendChild(image);
        }

        // Post content
        const content = document.createElement("div");
        content.className = "post-content";

        const title = document.createElement("h3");
        title.textContent = post.title || "Twende Adventure Update";

        const description = document.createElement("p");
        description.textContent = post.content || "";

        content.appendChild(title);
        content.appendChild(description);

        // Publication date
        const dateText = formatDate(post.publishedAt);

        if (dateText) {
            const date = document.createElement("small");
            date.className = "post-date";
            date.textContent = "Published: " + dateText;

            content.appendChild(date);
        }

        card.appendChild(content);

        return card;
    }

    // Automatically listen for new posts and deletions
    onSnapshot(
        collection(db, "posts"),

        (snapshot) => {
            postsContainer.innerHTML = "";

            if (snapshot.empty) {
                postsContainer.innerHTML = `
                    <p class="no-posts">
                        No updates available yet.
                        Check back soon!
                    </p>
                `;
                return;
            }

            const posts = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));

            // Newest posts first
            posts.sort((a, b) => {
                const timeA = a.publishedAt?.toMillis
                    ? a.publishedAt.toMillis()
                    : 0;

                const timeB = b.publishedAt?.toMillis
                    ? b.publishedAt.toMillis()
                    : 0;

                return timeB - timeA;
            });

            posts.forEach(post => {
                postsContainer.appendChild(createPostCard(post));
            });
        },

        (error) => {
            console.error("Firebase posts error:", error);

            postsContainer.innerHTML = `
                <p class="no-posts">
                    Unable to load updates.
                    Please try again later.
                </p>
            `;
        }
    );
}
