const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const selector = link.getAttribute("href");
    if (!selector || selector === "#") return;
    const target = document.getElementById(selector.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior: reduceMotion.matches ? "auto" : "smooth", block: "start"});
    history.replaceState(null, "", selector);
  });
});
