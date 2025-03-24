"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { FiMap, FiFileText, FiInfo, FiLogOut, FiMenu, FiX } from "react-icons/fi"
import MyButtons from "./MyButtons"
import AboutPage from "./AboutPage"

// Lazy load components that aren't needed immediately
const MapAnnotator = lazy(() => import("./MapAnnotator"))
const TextAnnotator = lazy(() => import("./TextAnnotator"))

function AdminPanel({ username, organization, fonction, onLogout }) {
  const [isMap, setIsMap] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
  const [globalDataset, setGlobalDataset] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme
    localStorage.setItem("theme", theme)
  }, [theme])

  // Save globalDataset to localStorage
  useEffect(() => {
    localStorage.setItem("globalDataset", JSON.stringify(globalDataset))
  }, [globalDataset])

  // Load globalDataset from localStorage on mount
  useEffect(() => {
    const savedDataset = localStorage.getItem("globalDataset")
    if (savedDataset) {
      try {
        setGlobalDataset(JSON.parse(savedDataset))
      } catch (error) {
        console.error("Failed to parse saved dataset:", error)
      }
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutPage />
      case "main":
      default:
        return (
          <>
            <div className="panel-container">
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    {isMap ? <FiMap className="icon" /> : <FiFileText className="icon" />}
                    {isMap ? "Map Annotation" : "Text Annotation"}
                  </h2>
                  <button
                    className="mode-toggle"
                    onClick={() => setIsMap(!isMap)}
                    aria-label={isMap ? "Switch to Text Mode" : "Switch to Map Mode"}
                  >
                    {isMap ? "Text Mode" : "Map Mode"}
                  </button>
                </div>
                <Suspense fallback={<div className="loading">Loading annotator...</div>}>
                  {isMap ? (
                    <MapAnnotator globalDataset={globalDataset} setGlobalDataset={setGlobalDataset} />
                  ) : (
                    <TextAnnotator />
                  )}
                </Suspense>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Dataset Overview</h2>
                  <button
                    className="button button-secondary"
                    onClick={() => setGlobalDataset([])}
                    aria-label="Clear dataset"
                    disabled={globalDataset.length === 0}
                  >
                    Clear
                  </button>
                </div>
                {globalDataset.length > 0 ? (
                  <div className="json-display">
                    <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No data available. Start by adding annotations on the map.</p>
                  </div>
                )}
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
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1 className="app-title">Annotation Dashboard</h1>
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="user-info">
            {username} | {organization}
          </span>
          <button className="logout-button" onClick={onLogout} aria-label="Log out">
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
            <span>MAIN PAGE</span>
          </li>
          <li
            className={`nav-tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("about")
              setIsMobileMenuOpen(false)
            }}
          >
            <FiInfo className="tab-icon" />
            <span>ABOUT</span>
          </li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="welcome-banner">
          <h1>
            Welcome, {username} from {organization} {fonction && `(${fonction})`}
          </h1>
          <MyButtons />
        </div>

        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Annotation Dashboard TSI24. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default AdminPanel

