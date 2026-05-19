(function () {
  const form = document.getElementById("authForm");
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");
  const nameInput = document.getElementById("authName");
  const nameGroup = document.getElementById("nameGroup");
  const modeTitle = document.getElementById("authModeTitle");
  const modeCopy = document.getElementById("authModeCopy");
  const submitButton = document.getElementById("authSubmit");
  const statusBox = document.getElementById("authStatus");
  const forgotButton = document.getElementById("forgotPassword");
  const modeButtons = Array.from(document.querySelectorAll("[data-auth-mode]"));
  const redirectTarget = window.CMPAuth?.getRedirectTarget("dashboard.html") || "dashboard.html";
  let mode = new URLSearchParams(window.location.search).get("mode") === "signup" ? "signup" : "signin";

  function setStatus(message, tone = "neutral") {
    statusBox.hidden = false;
    statusBox.dataset.tone = tone;
    statusBox.textContent = message;
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
      ? mode === "signup"
        ? "Creating account..."
        : "Signing in..."
      : mode === "signup"
        ? "Create account"
        : "Sign in";
  }

  function setMode(nextMode) {
    mode = nextMode;
    const isSignup = mode === "signup";
    modeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.authMode === mode);
    });
    nameGroup.hidden = !isSignup;
    nameInput.required = isSignup;
    modeTitle.textContent = isSignup ? "Create your CMP account" : "Sign in to CMP";
    modeCopy.textContent = isSignup
      ? "Create an account, confirm your email if required, then CMP will open the dashboard."
      : "Use your landlord account to unlock the protected compliance dashboard.";
    submitButton.textContent = isSignup ? "Create account" : "Sign in";
  }

  async function redirectIfSignedIn(client) {
    const { data } = await client.auth.getSession();
    if (data.session) {
      window.location.replace(redirectTarget);
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    window.lucide?.createIcons();
    setMode(mode);

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.authMode));
    });

    if (!window.CMPAuth?.isConfigured()) {
      setStatus(
        "Supabase is not connected yet. Add your project URL and publishable key in supabase-config.js, then this login form will create real accounts.",
        "warning"
      );
      submitButton.disabled = true;
      forgotButton.disabled = true;
      return;
    }

    const client = window.CMPAuth.getClient();
    if (!client) {
      setStatus("Supabase could not load. Check the network connection and the Supabase CDN script.", "warning");
      submitButton.disabled = true;
      forgotButton.disabled = true;
      return;
    }

    await redirectIfSignedIn(client);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setLoading(true);
      statusBox.hidden = true;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      try {
        if (mode === "signup") {
          const redirectUrl = new URL(
            `auth.html?mode=signin&redirect=${encodeURIComponent(redirectTarget)}`,
            window.location.href
          ).href;
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: nameInput.value.trim() },
              emailRedirectTo: redirectUrl
            }
          });

          if (error) throw error;
          if (data.session) {
            window.location.replace(redirectTarget);
            return;
          }

          setStatus("Account created. Check your email to confirm your account, then sign in.", "success");
          setMode("signin");
        } else {
          const { error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          window.location.replace(redirectTarget);
        }
      } catch (error) {
        setStatus(error.message || "Authentication failed. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    });

    forgotButton.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      if (!email) {
        setStatus("Enter your email first, then request a reset link.", "warning");
        return;
      }

      forgotButton.disabled = true;
      const redirectTo = new URL("auth.html?mode=signin", window.location.href).href;
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      forgotButton.disabled = false;
      setStatus(
        error ? error.message : "If that email exists, Supabase will send a password reset link.",
        error ? "error" : "success"
      );
    });
  });
})();
