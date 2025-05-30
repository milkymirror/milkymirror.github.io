document.addEventListener("DOMContentLoaded", function() {
    const messages = [
        "The Interstellar devs tried to sell my cousin fent",
        "What if Cool Math Games was called Cool Meth Games",
        "Every time you refresh = one Latvian orphanage bombed",
        "unforgettable.dk/42.zip <-- Securly bypass here",
        "Steven loves femboys",
        "Ok that's enough go outside",
        "NEVER GOON",
        "5,000 visits and I drop my Adobe Enterprise login",
        "I'm Tim Cheese, and I killed John Pork. And this is my story. That day. The day I snuck up behind John. You all think you know the story. You don't",
        "The Ultraviolet devs tried to sell my cousin vitamin gummies",
        "I'm in the thick of it everybody knows",
        "Look for the Gummibar album in stores on November 13th"
    ];

    const messageElement = document.getElementById("random-message");

    function updateMessage() {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        messageElement.textContent = randomMessage;
        messageElement.style.opacity = 0;
        messageElement.style.transform = "translateY(20px)";
        messageElement.style.transition = "opacity 0.6s ease, transform 0.6s ease, text-shadow 0.6s ease";

        setTimeout(() => {
            messageElement.style.opacity = 1;
            messageElement.style.transform = "translateY(0)";
            messageElement.style.textShadow = "0 0 10px black, 0 0 20px black, 0 0 30px black";
        }, 100);
    }

    updateMessage();
    setInterval(updateMessage, 6000);
});
