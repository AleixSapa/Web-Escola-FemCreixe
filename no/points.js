// Funció per afegir punts
function addPoints(toUser, points) {
  // Referència a la base de dades de Firebase
  const pointsRef = db.ref("points/" + toUser);

  // Obtenir els punts actuals i sumar els nous
  pointsRef.once("value").then((snapshot) => {
    const currentPoints = snapshot.val() || 0;
    const newPoints = currentPoints + points;

    // Actualitzar els punts
    pointsRef.set(newPoints);
  });
}

// Funció per obtenir els punts
function getPoints(username) {
  const pointsRef = db.ref("points/" + username);

  pointsRef.on("value", (snapshot) => {
    const points = snapshot.val() || 0;
    // Actualitzar els punts mostrats
    document.getElementById("points").textContent = points;
  });
}
