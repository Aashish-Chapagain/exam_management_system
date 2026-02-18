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
    "Digital Logic": "CACS105",
    "Mathematics I": "CAMT104",
    "Socity and Technology": "SAT103",
    "English I": "CACS106"
  },
  2: {
    
    "Microprocessor and Computer Architecture": "CACS155",
    "Programming in C": "CACS102",
    "Mathematics II": "CAMT154",
    "Financial Accounting": "CAAC152",
    "English II": "CAEN153",

  
  },
  3: {
    "Data Structures and Algorithms": "CACS201",
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

function autoSchedule() {
  const windowStart = $("#windowStart")?.value;
  const windowEnd = $("#windowEnd")?.value;
  const minGap = parseInt($("#minGap")?.value ?? "1", 10);
  const duration = parseInt($("#defaultDuration")?.value ?? "90", 10);
  const startTime = "09:00";
  const term = $("#term")?.value || "";
  const course = "BCA";

  if (!windowStart || !windowEnd) {
    alert("Please set Window Start and Window End dates before auto-scheduling.");
    return;
  }

  const start = new Date(windowStart);
  const end = new Date(windowEnd);
  if (start > end) {
    alert("Window Start must be before Window End.");
    return;
  }

  // Build list of all available date strings in the window
  const availableDates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    availableDates.push(d.toISOString().slice(0, 10));
  }

  // Build exam list for SELECTED SEMESTER ONLY
  const selectedSemester = $("#semester")?.value;
  if (!selectedSemester) {
    alert("Please select a semester before auto-scheduling.");
    return;
  }
  const toSchedule = [];
  const subjects = Object.keys(paperCodesBCA_TU[selectedSemester] || {});
  if (subjects.length === 0) {
    alert(`No subjects found for semester ${selectedSemester}.`);
    return;
  }
  for (const subject of subjects) {
    toSchedule.push({ semester: selectedSemester, subject });
  }

  // Track last scheduled date per semester
  const lastDateBySem = {};

  // Assign dates: iterate available dates, on each date assign as many exams as possible
  // (one per unique semester allowed that day, respecting minGap from that sem's last exam)
  const assignments = []; // {semester, subject, date}
  const remaining = [...toSchedule];

  for (const dateStr of availableDates) {
    if (remaining.length === 0) break;
    const currentDate = new Date(dateStr);
    // Try each remaining exam in order; assign the first one whose semester gap is satisfied
    for (let i = 0; i < remaining.length; i++) {
      const { semester } = remaining[i];
      const last = lastDateBySem[semester];
      if (last !== undefined) {
        const daysDiff = Math.round((currentDate - new Date(last)) / 86400000);
        if (daysDiff < minGap) continue;
      }
      // Assign this exam to this date
      assignments.push({ ...remaining[i], date: dateStr });
      lastDateBySem[semester] = dateStr;
      remaining.splice(i, 1);
      break; // one exam per date slot
    }
  }

  if (remaining.length > 0) {
    alert(
      `Not enough days in the window to schedule all exams with a ${minGap}-day minimum gap.\n` +
      `${remaining.length} exam(s) could not be scheduled.\n` +
      `Please widen the window or reduce the minimum gap.`
    );
    return;
  }

  // Confirm before saving
  if (!confirm(`Auto-schedule Semester ${selectedSemester}?\n${assignments.length} exam(s) from ${windowStart} to ${windowEnd}\n\nProceed?`)) {
    return;
  }

  // Save all assignments via API
  const inv_list = teachers;
  let inv_i = 0;

  (async () => {
    const csrftoken = document.cookie.split('; ').find(r => r.startsWith('csrftoken='))?.split('=')[1] || '';
    let saved = 0;
    let failed = 0;
    for (const item of assignments) {
      const paper_code = paperCodesBCA_TU[item.semester]?.[item.subject] || "";
      const inv_a = inv_list[inv_i % inv_list.length] || "";
      const inv_b = inv_list[(inv_i + 1) % inv_list.length] || "";
      const invigilators = [inv_a, inv_b].filter(Boolean).join(", ");
      inv_i++;

      const payload = {
        term,
        course,
        semester: item.semester,
        subject: item.subject,
        paper_code,
        date: item.date,
        start_time: startTime,
        duration,
        hall: "",
        candidates: 0,
        invigilators,
        notes: "",
      };

      try {
        const res = await fetch(examsApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          Schedule.rows.push(data.exam);
          saved++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    render();
    alert(`Auto-scheduling complete: ${saved} exam(s) saved${failed ? `, ${failed} failed` : ""}.`);
  })();
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

  $("#btnAutoFill")?.addEventListener("click", autoSchedule);

  render();
});

// Filters
const filterClass = $("#filterClass");
const filterSemester = $("#filterSemester");
filterClass?.addEventListener("change", render);
filterSemester?.addEventListener("change", render);
