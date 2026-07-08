(function () {
  "use strict";

  // ---- Eski tema kalintilarini temizle (Chirpy service worker + cache) ----
  // Onceki tema bir PWA service worker'i kaydettiyse, ziyaretcinin tarayicisi
  // F5'siz eski sayfayi sunmaya devam edebilir. Bunlari kaldirip cache'i bosalt.
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) { r.unregister(); });
      }).catch(function () {});
    }
    if (window.caches && caches.keys) {
      caches.keys().then(function (keys) {
        keys.forEach(function (k) { caches.delete(k); });
      }).catch(function () {});
    }
  } catch (e) {}

  // ---- Theme toggle ----
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-btn");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeBtn) themeBtn.setAttribute("aria-label", theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(current);
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  // ---- Mobile menu ----
  var menuBtn = document.getElementById("menu-btn");
  var navMenu = document.getElementById("nav-menu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", function () {
      var expanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
      navMenu.classList.toggle("open");
    });
  }
})();
