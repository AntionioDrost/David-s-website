(function () {
  const placeholderPattern = /YOUR_|REPLACE|example|supabase-url|publishable-key/i;

  function getConfig() {
    const config = window.CMP_SUPABASE_CONFIG || {};
    return {
      url: String(config.url || "").trim(),
      publishableKey: String(config.publishableKey || "").trim()
    };
  }

  function isConfigured() {
    const { url, publishableKey } = getConfig();
    return Boolean(
      url &&
        publishableKey &&
        /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) &&
        !placeholderPattern.test(url) &&
        !placeholderPattern.test(publishableKey)
    );
  }

  function getClient() {
    if (!isConfigured() || !window.supabase?.createClient) {
      return null;
    }

    if (!window.CMP_SUPABASE_CLIENT) {
      const { url, publishableKey } = getConfig();
      window.CMP_SUPABASE_CLIENT = window.supabase.createClient(url, publishableKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true
        }
      });
    }

    return window.CMP_SUPABASE_CLIENT;
  }

  function sanitizeRedirect(value, fallback = "dashboard.html") {
    const target = String(value || fallback).trim();
    if (
      !target ||
      target.startsWith("//") ||
      target.includes("\\") ||
      target.includes("..") ||
      /^[a-z][a-z0-9+.-]*:/i.test(target)
    ) {
      return fallback;
    }

    return target.includes(".html") ? target : fallback;
  }

  function getRedirectTarget(fallback = "dashboard.html") {
    const params = new URLSearchParams(window.location.search);
    return sanitizeRedirect(params.get("redirect"), fallback);
  }

  function authUrl(redirect = "dashboard.html") {
    return `auth.html?redirect=${encodeURIComponent(sanitizeRedirect(redirect))}`;
  }

  window.CMPAuth = {
    authUrl,
    getClient,
    getConfig,
    getRedirectTarget,
    isConfigured,
    sanitizeRedirect
  };
})();
