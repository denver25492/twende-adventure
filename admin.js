
import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const ADMIN_EMAIL = "borrisbundi@gmail.com";

// PAGE ELEMENTS
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const tripForm = document.getElementById("tripForm");
const tripsList = document.getElementById("tripsList");
const loginMessage = document.getElementById("loginMessage");
const tripMessage = document.getElementById("tripMessage");

const postForm = document.getElementById("postForm");
const postMessage = document.getElementById("postMessage");
const postsList = document.getElementById("postsList");

let editingTripId = null;

// ESCAPE HTML
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ADMIN LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Logging in...";

    try {
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            throw new Error("This email is not authorised.");
        }

        await signInWithEmailAndPassword(auth, email, password);

    } catch (error) {
        loginMessage.textContent = error.message;
    }
});

// CHECK LOGIN STATUS
onAuthStateChanged(auth, async (user) => {
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {

        loginSection.hidden = true;
        dashboardSection.hidden = false;

        await loadTrips();
        await loadPosts();

    } else {
        loginSection.hidden = false;
        dashboardSection.hidden = true;

        if (user) {
            await signOut(auth);
            loginMessage.textContent = "You are not authorised.";
        }
    }
});

// ADD OR UPDATE TRIPS
tripForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const trip = {
        name: document.getElementById("tripName").value.trim(),
        destination: document.getElementById("tripLocation").value.trim(),
        date: document.getElementById("tripDate").value,
        price: Number(document.getElementById("tripPrice").value),
        image: document.getElementById("tripImage").value.trim(),
        description: document.getElementById("tripDescription").value.trim()
    };

    if (
        !trip.name ||
        !trip.destination ||
        !trip.date ||
        !trip.description ||
        !Number.isFinite(trip.price) ||
        trip.price <= 0
    ) {
        tripMessage.textContent = "Please complete all required fields.";
        return;
    }

    tripMessage.textContent = "Saving trip...";

    try {
        if (editingTripId) {
            await updateDoc(doc(db, "trips", editingTripId), trip);
            tripMessage.textContent = "Trip updated successfully!";
        } else {
            await addDoc(collection(db, "trips"), {
                ...trip,
                createdAt: serverTimestamp()
            });

            tripMessage.textContent = "Trip added successfully!";
        }

        resetTripForm();
        await loadTrips();

    } catch (error) {
        tripMessage.textContent = "Error: " + error.message;
    }
});

// LOAD TRIPS
async function loadTrips() {
    tripsList.textContent = "Loading trips...";

    try {
        const snapshot = await getDocs(collection(db, "trips"));

        if (snapshot.empty) {
            tripsList.textContent = "No trips added yet.";
            return;
        }

        tripsList.innerHTML = "";

        snapshot.forEach((item) => {
            const trip = item.data();
            const id = item.id;

            const card = document.createElement("div");
            card.className = "trip-card";

            card.innerHTML = `
                <h3>${escapeHTML(trip.name)}</h3>
                <p><strong>Location:</strong> ${escapeHTML(trip.destination)}</p>
                <p><strong>Date:</strong> ${escapeHTML(trip.date)}</p>
                <p><strong>Price:</strong> KSh ${Number(trip.price).toLocaleString("en-KE")}</p>
                <p>${escapeHTML(trip.description)}</p>

                ${trip.image
                    ? `<img src="${escapeHTML(trip.image)}"
                            alt="Trip photo"
                            onerror="this.style.display='none'">`
                    : ""}

                <div class="trip-actions">
                    <button type="button" class="edit"
                            data-edit="${escapeHTML(id)}">Edit</button>

                    <button type="button" class="delete"
                            data-delete="${escapeHTML(id)}">Delete</button>
                </div>
            `;

            tripsList.appendChild(card);
        });

    } catch (error) {
        tripsList.textContent = "Could not load trips: " + error.message;
    }
}

// EDIT AND DELETE TRIP BUTTONS
tripsList.addEventListener("click", async (event) => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;

    if (editId) await editTrip(editId);
    if (deleteId) await removeTrip(deleteId);
});

// EDIT TRIP
async function editTrip(id) {
    try {
        const snapshot = await getDocs(collection(db, "trips"));
        const selected = snapshot.docs.find(item => item.id === id);

        if (!selected) return;

        const trip = selected.data();

        editingTripId = id;

        document.getElementById("tripName").value = trip.name || "";
        document.getElementById("tripLocation").value = trip.destination || "";
        document.getElementById("tripDate").value = trip.date || "";
        document.getElementById("tripPrice").value = trip.price ?? "";
        document.getElementById("tripImage").value = trip.image || "";
        document.getElementById("tripDescription").value = trip.description || "";

        document.getElementById("formTitle").textContent = "Edit Trip";
        document.getElementById("saveTripBtn").textContent = "Update Trip";
        document.getElementById("cancelEditBtn").hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
        tripMessage.textContent = error.message;
    }
}

// DELETE TRIP
async function removeTrip(id) {
    const confirmed = window.confirm("Are you sure you want to delete this trip?");

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "trips", id));

        tripMessage.textContent = "Trip deleted successfully!";
        await loadTrips();

    } catch (error) {
        tripMessage.textContent = "Could not delete trip: " + error.message;
    }
}

// RESET TRIP FORM
function resetTripForm() {
    tripForm.reset();
    editingTripId = null;

    document.getElementById("formTitle").textContent = "Add New Trip";
    document.getElementById("saveTripBtn").textContent = "Save Trip";
    document.getElementById("cancelEditBtn").hidden = true;
}

document.getElementById("cancelEditBtn").addEventListener("click", resetTripForm);

// =====================================
// WEBSITE POSTS: PUBLISH AND DELETE
// =====================================

// PUBLISH A NEW POST
postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const image = document.getElementById("postImage").value.trim();

    if (!title || !content) {
        postMessage.textContent = "Please enter a title and message.";
        return;
    }

    postMessage.textContent = "Publishing your post...";

    const publishButton = document.getElementById("publishPostBtn");
    publishButton.disabled = true;

    try {
        await addDoc(collection(db, "posts"), {
            title: title,
            content: content,
            image: image,
            publishedAt: serverTimestamp()
        });

        postMessage.textContent = "Your post has been published successfully!";
        postForm.reset();

        await loadPosts();

    } catch (error) {
        postMessage.textContent = "Could not publish post: " + error.message;
    } finally {
        publishButton.disabled = false;
    }
});

// LOAD PUBLISHED POSTS IN ADMIN DASHBOARD
async function loadPosts() {
    postsList.textContent = "Loading posts...";

    try {
        const snapshot = await getDocs(collection(db, "posts"));

        if (snapshot.empty) {
            postsList.textContent = "No posts published yet.";
            return;
        }

        postsList.innerHTML = "";

        snapshot.forEach((item) => {
            const post = item.data();
            const id = item.id;

            const card = document.createElement("div");
            card.className = "trip-card";

            card.innerHTML = `
                <h3>${escapeHTML(post.title)}</h3>
                <p>${escapeHTML(post.content)}</p>

                ${post.image
                    ? `<img src="${escapeHTML(post.image)}"
                            alt="Post image"
                            onerror="this.style.display='none'">`
                    : ""}

                <div class="trip-actions">
                    <button type="button" class="delete"
                            data-delete-post="${escapeHTML(id)}">
                        Delete Post
                    </button>
                </div>
            `;

            postsList.appendChild(card);
        });

    } catch (error) {
        postsList.textContent = "Could not load posts: " + error.message;
    }
}

// DELETE A POST
postsList.addEventListener("click", async (event) => {
    const deleteId = event.target.dataset.deletePost;

    if (!deleteId) return;

    const confirmed = window.confirm(
        "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "posts", deleteId));

        postMessage.textContent = "Post deleted successfully!";
        await loadPosts();

    } catch (error) {
        postMessage.textContent = "Could not delete post: " + error.message;
    }
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
});
