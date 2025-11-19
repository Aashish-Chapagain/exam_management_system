// Smooth print
function printSeatPlan() {
  window.print();
}

// Optional: confirm generation
function confirmSeatGeneration() {
  return confirm("Are you sure you want to generate the seat plan?");
}

// Debug helper: log static URLs and try fetching CSS/JS to surface load errors
function debugStaticAssets() {
  try {
    const origin = window.location.origin || "";
    const cssPath = origin + "/static/seatplan/css/main.css";
    const jsPath = origin + "/static/seatplan/js/main.js";
    console.log("DEBUG: seatplan css ->", cssPath);
    console.log("DEBUG: seatplan js  ->", jsPath);

    fetch(cssPath, { method: "GET", cache: "no-store" })
      .then((r) => console.log("DEBUG: fetch CSS status", r.status))
      .catch((e) => console.error("DEBUG: fetch CSS error", e));

    fetch(jsPath, { method: "GET", cache: "no-store" })
      .then((r) => console.log("DEBUG: fetch JS status", r.status))
      .catch((e) => console.error("DEBUG: fetch JS error", e));
  } catch (e) {
    console.error("DEBUG: debugStaticAssets error", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  debugStaticAssets();
});

// Seatplan page: auto-select hall or offer to create one from exam data
function initSeatplanSelect() {
  try {
    const examsScript = document.getElementById("exams-data");
    const hallsScript = document.getElementById("halls-data");
    if (!examsScript || !hallsScript) return;

    const exams = JSON.parse(examsScript.textContent || "[]");
    const halls = JSON.parse(hallsScript.textContent || "[]");

    const examSelect = document.querySelector('select[name="exam_id"]');
    const hallSelect = document.querySelector('select[name="hall_id"]');
    const hallAction = document.getElementById("hall-action");
    const selectedHallInput = document.getElementById("selected-hall-id");

    function findHallByName(name) {
      if (!name) return null;
      const lower = name.trim().toLowerCase();
      return (
        halls.find((h) => h.name && h.name.toLowerCase() === lower) || null
      );
    }

    function onExamChange() {
      const sel = examSelect.value;
      const exam = exams.find((e) => String(e.id) === String(sel));
      hallAction.innerHTML = "";
      if (exam && exam.hall_name) {
        const match = findHallByName(exam.hall_name);
        if (match) {
          // select the matching hall
          hallSelect.value = match.id;
        } else {
          // offer to create the hall (link to create view)
          const a = document.createElement("a");
          a.className = "btn";
          a.textContent = 'Create hall "' + exam.hall_name + '"';
          a.href =
            "/seatplan/create/?name=" + encodeURIComponent(exam.hall_name);
          hallAction.appendChild(a);
        }
      }
    }

    // initial selection from query param if provided
    if (selectedHallInput && hallSelect) {
      const val = selectedHallInput.value;
      if (val) hallSelect.value = val;
    }

    if (examSelect) {
      examSelect.addEventListener("change", onExamChange);
      // trigger once on load
      onExamChange();
    }
  } catch (e) {
    console.error("initSeatplanSelect error", e);
  }
}

document.addEventListener("DOMContentLoaded", initSeatplanSelect);
