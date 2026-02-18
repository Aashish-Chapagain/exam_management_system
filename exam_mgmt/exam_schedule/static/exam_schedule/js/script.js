const $ = (q) => document.querySelector(q);

function toDT(d, t) {
  return new Date(`${d}T${t}`);
}

function addMinutes(date, m) {
  return new Date(date.getTime() + m * 60000);
}

const paperCodesBCA_TU = {
  1: {
    "Computer Fundamentals and Applications": "CACS101",
    "Programming in C": "CACS102",
    "Digital Logic": "CACS105",
    "Mathematics I": "CAMT104",
    "Professional Communication and Ethics": "CAEN103",
    "Hardware Workshop": "CACS106"
  },
  2: {
    "Discrete Structure": "CACS151",
    "Microprocessor and Computer Architecture": "CACS155",
    "OOP in Java": "CACS153",
    "Mathematics II": "CAMT154",
    "Financial Accounting": "CAAC152",
    "English II": "CAEN153",
    "Principles of Management": "CACS156",
    "UX/UI Design": "CACS155"
  },
  3: {
    "Data Structures and Algorithms": "CACS201",
    "Database Management System": "CACS202",
    "Web Technology I": "CACS203",
    "System Analysis and Design": "CACS204",
    "Probability and Statistics": "CAST202",
    "Applied Economics": "CACS206"
  },
  4: {
    "Operating Systems": "CACS251",
    "Software Engineering": "CACS252",
    "Numerical Methods": "CACS253",
    "Scripting Language": "CACS254",
    "Database Management System": "CACS255",
    "Project I": "CAPJ256"
  },
  5: {
    "MIS and E-Business": "CACS301",
    "Dot Net Technology": "CACS302",
    "Computer Networking": "CACS303",
    "Introduction to Management": "CAMG304",
    "Computer Graphics and Animation": "CACS305"
  },
  6: {
    "Mobile Programming": "CACS351",
    "Distributed System": "CACS352",
    "Applied Economics": "CAEC353",
    "Advanced Java Programming": "CACS354",
    "Network Programming": "CACS355",
    "Project II": "CAPJ356"
  },
  7: {
    "Cyber Law and Professional Ethics": "CACS401",
    "Cloud Computing": "CACS402",
    "Internship": "CAIN403",
    "Image Processing": "CACS404",
    "Database Administration": "CACS405",
    "Network Administration": "CACS406",
    "Advanced Dot Net Technology": "CACS408",
    "E-Governance": "CACS409",
    "Artificial Intelligence": "CACS410"
  },
  8: {
    "Operations Research": "CAOR451",
    "Project III": "CAPJ452",
    "Database Programming": "CACS453",
    "Geographical Information System": "CACS454",
    "Data Analysis and Visualization": "CACS455",
    "Machine Learning": "CACS456",
    "Multimedia System": "CACS457",
    "Knowledge Engineering": "CACS458"
  }
};

const teachers = [
  "Ramesh Shrestha", "Mina Rana", "Kamal Chhetri", "Saraswati Acharya", "Bina Gurung",
  "Sanjay Adhikari", "Nirajan Poudel", "Rupesh Khadka", "Sushma Koirala", "Deepak Gautam",
  "Anita Panta", "Krishna Rajbhandari", "Sabina Thapa", "Hari Prasad Neupane", "Laxmi Ghimire"
];

let sortDir = "asc";
const form = $("#examForm");
const examsApiUrl = form?.dataset.examsApiUrl;
const examDetailTemplate = form?.dataset.examDetailApiTemplate;
const initialData = JSON.parse(document.getElementById("init-exams")?.textContent || "[]");
const Schedule = { rows: initialData };

function examDetailUrl(id) {
  return examDetailTemplate.replace(/0\/$/, `${id}/`);
}

function validate(rows) {
  const issues = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const A = rows[i];
      const B = rows[j];
      const aS = toDT(A.date, A.start || A.start_time);
      const aE = addMinutes(aS, A.duration);
      const bS = toDT(B.date, B.start || B.start_time);
      const bE = addMinutes(bS, B.duration);
      if (A.date === B.date && aS < bE && bS < aE) {
        if (A.hall && A.hall === B.hall) issues.push("Hall clash detected");
        if (A.course === B.course && String(A.semester) === String(B.semester)) {
          issues.push("Course/Semester overlap detected");
        }
      }
    }
  }
  return issues;
}

function render() {
  const tb = $("#table tbody");
  if (!tb) return;
  tb.innerHTML = "";

  const fClass = $("#filterClass")?.value || "";
  const fSem = $("#filterSemester")?.value || "";
  let rows = [...Schedule.rows].filter(r =>
    (fClass ? r.course === fClass : true) &&
    (fSem ? String(r.semester) === String(fSem) : true)
  );

  rows.sort((a, b) => {
    const diff = toDT(a.date, a.start || a.start_time) - toDT(b.date, b.start || b.start_time);
    return sortDir === "asc" ? diff : -diff;
  });

  rows.forEach((r) => {
    const start = r.start || r.start_time;
    const end = addMinutes(toDT(r.date, start), r.duration).toTimeString().slice(0, 5);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${start}</td>
      <td>${end}</td>
      <td>${r.course}</td>
      <td>${r.semester}</td>
      <td>${r.subject}</td>
      <td>${r.paper_code || "-"}</td>
      <td>${r.hall || "-"}</td>
      <td>${r.invigilators || "-"}</td>
      <td>${r.duration}</td>
      <td>${r.candidates || 0}</td>
      <td>
        <button data-e="${r.id}">Edit</button>
        <button data-d="${r.id}">Delete</button>
      </td>`;
    tb.appendChild(tr);
  });

  const box = $("#validationSummary");
  const issues = validate(rows);
  if (box) {
    box.style.display = "block";
    box.textContent = issues.length ? `⚠ ${issues.length} issue(s) found` : "✅ No issues detected";
  }
}

function readForm() {
  return {
    term: $("#term")?.value || "Regular",
    course: $("#klass").value,
    semester: Number($("#semester").value),
    subject: $("#subject").value,
    paper_code: $("#paper").value,
    date: $("#date").value,
    start_time: $("#start").value,
    duration: Number($("#duration").value || $("#defaultDuration").value || 90),
    hall: $("#hall").value,
    candidates: Number($("#candidates").value || 0),
    invigilators: $("#invigilators").value,
    notes: $("#notes").value,
  };
}

function fillForm(r) {
  $("#editingId").value = r.id;
  $("#term").value = r.term || "";
  $("#klass").value = r.course;
  $("#semester").value = r.semester;
  $("#semester").dispatchEvent(new Event("change"));
  $("#subject").value = r.subject;
  $("#paper").value = r.paper_code || "";
  $("#date").value = r.date;
  $("#start").value = r.start || r.start_time;
  $("#duration").value = r.duration;
  $("#hall").value = r.hall;
  $("#candidates").value = r.candidates;
  $("#invigilators").value = r.invigilators;
  $("#notes").value = r.notes;
}

async function saveExam(payload, id) {
  const csrftoken = document.cookie.split('; ').find(r => r.startsWith('csrftoken='))?.split('=')[1] || '';
  const res = await fetch(id ? examDetailUrl(id) : examsApiUrl, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(data.errors || data));
  }
  return data.exam;
}

async function deleteExam(id) {
  const csrftoken = document.cookie.split('; ').find(r => r.startsWith('csrftoken='))?.split('=')[1] || '';
  const res = await fetch(examDetailUrl(id), {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrftoken },
  });
  if (!res.ok) throw new Error('Delete failed');
}

document.addEventListener("DOMContentLoaded", () => {
  const invSel = $("#invigilators");
  if (invSel) {
    invSel.innerHTML = `<option value="" selected>Select invigilator</option>` +
      teachers.map(t => `<option value="${t}">${t}</option>`).join("");
  }

  const semesterEl = $("#semester");
  const subjectEl = $("#subject");
  const paperEl = $("#paper");

  function populateSubjects() {
    const s = semesterEl?.value;
    if (!subjectEl) return;
    subjectEl.innerHTML = `<option value="" disabled selected>Select subject</option>`;
    Object.keys(paperCodesBCA_TU[s] || {}).forEach(sub => {
      subjectEl.innerHTML += `<option>${sub}</option>`;
    });
    if (paperEl) paperEl.value = "";
  }

  function syncPaperCode() {
    if (!semesterEl || !subjectEl || !paperEl) return;
    paperEl.value = paperCodesBCA_TU[semesterEl.value]?.[subjectEl.value] || "";
  }

  semesterEl?.addEventListener("change", populateSubjects);
  subjectEl?.addEventListener("change", syncPaperCode);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = readForm();
    if (!payload.course || !payload.subject || !payload.date || !payload.start_time) {
      alert("Required fields missing");
      return;
    }

    try {
      const editingId = $("#editingId").value;
      const saved = await saveExam(payload, editingId || null);
      const index = Schedule.rows.findIndex((r) => String(r.id) === String(saved.id));
      if (index >= 0) Schedule.rows[index] = saved;
      else Schedule.rows.push(saved);
      render();
      form.reset();
      $("#editingId").value = "";
    } catch (err) {
      alert(`Failed to save exam: ${err.message}`);
    }
  });

  $("#table")?.addEventListener("click", async (e) => {
    const editId = e.target.dataset.e;
    const delId = e.target.dataset.d;
    if (editId) {
      const row = Schedule.rows.find((r) => String(r.id) === String(editId));
      if (row) fillForm(row);
    }
    if (delId) {
      if (!confirm("Delete this exam?")) return;
      try {
        await deleteExam(delId);
        Schedule.rows = Schedule.rows.filter((r) => String(r.id) !== String(delId));
        render();
      } catch {
        alert("Failed to delete exam");
      }
    }
  });

  $("#btnSort")?.addEventListener("click", () => {
    sortDir = sortDir === "asc" ? "desc" : "asc";
    render();
  });

  render();
});

// Filters
const filterClass = $("#filterClass");
const filterSemester = $("#filterSemester");
filterClass?.addEventListener("change", render);
filterSemester?.addEventListener("change", render);
