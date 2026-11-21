// Affiche les résultats de runTests() dans tests.html.
const results = runTests();
const list = document.getElementById("results");
results.forEach((r) => {
  const item = document.createElement("li");
  item.className = r.ok ? "ok" : "fail";
  item.textContent = r.name;
  if (!r.ok) {
    const detail = document.createElement("pre");
    detail.textContent = r.error;
    item.appendChild(detail);
  }
  list.appendChild(item);
});
const failed = results.filter((r) => !r.ok).length;
document.getElementById("summary").textContent = results.length - failed + "/" + results.length + " tests réussis";
