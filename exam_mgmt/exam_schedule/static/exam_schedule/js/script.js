/* ===================== Utilities ===================== */
const $ = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

const uid = () =>
  "x" + Math.random().toString(36).slice(2, 10);

function toDT(d, t) {
  return new Date(`${d}T${t}`);
}

function addMinutes(date, m) {
  return new Date(date.getTime() + m * 60000);
}

function addDays(date, d) {
  const nd = new Date(date);
  nd.setDate(nd.getDate() + d);
  return nd;
}

function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((d2 - d1) / MS);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===================== Subjects & Codes ===================== */
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
    "Principles of Management": "CACS156",   // sometimes seen
    "UX/UI Design": "CACS155"               // some variants
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
    // some common electives:
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
    // elective options for 8th:
    "Database Programming": "CACS453",
    "Geographical Information System": "CACS454",
    "Data Analysis and Visualization": "CACS455",
    "Machine Learning": "CACS456",
    "Multimedia System": "CACS457",
    "Knowledge Engineering": "CACS458"
  }
};

function getPaperCode(sem, subjectName) {
  const m = paperCodesBCA_TU[sem] || {};
  return m[subjectName] || "";
}

/* ===================== teachers ===================== */
const teachers = [
    "Ramesh Shrestha",
    "Mina Rana",
    "Kamal Chhetri",
    "Saraswati Acharya",
    "Bina Gurung",
    "Sanjay Adhikari",
    "Nirajan Poudel",
    "Rupesh Khadka",
    "Sushma Koirala",
    "Deepak Gautam",
    "Anita Panta",
    "Krishna Rajbhandari",
    "Sabina Thapa",
    "Hari Prasad Neupane",
    "Laxmi Ghimire",
]
    
// Populate invigilators select options on load
document.addEventListener("DOMContentLoaded", () => {
  const invSel = $("#invigilators");
  if (invSel && invSel.tagName === 'SELECT') {
    invSel.innerHTML = `<option value="" disabled selected>Select invigilator</option>` +
      teachers.map(t => `<option value="${t}">${t}</option>`).join("");
  }
});
$("#semester").addEventListener("change", () => {
  const s = $("#semester").value;
  const sel = $("#subject");
  sel.innerHTML = `<option disabled selected>Select subject</option>`;
  const names = Object.keys(paperCodesBCA_TU[s] || {});
  names.forEach(sub => {
    sel.innerHTML += `<option>${sub}</option>`;
  });
  // Clear paper code when semester switches
  const paper = $("#paper");
  if (paper) paper.value = "";
});

// When subject changes, auto-fill its code into #paper
$("#subject").addEventListener("change", () => {
  const s = $("#semester").value;
  const sub = $("#subject").value;
  const code = getPaperCode(s, sub);
  const paper = $("#paper");
  if (paper) paper.value = code;
});

/* ===================== Store ===================== */
const KEY = "exam_schedule";
const Store = {
  load: () => JSON.parse(localStorage.getItem(KEY) || "[]"),
  save: d => localStorage.setItem(KEY, JSON.stringify(d))
};

/* ===================== Schedule ===================== */
const Schedule = {
  rows: Store.load(),

  add(r) {
    this.rows.push(r);
    this.sync();
  },
  update(id, r) {
    const i = this.rows.findIndex(x => x.id === id);
    if (i !== -1) this.rows[i] = r;
    this.sync();
  },
  remove(id) {
    this.rows = this.rows.filter(x => x.id !== id);
    this.sync();
  },
  sync() {
    Store.save(this.rows);
    render();
  }
};

/* ===================== Validation ===================== */
function validate() {
  const issues = [];
  for (let i = 0; i < Schedule.rows.length; i++) {
    for (let j = i + 1; j < Schedule.rows.length; j++) {
      const A = Schedule.rows[i];
      const B = Schedule.rows[j];

      const aS = toDT(A.date, A.start);
      const aE = addMinutes(aS, A.duration);
      const bS = toDT(B.date, B.start);
      const bE = addMinutes(bS, B.duration);

      if (A.date === B.date && aS < bE && bS < aE) {
        if (A.hall && A.hall === B.hall)
          issues.push("Hall clash detected");
        if (A.klass === B.klass && A.semester === B.semester)
          issues.push("Class overlap detected");
      }
    }
  }
  return issues;
}

/* ===================== Render ===================== */
function render() {
  const tb = $("#table tbody");
  tb.innerHTML = "";

  Schedule.rows
    .sort((a,b)=>toDT(a.date,a.start)-toDT(b.date,b.start))
    .forEach(r => {
      const tr = document.createElement("tr");
      const end = addMinutes(toDT(r.date, r.start), r.duration);
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${r.start}</td>
        <td>${end.toTimeString().slice(0,5)}</td>
        <td>${r.klass}</td>
        <td>${r.semester}</td>
        <td>${r.subject}</td>
        <td>${r.paper || r.paper_code || "-"}</td>
        <td>${r.hall || "-"}</td>
        <td>${r.invigilators || "-"}</td>
        <td>${r.duration}</td>
        <td>${r.candidates || "-"}</td>
        <td>
          <button data-e="${r.id}">Edit</button>
          <button data-d="${r.id}">Delete</button>
        </td>`;
      tb.appendChild(tr);
    });

  const box = $("#validationSummary");
  const issues = validate();
  box.style.display = "block";
  box.textContent = issues.length
    ? `⚠ ${issues.length} issue(s) found`
    : "✅ No issues detected";
}

/* ===================== Form ===================== */
function readForm() {
  return {
    id: $("#editingId").value || uid(),
    // Map to Django form field names
    course: $("#klass").value,
    semester: $("#semester").value,
    subject: $("#subject").value,
    paper: $("#paper").value,
    paper_code: $("#paper").value,
    date: $("#date").value,
    start_time: $("#start").value,
    duration: +($("#duration").value || $("#defaultDuration").value),
    hall: $("#hall").value,
    candidates: +($("#candidates").value || 0),
    invigilators: $("#invigilators").value,
    notes: $("#notes").value
  };
}

$("#btnAdd").onclick = e => {
  e.preventDefault();
  const r = readForm();
  if (!r.klass || !r.subject || !r.date || !r.start) {
    alert("Required fields missing");
    return;
  }
  // Persist locally
  $("#editingId").value
    ? Schedule.update(r.id, r)
    : Schedule.add(r);

  // Also POST to Django API
  const csrftoken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  fetch('/exam_schedule/api/exams/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || ''
    },
    body: JSON.stringify(r)
  })
    .then(res => {
      if (!res.ok) throw new Error('Server error');
      return res.json();
    })
    .then(data => {
      console.log('Saved to server', data);
    })
    .catch(err => {
      console.warn('Failed to save to server:', err);
    });
  $("#examForm").reset();
  $("#editingId").value = "";
};

$("#table").onclick = e => {
  if (e.target.dataset.e) {
    const r = Schedule.rows.find(x => x.id === e.target.dataset.e);
    $("#editingId").value = r.id;
    $("#semester").value = r.semester;
    $("#semester").dispatchEvent(new Event("change"));
    Object.keys(r).forEach(k => {
      const el = $("#" + k);
      if (!el) return;
      el.value = r[k];
    });
  }
  if (e.target.dataset.d) {
    if (confirm("Delete?"))
      Schedule.remove(e.target.dataset.d);
  }
};

/* ===================== Auto Scheduling ===================== */
$("#btnAutoFill").onclick = () => {
  const sem = $("#semester").value;
  const subs = Object.keys(paperCodesBCA_TU[sem] || {});
  if (!sem || subs.length === 0) {
    alert("Please select a semester with subjects");
    return;
  }

  const wsStr = $("#windowStart").value;
  const weStr = $("#windowEnd").value;
  if (!wsStr || !weStr) {
    alert("Please set Window Start and End dates");
    return;
  }
  const ws = new Date(wsStr);
  const we = new Date(weStr);
  if (isNaN(ws.getTime()) || isNaN(we.getTime()) || ws > we) {
    alert("Invalid date window. Ensure Start ≤ End.");
    return;
  }

  const minGap = Math.max(0, +($("#minGap").value || 0));
  const spacing = minGap + 1; // at least 1 day between exams means + (gap+1)
  const totalDays = daysBetween(ws, we) + 1;
  const n = subs.length;
  const minDaysRequired = 1 + (n - 1) * spacing;
  if (totalDays < minDaysRequired) {
    alert(`Not enough days in window. Need at least ${minDaysRequired} days for ${n} exams with gap ${minGap}.`);
    return;
  }

  // Distribute slack days randomly across start offset and gaps to randomize
  let slack = totalDays - minDaysRequired;
  const slots = new Array(n).fill(0); // slot 0 = start offset, 1..n-1 = extra days after each exam
  while (slack-- > 0) {
    const idx = Math.floor(Math.random() * n);
    slots[idx]++;
  }

  // Build exam dates
  const dates = [];
  let cur = addDays(ws, slots[0]);
  for (let i = 0; i < n; i++) {
    dates.push(cur);
    if (i < n - 1) {
      cur = addDays(cur, spacing + slots[i + 1]);
    }
  }

  // Randomize invigilators: choose exactly 1 per exam
  const pickInvigilators = () => {
    return shuffle(teachers)[0];
  };

  const klass = $("#klass")?.value || "BCA";
  const startTime = $("#start")?.value || "09:00";
  const duration = +($("#defaultDuration").value || 90);
  const hall = $("#hall")?.value || "Hall A";

  subs.forEach((sub, i) => {
    const d = dates[i];
    const code = getPaperCode(sem, sub);
    Schedule.add({
      id: uid(),
      klass,
      semester: sem,
      subject: sub,
      paper: code,
      paper_code: code,
      date: d.toISOString().slice(0, 10),
      start: startTime,
      duration: duration,
      hall: hall,
      invigilators: pickInvigilators(),
      candidates: 0
    });
  });
};

/* ===================== Init ===================== */
document.addEventListener("DOMContentLoaded", render);

// Print support
const printBtn = $("#btnPrint");
if (printBtn) {
  printBtn.addEventListener("click", () => window.print());
}
