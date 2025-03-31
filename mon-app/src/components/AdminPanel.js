"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { FiMap, FiFileText, FiInfo, FiLogOut, FiMenu, FiX, FiSettings, FiEye, FiEdit, FiShield } from "react-icons/fi"
import MyButtons from "./MyButtons"
import AboutPage from "./AboutPage"
import SettingsPage from "./SettingsPage"
import RolePermissionBanner from "./RolePermissionBanner"

// Lazy load components that aren't needed immediately
const MapAnnotator = lazy(() => import("./MapAnnotator"))
const TextAnnotator = lazy(() => import("./TextAnnotator"))

function AdminPanel({ full_name, organization, fonction, onLogout }) {
  const [isMap, setIsMap] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
  const [globalDataset, setGlobalDataset] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [viewMode, setViewMode] = useState("view") // "edit" or "view"
  const [currentRole, setCurrentRole] = useState(fonction)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Permissions based on role
  const permissions = {
    admin: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canComment: true,
      canExport: true,
      canManageRights: true,
      canRequestPermission: false,
      exportFormats: ["CSV", "JSON", "Excel", "GeoJSON"],
      accessSettings: true,
    },
    editeur: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canComment: true,
      canExport: true,
      canManageRights: false,
      canRequestPermission: true,
      exportFormats: ["CSV", "JSON"],
      accessSettings: false,
    },
    visiteur: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canComment: true,
      canExport: true,
      canManageRights: false,
      canRequestPermission: true,
      exportFormats: ["JSON"],
      accessSettings: false,
    },
    anonyme: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canComment: true,
      canExport: false,
      canManageRights: false,
      canRequestPermission: true,
      exportFormats: [],
      accessSettings: false,
    },
  }

  // Get current permissions
  const currentPermissions = permissions[currentRole] || permissions.anonyme

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

  // Set view mode based on permissions
  useEffect(() => {
    if (currentPermissions.canCreate || currentPermissions.canUpdate) {
      setViewMode("edit")
    } else {
      setViewMode("view")
    }
  }, [currentRole])

  // Sauvegarde du thème et des données
  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.body.className = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem("globalDataset", JSON.stringify(globalDataset))
  }, [globalDataset])

  // Check for backend connectivity
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("/api/health", { method: "GET" })
        const wasOffline = isOfflineMode
        const nowOnline = response.ok

        setIsOfflineMode(!nowOnline)

        // If we were offline but now we're online, try to sync pending data
        if (wasOffline && nowOnline) {
          syncOfflineData()
        }
      } catch (error) {
        setIsOfflineMode(true)
      }
    }

    const syncOfflineData = async () => {
      try {
        // Get pending offline data
        const offlineData = JSON.parse(localStorage.getItem("offlineMetadata") || "[]")
        const pendingData = offlineData.filter((item) => item.pendingSync)

        if (pendingData.length === 0) return

        // Show syncing notification
        const syncNotification = document.createElement("div")
        syncNotification.className = "sync-notification"
        syncNotification.textContent = `Synchronisation des données (${pendingData.length} éléments)...`
        document.body.appendChild(syncNotification)

        // Try to sync each pending item
        let successCount = 0
        for (const item of pendingData) {
          try {
            const response = await fetch("/api/data/store-metadata", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data: item.data,
                userFullName: item.data.LastModifiedBy || full_name,
              }),
            })

            if (response.ok) {
              // Mark as synced
              item.pendingSync = false
              successCount++
            }
          } catch (error) {
            console.warn("Failed to sync item:", error)
          }
        }

        // Update localStorage with synced status
        localStorage.setItem("offlineMetadata", JSON.stringify(offlineData))

        // Update notification
        syncNotification.textContent = `Synchronisation terminée: ${successCount} sur ${pendingData.length} éléments synchronisés`
        syncNotification.className = "sync-notification sync-complete"

        // Remove notification after delay
        setTimeout(() => {
          syncNotification.classList.add("sync-fade-out")
          setTimeout(() => document.body.removeChild(syncNotification), 500)
        }, 3000)
      } catch (error) {
        console.error("Error during sync:", error)
      }
    }

    checkBackendConnection()
    const interval = setInterval(checkBackendConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isOfflineMode, full_name])

  // Toggle theme between light & dark mode
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  // Handle mobile menu state toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Toggle between edit and view modes (if permissions allow)
  const toggleViewMode = () => {
    if (currentPermissions.canCreate || currentPermissions.canUpdate) {
      setViewMode((prev) => (prev === "edit" ? "view" : "edit"))
    }
  }

  // Simulate role change (for admin testing purposes)
  const changeRole = (newRole) => {
    if (fonction === "admin") {
      setCurrentRole(newRole)
    }
  }

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutPage />
      case "settings":
        return currentPermissions.accessSettings ? <SettingsPage /> : <RolePermissionBanner />
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
                    {(currentPermissions.canCreate || currentPermissions.canUpdate) && (
                      <button
                        className="mode-toggle view-mode-toggle"
                        onClick={toggleViewMode}
                        aria-label={viewMode === "edit" ? "Passer en mode visualisation" : "Passer en mode édition"}
                      >
                        {viewMode === "edit" ? (
                          <>
                            <FiEye className="button-icon" />
                            <span>Mode Visualisation</span>
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
                      permissions={currentPermissions}
                    />
                  ) : (
                    <TextAnnotator viewMode={viewMode} permissions={currentPermissions} 
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
                  {currentPermissions.canDelete && viewMode === "edit" && (
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
          {isOfflineMode && (
            <div className="offline-indicator">
              <span className="offline-dot"></span>
              <span>Mode Hors Ligne</span>
              <button
                className="retry-connection-button"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/health", { method: "GET" })
                    if (response.ok) {
                      setIsOfflineMode(false)
                      // Show success notification
                      const notification = document.createElement("div")
                      notification.className = "sync-notification sync-complete"
                      notification.textContent = "Connexion rétablie!"
                      document.body.appendChild(notification)
                      setTimeout(() => {
                        notification.classList.add("sync-fade-out")
                        setTimeout(() => document.body.removeChild(notification), 500)
                      }, 2000)
                    }
                  } catch (error) {
                    console.error("Still offline:", error)
                  }
                }}
                title="Vérifier la connexion"
              >
                Réessayer
              </button>
            </div>
          )}
          {fonction === "admin" && (
            <div className="role-selector">
              <select value={currentRole} onChange={(e) => changeRole(e.target.value)} className="role-select">
                <option value="admin">Mode Admin</option>
                <option value="editeur">Mode Éditeur</option>
                <option value="visiteur">Mode Visiteur</option>
                <option value="anonyme">Mode Anonyme</option>
              </select>
            </div>
          )}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Basculer en mode ${theme === "light" ? "sombre" : "clair"}`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="user-info">
            {full_name} | {organization} | {currentRole}
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
          {currentPermissions.accessSettings && (
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
          <div className="welcome-info">
            <h1>
              Bienvenue, {full_name} de {organization}
            </h1>
            <div className="role-badge-container">
              <span className={`role-badge ${currentRole}`}>
                <FiShield className="role-icon" />
                {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
              </span>
            </div>
          </div>
          <MyButtons permissions={currentPermissions} />
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

