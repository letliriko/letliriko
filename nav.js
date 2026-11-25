// Shared navigation state and toast notifications.
function showToast(message, type = "info") {
  const region = document.getElementById("toastRegion");
  if (!region) { window.alert(message); return; }
  region.replaceChildren();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  const icon = document.createElement("span");
  icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "💜";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(icon, text);
  region.append(toast);
  window.setTimeout(() => {
    toast.classList.add("toast-leave");
    window.setTimeout(() => toast.remove(), 250);
  }, 3500);
}
window.showToast = showToast;

function updateAccountNavigation(user) {
  const link = document.getElementById("accountNav");
  if (!link) return;
  link.textContent = user ? `Hi, ${user.user_metadata?.username || "there"}` : "Log in";
  link.href = "account.html";
}
window.addEventListener("letliriko-auth-change", event => updateAccountNavigation(event.detail.user));
window.addEventListener("load", async () => {
  if (window.LetLirikoCloud?.getCurrentUser) {
    try { updateAccountNavigation(await window.LetLirikoCloud.getCurrentUser()); } catch (error) { console.error(error); }
  }
});
