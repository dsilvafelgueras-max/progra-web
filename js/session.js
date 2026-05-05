export const USERS_KEY = "sangria-users";
export const SESSION_KEY = "sangria-session";

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser() {
  const session = loadSession();
  if (!session?.email) return null;
  const users = loadUsers();
  return {
    email: session.email,
    data: users[session.email] ?? null,
  };
}

export function updateCurrentUser(updates) {
  const session = loadSession();
  if (!session?.email) return null;
  const users = loadUsers();
  const current = users[session.email] ?? {};
  const next = { ...current, ...updates };
  users[session.email] = next;
  saveUsers(users);
  return next;
}

export function enhanceSessionLink() {
  const userLink = document.querySelector('a[href="./login.html"]');
  const session = loadSession();

  if (userLink) {
    userLink.href = session?.email ? "./cuenta.html" : "./login.html";
    userLink.setAttribute(
      "aria-label",
      session?.email ? "Ir a mi perfil" : "Ir a iniciar sesion"
    );
  }

  const menuLinks = document.querySelector(".menu-links");
  const existingLogout = document.querySelector("[data-logout-session]");

  if (!menuLinks) return;

  if (!session?.email) {
    existingLogout?.remove();
    return;
  }

  if (existingLogout) return;

  const logoutButton = document.createElement("button");
  logoutButton.type = "button";
  logoutButton.className = "menu-main-link menu-logout-link";
  logoutButton.dataset.logoutSession = "true";
  logoutButton.textContent = "cerrar sesion";
  logoutButton.addEventListener("click", () => {
    clearSession();
    window.location.href = "./index.html";
  });

  menuLinks.append(logoutButton);
}
