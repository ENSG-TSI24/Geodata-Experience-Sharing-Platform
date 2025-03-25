"use client"

import { FiUpload, FiDownload } from "react-icons/fi"

function MyButtons({ isAdmin }) {
  // Handle metadata import from file
  const handleImport = () => {
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
            alert("Metadata imported successfully!")
          } catch (error) {
            alert("Error importing metadata: Invalid JSON format")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Handle metadata export to file
  const handleExport = () => {
    // Get data from localStorage
    const textAnnotations = localStorage.getItem("textAnnotations") || "[]"
    const globalDataset = localStorage.getItem("globalDataset") || "[]"

    // Combine data
    const exportData = {
      textAnnotations: JSON.parse(textAnnotations),
      mapAnnotations: JSON.parse(globalDataset),
      exportDate: new Date().toISOString(),
    }

    // For non-admin users, filter out sensitive data
    if (!isAdmin) {
      // Example: Filter out specific properties or markers with certain flags
      exportData.textAnnotations = exportData.textAnnotations.filter((annotation) => !annotation.isPrivate)
      exportData.mapAnnotations = exportData.mapAnnotations.filter((marker) => !marker.Proprietes.isPrivate)
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
  }

  return (
    <div className="button-group">
      {isAdmin && (
        <button className="button button-primary" onClick={handleImport} aria-label="Import metadata">
          <FiUpload className="button-icon" />
          <span>Import Metadata</span>
        </button>
      )}
      <button className="button button-secondary" onClick={handleExport} aria-label="Export metadata">
        <FiDownload className="button-icon" />
        <span>Export {isAdmin ? "Full" : "Filtered"} Metadata</span>
      </button>
    </div>
  )
}

export default MyButtons
