// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "../build")));
// Route pour l'API, si tu en as besoin
app.get("/api/test", (req, res) => {
  res.json({ message: "Ceci est une route de test" });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "mon-app/build", "index.html"));
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
