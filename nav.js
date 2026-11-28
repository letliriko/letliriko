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
  window.setTimeout(() => toast.remove(), 3500);
}
window.showToast = showToast;

function updateAccountNavigation(user) {
  const accountLink = document.getElementById("accountNav");
  const logoutLink = document.getElementById("logoutNav");
  if (accountLink) accountLink.textContent = "Accounts";
  if (logoutLink) logoutLink.hidden = !user;
}
async function refreshAccountNavigation() {
  try {
    const user = await window.LetLirikoCloud?.getCurrentUser?.();
    updateAccountNavigation(user || null);
  } catch (error) {
    console.error("Could not read current account for navigation:", error);
    updateAccountNavigation(null);
  }
}
window.addEventListener("letliriko-auth-change", event => updateAccountNavigation(event.detail.user));
window.addEventListener("letliriko-cloud-ready", refreshAccountNavigation);
window.addEventListener("load", refreshAccountNavigation);

document.getElementById("logoutNav")?.addEventListener("click", async event => {
  event.preventDefault();
  const cloud = window.LetLirikoCloud;
  if (!cloud?.signOut) { showToast("Account service isn't ready yet. Please try again.", "error"); return; }
  try {
    await cloud.signOut();
    updateAccountNavigation(null);
    showToast("Logged out na. See you again! 💜", "success");
    if (!/account\.html$/i.test(window.location.pathname)) window.location.href = "account.html";
  } catch (error) {
    console.error("Logout failed:", error);
    showToast(error.message || "Couldn't log out right now. Please try again.", "error");
  }
});
