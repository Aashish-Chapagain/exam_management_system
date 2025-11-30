const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
const uid = () =>
  "x" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function toDateTime(dateStr, timeStr) {
  // dateStr: '2025-08-31', timeStr: '09:30'
  return new Date(dateStr + "T" + (timeStr || "00:00"));
}
function minutes(ms) {
  return Math.round(ms / 60000);
}
function formatTime(d) {
  return d.toTimeString().slice(0, 5);
}

/* ------------------------- Store ------------------------- */
const KEY = "examSchedule.v1";
const Store = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  },
  save(rows) {
    localStorage.setItem(KEY, JSON.stringify(rows));
  },
};
const subjects = {
  1: [
    "Computer Fundamentals and Applications",
    "Society and Technology",
    "English I",
    "Mathematics I",
    "Digital Logic"
  ],

  2: [
    "C Programming",
    "Financial Accounting",
    "English II",
    "Mathematics II",
    "Microprocessor and Computer Architecture"
  ],

  3: [
    "Data Structures and Algorithms",
    "Object-Oriented Programming in Java",
    "Web Technology",
    "Statistics I",
    "Operating Systems"
  ],

  4: [
    "Numerical Methods",
    "Software Engineering",
    "Database Management System (DBMS)",
    "Computer Networking",
    "Statistics II"
  ],

  5: [
    "MIS and E-Business",
    "Dot Net Technology",
    "Computer Graphics and Animation",
    "Artificial Intelligence",
    "Network Programming"
  ],

  6: [
    "Mobile Programming",
    "Distributed System",
    "Applied Economics",
    "Advanced Java Programming",
    "Network and System Administration"
  ],

  7: [
    "Cyber Law and Professional Ethics",
    "Cloud Computing",
    "Image Processing",
    "Database Administration",
    "Knowledge Management"
  ],

  8: [
    "Operations Research",
    "Multimedia System",
    "E-Governance",
    "Information Security"
  ]
};

 

document.getElementById("semester").addEventListener("change", function () {
  let sem = parseInt(this.value, 10);
  let subjectSelect = document.getElementById("subject");
  // Always clear previous options and add the default
  subjectSelect.innerHTML = "<option value='' disabled selected>Select subject</option>";
  if (subjects[sem]) {
    subjects[sem].forEach((sub) => {
      if (sub) {
        let opt = document.createElement("option");
        opt.value = sub;
        opt.textContent = sub;
        subjectSelect.appendChild(opt);
      }
    });
  }
});

// Ensure subject dropdown is populated on page load for the default semester
document.addEventListener("DOMContentLoaded", function () {
  const semesterSelect = document.getElementById("semester");
  if (semesterSelect) {
    semesterSelect.dispatchEvent(new Event("change"));
  }
});

/* ------------------------- Core ------------------------- */
const Schedule = {
  rows: Store.load(),

  add(row) {
    this.rows.push(row);
    this.persist();
  },
  update(id, patch) {
    const i = this.rows.findIndex((r) => r.id === id);
    if (i > -1) {
      this.rows[i] = { ...this.rows[i], ...patch };
      this.persist();
    }
  },
  remove(id) {
    this.rows = this.rows.filter((r) => r.id !== id);
    this.persist();
  },
  clear() {
    this.rows = [];
    this.persist();
  },
  persist() {
    Store.save(this.rows);
    render();
  },

  sorted() {
    return [...this.rows].sort((a, b) => {
      const ad = toDateTime(a.date, a.start).getTime();
      const bd = toDateTime(b.date, b.start).getTime();
      return ad - bd;
    });
  },
};

/* ------------------------- Validation ------------------------- */
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function validateAll() {
  const minGapDays = parseInt($("#minGap").value || "0", 10);
  const out = []; // {type,msg,ids:[idA,idB]}
  const rows = Schedule.rows.map((r) => ({
    ...r,
    _start: toDateTime(r.date, r.start),
    _end: new Date(
      toDateTime(r.date, r.start).getTime() + (r.duration || 90) * 60000
    ),
  }));

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const A = rows[i],
        B = rows[j];
      const sameDate = A.date === B.date;
      const sameClass = A.klass === B.klass;
      const samesemester = (A.semester || "") === (B.semester || "");

      if (sameDate && overlaps(A._start, A._end, B._start, B._end)) {
        // Hall clash
        if (A.hall && B.hall && A.hall.toLowerCase() === B.hall.toLowerCase()) {
          out.push({
            type: "hall",
            msg: `Hall clash: ${A.hall} is double‑booked (${A.subject} vs ${B.subject}) on ${A.date}.`,
            ids: [A.id, B.id],
          });
        }
        // Class/semester clash
        if (
          sameClass &&
          (A.semester === "" || B.semester === "" || samesemester)
        ) {
          out.push({
            type: "class",
            msg: `Class ${A.klass}${
              A.semester ? "-" + A.semester : ""
            } has overlapping exams (${A.subject} vs ${B.subject}) on ${
              A.date
            }.`,
            ids: [A.id, B.id],
          });
        }
        // Invigilator clash (if any common names)
        const invA = (A.invigilators || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const invB = (B.invigilators || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (invA.length && invB.length) {
          const common = invA.filter((x) => invB.includes(x));
          if (common.length) {
            out.push({
              type: "invigilator",
              msg: `Invigilator clash (${common.join(
                ", "
              )}): overlapping duties on ${A.date}.`,
              ids: [A.id, B.id],
            });
          }
        }
      }

      // Min-gap rule: same class (any semester) must be at least N days apart
      if (minGapDays > 0 && sameClass) {
        const dayA = new Date(A.date + "T00:00");
        const dayB = new Date(B.date + "T00:00");
        const gap = Math.abs((dayA - dayB) / (1000 * 60 * 60 * 24));
        if (gap < minGapDays) {
          out.push({
            type: "gap",
            msg: `Minimum gap not met for Class ${A.klass}: ${A.subject} and ${B.subject} are ${gap} day(s) apart (need ≥ ${minGapDays}).`,
            ids: [A.id, B.id],
          });
        }
      }
    }
  }

  return out;
}

/* ------------------------- UI Render ------------------------- */
function render() {
  const tbody = $("#table tbody");
  tbody.innerHTML = "";
  const fc = $("#filterClass").value;
  const fs = $("#filtersemester").value;
  const rows = Schedule.sorted().filter(
    (r) =>
      (fc ? r.klass === fc : true) && (fs ? (r.semester || "") === fs : true)
  );

  for (const r of rows) {
    const tr = document.createElement("tr");
    const end = new Date(
      toDateTime(r.date, r.start).getTime() + (r.duration || 90) * 60000
    );
    tr.innerHTML = `
          <td>${r.date}</td>
          <td>${r.start}</td>
          <td>${("0" + end.getHours()).slice(-2)}:${(
      "0" + end.getMinutes()
    ).slice(-2)}</td>
          <td>${r.klass}</td>
          <td>${r.semester || "—"}</td>
          <td>${r.subject}</td>
          <td>${r.paper || "—"}</td>
          <td>${r.hall || "—"}</td>
          <td>${r.invigilators || "—"}</td>
          <td>${r.duration || 90}m</td>
          <td>${r.candidates || "—"}</td>
          <td>
            <button class="btn" data-act="edit" data-id="${r.id}">Edit</button>
            <button class="btn bad" data-act="del" data-id="${
              r.id
            }">Delete</button>
          </td>`;
    tbody.appendChild(tr);
  }

  // Show validation summary if any
  const issues = validateAll();
  const box = $("#validationSummary");
  if (issues.length) {
    const grouped = issues.reduce((acc, i) => {
      (acc[i.type] = acc[i.type] || []).push(i);
      return acc;
    }, {});
    box.className = "notice bad";
    box.style.display = "block";
    box.innerHTML =
      `<strong>Found ${issues.length} issue(s)</strong><ul style="margin:6px 0 0 18px">` +
      Object.keys(grouped)
        .map((t) => `<li>${t.toUpperCase()}: ${grouped[t].length}</li>`)
        .join("") +
      `</ul>`;
  } else {
    box.className = "notice ok";
    box.style.display = "block";
    box.textContent = "No issues detected.";
  }
}

/* ------------------------- Handlers ------------------------- */
function readForm() {
  const duration = parseInt(
    $("#duration").value || $("#defaultDuration").value || "90",
    10
  );
  return {
    id: $("#editingId").value || uid(),
    klass: $("#klass").value,
    semester: $("#semester").value,
    subject: $("#subject").value.trim(),
    paper: $("#paper").value.trim(),
    date: $("#date").value,
    start: $("#start").value,
    duration: duration,
    hall: $("#hall").value.trim(),
    candidates: parseInt($("#candidates").value || "0", 10) || undefined,
    invigilators: $("#invigilators").value.trim(),
    notes: $("#notes").value.trim(),
  };
}

function fillForm(r) {
  $("#editingId").value = r.id || "";
  $("#klass").value = r.klass || "";
  $("#semester").value = r.semester || "";
  $("#subject").value = r.subject || "";
  $("#paper").value = r.paper || "";
  $("#date").value = r.date || "";
  $("#start").value = r.start || "";
  $("#duration").value = r.duration || "";
  $("#hall").value = r.hall || "";
  $("#candidates").value = r.candidates || "";
  $("#invigilators").value = r.invigilators || "";
  $("#notes").value = r.notes || "";
  $("#btnAdd").textContent = r.id ? "Update Exam" : "Save Exam";
}

// Add/Update
$("#btnAdd").addEventListener("click", (e) => {
  e.preventDefault();
  const r = readForm();
  if (!r.klass || !r.subject || !r.date || !r.start) {
    alert("Please fill Class, Subject, Date and Start Time.");
    return;
  }
  const editing = $("#editingId").value;
  if (editing) {
    Schedule.update(r.id, r);
  } else {
    Schedule.add(r);
  }
  
  // Post to Django backend to save to database
  const form = $("#examForm");
  const formData = new FormData(form);
  
  // Map client field names to Django model field names
  formData.set('term', $("#term").value);
  formData.set('course', $("#klass").value);
  formData.set('semester', $("#semester").value);
  formData.set('subject', $("#subject").value);
  formData.set('paper_code', $("#paper").value);
  formData.set('date', $("#date").value);
  formData.set('start_time', $("#start").value);
  formData.set('duration', $("#duration").value || $("#defaultDuration").value || "90");
  formData.set('hall', $("#hall").value);
  formData.set('candidates', $("#candidates").value || "0");
  formData.set('invigilators', $("#invigilators").value);
  formData.set('notes', $("#notes").value);
  
  fetch(window.location.pathname, {
    method: 'POST',
    body: formData
  })
  .then(r => {
    if (r.ok) {
      console.log('Exam saved to database');
      $("#examForm").reset();
      $("#editingId").value = "";
      $("#btnAdd").textContent = "Save Exam";
      // Reload to show saved data from server
      setTimeout(() => location.reload(), 500);
    } else {
      alert('Failed to save to database');
    }
  })
  .catch(e => {
    console.error('Server save error:', e);
    alert('Error: ' + e.message);
  });
});

// Reset
$("#btnReset").addEventListener("click", () => {
  $("#editingId").value = "";
  $("#btnAdd").textContent = "Save Exam";
});

// Table actions
$("#table").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  if (btn.dataset.act === "del") {
    if (confirm("Delete this exam?")) Schedule.remove(id);
  } else if (btn.dataset.act === "edit") {
    const r = Schedule.rows.find((x) => x.id === id);
    if (r) fillForm(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Sort
$("#btnSort").addEventListener("click", () => {
  Schedule.rows = Schedule.sorted();
  Schedule.persist();
});

// Filters
$("#filterClass").addEventListener("change", render);
$("#filtersemester").addEventListener("change", render);

// Validate
$("#btnValidate").addEventListener("click", () => {
  const issues = validateAll();
  if (!issues.length) {
    alert("✅ No issues detected.");
    return;
  }
  const lines = issues.map((i) => "• " + i.msg).join("\n");
  alert("⚠️ Issues found:\n\n" + lines);
});

// Export JSON
$("#btnExportJSON").addEventListener("click", () => {
  const payload = {
    meta: {
      term: $("#term").value,
      windowStart: $("#windowStart").value,
      windowEnd: $("#windowEnd").value,
      minGapDays: parseInt($("#minGap").value || "0", 10),
      defaultDuration: parseInt($("#defaultDuration").value || "90", 10),
      school: $("#schoolName").value,
    },
    schedule: Schedule.sorted(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "exam_schedule.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

// Export CSV
$("#btnExportCSV").addEventListener("click", () => {
  const rows = [
    [
      "Date",
      "Start",
      "End",
      "Class",
      "semester",
      "Subject",
      "Paper",
      "Hall",
      "Invigilators",
      "Duration(min)",
      "Candidates",
      "Notes",
    ],
  ];
  for (const r of Schedule.sorted()) {
    const end = new Date(
      toDateTime(r.date, r.start).getTime() + (r.duration || 90) * 60000
    );
    rows.push([
      r.date,
      r.start,
      ("0" + end.getHours()).slice(-2) +
        ":" +
        ("0" + end.getMinutes()).slice(-2),
      r.klass,
      r.semester || "",
      r.subject,
      r.paper || "",
      r.hall || "",
      r.invigilators || "",
      r.duration || 90,
      r.candidates || "",
      r.notes || "",
    ]);
  }
  const csv = rows
    .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "exam_schedule.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

// Print
$("#btnPrint").addEventListener("click", () => window.print());

// Clear all
$("#btnClearAll").addEventListener("click", () => {
  if (confirm("Clear entire schedule?")) {
    Schedule.clear();
    $("#examForm").reset();
  }
});

// Prefill duration when date changes (quality of life)
$("#date").addEventListener("change", () => {
  if (!$("#duration").value) {
    $("#duration").value = $("#defaultDuration").value;
  }
});

// If server provided initial exams, merge/load them when appropriate
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Prefer server data embedded via json_script element
    let server = [];
    const el = document.getElementById('init-exams');
    if (el) {
      try {
        server = JSON.parse(el.textContent || el.innerText || '[]');
      } catch (e) {
        server = [];
      }
    } else {
      // fallback for older embedding
      server = window.INIT_EXAMS || [];
    }

    const stored = Store.load() || [];
    if (Array.isArray(server) && server.length) {
      if (!stored || stored.length === 0) {
        // No local data: seed from server
        Schedule.rows = server.map((r) => ({ ...r }));
        Store.save(Schedule.rows);
      } else {
        // Merge server rows that aren't present locally (by id)
        const ids = new Set(stored.map((s) => String(s.id)));
        const toAdd = server.filter((r) => !ids.has(String(r.id)));
        if (toAdd.length) {
          Schedule.rows = [...stored, ...toAdd.map((r) => ({ ...r }))];
          Store.save(Schedule.rows);
        }
      }
    }
  } catch (e) {
    // ignore
    console.error('INIT_EXAMS load error', e);
  }
  // render after possible merge
  render();
});
