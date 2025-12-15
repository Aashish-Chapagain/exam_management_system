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

/* ===================== Subjects ===================== */
const subjects = {
  1: ["Computer Fundamentals and Applications","Society and Technology","English I","Mathematics I","Digital Logic"],
  2: ["C Programming","Financial Accounting","English II","Mathematics II","Microprocessor and Computer Architecture"],
  3: ["Data Structures and Algorithms","OOP in Java","Web Technology","Statistics I","Operating Systems"],
  4: ["Numerical Methods","Software Engineering","DBMS","Computer Networking","Statistics II"],
  5: ["MIS and E-Business","Dot Net Technology","Computer Graphics","Artificial Intelligence","Network Programming"],
  6: ["Mobile Programming","Distributed System","Applied Economics","Advanced Java","Network Administration"],
  7: ["Cyber Law","Cloud Computing","Image Processing","Database Administration","Knowledge Management"],
  8: ["Operations Research","Multimedia System","E-Governance","Information Security"]
};

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
    
$("#semester").addEventListener("change", () => {
  const s = $("#semester").value;
  const sel = $("#subject");
  sel.innerHTML = `<option disabled selected>Select subject</option>`;
  (subjects[s] || []).forEach(sub => {
    sel.innerHTML += `<option>${sub}</option>`;
  });
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
        <td>${r.paper || "-"}</td>
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
    klass: $("#klass").value,
    semester: $("#semester").value,
    subject: $("#subject").value,
    paper: $("#paper").value,
    date: $("#date").value,
    start: $("#start").value,
    duration: +($("#duration").value || $("#defaultDuration").value),
    hall: $("#hall").value,
    candidates: $("#candidates").value,
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
  $("#editingId").value
    ? Schedule.update(r.id, r)
    : Schedule.add(r);
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
      if (el) el.value = r[k];
    });
  }
  if (e.target.dataset.d) {
    if (confirm("Delete?"))
      Schedule.remove(e.target.dataset.d);
  }
};

/* ===================== Auto Scheduling ===================== */
$("#btnAutoFill").onclick = () => {
  const start = new Date($("#windowStart").value);
  let day = start;

  subjects[$("#semester").value]?.forEach((sub,i) => {
    Schedule.add({
      id: uid(),
      klass: "BCA",
      semester: $("#semester").value,
      subject: sub,
      paper: "",
      date: day.toISOString().slice(0,10),
      start: "09:00",
      duration: +$("#defaultDuration").value,
      hall: "Hall A"
    });
    day.setDate(day.getDate() + 2);
  });
};

/* ===================== Init ===================== */
document.addEventListener("DOMContentLoaded", render);

// Print support
const printBtn = $("#btnPrint");
if (printBtn) {
  printBtn.addEventListener("click", () => window.print());
}
