"use client"

import { FiUpload, FiDownload, FiAlertTriangle } from "react-icons/fi"
import { useState } from "react"

function MyButtons({ permissions }) {
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportFormat, setExportFormat] = useState("JSON")
  const [notification, setNotification] = useState(null)

  // Handle metadata import from file
  const handleImport = () => {
    if (!permissions.canCreate) {
      showNotification("Vous n'avez pas les permissions pour importer des données", "error")
      return
    }

    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result)
            // Here you would process the imported data
            showNotification("Métadonnées importées avec succès!", "success")
          } catch (error) {
            showNotification("Erreur d'importation: Format JSON invalide", "error")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Handle metadata export to file
  const handleExport = () => {
    if (!permissions.canExport) {
      showNotification("Vous n'avez pas les permissions pour exporter des données", "error")
      return
    }

    // Get data from localStorage
    const textAnnotations = localStorage.getItem("textAnnotations") || "[]"
    const globalDataset = localStorage.getItem("globalDataset") || "[]"
    const offlineMetadata = localStorage.getItem("offlineMetadata") || "[]"

    // Combine data
    const exportData = {
      textAnnotations: JSON.parse(textAnnotations),
      mapAnnotations: JSON.parse(globalDataset),
      offlinePendingData: JSON.parse(offlineMetadata).filter((item) => item.pendingSync),
      exportDate: new Date().toISOString(),
      exportedBy: "User", // This would be the actual user in a real app
      exportFormat: exportFormat,
    }

    // Apply role-based filtering
    if (permissions.canExport && !permissions.canDelete) {
      // For editors: filter out data they didn't create
      exportData.textAnnotations = exportData.textAnnotations.filter((annotation) => !annotation.isPrivate)
      exportData.mapAnnotations = exportData.mapAnnotations.filter((marker) => !marker.Proprietes.isPrivate)
    }

    if (permissions.canRead && !permissions.canUpdate) {
      // For visitors: only anonymized JSON
      // Remove sensitive fields
      exportData.textAnnotations = exportData.textAnnotations.map((annotation) => ({
        ...annotation,
        createdBy: "Anonymous",
        // Remove other sensitive fields
      }))
      exportData.mapAnnotations = exportData.mapAnnotations.map((marker) => ({
        ...marker,
        Proprietes: {
          ...marker.Proprietes,
          CreatedBy: "Anonymous",
          // Remove other sensitive fields
        },
      }))
    }

    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `annotation-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Log export for admin
    if (permissions.canManageRights) {
      console.log(`Export log: User exported data in ${exportFormat} format at ${new Date().toISOString()}`)
    }

    showNotification(`Données exportées avec succès en format ${exportFormat}`, "success")
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const toggleExportOptions = () => {
    if (permissions.canExport) {
      setShowExportOptions(!showExportOptions)
    } else {
      showNotification("Vous n'avez pas les permissions pour exporter des données", "error")
    }
  }

  return (
    <div className="button-container">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === "error" && <FiAlertTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="button-group">
        {permissions.canCreate && (
          <button className="button button-primary" onClick={handleImport} aria-label="Importer des métadonnées">
            <FiUpload className="button-icon" />
            <span>Importer</span>
          </button>
        )}

        {permissions.canExport && (
          <div className="export-container">
            <button
              className="button button-secondary"
              onClick={toggleExportOptions}
              aria-label="Exporter des métadonnées"
            >
              <FiDownload className="button-icon" />
              <span>Exporter</span>
            </button>

            {showExportOptions && (
              <div className="export-options">
                <div className="export-header">
                  <h4>Format d'exportation</h4>
                </div>
                <div className="export-formats">
                  {permissions.exportFormats.map((format) => (
                    <label key={format} className="export-format-option">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format}
                        checked={exportFormat === format}
                        onChange={() => setExportFormat(format)}
                      />
                      <span>{format}</span>
                    </label>
                  ))}
                </div>
                <button
                  className="button button-primary button-sm"
                  onClick={() => {
                    handleExport()
                    setShowExportOptions(false)
                  }}
                >
                  Exporter en {exportFormat}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyButtons

