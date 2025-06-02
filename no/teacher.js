// Comprovar autenticació
function checkAuth() {
  const currentUser = localStorage.getItem("currentUser");
  const userType = localStorage.getItem("userType");

  if (!currentUser || (userType !== "teacher" && userType !== "admin")) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userName").textContent = `Hola, ${currentUser}!`;
  updatePointsSummary();
  loadPointsHistory();
}

// Afegir punts
function addPoints() {
  const student = document.getElementById("studentSelect").value;
  const points = parseInt(document.getElementById("pointsToAdd").value);
  const reason = document.getElementById("pointReason").value;

  if (!student || !points || !reason) {
    alert("Si us plau, omple tots els camps");
    return;
  }

  if (points < 1) {
    alert("Els punts han de ser un número positiu");
    return;
  }

  // Obtenir punts actuals
  let currentPoints = parseInt(
    localStorage.getItem(`points_${student}`) || "0"
  );

  // Afegir nous punts
  currentPoints += points;

  // Guardar els nous punts
  localStorage.setItem(`points_${student}`, currentPoints.toString());

  // Guardar a l'historial
  const historyItem = {
    student: student,
    points: points,
    reason: reason,
    teacher: localStorage.getItem("currentUser"),
    date: new Date().toISOString(),
    totalPoints: currentPoints,
  };

  const history = JSON.parse(localStorage.getItem("pointsHistory") || "[]");
  history.unshift(historyItem);
  localStorage.setItem("pointsHistory", JSON.stringify(history));

  // Actualitzar la interfície
  updatePointsSummary();
  loadPointsHistory();

  // Netejar el formulari
  document.getElementById("pointsToAdd").value = "1";
  document.getElementById("pointReason").value = "";

  alert(
    `S'han afegit ${points} punts a ${student}. Total: ${currentPoints} punts`
  );
}

// Actualitzar resum de punts
function updatePointsSummary() {
  const students = ["Aleix", "Valeria", "Sofia", "Luke", "Leo", "Emma"];
  const pointsList = document.getElementById("studentsPointsList");
  pointsList.innerHTML = "";

  students.forEach((student) => {
    const points = parseInt(localStorage.getItem(`points_${student}`) || "0");
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
            <h4>${student}</h4>
            <p>${points} punts</p>
        `;
    pointsList.appendChild(card);
  });
}

// Carregar historial de punts
function loadPointsHistory() {
  const history = JSON.parse(localStorage.getItem("pointsHistory") || "[]");
  const historyList = document.getElementById("pointsHistory");
  historyList.innerHTML = "";

  history.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    const date = new Date(entry.date).toLocaleString("ca");
    item.innerHTML = `
            <div>
                <strong>${entry.student}</strong>: +${entry.points} punts
                <br>
                <small>${entry.reason}</small>
            </div>
            <div class="date">
                <small>${date} per ${entry.teacher}</small>
            </div>
        `;
    historyList.appendChild(item);
  });
}

// Tancar sessió
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userType");
  window.location.href = "index.html";
}

// Inicialitzar la pàgina
checkAuth();

// Actualitzar la pàgina cada 30 segons
setInterval(function () {
  updatePointsSummary();
  loadPointsHistory();
}, 30000);
