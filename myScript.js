// Default student records mimicking the user's original table data
const defaultStudents = [
  { id: 1, roll: "21/FCA/MCA/008", name: "Aniket", max: 100, scored: 50 },
  { id: 2, roll: "21/FCA/MCA/060", name: "baba", max: 100, scored: 40 },
  { id: 3, roll: "21/FCA/MCA/061", name: "yogesh", max: 100, scored: 30 },
  { id: 4, roll: "21/FCA/MCA/021", name: "harshit", max: 100, scored: 20 },
  { id: 5, roll: "21/FCA/MCA/024", name: "kamal", max: 100, scored: 10 },
];

// Main application state
let state = {
  institution: "FCA Dept, MCA Course",
  title: "Mca marks summary sheet",
  session: "session: july 2022",
  theme: "theme-emerald",
  students: JSON.parse(JSON.stringify(defaultStudents)),
};

// Initialize input event listeners
document.getElementById("input-institution").addEventListener("input", (e) => {
  state.institution = e.target.value;
  document.getElementById("preview-institution").innerText =
    state.institution || "—";
});

document.getElementById("input-title").addEventListener("input", (e) => {
  state.title = e.target.value;
  document.getElementById("preview-title").innerText = state.title || "—";
});

document.getElementById("input-session").addEventListener("input", (e) => {
  state.session = e.target.value;
  document.getElementById("preview-session").innerText = state.session || "—";
});

// Change theme preset
function setTheme(themeClass) {
  state.theme = themeClass;

  // Update active styling on theme selection buttons
  document
    .querySelectorAll(".theme-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Toggle CSS classes on preview element
  const previewContainer = document.getElementById("mca");
  previewContainer.className = "main-container " + themeClass;
}

// Update generated timestamp dynamically to local time
function updateTimestamp() {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const nowString = new Date().toLocaleDateString("en-US", options);
  document.getElementById("generation-timestamp").innerText =
    "Generated on: " + nowString;
}

// Calculate Statistics and Redraw Printable Document
function updatePreview() {
  updateTimestamp();

  const tbody = document.getElementById("preview-table-body");
  tbody.innerHTML = "";

  let totalMax = 0;
  let totalScored = 0;
  let highestScore = 0;
  let passedCount = 0;

  state.students.forEach((student, index) => {
    const max = Number(student.max) || 100;
    const scored = Number(student.scored) || 0;
    totalMax += max;
    totalScored += scored;

    if (scored > highestScore) {
      highestScore = scored;
    }

    const percentage = max > 0 ? ((scored / max) * 100).toFixed(0) : 0;
    // Passing threshold is 33%
    const isPass = percentage >= 33;
    if (isPass) passedCount++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
					<td style="text-align: center;">${index + 1}</td>
					<td>${escapeHtml(student.roll)}</td>
					<td style="font-weight: 500;">${escapeHtml(student.name)}</td>
					<td style="text-align: right;">${max}</td>
					<td style="text-align: right; font-weight: 500;">${scored}</td>
					<td style="text-align: right;">${percentage}%</td>
					<td style="text-align: center;">
						<span class="badge ${isPass ? "badge-success" : "badge-fail"}">
							${isPass ? "Pass" : "Fail"}
						</span>
					</td>
				`;
    tbody.appendChild(tr);
  });

  // Append Summary row if table contains student records
  if (state.students.length > 0) {
    const avgPercent =
      totalMax > 0 ? ((totalScored / totalMax) * 100).toFixed(1) : 0;
    const summaryTr = document.createElement("tr");
    summaryTr.className = "summary-row";
    summaryTr.innerHTML = `
					<td colspan="3" style="text-align: left;">AVERAGE / SUM OVERALL</td>
					<td style="text-align: right;">${totalMax}</td>
					<td style="text-align: right;">${totalScored}</td>
					<td style="text-align: right;">${avgPercent}%</td>
					<td style="text-align: center;">
						<span class="badge ${avgPercent >= 33 ? "badge-success" : "badge-fail"}">
							${avgPercent >= 33 ? "Class Pass" : "Class Fail"}
						</span>
					</td>
				`;
    tbody.appendChild(summaryTr);

    // Update Stat Badges
    document.getElementById("stat-total-students").innerText =
      state.students.length;
    document.getElementById("stat-class-average").innerText = avgPercent + "%";
    document.getElementById("stat-highest-score").innerText = highestScore;

    const passRate = ((passedCount / state.students.length) * 100).toFixed(0);
    document.getElementById("stat-pass-rate").innerText = passRate + "%";
  } else {
    // Empty Table Fallback
    const emptyTr = document.createElement("tr");
    emptyTr.innerHTML = `
					<td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
						No student records available. Add rows in the panel.
					</td>
				`;
    tbody.appendChild(emptyTr);

    document.getElementById("stat-total-students").innerText = 0;
    document.getElementById("stat-class-average").innerText = "0%";
    document.getElementById("stat-highest-score").innerText = 0;
    document.getElementById("stat-pass-rate").innerText = "0%";
  }
}

// Render Sidebar controls for editing student rows without focus loss
function renderEditorList() {
  const container = document.getElementById("editor-students-body");
  container.innerHTML = "";

  state.students.forEach((student, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
					<td>
						<input type="text" value="${escapeHtml(student.name)}" oninput="editStudent(${student.id}, 'name', this.value)" placeholder="Name">
					</td>
					<td>
						<input type="text" value="${escapeHtml(student.roll)}" oninput="editStudent(${student.id}, 'roll', this.value)" placeholder="Roll No">
					</td>
					<td>
						<input type="number" value="${student.scored}" oninput="editStudent(${student.id}, 'scored', this.value)" placeholder="Marks" style="text-align: right;">
					</td>
					<td style="text-align: center;">
						<button class="btn-delete" onclick="deleteStudent(${student.id})" title="Delete Record">
							<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
							</svg>
						</button>
					</td>
				`;
    container.appendChild(tr);
  });
}

// Edit single student property and trigger immediate statistics updates
function editStudent(id, field, value) {
  const student = state.students.find((s) => s.id === id);
  if (student) {
    if (field === "scored" || field === "max") {
      student[field] = Number(value) || 0;
    } else {
      student[field] = value;
    }
    updatePreview();
  }
}

// Add new record from add-form
function addStudent() {
  const nameInput = document.getElementById("add-name");
  const rollInput = document.getElementById("add-roll");
  const maxInput = document.getElementById("add-max");
  const scoredInput = document.getElementById("add-scored");

  const name = nameInput.value.trim();
  const roll = rollInput.value.trim();
  const max = Number(maxInput.value) || 100;
  const scored = Number(scoredInput.value) || 0;

  if (!name || !roll) {
    alert("Please fill in Student Name and Roll Number fields.");
    return;
  }

  const newId =
    state.students.length > 0
      ? Math.max(...state.students.map((s) => s.id)) + 1
      : 1;
  state.students.push({
    id: newId,
    name: name,
    roll: roll,
    max: max,
    scored: scored,
  });

  // Reset form inputs
  nameInput.value = "";
  rollInput.value = "";
  scoredInput.value = "50";

  renderEditorList();
  updatePreview();
}

// Delete student record
function deleteStudent(id) {
  state.students = state.students.filter((s) => s.id !== id);
  renderEditorList();
  updatePreview();
}

// Reset settings and records list to defaults
function resetToDefaults() {
  if (confirm("Are you sure you want to reset all data to default values?")) {
    state = {
      institution: "FCA Dept, MCA Course",
      title: "Mca marks summary sheet",
      session: "session: july 2022",
      theme: "theme-emerald",
      students: JSON.parse(JSON.stringify(defaultStudents)),
    };

    // Reset header elements in editor
    document.getElementById("input-institution").value = state.institution;
    document.getElementById("input-title").value = state.title;
    document.getElementById("input-session").value = state.session;

    // Reset visual preview tags
    document.getElementById("preview-institution").innerText =
      state.institution;
    document.getElementById("preview-title").innerText = state.title;
    document.getElementById("preview-session").innerText = state.session;

    // Reset active theme buttons classes
    document
      .querySelectorAll(".theme-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector("[onclick=\"setTheme('theme-emerald')\"]")
      .classList.add("active");
    document.getElementById("mca").className = "main-container theme-emerald";

    renderEditorList();
    updatePreview();
  }
}

// Helper to escape HTML tags
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// PDF Generator Exporter Action - Fixed Performance Issue (Only runs html2pdf once)
function generatepdf() {
  const element = document.getElementById("mca");

  // Temporary print scale styling adjustments if needed
  const opt = {
    margin: [0.4, 0.4, 0.4, 0.4],
    filename: state.title.toLowerCase().replace(/[^a-z0-9]/g, "_") + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  // Fixed double execution bug: Only execute save stream once.
  html2pdf().set(opt).from(element).save();
}

// Primary Initialization Render
renderEditorList();
updatePreview();
