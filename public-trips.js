
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const tripContainer = document.getElementById("tripContainer");
const tripSelect = document.getElementById("trip");

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

async function displayTrips() {
    try {
        const snapshot = await getDocs(collection(db, "trips"));

        tripContainer.innerHTML = "";

        if (snapshot.empty) {
            tripContainer.innerHTML =
                "<p>No adventures available at the moment. Check back soon!</p>";
            return;
        }

        snapshot.forEach((item) => {
            const trip = item.data();

            const card = document.createElement("div");
            card.className = "trip-card";

            const image = trip.image
                ? `<img src="${escapeHTML(trip.image)}" alt="${escapeHTML(trip.name)}" onerror="this.style.display='none'">`
                : "";

            card.innerHTML = `
                ${image}
                <div class="trip-info">
                    <span class="location">${escapeHTML(trip.destination)}</span>
                    <h3>${escapeHTML(trip.name)}</h3>
                    <p>${escapeHTML(trip.description)}</p>
                    <p><strong>Travel Date:</strong> ${escapeHTML(trip.date)}</p>
                    <h4>KSh ${Number(trip.price).toLocaleString("en-KE")}
                        <small>/ person</small>
                    </h4>
                    <a href="#booking" class="btn book-trip"
                       data-trip="${escapeHTML(trip.name)}">
                       Book This Trip
                    </a>
                </div>
            `;

            tripContainer.appendChild(card);

            const option = document.createElement("option");
            option.value = trip.name;
            option.textContent = trip.name;
            tripSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Trip loading error:", error);

        tripContainer.innerHTML =
            "<p>Unable to load trips. Please try again later.</p>";
    }
}

// Select the trip when a visitor clicks Book This Trip
tripContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".book-trip");

    if (button) {
        tripSelect.value = button.dataset.trip;
    }
});

// Load trips when the page opens
displayTrips();
