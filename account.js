// Optional username/password account page.
const byId = id => document.getElementById(id);
const accountNotify = (message, type = "info") => window.showToast ? window.showToast(message, type) : window.alert(message);
let activeUser = null;

function setAccountView(user) {
  activeUser = user;
  byId("authPanel").hidden = Boolean(user);
  byId("accountDashboard").hidden = !user;
  if (user) {
    const username = user.user_metadata?.username || "there";
    byId("welcomeUser").textContent = `Hi, ${username}!`;
    loadMyEntries();
  }
}

function displayDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("fil-PH", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

async function loadMyEntries() {
  const container = byId("myEntries");
  container.textContent = "Loading your entries...";
  try {
    const entries = await window.LetLirikoCloud.getMyCloudEntries();
    if (!entries.length) {
      container.innerHTML = '<p>You haven\'t posted any entries while logged in yet. <a href="messages.html">Share your first story!</a></p>';
      return;
    }
    const fragment = document.createDocumentFragment();
    entries.forEach(entry => {
      const card = document.createElement("article");
      card.className = "account-entry";
      const heading = document.createElement("h3");
      heading.textContent = entry.title || "Untitled story";
      const body = document.createElement("p");
      body.textContent = entry.meaning || "";
      const date = document.createElement("small");
      date.textContent = `Posted ${displayDate(entry.created_at)}`;
      const button = document.createElement("button");
      button.className = "btn btn-danger";
      button.type = "button";
      button.textContent = "Delete entry";
      button.addEventListener("click", () => removeMyEntry(entry.id));
      card.append(heading, body, date, button);
      fragment.append(card);
    });
    container.replaceChildren(fragment);
  } catch (error) {
    console.error("Could not load account entries:", error);
    container.textContent = "Couldn't load your entries. Please refresh and try again.";
  }
}

async function removeMyEntry(id) {
  if (!window.confirm("Sure ka bang i-delete itong entry? Hindi na ito maibabalik.")) return;
  try {
    await window.LetLirikoCloud.deleteCloudEntry(id);
    accountNotify("Deleted na ang entry mo.", "success");
    await loadMyEntries();
  } catch (error) {
    console.error("Could not delete entry:", error);
    accountNotify(error.message || "Hindi ma-delete ang entry. Try again.", "error");
  }
}

byId("loginForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const user = await window.LetLirikoCloud.signIn(byId("loginUsername").value, byId("loginPassword").value);
    byId("loginForm").reset();
    setAccountView(user);
    accountNotify("Welcome back! 💜", "success");
  } catch (error) {
    console.error("Login failed:", error);
    accountNotify(error.message || "Login failed. Check your username and password.", "error");
  } finally { button.disabled = false; }
});

byId("signupForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const username = byId("signupUsername").value.trim();
  const password = byId("signupPassword").value;
  if (password !== byId("signupPasswordConfirm").value) {
    accountNotify("Passwords don't match. Please check them.", "error");
    return;
  }
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const user = await window.LetLirikoCloud.signUp(username, password);
    byId("signupForm").reset();
    setAccountView(user);
    accountNotify("Account created! Welcome to LetLiriko. 💜", "success");
  } catch (error) {
    console.error("Sign-up failed:", error);
    accountNotify(error.message || "Couldn't create your account. Please try again.", "error");
  } finally { button.disabled = false; }
});

byId("logoutButton")?.addEventListener("click", async () => {
  try {
    await window.LetLirikoCloud.signOut();
    setAccountView(null);
    accountNotify("Logged out na. See you again! 💜", "success");
  } catch (error) {
    console.error("Logout failed:", error);
    accountNotify("Couldn't log out right now. Please try again.", "error");
  }
});

window.addEventListener("load", async () => {
  // cloud.js is a module; wait briefly for its public API to initialize.
  for (let attempt = 0; attempt < 40 && !window.LetLirikoCloud; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!window.LetLirikoCloud) {
    accountNotify("Database connection isn't ready. Please refresh the page.", "error");
    return;
  }
  try { setAccountView(await window.LetLirikoCloud.getCurrentUser()); }
  catch (error) { console.error(error); setAccountView(null); }
});
window.addEventListener("letliriko-auth-change", event => setAccountView(event.detail.user));
