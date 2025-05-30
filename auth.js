// Definim els usuaris per tipus
const users = {
  admin: ["Escola"],
  teachers: ["Vane", "Clara", "Marta", "Sara"],
  students: ["Aleix", "Valeria", "Sofia", "Luke", "Leo", "Emma"],
};

// Funció per actualitzar la llista d'usuaris segons el rol seleccionat
function updateUserList() {
  const userType = document.getElementById("userType").value;
  const usernameSelect = document.getElementById("username");
  usernameSelect.innerHTML = '<option value="">Selecciona...</option>';

  let userList = [];
  if (userType === "admin") {
    userList = users.admin;
  } else if (userType === "teacher") {
    userList = users.teachers;
  } else if (userType === "student") {
    userList = users.students;
  }

  userList.forEach((user) => {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = user;
    usernameSelect.appendChild(option);
  });
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const userType = document.getElementById("userType").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (password === username) {
    // Guardar l'usuari i el seu tipus al localStorage
    localStorage.setItem("currentUser", username);
    localStorage.setItem("userType", userType);

    // Redirigir segons el tipus d'usuari
    if (userType === "teacher" || userType === "admin") {
      window.location.href = "teacher.html";
    } else {
      localStorage.setItem("userPoints", "0");
      window.location.href = "dashboard.html";
    }
  } else {
    alert(
      "Contrasenya incorrecta. La contrasenya ha de ser igual que el nom d'usuari."
    );
  }
});
