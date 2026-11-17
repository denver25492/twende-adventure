
// MOBILE NAVIGATION
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// CLOSE MENU AFTER CLICKING A LINK
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});

// AUTOMATIC COPYRIGHT YEAR
document.getElementById("year").textContent =
    new Date().getFullYear();

// SELECT TRIP AUTOMATICALLY
document.querySelectorAll(".book-trip").forEach(button => {
    button.addEventListener("click", () => {
        const trip = button.dataset.trip;
        document.getElementById("trip").value = trip;
    });
});

// WHATSAPP BOOKING
document.getElementById("bookingForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const trip = document.getElementById("trip").value;
    const people = document.getElementById("people").value;
    const date = document.getElementById("date").value;
    const message = document.getElementById("message").value.trim();

    if (!name || !phone || !trip || !people || !date) {
        alert("Please complete all required fields.");
        return;
    }

    const bookingMessage =
        `Hello Twende Adventure!\n\n` +
        `I would like to make a booking.\n\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Destination: ${trip}\n` +
        `Number of travellers: ${people}\n` +
        `Travel date: ${date}\n` +
        `Additional information: ${message}\n\n` +
        `Please provide more information about this trip.`;

    const whatsappNumber = "254792523556";

    const whatsappURL =
        "https://wa.me/" + whatsappNumber +
        "?text=" + encodeURIComponent(bookingMessage);

    window.open(whatsappURL, "_blank");
});
