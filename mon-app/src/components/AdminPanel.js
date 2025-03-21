"use client"

import { useState } from "react"
import MapAnnotator from "./MapAnnotator"
import TextAnnotator from "./TextAnnotator"
import MyButtons from "./MyButtons"
import AboutPage from "./AboutPage"

function AdminPanel({ username, organization, fonction }) {
  const [isMap, setIsMap] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
  const [globalDataset, setGlobalDataset] = useState([])

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
                  <h2 className="panel-title">Annotation Tool</h2>
                  <button className="mode-toggle" onClick={() => setIsMap(!isMap)}>
                    {isMap ? "Text Mode" : "Map Mode"}
                  </button>
                </div>
                {isMap ? (
                  <MapAnnotator globalDataset={globalDataset} setGlobalDataset={setGlobalDataset} />
                ) : (
                  <TextAnnotator />
                )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Dataset Overview</h2>
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
        <h1 className="app-title">Annotation Dashboard</h1>
        <div className="header-actions">
          <span>
            {username} | {organization}
          </span>
        </div>
      </header>

      <ul className="nav-tabs">
        <li className={`nav-tab ${activeTab === "main" ? "active" : ""}`} onClick={() => setActiveTab("main")}>
          MAIN PAGE
        </li>
        <li className={`nav-tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>
          ABOUT
        </li>
      </ul>

      <div className="admin-content">
        <div className="welcome-banner">
          <h1>
            Welcome, {username} from {organization} ({fonction})
          </h1>
          <MyButtons />
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default AdminPanel;
