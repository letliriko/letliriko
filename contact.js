// Contact form submission.
const contactForm = document.getElementById("contactForm");
contactForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const message = {
    name: document.getElementById("contactName").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
    subject: document.getElementById("contactSubject").value.trim(),
    message: document.getElementById("contactMessage").value.trim()
  };
  if (!message.name || !message.subject || !message.message) {
    showToast("Please fill out your name, subject, and message first.", "error");
    return;
  }
  if (submitButton) submitButton.disabled = true;
  try {
    if (!window.LetLirikoCloud?.sendContactMessage) throw new Error("Database connection isn't ready yet.");
    await window.LetLirikoCloud.sendContactMessage(message);
    contactForm.reset();
    showToast("Message sent! Thank you sa feedback mo. 💜", "success");
  } catch (error) {
    console.error("Contact submission failed:", error);
    showToast("Oops! Hindi na-send ang message. Please try again later.", "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
