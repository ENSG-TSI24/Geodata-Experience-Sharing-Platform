"use client"

import { useState } from "react"
import { FiUpload, FiDownload, FiAlertTriangle } from "react-icons/fi"

function MyButtons({ canEdit, canDelete, userRole, onImportData }) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [exportType, setExportType] = useState("json")
  const [exportStatus, setExportStatus] = useState({ loading: false, error: null })

  // Handle metadata import from file (admin and editeur can import)
  const handleImport = () => {
    if (!canDelete && userRole !== "editeur") return
  
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            console.log("Original file content:", event.target.result);
            const data = JSON.parse(event.target.result);
            console.log("Parsed data:", data);
  
            if (data && data.length > 0) {
              const firstItem = data[0];
              console.log("First item data:", firstItem);
              
              const title = firstItem?.Title || firstItem?.title || "";
              
              const text = firstItem?.Proprietees?.description || 
                           firstItem?.Proprietes?.description || 
                           firstItem?.Propriety?.description || 
                           firstItem?.properties?.description ||
                           firstItem?.Properties?.description ||
                           firstItem?.description ||
                           "";
              
              if (title && onImportData) {
                onImportData({ title, text });
                alert("Metadata imported successfully!");
              } else if (!title) {
                alert("Invalid data structure: Missing title in the imported file");
              } else {
                alert("Import function not available");
              }
            } else {
              alert("No valid data found in the imported file");
            }
          } catch (error) {
            console.error("Import error:", error);
            alert("Import error: Invalid JSON format");
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Handle metadata export to file (with role-based restrictions)
  const handleExport = () => {
    setExportStatus({ loading: true, error: null })

    // Get data from localStorage
    const textAnnotations = localStorage.getItem("textAnnotations") || "[]"
    const globalDataset = localStorage.getItem("globalDataset") || "[]"

    // Combine data
    let exportData = {
      textAnnotations: JSON.parse(textAnnotations),
      mapAnnotations: JSON.parse(globalDataset),
      exportDate: new Date().toISOString(),
      exportedBy: userRole,
    }

    // Apply role-based filtering
    if (userRole === "anonyme") {
      // Anonymous users can't export
      setExportStatus({ loading: false, error: "Les utilisateurs anonymes ne peuvent pas exporter de données." })
      return
    } else if (userRole === "visiteur") {
      // Visitors can only export anonymized JSON
      exportData = anonymizeData(exportData)
      setExportType("json")
    } else if (userRole === "editeur") {
      // Editors can export CSV and JSON with some filtering
      exportData = filterSensitiveData(exportData)

      // Check if data volume exceeds editor limit (example: 10 items)
      const totalItems = exportData.textAnnotations.length + exportData.mapAnnotations.length
      if (totalItems > 10 && !showConfirmation) {
        setShowConfirmation(true)
        setExportStatus({ loading: false, error: null })
        return
      }
    }
    // Admins can export everything without restrictions

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

    setExportStatus({ loading: false, error: null })
    setShowConfirmation(false)
  }

  // Filter sensitive data for editor exports
  const filterSensitiveData = (data) => {
    // Example: Remove email fields, exact coordinates, etc.
    return {
      ...data,
      textAnnotations: data.textAnnotations.filter((item) => !item.isPrivate),
      mapAnnotations: data.mapAnnotations
        .map((marker) => {
          if (marker.Proprietes && marker.Proprietes.isPrivate) {
            return null
          }
          // Filter out sensitive properties
          const filteredProps = { ...marker.Proprietes }
          delete filteredProps.email
          delete filteredProps.phone
          return { ...marker, Proprietes: filteredProps }
        })
        .filter(Boolean),
    }
  }

  // Anonymize data for visitor exports
  const anonymizeData = (data) => {
    // Create aggregated/anonymized version of the data
    return {
      summary: {
        totalAnnotations: data.textAnnotations.length,
        totalMapMarkers: data.mapAnnotations.length,
        categories: getCategoryCounts(data),
        exportDate: data.exportDate,
      },
      // Include only public data with minimal details
      publicMapData: data.mapAnnotations
        .filter((marker) => !marker.Proprietes?.isPrivate)
        .map((marker) => ({
          title: marker.Title,
          // Approximate location (reduce precision)
          location: marker.Proprietes?.Position
            ? {
                lat: Math.round(marker.Proprietes.Position.lat * 100) / 100,
                lng: Math.round(marker.Proprietes.Position.lng * 100) / 100,
              }
            : null,
        })),
    }
  }

  // Helper to count categories
  const getCategoryCounts = (data) => {
    const categories = {}

    // Count text annotation categories
    data.textAnnotations.forEach((annotation) => {
      Object.keys(annotation).forEach((key) => {
        if (key !== "text" && key !== "annotation") {
          categories[key] = (categories[key] || 0) + 1
        }
      })
    })

    // Count map marker properties
    data.mapAnnotations.forEach((marker) => {
      if (marker.Proprietes) {
        Object.keys(marker.Proprietes).forEach((key) => {
          if (key !== "Position" && key !== "Description") {
            categories[key] = (categories[key] || 0) + 1
          }
        })
      }
    })

    return categories
  }

  // Cancel export confirmation
  const handleCancelExport = () => {
    setShowConfirmation(false)
    setExportStatus({ loading: false, error: null })
  }

  return (
    <div className="button-group">
      {(canDelete || userRole === "editeur") && (
        <button className="button button-primary" onClick={handleImport} aria-label="Importer des métadonnées">
          <FiUpload className="button-icon" />
          <span>Importer</span>
        </button>
      )}

      {userRole !== "anonyme" && (
        <>
          {showConfirmation ? (
            <div className="export-confirmation">
              <FiAlertTriangle className="warning-icon" />
              <span>Volume important de données. Confirmer l'export?</span>
              <div className="confirmation-actions">
                <button className="button button-secondary button-sm" onClick={handleCancelExport}>
                  Annuler
                </button>
                <button className="button button-primary button-sm" onClick={handleExport}>
                  Confirmer
                </button>
              </div>
            </div>
          ) : (
            <button
              className="button button-secondary"
              onClick={handleExport}
              disabled={exportStatus.loading || userRole === "anonyme"}
              aria-label="Exporter les métadonnées"
            >
              <FiDownload className="button-icon" />
              <span>
                {exportStatus.loading
                  ? "Export en cours..."
                  : `Exporter ${userRole === "admin" ? "Complet" : userRole === "editeur" ? "Filtré" : "Anonymisé"}`}
              </span>
            </button>
          )}

          {exportStatus.error && <div className="export-error">{exportStatus.error}</div>}
        </>
      )}
    </div>
  )
}

export default MyButtons