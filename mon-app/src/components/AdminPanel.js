import { useState, useEffect, lazy, Suspense } from "react";
import { FiMap, FiFileText, FiInfo, FiLogOut, FiMenu, FiX, FiSettings } from "react-icons/fi";
import MyButtons from "./MyButtons";
import AboutPage from "./AboutPage";

// Lazy load components that aren't needed immediately
const MapAnnotator = lazy(() => import("./MapAnnotator"));
const TextAnnotator = lazy(() => import("./TextAnnotator"));

function AdminPanel({ full_name, organization, fonction, onLogout }) {
  const [isMap, setIsMap] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [globalDataset, setGlobalDataset] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // Chargement initial
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;

    const savedDataset = localStorage.getItem("globalDataset");
    if (savedDataset) {
      try {
        setGlobalDataset(JSON.parse(savedDataset));
      } catch (error) {
        console.error("Erreur de chargement du dataset:", error);
      }
    }
  }, []);

  // Sauvegarde du thème et des données
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("globalDataset", JSON.stringify(globalDataset));
  }, [globalDataset]);

  // Toggle theme between light & dark mode
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

   // Handle mobile menu state toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

   // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutPage />;
      case "main":
      default:
        return (
          <>
            <div className="panel-container">
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    {isMap ? <FiMap className="icon" /> : <FiFileText className="icon" />}
                    {isMap ? "Annotation Carte" : "Annotation Texte"}
                  </h2>
                  <button
                    className="mode-toggle"
                    onClick={() => setIsMap(!isMap)}
                  >
                    {isMap ? "Mode Texte" : "Mode Carte"}
                  </button>
                </div>
                <Suspense fallback={<div className="loading">Chargement...</div>}>
                  {isMap ? (
                    <MapAnnotator
                      globalDataset={globalDataset}
                      setGlobalDataset={setGlobalDataset}
                      userFullName={full_name}
                    />
                  ) : (
                    <TextAnnotator 
                    globalDataset={globalDataset}
                    setGlobalDataset={setGlobalDataset}
                    userFullName={full_name} 
                  />
                  )}
                </Suspense>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Aperçu des Données</h2>
                </div>
                <div className="json-display">
                  <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-container">
      <header className="app-header">
        <div className="header-left">
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1 className="app-title">Plateforme d'Annotation</h1>
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Basculer en mode ${theme === "light" ? "sombre" : "clair"}`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="user-info">
            {full_name} | {organization} | {fonction}
          </span>
          <button className="logout-button" onClick={onLogout}>
            <FiLogOut />
          </button>
        </div>
      </header>

      <nav className={`nav-container ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <ul className="nav-tabs">
          <li
            className={`nav-tab ${activeTab === "main" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("main");
              setIsMobileMenuOpen(false);
            }}
          >
            <FiFileText className="tab-icon" />
            <span>ACCUEIL</span>
          </li>
          <li
            className={`nav-tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("about");
              setIsMobileMenuOpen(false);
            }}
          >
            <FiInfo className="tab-icon" />
            <span>À PROPOS</span>
          </li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="welcome-banner">
          <h1>
            Bienvenue, {full_name} de {organization} ({fonction})
          </h1>
          <MyButtons />
        </div>

        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Plateforme d'Annotation Géographique</p>
      </footer>
    </div>
  );
}

export default AdminPanel;