// Llista d'usuaris disponibles
const availableUsers = [
  // Alumnes
  "Aleix",
  "Mat",
  "Sofia",
  "Luke",
  "Leo",
  "Emma",
  // Profes
  "Vane",
  "Clara",
  "Sara",
  // Admin
  "Escola",
];

// Funció per mostrar el modal de crear grup
function showNewGroupModal() {
  const modal = document.getElementById("newGroupModal");
  const membersList = document.getElementById("membersList");
  membersList.innerHTML = "";

  // Afegir tots els usuaris disponibles com a opcions
  availableUsers.forEach((user) => {
    if (user !== localStorage.getItem("currentUser")) {
      const memberDiv = document.createElement("div");
      memberDiv.className = "member-option";
      memberDiv.innerHTML = `
                <input type="checkbox" id="user-${user}" value="${user}">
                <label for="user-${user}">${user}</label>
            `;
      membersList.appendChild(memberDiv);
    }
  });

  modal.style.display = "block";
}

// Funció per tancar el modal
function closeModal() {
  document.getElementById("newGroupModal").style.display = "none";
  document.getElementById("groupName").value = "";
}

// Funció per crear un nou grup
function createGroup() {
  const groupName = document.getElementById("groupName").value.trim();
  if (!groupName) {
    alert("Si us plau, introdueix un nom pel grup");
    return;
  }

  // Obtenir els membres seleccionats
  const selectedMembers = Array.from(
    document.querySelectorAll("#membersList input:checked")
  ).map((input) => input.value);

  // Afegir l'usuari actual al grup
  selectedMembers.push(localStorage.getItem("currentUser"));

  // Crear el nou grup
  const newGroup = {
    id: Date.now().toString(),
    name: groupName,
    members: selectedMembers,
    messages: [],
    createdBy: localStorage.getItem("currentUser"),
    createdAt: new Date().toISOString(),
  };

  // Guardar el grup
  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  groups.push(newGroup);
  localStorage.setItem("chatGroups", JSON.stringify(groups));

  // Actualitzar la interfície
  closeModal();
  loadGroups();
  selectGroup(newGroup.id);
}

// Funció per carregar els grups
function loadGroups() {
  const currentUser = localStorage.getItem("currentUser");
  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  const groupsList = document.getElementById("groupsList");
  groupsList.innerHTML = "";

  groups.forEach((group) => {
    if (group.members.includes(currentUser)) {
      const groupDiv = document.createElement("div");
      groupDiv.className = "group-item";
      groupDiv.onclick = () => selectGroup(group.id);
      groupDiv.innerHTML = `
                <div class="group-name">${group.name}</div>
                <div class="group-preview">${group.members.length} membres</div>
            `;
      groupsList.appendChild(groupDiv);
    }
  });
}

// Funció per seleccionar un grup
function selectGroup(groupId) {
  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  // Actualitzar capçalera
  document.getElementById("currentChatHeader").innerHTML = `
        <h3>${group.name}</h3>
        <div class="group-members">${group.members.join(", ")}</div>
    `;

  // Mostrar missatges
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = "";
  group.messages.forEach((msg) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${
      msg.sender === localStorage.getItem("currentUser") ? "sent" : "received"
    }`;
    messageDiv.innerHTML = `
            <div class="message-sender">${msg.sender}</div>
            <div class="message-content">${msg.content}</div>
            <div class="message-time">${new Date(
              msg.time
            ).toLocaleTimeString()}</div>
        `;
    chatMessages.appendChild(messageDiv);
  });

  // Guardar el grup actual
  localStorage.setItem("currentGroupId", groupId);

  // Auto-scroll als últims missatges
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Funció per enviar missatges
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  const currentGroupId = localStorage.getItem("currentGroupId");

  if (!message || !currentGroupId) return;

  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  const groupIndex = groups.findIndex((g) => g.id === currentGroupId);

  if (groupIndex === -1) return;

  const newMessage = {
    sender: localStorage.getItem("currentUser"),
    content: message,
    time: new Date().toISOString(),
  };

  groups[groupIndex].messages.push(newMessage);
  localStorage.setItem("chatGroups", JSON.stringify(groups));

  messageInput.value = "";
  selectGroup(currentGroupId);
}

// Afegir al mostrar la pestanya de xat
function showTab(tabName) {
  // ... (codi anterior de showTab) ...

  if (tabName === "chat") {
    loadGroups();
  }
} // Variable per controlar els punts
let userPoints = 0;

// Comprova si l'usuari està autenticat
function checkAuth() {
  const currentUser = localStorage.getItem("currentUser");
  const userType = localStorage.getItem("userType");

  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Mostra el nom de l'usuari
  document.getElementById("userName").textContent = `Hola, ${currentUser}!`;

  // Carrega els punts de l'usuari
  userPoints = parseInt(
    localStorage.getItem(`points_${currentUser}`) || "1000"
  );
  updatePoints();

  // Comprova si té el xat desbloquejat
  const chatUnlocked = localStorage.getItem(`chat_${currentUser}`) === "true";

  // Configura la visibilitat del xat
  document.getElementById("chatTab").style.display = chatUnlocked
    ? "block"
    : "none";

  const goToChatButton = document.getElementById("goToChatButton");
  if (!chatUnlocked) {
    goToChatButton.textContent = "Xat Bloquejat";
    goToChatButton.disabled = true;
    goToChatButton.classList.add("disabled");
  }

  // Actualitza el botó de compra
  const buyButton = document.getElementById("buyButton");
  if (chatUnlocked) {
    buyButton.disabled = true;
    buyButton.textContent = "Comprat";
  }

  // Mostra la pestanya inicial
  showTab("home");
}

// Funció per actualitzar els punts
function updatePoints() {
  document.getElementById("userPoints").textContent = userPoints;
  document.getElementById("totalPoints").textContent = userPoints;

  const currentUser = localStorage.getItem("currentUser");
  localStorage.setItem(`points_${currentUser}`, userPoints.toString());
}

// Funció per canviar entre pestanyes
function showTab(tabName) {
  // Amaga totes les pestanyes
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => {
    tab.style.display = "none";
    tab.classList.remove("active");
  });

  // Desactiva tots els botons
  const buttons = document.querySelectorAll(".tab-button");
  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  // Mostra la pestanya seleccionada
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.style.display = "block";
    selectedTab.classList.add("active");
  }

  // Activa el botó corresponent
  const activeButton = document.querySelector(
    `button[onclick="showTab('${tabName}')"]`
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }

  // Si és la pestanya de xat, carrega els grups
  if (tabName === "chat") {
    loadGroups();
  }
}

// Funció per comprar el xat
function buyChat() {
  if (userPoints >= 1000) {
    // Resta els punts
    userPoints -= 1000;
    updatePoints();

    // Desa que té el xat desbloquejat
    const currentUser = localStorage.getItem("currentUser");
    localStorage.setItem(`chat_${currentUser}`, "true");

    // Actualitza la interfície
    document.getElementById("chatTab").style.display = "block";

    // Actualitza els botons
    const buyButton = document.getElementById("buyButton");
    buyButton.disabled = true;
    buyButton.textContent = "Comprat";

    const goToChatButton = document.getElementById("goToChatButton");
    goToChatButton.disabled = false;
    goToChatButton.textContent = "Anar al Xat";
    goToChatButton.classList.remove("disabled");

    alert("Has desbloquejat el xat!");
    showTab("chat");
  } else {
    alert("No tens prou punts! Necessites 1000 punts per desbloquejar el xat.");
  }
}

// ... (mantenir la resta del codi del xat igual) ...

// Inicialitzar quan la pàgina carregui
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
});
