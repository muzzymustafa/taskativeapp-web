const API_BASE = "https://taskativeapp.com";
const FIREBASE_API_KEY = "AIzaSyC5U0sq27tVGbyV9UPP58V7QZeddALVSkI";

const $ = (id) => document.getElementById(id);

async function init() {
  const data = await chrome.storage.local.get(["idToken", "userEmail", "tokenExpiry"]);
  if (data.idToken && data.userEmail) {
    showTaskView(data.userEmail);
  } else {
    showLoginView();
  }
}

function showLoginView() {
  $("login-view").style.display = "block";
  $("task-view").style.display = "none";
}

function showTaskView(email) {
  $("login-view").style.display = "none";
  $("task-view").style.display = "block";
  $("user-email").textContent = email;
  $("task-title").focus();
}

async function login() {
  const email = $("email").value.trim();
  const password = $("password").value;
  $("login-error").innerHTML = "";

  if (!email || !password) return;
  $("login-btn").disabled = true;
  $("login-btn").textContent = "Signing in...";

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const json = await res.json();
    if (json.error) {
      $("login-error").innerHTML = `<div class="error">${friendlyError(json.error.message)}</div>`;
      return;
    }
    await chrome.storage.local.set({
      idToken: json.idToken,
      refreshToken: json.refreshToken,
      tokenExpiry: Date.now() + parseInt(json.expiresIn) * 1000,
      userEmail: json.email,
    });
    showTaskView(json.email);
  } catch (err) {
    $("login-error").innerHTML = `<div class="error">Network error. Please try again.</div>`;
  } finally {
    $("login-btn").disabled = false;
    $("login-btn").textContent = "Sign in";
  }
}

function friendlyError(code) {
  if (code === "EMAIL_NOT_FOUND") return "No account with this email.";
  if (code === "INVALID_PASSWORD" || code === "INVALID_LOGIN_CREDENTIALS") return "Wrong email or password.";
  if (code === "TOO_MANY_ATTEMPTS_TRY_LATER") return "Too many attempts. Try again later.";
  return code || "Login failed.";
}

async function logout() {
  await chrome.storage.local.clear();
  showLoginView();
}

async function addTask() {
  const title = $("task-title").value.trim();
  const description = $("task-desc").value.trim();
  $("task-message").innerHTML = "";

  if (!title) return;
  $("add-btn").disabled = true;
  $("add-btn").textContent = "Adding...";

  try {
    const data = await chrome.storage.local.get(["idToken"]);
    const res = await fetch(`${API_BASE}/api/ext/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.idToken}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (res.ok) {
      $("task-message").innerHTML = `<div class="success">✓ Task added</div>`;
      $("task-title").value = "";
      $("task-desc").value = "";
      setTimeout(() => { $("task-message").innerHTML = ""; }, 2000);
    } else if (res.status === 401) {
      $("task-message").innerHTML = `<div class="error">Session expired. Please sign in again.</div>`;
      setTimeout(() => logout(), 1500);
    } else {
      $("task-message").innerHTML = `<div class="error">Failed to add task.</div>`;
    }
  } catch (err) {
    $("task-message").innerHTML = `<div class="error">Network error.</div>`;
  } finally {
    $("add-btn").disabled = false;
    $("add-btn").textContent = "Add to Taskative";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  $("login-btn").addEventListener("click", login);
  $("password").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
  $("add-btn").addEventListener("click", addTask);
  $("task-title").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) addTask(); });
  $("logout").addEventListener("click", (e) => { e.preventDefault(); logout(); });
  $("open-app").addEventListener("click", () => {
    chrome.tabs.create({ url: `${API_BASE}/timeline` });
  });
});
