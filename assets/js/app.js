(function () {
  "use strict";

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
