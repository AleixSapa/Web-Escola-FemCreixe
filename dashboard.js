// Variable per controlar els punts
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

  // Si està al xat, carrega els grups
  if (document.getElementById("chat").classList.contains("active")) {
    loadGroups();
  }
}

// Actualitza els punts mostrats
function updatePoints() {
  document.getElementById("userPoints").textContent = userPoints;
  document.getElementById("totalPoints").textContent = userPoints;
  localStorage.setItem(
    `points_${localStorage.getItem("currentUser")}`,
    userPoints.toString()
  );
}

// Mostra una pestanya específica
function showTab(tabName) {
  // Amaga totes les pestanyes
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Desactiva tots els botons
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active");
  });

  // Mostra la pestanya seleccionada
  document.getElementById(tabName).classList.add("active");

  // Activa el botó corresponent
  document
    .querySelector(`button[onclick="showTab('${tabName}')"]`)
    .classList.add("active");

  if (tabName === "chat") {
    loadGroups();
  }
}

// Compra el xat
function buyChat() {
  const currentUser = localStorage.getItem("currentUser");
  const chatUnlocked = localStorage.getItem(`chat_${currentUser}`) === "true";

  if (!chatUnlocked) {
    localStorage.setItem(`chat_${currentUser}`, "true");
    document.getElementById("chatTab").style.display = "block";
    const goToChatButton = document.getElementById("goToChatButton");
    goToChatButton.textContent = "Anar al Xat";
    goToChatButton.disabled = false;
    goToChatButton.classList.remove("disabled");
    document.getElementById("buyButton").disabled = true;
    document.getElementById("buyButton").textContent = "Comprat";
    alert("Has desbloquejat el xat!");
  }
}

// Carrega els grups de xat
function loadGroups() {
  const currentUser = localStorage.getItem("currentUser");
  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  const groupsList = document.getElementById("groupsList");
  groupsList.innerHTML = "";

  groups.forEach((group) => {
    if (group.members.includes(currentUser)) {
      const groupDiv = document.createElement("div");
      groupDiv.className = "chat-item";
      groupDiv.onclick = () => selectGroup(group.id);
      groupDiv.innerHTML = `
                <h4>${group.name}</h4>
                <small>${group.members.length} membres</small>
            `;
      groupsList.appendChild(groupDiv);
    }
  });
}

// Selecciona un grup de xat
function selectGroup(groupId) {
  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  // Actualitzar capçalera
  document.getElementById("currentChatHeader").innerHTML = `
        <div class="chat-header-content">
            <h3>${group.name}</h3>
            <div class="group-members">${group.members.join(", ")}</div>
        </div>
        <button onclick="leaveGroup()" class="btn-danger">Sortir del grup</button>
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

// Funció per sortir d'un grup
function leaveGroup() {
  const currentUser = localStorage.getItem("currentUser");
  const currentGroupId = localStorage.getItem("currentGroupId");

  if (!currentGroupId) return;

  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  const groupIndex = groups.findIndex((g) => g.id === currentGroupId);

  if (groupIndex === -1) return;

  // Confirmar abans de sortir
  if (!confirm("Estàs segur que vols sortir d'aquest grup?")) {
    return;
  }

  // Eliminar l'usuari de la llista de membres
  const group = groups[groupIndex];
  const memberIndex = group.members.indexOf(currentUser);

  if (memberIndex > -1) {
    group.members.splice(memberIndex, 1);

    // Si no queden membres, eliminar el grup
    if (group.members.length === 0) {
      groups.splice(groupIndex, 1);
    } else {
      // Afegir missatge de sistema informant que l'usuari ha sortit
      group.messages.push({
        sender: "Sistema",
        content: `${currentUser} ha sortit del grup`,
        time: new Date().toISOString(),
      });
      groups[groupIndex] = group;
    }

    // Actualitzar els grups al localStorage
    localStorage.setItem("chatGroups", JSON.stringify(groups));

    // Netejar la vista del xat
    document.getElementById("currentChatHeader").innerHTML = `
            <div class="chat-header-content">
                <h3>Selecciona un xat</h3>
                <div class="group-members"></div>
            </div>
        `;
    document.getElementById("chatMessages").innerHTML = "";
    localStorage.removeItem("currentGroupId");

    // Actualitzar la llista de grups
    loadGroups();
  }
}

// Mostra el modal per crear un nou grup
function showNewGroupModal() {
  const modal = document.getElementById("newGroupModal");
  const membersList = document.getElementById("membersList");
  membersList.innerHTML = "";

  // Obtenir tots els usuaris disponibles
  const availableUsers = [...users.admin, ...users.teachers, ...users.students];

  // Crear checkbox per cada usuari
  availableUsers.forEach((user) => {
    if (user !== localStorage.getItem("currentUser")) {
      const div = document.createElement("div");
      div.innerHTML = `
                <label>
                    <input type="checkbox" value="${user}"> ${user}
                </label>
            `;
      membersList.appendChild(div);
    }
  });

  modal.style.display = "block";
}

// Tanca el modal
function closeModal() {
  document.getElementById("newGroupModal").style.display = "none";
  document.getElementById("groupName").value = "";
}

// Crea un nou grup
function createGroup() {
  const groupName = document.getElementById("groupName").value.trim();
  if (!groupName) {
    alert("Si us plau, introdueix un nom pel grup");
    return;
  }

  // Obtenir membres seleccionats
  const selectedMembers = Array.from(
    document.querySelectorAll("#membersList input:checked")
  ).map((checkbox) => checkbox.value);

  // Afegir l'usuari actual als membres
  selectedMembers.push(localStorage.getItem("currentUser"));

  if (selectedMembers.length < 2) {
    alert("Si us plau, selecciona almenys un altre membre pel grup");
    return;
  }

  // Crear nou grup
  const newGroup = {
    id: Date.now().toString(),
    name: groupName,
    members: selectedMembers,
    messages: [
      {
        sender: "Sistema",
        content: "Grup creat",
        time: new Date().toISOString(),
      },
    ],
  };

  // Guardar el grup
  const groups = JSON.parse(localStorage.getItem("chatGroups") || "[]");
  groups.push(newGroup);
  localStorage.setItem("chatGroups", JSON.stringify(groups));

  // Tancar modal i recarregar grups
  closeModal();
  loadGroups();
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

// Inicialització quan es carrega la pàgina
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});

// Afegir event listener per env
