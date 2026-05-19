(async function () {
  const redirectTarget = "dashboard.html";
  const loginUrl = window.CMPAuth?.authUrl(redirectTarget) || "auth.html?redirect=dashboard.html";

  function sendToLogin(reason) {
    const suffix = reason ? `&${reason}=true` : "";
    window.location.replace(`${loginUrl}${suffix}`);
  }

  if (!window.CMPAuth?.isConfigured()) {
    sendToLogin("setup");
    return;
  }

  const client = window.CMPAuth.getClient();
  if (!client) {
    sendToLogin("setup");
    return;
  }

  const { data, error } = await client.auth.getSession();
  if (error || !data.session) {
    sendToLogin();
    return;
  }

  const emailTarget = document.getElementById("sessionEmail");
  if (emailTarget) {
    emailTarget.textContent = data.session.user.email || "Signed in";
  }

  document.body.classList.remove("is-auth-checking");

  const signOutButton = document.getElementById("signOutButton");
  signOutButton?.addEventListener("click", async () => {
    signOutButton.disabled = true;
    await client.auth.signOut();
    window.location.replace(loginUrl);
  });

  client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      window.location.replace(loginUrl);
    }
  });
})();
