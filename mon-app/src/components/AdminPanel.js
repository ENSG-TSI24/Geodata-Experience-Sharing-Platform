"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { FiMap, FiFileText, FiInfo, FiLogOut, FiMenu, FiX, FiSettings, FiEye, FiEdit, FiArrowUp } from "react-icons/fi"
import MyButtons from "./MyButtons"
import AboutPage from "./AboutPage"
import UserPermissions from "./UserPermissions"

// Lazy load components that aren't needed immediately
const MapAnnotator = lazy(() => import("./MapAnnotator"))
const TextAnnotator = lazy(() => import("./TextAnnotator"))
const SettingsPage = lazy(() => import("./SettingsPage"))

function AdminPanel({ full_name, organization, fonction, onLogout }) {
  const [isMap, setIsMap] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
  const [globalDataset, setGlobalDataset] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [viewMode, setViewMode] = useState(fonction === "admin" || fonction === "editeur" ? "edit" : "search")

  // Chargement initial
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.body.className = savedTheme

    const savedDataset = localStorage.getItem("globalDataset")
    if (savedDataset) {
      try {
        setGlobalDataset(JSON.parse(savedDataset))
      } catch (error) {
        console.error("Erreur de chargement du dataset:", error)
      }
    }
  }, [])

  // Update viewMode when role changes
  useEffect(() => {
    setViewMode(fonction === "admin" || fonction === "editeur" ? "edit" : "search")
  }, [fonction])

  // Sauvegarde du thème et des données
  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.body.className = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem("globalDataset", JSON.stringify(globalDataset))
  }, [globalDataset])

  // Toggle theme between light & dark mode
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  // Handle mobile menu state toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Toggle between edit and search modes (only for admin and editor)
  const toggleViewMode = () => {
    if (fonction === "admin" || fonction === "editeur") {
      setViewMode(viewMode === "edit" ? "search" : "edit")
    }
  }

  // Check if user can edit (admin or editor)
  const canEdit = fonction === "admin" || fonction === "editeur"

  // Check if user can delete (admin only)
  const canDelete = fonction === "admin"

  // Check if user can access settings (admin only)
  const canAccessSettings = fonction === "admin"

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutPage />
      case "settings":
        return canAccessSettings ? (
          <Suspense fallback={<div className="loading">Chargement...</div>}>
            <SettingsPage />
          </Suspense>
        ) : (
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <FiSettings className="icon" />
                Paramètres
              </h2>
            </div>
            <div className="access-denied">
              <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
              <p>Seuls les administrateurs peuvent accéder aux paramètres du système.</p>
            </div>
          </div>
        )
      case "permissions":
        return (
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <FiArrowUp className="icon" />
                Demandes de Permissions
              </h2>
            </div>
            <div className="panel-content">
              <UserPermissions full_name={full_name} fonction={fonction} isAdmin={false} />
            </div>
          </div>
        )
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
                  <div className="panel-actions">
                    {(fonction === "admin" || fonction === "editeur") && (
                      <button
                        className="mode-toggle view-mode-toggle"
                        onClick={toggleViewMode}
                        aria-label={viewMode === "edit" ? "Passer en mode recherche" : "Passer en mode édition"}
                      >
                        {viewMode === "edit" ? (
                          <>
                            <FiEye className="button-icon" />
                            <span>Mode Recherche</span>
                          </>
                        ) : (
                          <>
                            <FiEdit className="button-icon" />
                            <span>Mode Édition</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      className="mode-toggle"
                      onClick={() => setIsMap(!isMap)}
                      aria-label={isMap ? "Passer en mode texte" : "Passer en mode carte"}
                    >
                      {isMap ? "Mode Texte" : "Mode Carte"}
                    </button>
                  </div>
                </div>
                <Suspense fallback={<div className="loading">Chargement...</div>}>
                  {isMap ? (
                    <MapAnnotator
                      globalDataset={globalDataset}
                      setGlobalDataset={setGlobalDataset}
                      userFullName={full_name}
                      viewMode={viewMode}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      userRole={fonction}
                    />
                  ) : (
                    <TextAnnotator userFullName={full_name} viewMode={viewMode} canEdit={canEdit} canDelete={canDelete} userRole={fonction} />
                  )}
                </Suspense>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Aperçu des Données</h2>
                  {canDelete && viewMode === "edit" && (
                    <button
                      className="button button-secondary"
                      onClick={() => setGlobalDataset([])}
                      aria-label="Effacer les données"
                      disabled={globalDataset.length === 0}
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="json-display">
                  <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "role-badge admin"
      case "editeur":
        return "role-badge editor"
      case "anonyme":
        return "role-badge anonymous"
      default:
        return "role-badge editor"
    }
  }

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
          <span className={getRoleBadgeClass(fonction)}>
            {fonction === "admin" && "Admin"}
            {fonction === "editeur" && "Éditeur"}
            {fonction === "anonyme" && "Anonyme"}
          </span>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Basculer en mode ${theme === "light" ? "sombre" : "clair"}`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="user-info">
            {full_name} | {organization}
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
              setActiveTab("main")
              setIsMobileMenuOpen(false)
            }}
          >
            <FiFileText className="tab-icon" />
            <span>ACCUEIL</span>
          </li>
          {canAccessSettings && (
            <li
              className={`nav-tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("settings")
                setIsMobileMenuOpen(false)
              }}
            >
              <FiSettings className="tab-icon" />
              <span>PARAMÈTRES</span>
            </li>
          )}
          {!canAccessSettings && (
            <li
              className={`nav-tab ${activeTab === "permissions" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("permissions")
                setIsMobileMenuOpen(false)
              }}
            >
              <FiArrowUp className="tab-icon" />
              <span>PERMISSIONS</span>
            </li>
          )}
          <li
            className={`nav-tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("about")
              setIsMobileMenuOpen(false)
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
            Bienvenue, {full_name} de {organization}
          </h1>
          <MyButtons canEdit={canEdit} canDelete={canDelete} userRole={fonction} />
        </div>

        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Plateforme d'Annotation Géographique</p>
      </footer>
    </div>
  )
}

export default AdminPanel
