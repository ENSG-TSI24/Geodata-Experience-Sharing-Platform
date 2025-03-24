"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { FiTrash2, FiPlus, FiMapPin, FiX, FiInfo } from "react-icons/fi"

// Fix Leaflet icon issue
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

// Property options for markers
const propertyOptions = [
  { value: "address", label: "Address" },
  { value: "date", label: "Date" },
  { value: "issue", label: "Issue" },
  { value: "solution", label: "Solution" },
]

function AddMarkerOnClick({ setGlobalDataset }) {
  const [formPosition, setFormPosition] = useState(null)

  useMapEvents({
    click(e) {
      setFormPosition(e.latlng)
    },
  })

  const handleFormSubmit = (title, description) => {
    if (title && description && formPosition) {
      const newMarker = {
        Title: title,
        Proprietes: {
          Description: description,
          Position: formPosition,
        },
      }
      setGlobalDataset((prevDataset) => [...prevDataset, newMarker])
      setFormPosition(null) // Hide the form after submission
    }
  }

  const handleFormCancel = () => {
    setFormPosition(null) // Hide the form
  }

  return formPosition ? (
    <MarkerForm position={formPosition} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
  ) : null
}

function MarkerForm({ position, onSubmit, onCancel }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = "Dataset Name is required"
    if (!description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(title, description)
      setTitle("")
      setDescription("")
    }
  }

  return (
    <div className="marker-form-container">
      <div className="marker-form">
        <div className="marker-form-header">
          <h3>Add New Marker</h3>
          <button className="button-icon-only" onClick={onCancel} aria-label="Close form">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`form-group ${errors.title ? "has-error" : ""}`}>
            <label htmlFor="marker-title">
              <FiMapPin className="input-icon" />
              Dataset Name
            </label>
            <input
              id="marker-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter dataset name"
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <div className={`form-group ${errors.description ? "has-error" : ""}`}>
            <label htmlFor="marker-description">
              <FiInfo className="input-icon" />
              Description
            </label>
            <textarea
              id="marker-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter dataset description"
              rows="3"
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Add Marker
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MapAnnotator({ globalDataset, setGlobalDataset }) {
  const [selectedText, setSelectedText] = useState("")
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState("")

  // Handle text selection in popup
  const handleTextSelection = (index) => {
    const selection = window.getSelection().toString().trim()
    if (selection) {
      setSelectedText(selection)
      setActiveMarkerIndex(index)
    }
  }

  // Add property to marker
  const addPropertyToMarker = (property) => {
    if (activeMarkerIndex !== null && selectedText && property) {
      setGlobalDataset((prevDataset) =>
        prevDataset.map((marker, i) => {
          if (i === activeMarkerIndex) {
            return {
              ...marker,
              Proprietes: {
                ...marker.Proprietes,
                [property]: selectedText,
              },
            }
          }
          return marker
        }),
      )
      setSelectedText("")
      setActiveMarkerIndex(null)
      setSelectedProperty("")
    }
  }

  // Remove property from marker
  const removeProperty = (markerIndex, propertyKey) => {
    setGlobalDataset((prevDataset) =>
      prevDataset.map((marker, i) => {
        if (i === markerIndex) {
          const updatedProperties = { ...marker.Proprietes }
          delete updatedProperties[propertyKey]
          return { ...marker, Proprietes: updatedProperties }
        }
        return marker
      }),
    )
  }

  // Remove marker entirely
  const removeMarker = (markerIndex) => {
    setGlobalDataset((prevDataset) => prevDataset.filter((_, index) => index !== markerIndex))
  }

  return (
    <div className="map-annotator">
      <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Esri, DeLorme, NAVTEQ"
          maxZoom={16}
        />
        <AddMarkerOnClick setGlobalDataset={setGlobalDataset} />

        {globalDataset.map((marker, index) => (
          <Marker key={index} position={marker.Proprietes.Position} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <h3 className="popup-title">{marker.Title}</h3>
                  <button
                    onClick={() => removeMarker(index)}
                    className="button button-danger button-sm"
                    aria-label="Delete marker"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="popup-section">
                  <div className="popup-label">Description:</div>
                  <div className="popup-text" onMouseUp={() => handleTextSelection(index)}>
                    {marker.Proprietes.Description}
                  </div>
                </div>

                {/* Properties Section */}
                {Object.entries(marker.Proprietes).some(([key]) => key !== "Position" && key !== "Description") && (
                  <div className="popup-section">
                    <div className="popup-label">Properties:</div>
                    <div className="properties-list">
                      {Object.entries(marker.Proprietes).map(
                        ([key, value]) =>
                          key !== "Position" &&
                          key !== "Description" && (
                            <div key={key} className="property-item">
                              <div className="property-content">
                                <span className="property-key">{key}:</span>
                                <span className="property-value">{value}</span>
                              </div>
                              <button
                                onClick={() => removeProperty(index, key)}
                                className="button-icon-only"
                                aria-label={`Remove ${key} property`}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                )}

                {/* Text Selection and Property Addition */}
                {selectedText && activeMarkerIndex === index && (
                  <div className="popup-section selection-section">
                    <div className="popup-label">Selected Text:</div>
                    <div className="selected-text">"{selectedText}"</div>
                    <div className="property-selection">
                      <select
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="select-input"
                      >
                        <option value="">Select a property</option>
                        {propertyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => addPropertyToMarker(selectedProperty)}
                        className="button button-primary button-sm"
                        disabled={!selectedProperty}
                      >
                        <FiPlus />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="popup-footer">
                  <small>Select text to add properties. Click outside to close.</small>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {globalDataset.length === 0 && (
        <div className="empty-state map-empty-state">
          <FiMapPin className="empty-icon" />
          <p>Click on the map to add markers and create datasets.</p>
        </div>
      )}
    </div>
  )
}

export default MapAnnotator

