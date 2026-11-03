// Get appointment form
const appointmentForm = document.getElementById("appointmentForm");

// Set the minimum appointment date to today
const appointmentDate = document.getElementById("appointmentDate");

if (appointmentDate) {
  const today = new Date();

  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  appointmentDate.min = localDate;
}

// Handle appointment form submission
if (appointmentForm) {
  appointmentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get customer information
    const name = document.getElementById("customerName").value.trim();

    const phone = document.getElementById("customerPhone").value.trim();

    const email = document.getElementById("customerEmail").value.trim();

    const service = document.getElementById("appointmentService").value;

    const date = document.getElementById("appointmentDate").value;

    const time = document.getElementById("appointmentTime").value;

    const additionalMessage = document
      .getElementById("appointmentMessage")
      .value.trim();

    // Business WhatsApp number
    const businessNumber = "2348065726333";

    // Create WhatsApp message
    let message =
      "Hello ClearView Opticals! I would like to request an appointment.\n\n";

    message += "*APPOINTMENT REQUEST*\n";
    message += "--------------------------\n";

    message += `Name: ${name}\n`;
    message += `Phone: ${phone}\n`;

    if (email) {
      message += `Email: ${email}\n`;
    }

    message += `Service: ${service}\n`;
    message += `Preferred Date: ${date}\n`;
    message += `Preferred Time: ${time}\n`;

    if (additionalMessage) {
      message += `Additional Information: ${additionalMessage}\n`;
    }

    message += "\nPlease confirm whether this appointment is available.\n\n";

    message += "Thank you!";

    // Encode message
    const encodedMessage = encodeURIComponent(message);

    // Generate WhatsApp URL
    const whatsappURL = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

    console.log("Appointment request prepared successfully.");

    // Open WhatsApp
    window.open(whatsappURL, "_blank");
  });
}
