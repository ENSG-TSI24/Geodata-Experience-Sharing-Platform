"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { FiTrash2, FiPlus, FiMapPin, FiX, FiInfo, FiEye, FiLock, FiAlertTriangle } from "react-icons/fi"
import ClickableMap from "./ClickableMap"

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

const propertyOptions = [
  { value: "Catégorie_Données", label: "Catégorie Données" },
  { value: "Zone_Localisation", label: "Zone Localisation" },
  { value: "Mode_Acquisition", label: "Mode Acquisition" },
  { value: "Résolution_Spatiale", label: "Résolution Spatiale" },
  { value: "Solution_SIG", label: "Solution SIG" },
  { value: "Systeme_de_coordonnees", label: "Système de coordonnées" },
  { value: "Format_Fichier", label: "Format Fichier" },
  { value: "Droits_usage", label: "Droits usage" },
  { value: "Date", label: "Date" },
  { value: "Source", label: "Source" },
  { value: "Problème", label: "Problème" },
  { value: "Date_création", label: "Date création" },
  { value: "Date_modification", label: "Date modification" },
]

function AddMarkerOnClick({ setGlobalDataset, userFullName, viewMode, permissions }) {
  const [formPosition, setFormPosition] = useState(null)

  const addMarker = (latlng) => {
    if (viewMode === "edit" && permissions.canCreate) {
      setFormPosition(latlng)
    }
  }

  const handleFormSubmit = (title, description, isPrivate) => {
    if (title && description && formPosition) {
      const newMarker = {
        Title: title,
        Proprietes: {
          Description: description,
          Position: formPosition,
          CreatedBy: userFullName,
          isPrivate: isPrivate,
          CreatedAt: new Date().toISOString(),
        },
      }
      setGlobalDataset((prevDataset) => [...prevDataset, newMarker])
      setFormPosition(null)
    }
  }

  const handleFormCancel = () => {
    setFormPosition(null)
  }

  return (
    <>
      <ClickableMap addMarker={addMarker} />
      {formPosition && (
        <MarkerForm
          position={formPosition}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          permissions={permissions}
        />
      )}
    </>
  )
}

function MarkerForm({ position, onSubmit, onCancel, permissions }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = "Le nom du jeu de données est requis"
    if (!description.trim()) newErrors.description = "La description est requise"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(title, description, isPrivate)
    }
  }

  return (
    <div className="marker-form-container">
      <div className="marker-form">
        <div className="marker-form-header">
          <h3>Ajouter un nouveau jeu de données</h3>
          <button className="button-icon-only" onClick={onCancel} aria-label="Fermer le formulaire">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`form-group ${errors.title ? "has-error" : ""}`}>
            <label htmlFor="marker-title">
              <FiMapPin className="input-icon" />
              Nom du jeu de données
            </label>
            <input
              id="marker-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le nom du jeu de données"
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
              placeholder="Entrez la description du jeu de données"
              rows="3"
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          {permissions.canManageRights && (
            <div className="form-group checkbox-group">
              <label htmlFor="marker-private" className="checkbox-label">
                <input
                  id="marker-private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span>Marquer comme privé (admin uniquement)</span>
              </label>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="button button-primary">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MapAnnotator({ globalDataset, setGlobalDataset, userFullName, viewMode, permissions }) {
  // Function to retry sending pending data to server
  const retryPendingData = async () => {
    try {
      const offlineData = JSON.parse(localStorage.getItem("offlineMetadata") || "[]")
      const pendingData = offlineData.filter((item) => item.pendingSync)

      if (pendingData.length === 0) return

      showNotification(`Tentative de synchronisation de ${pendingData.length} élément(s)...`, "info")

      let successCount = 0
      for (const item of pendingData) {
        try {
          const response = await fetch("/api/data/store-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: item.data,
              userFullName: item.data.LastModifiedBy || userFullName,
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

      if (successCount > 0) {
        showNotification(`${successCount} élément(s) synchronisé(s) avec succès`, "success")
      } else {
        showNotification("La synchronisation a échoué, réessayez plus tard", "warning")
      }
    } catch (error) {
      console.error("Error during retry:", error)
    }
  }

  const [selectedText, setSelectedText] = useState("")
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState("")
  const [storageStatus, setStorageStatus] = useState({
    loading: false,
    error: null,
    success: false,
  })
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleTextSelection = (index) => {
    if (viewMode !== "edit" || !permissions.canUpdate) return

    const selection = window.getSelection().toString().trim()
    if (selection) {
      setSelectedText(selection)
      setActiveMarkerIndex(index)
    }
  }

  const addPropertyToMarker = (property) => {
    if (viewMode !== "edit" || !permissions.canUpdate) {
      showNotification("Vous n'avez pas les permissions pour modifier les propriétés", "error")
      return
    }

    if (activeMarkerIndex !== null && selectedText && property) {
      setGlobalDataset((prevDataset) =>
        prevDataset.map((marker, i) => {
          if (i === activeMarkerIndex) {
            return {
              ...marker,
              Proprietes: {
                ...marker.Proprietes,
                [property]: selectedText,
                LastModifiedBy: userFullName,
                LastModifiedAt: new Date().toISOString(),
              },
            }
          }
          return marker
        }),
      )
      setSelectedText("")
      setActiveMarkerIndex(null)
      setSelectedProperty("")
      showNotification("Propriété ajoutée avec succès", "success")
    }
  }

  const removeProperty = (markerIndex, propertyKey) => {
    if (viewMode !== "edit" || !permissions.canUpdate) {
      showNotification("Vous n'avez pas les permissions pour supprimer les propriétés", "error")
      return
    }

    setGlobalDataset((prevDataset) =>
      prevDataset.map((marker, i) => {
        if (i === markerIndex) {
          const updatedProperties = { ...marker.Proprietes }
          delete updatedProperties[propertyKey]
          return {
            ...marker,
            Proprietes: {
              ...updatedProperties,
              LastModifiedBy: userFullName,
              LastModifiedAt: new Date().toISOString(),
            },
          }
        }
        return marker
      }),
    )
    showNotification("Propriété supprimée avec succès", "success")
  }

  const removeMarker = (markerIndex) => {
    if (viewMode !== "edit" || !permissions.canDelete) {
      showNotification("Vous n'avez pas les permissions pour supprimer des marqueurs", "error")
      return
    }

    setGlobalDataset((prevDataset) => prevDataset.filter((_, index) => index !== markerIndex))
    showNotification("Marqueur supprimé avec succès", "success")
  }

  const handleStoreMetadata = async (marker) => {
    if (!permissions.canCreate && !permissions.canUpdate) {
      showNotification("Vous n'avez pas les permissions pour stocker des métadonnées", "error")
      return
    }

    try {
      setStorageStatus({ loading: true, error: null, success: false })

      // Prepare the data to be stored
      const metadataToStore = {
        Title: marker.Title,
        ...marker.Proprietes,
        Position: `${marker.Proprietes.Position.lat},${marker.Proprietes.Position.lng}`,
        LastModifiedBy: userFullName,
        LastModifiedAt: new Date().toISOString(),
      }

      // Always store in localStorage as a backup
      const offlineData = JSON.parse(localStorage.getItem("offlineMetadata") || "[]")
      offlineData.push({
        timestamp: new Date().toISOString(),
        data: metadataToStore,
        pendingSync: true,
      })
      localStorage.setItem("offlineMetadata", JSON.stringify(offlineData))

      // Try to send to server
      let serverSuccess = false
      try {
        // Set a reasonable timeout to prevent long waiting
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const response = await fetch("/api/data/store-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: metadataToStore,
            userFullName: userFullName,
          }),
          signal: controller.signal,
        })

        // Clear the timeout
        clearTimeout(timeoutId)

        if (response.ok) {
          // Mark the data as synced in localStorage
          const updatedOfflineData = offlineData.map((item, index) =>
            index === offlineData.length - 1 ? { ...item, pendingSync: false } : item,
          )
          localStorage.setItem("offlineMetadata", JSON.stringify(updatedOfflineData))

          serverSuccess = true
          setStorageStatus({ loading: false, error: null, success: true })
          showNotification("Métadonnées stockées avec succès sur le serveur", "success")
        } else {
          const errorText = await response.text().catch(() => "Erreur inconnue")
          throw new Error(`Erreur serveur (${response.status}): ${errorText.substring(0, 100)}`)
        }
      } catch (apiError) {
        console.warn("Stockage serveur échoué, utilisation du stockage local:", apiError)

        // Check if it's a timeout error
        if (apiError.name === "AbortError") {
          showNotification("Le serveur ne répond pas, données stockées localement", "warning")
        } else if (apiError.message.includes("500")) {
          showNotification("Erreur interne du serveur, données stockées localement", "warning")
        } else {
          showNotification("Métadonnées stockées localement (mode hors ligne)", "warning")
        }

        setStorageStatus({ loading: false, error: null, success: true })
      }

      // Clear success message after a delay
      setTimeout(() => setStorageStatus({ loading: false, error: null, success: false }), 3000)
    } catch (error) {
      console.error("Erreur critique lors du stockage:", error)
      setStorageStatus({ loading: false, error: "Erreur lors du stockage des données", success: false })
      showNotification(`Erreur lors du stockage: ${error.message}`, "error")
    }
  }

  // Filter markers based on permissions
  const visibleDataset = globalDataset.filter((marker) => {
    // Admin can see everything
    if (permissions.canManageRights) return true

    // Others can't see private markers unless they created them
    if (marker.Proprietes.isPrivate && marker.Proprietes.CreatedBy !== userFullName) {
      return false
    }

    return true
  })

  return (
    <div className="map-annotator">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === "error" && <FiAlertTriangle />}
          {notification.type === "warning" && <FiAlertTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {viewMode !== "edit" && (
        <div className="view-mode-banner">
          <FiEye className="view-icon" />
          <span>Vous êtes en mode visualisation. L'édition est désactivée.</span>
        </div>
      )}

      <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AddMarkerOnClick
          setGlobalDataset={setGlobalDataset}
          userFullName={userFullName}
          viewMode={viewMode}
          permissions={permissions}
        />

        {visibleDataset.map((marker, index) => (
          <Marker key={index} position={marker.Proprietes.Position} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <h3 className="popup-title">
                    {marker.Title}
                    {marker.Proprietes.isPrivate && (
                      <span className="private-badge" title="Données privées (admin uniquement)">
                        <FiLock />
                      </span>
                    )}
                  </h3>
                  {viewMode === "edit" && permissions.canDelete && (
                    <button
                      onClick={() => removeMarker(index)}
                      className="button button-danger button-sm"
                      aria-label="Supprimer le marqueur"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>

                <div className="popup-section">
                  <div className="popup-label">Description:</div>
                  <div
                    className="popup-text"
                    onMouseUp={() => handleTextSelection(index)}
                    style={{ cursor: viewMode === "edit" && permissions.canUpdate ? "text" : "default" }}
                  >
                    {marker.Proprietes.Description}
                  </div>
                </div>

                {/* Metadata Section */}
                <div className="popup-section">
                  <div className="popup-label">Métadonnées:</div>
                  <div className="metadata-list">
                    {marker.Proprietes.CreatedBy && (
                      <div className="metadata-item">
                        <span className="metadata-key">Créé par:</span>
                        <span className="metadata-value">{marker.Proprietes.CreatedBy}</span>
                      </div>
                    )}
                    {marker.Proprietes.CreatedAt && (
                      <div className="metadata-item">
                        <span className="metadata-key">Date de création:</span>
                        <span className="metadata-value">{new Date(marker.Proprietes.CreatedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {marker.Proprietes.LastModifiedBy && (
                      <div className="metadata-item">
                        <span className="metadata-key">Dernière modification par:</span>
                        <span className="metadata-value">{marker.Proprietes.LastModifiedBy}</span>
                      </div>
                    )}
                    {marker.Proprietes.LastModifiedAt && (
                      <div className="metadata-item">
                        <span className="metadata-key">Date de dernière modification:</span>
                        <span className="metadata-value">
                          {new Date(marker.Proprietes.LastModifiedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Propriétés */}
                {Object.entries(marker.Proprietes).some(
                  ([key]) =>
                    ![
                      "Position",
                      "Description",
                      "CreatedBy",
                      "CreatedAt",
                      "LastModifiedBy",
                      "LastModifiedAt",
                      "isPrivate",
                    ].includes(key),
                ) && (
                  <div className="popup-section">
                    <div className="popup-label">Propriétés:</div>
                    <div className="properties-list">
                      {Object.entries(marker.Proprietes).map(
                        ([key, value]) =>
                          ![
                            "Position",
                            "Description",
                            "CreatedBy",
                            "CreatedAt",
                            "LastModifiedBy",
                            "LastModifiedAt",
                            "isPrivate",
                          ].includes(key) && (
                            <div key={key} className="property-item">
                              <div className="property-content">
                                <span className="property-key">{key}:</span>
                                <span className="property-value">{value}</span>
                              </div>
                              {viewMode === "edit" && permissions.canUpdate && (
                                <button
                                  onClick={() => removeProperty(index, key)}
                                  className="button-icon-only"
                                  aria-label={`Supprimer la propriété ${key}`}
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                )}

                {/* Sélection de texte et ajout de propriété */}
                {viewMode === "edit" && permissions.canUpdate && selectedText && activeMarkerIndex === index && (
                  <div className="popup-section selection-section">
                    <div className="popup-label">Texte sélectionné:</div>
                    <div className="selected-text">"{selectedText}"</div>
                    <div className="property-selection">
                      <select
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="select-input"
                      >
                        <option value="">Sélectionner une propriété</option>
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
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bouton de stockage */}
                {(permissions.canCreate || permissions.canUpdate) && (
                  <div className="popup-section">
                    <div className="button-group">
                      <button
                        onClick={() => handleStoreMetadata(marker)}
                        className="button button-accent"
                        disabled={storageStatus.loading}
                      >
                        {storageStatus.loading ? "Stockage en cours..." : "Stocker les métadonnées"}
                      </button>

                      <button
                        onClick={retryPendingData}
                        className="button button-secondary"
                        title="Essayer de synchroniser les données en attente"
                      >
                        Synchroniser
                      </button>
                    </div>

                    {storageStatus.error && <div className="error-message">Erreur: {storageStatus.error}</div>}

                    {storageStatus.success && <div className="success-message">Données stockées avec succès!</div>}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {visibleDataset.length === 0 && (
        <div className="empty-state map-empty-state">
          <FiMapPin className="empty-icon" />
          <p>Cliquez sur la carte pour ajouter des jeux de données</p>
          {viewMode !== "edit" && (
            <p className="view-mode-note">
              {permissions.canCreate
                ? "Passez en mode édition pour ajouter des marqueurs."
                : "Vous n'avez pas les permissions pour ajouter des marqueurs."}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MapAnnotator

