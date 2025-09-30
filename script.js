let studentData = [];
let flagData = {};
let charts = {};

// Load JSON files then render everything
Promise.all([
  fetch("students.json").then(res => res.json()),
  fetch("flag.json").then(res => res.json())
]).then(([students, flags]) => {
  studentData = students;
  flagData = flags;
  renderTable();
  renderCharts();
});

// Render student table
function renderTable() {
  const tableBody = document.querySelector("#student-table tbody");
  tableBody.innerHTML = "";

  const sortedStudents = studentData.sort((a, b) => a.name.localeCompare(b.name));

  sortedStudents.forEach(student => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = student.id;

    const catCell = document.createElement("td");
    catCell.textContent = student.category;

    const nameCell = document.createElement("td");
    nameCell.textContent = student.name;

    const schoolCell = document.createElement("td");
    schoolCell.textContent = student.school;

    const countryCell = document.createElement("td");
    if (flagData[student.country]) {
      const span = document.createElement("span");
      span.classList.add("flag-icon");
      span.innerHTML = flagData[student.country];
      span.title = student.country; // tooltip
      countryCell.appendChild(span);
    }

    const selectedCell = document.createElement("td");
    selectedCell.textContent = student.selected;

    if (student.selected === "Yes") {
      row.classList.add("selected-yes");
    }

    row.appendChild(idCell);
    row.appendChild(catCell);
    row.appendChild(nameCell);
    row.appendChild(schoolCell);
    row.appendChild(countryCell);
    row.appendChild(selectedCell);

    tableBody.appendChild(row);
  });
}

// Render charts
function renderCharts() {
  // Destroy old charts if they exist
  for (const key in charts) {
    charts[key].destroy();
  }

  // Junior Selected vs Non-selected
  const juniors = studentData.filter(s => s.category === "Junior");
  const juniorYes = juniors.filter(s => s.selected === "Yes").length;
  const juniorNo = juniors.filter(s => s.selected === "No").length;

  charts.juniorChart = new Chart(document.getElementById("juniorChart"), {
    type: "doughnut",
    data: {
      labels: ["Selected", "Not Selected"],
      datasets: [{
        data: [juniorYes, juniorNo],
        backgroundColor: ["#4CAF50", "#FF5252"]
      }]
    }
  });

  // Senior Selected vs Non-selected
  const seniors = studentData.filter(s => s.category === "Senior");
  const seniorYes = seniors.filter(s => s.selected === "Yes").length;
  const seniorNo = seniors.filter(s => s.selected === "No").length;

  charts.seniorChart = new Chart(document.getElementById("seniorChart"), {
    type: "doughnut",
    data: {
      labels: ["Selected", "Not Selected"],
      datasets: [{
        data: [seniorYes, seniorNo],
        backgroundColor: ["#4CAF50", "#FF5252"]
      }]
    }
  });

  // Country Participation Pie (with flags in legend tooltips)
  const countryCounts = {};
  studentData.forEach(s => {
    countryCounts[s.country] = (countryCounts[s.country] || 0) + 1;
  });

  const countryLabels = Object.keys(countryCounts);
  const countryValues = Object.values(countryCounts);

  charts.countryChart = new Chart(document.getElementById("countryChart"), {
    type: "pie",
    data: {
      labels: countryLabels,
      datasets: [{
        data: countryValues,
        backgroundColor: ["#2196F3", "#FF9800", "#9C27B0", "#009688"]
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const country = ctx.label;
              const count = ctx.raw;
              let svg = flagData[country] ? flagData[country] : "";
              return `${country}: ${count}`;
            }
          }
        },
        legend: {
          labels: {
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, i) => {
                const svg = flagData[label] ? flagData[label] : "";
                return {
                  text: label,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
          }
        }
      }
    }
  });
}
