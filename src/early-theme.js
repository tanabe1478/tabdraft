// Runs before main app to prevent theme flash
(function() {
  var colors = { dark: "#1e1e2e", light: "#ffffff", monokai: "#272822" };
  try {
    var s = JSON.parse(localStorage.getItem("tabdraft_settings") || "{}");
    var theme = s.theme || "system";
    if (theme === "system") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", theme);
    var bg = colors[theme] || colors.dark;
    if (theme === "custom" && s.customCSS) {
      var m = s.customCSS.match(/--bg:\s*([^;]+)/);
      if (m) bg = m[1].trim();
    }
    document.documentElement.style.background = bg;
  } catch(e) {
    document.documentElement.style.background = colors.dark;
  }
})();
