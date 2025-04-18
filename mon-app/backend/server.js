require("dotenv").config();
const express = require("express");
const path = require("path");

const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const dataRoutes = require("./routes/dataRoutes");
const solutionRoutes = require ("./routes/SolutionRoutes");
const listeRoutes = require ("./routes/ListeRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const llmRoutes = require('./routes/llmRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// path to build
app.use(express.static(path.join(__dirname, "../build")));

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/listes", listeRoutes);
app.use("/api/organizations", organizationRoutes);
app.use('/api/llm', llmRoutes);

// path to React application
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});
 
// Start le server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
