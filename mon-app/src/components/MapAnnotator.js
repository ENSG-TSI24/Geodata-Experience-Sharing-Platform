import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiTrash2, FiPlus, FiMapPin, FiX, FiInfo, FiEye, FiLock } from "react-icons/fi";


const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});


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
  { value: "Date_modification", label: "Date modification" }
];


function AddMarkerOnClick({ setGlobalDataset, userFullName }) {
  const [formPosition, setFormPosition] = useState(null);

  useMapEvents({
    click(e) {
      setFormPosition(e.latlng);
    },
  });

  const handleFormSubmit = (title, description) => {
    if (title && description && formPosition) {
      const newMarker = {
        Title: title,
        Proprietes: {
          Description: description,
          Position: formPosition,
          CreatedBy: userFullName,
        },
      };
      setGlobalDataset((prevDataset) => [...prevDataset, newMarker]);
      setFormPosition(null);
    }
  };

  const handleFormCancel = () => {
    setFormPosition(null);
  };

  return formPosition ? (
    <MarkerForm 
      position={formPosition} 
      onSubmit={handleFormSubmit} 
      onCancel={handleFormCancel} 
    />
  ) : null;
}


function MarkerForm({ position, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Le nom du jeu de données est requis";
    if (!description.trim()) newErrors.description = "La description est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(title, description);
    }
  };

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
  );
}


function MapAnnotator({ globalDataset, setGlobalDataset, userFullName }) {
  const [selectedText, setSelectedText] = useState("");
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [storageStatus, setStorageStatus] = useState({ 
    loading: false, 
    error: null, 
    success: false 
  });

  const handleTextSelection = (index) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      setSelectedText(selection);
      setActiveMarkerIndex(index);
    }
  };

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
            };
          }
          return marker;
        })
      );
      setSelectedText("");
      setActiveMarkerIndex(null);
      setSelectedProperty("");
    }
  };

  const removeProperty = (markerIndex, propertyKey) => {
    setGlobalDataset((prevDataset) =>
      prevDataset.map((marker, i) => {
        if (i === markerIndex) {
          const updatedProperties = { ...marker.Proprietes };
          delete updatedProperties[propertyKey];
          return { ...marker, Proprietes: updatedProperties };
        }
        return marker;
      })
    );
  };

  const removeMarker = (markerIndex) => {
    setGlobalDataset((prevDataset) => prevDataset.filter((_, index) => index !== markerIndex));
  };

  const handleStoreMetadata = async (marker) => {
    try {
      setStorageStatus({ loading: true, error: null, success: false });
      
      const response = await fetch('/api/data/store-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            Title: marker.Title,
            ...marker.Proprietes,
            Position: `${marker.Proprietes.Position.lat},${marker.Proprietes.Position.lng}`
          },
          userFullName: userFullName 
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      setStorageStatus({ loading: false, error: null, success: true });
      setTimeout(() => setStorageStatus({ loading: false, error: null, success: false }), 3000);
    } catch (error) {
      setStorageStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="map-annotator">
      <MapContainer 
        center={[48.8566, 2.3522]} 
        zoom={13} 
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AddMarkerOnClick 
          setGlobalDataset={setGlobalDataset} 
          userFullName={userFullName}
        />

        {globalDataset.map((marker, index) => (
          <Marker key={index} position={marker.Proprietes.Position} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <h3 className="popup-title">
                    {marker.Title}
                    {marker.Proprietes.CreatedBy && (
                      <span className="created-by-badge" title={`Créé par ${marker.Proprietes.CreatedBy}`}>
                        <FiInfo />
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => removeMarker(index)}
                    className="button button-danger button-sm"
                    aria-label="Supprimer le marqueur"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="popup-section">
                  <div className="popup-label">Description:</div>
                  <div
                    className="popup-text"
                    onMouseUp={() => handleTextSelection(index)}
                    style={{ cursor: "text" }}
                  >
                    {marker.Proprietes.Description}
                  </div>
                </div>

                {/* Section Propriétés */}
                {Object.entries(marker.Proprietes).some(
                  ([key]) => key !== "Position" && key !== "Description" && key !== "CreatedBy"
                ) && (
                  <div className="popup-section">
                    <div className="popup-label">Propriétés:</div>
                    <div className="properties-list">
                      {Object.entries(marker.Proprietes).map(
                        ([key, value]) =>
                          key !== "Position" &&
                          key !== "Description" &&
                          key !== "CreatedBy" && (
                            <div key={key} className="property-item">
                              <div className="property-content">
                                <span className="property-key">{key}:</span>
                                <span className="property-value">{value}</span>
                              </div>
                              <button
                                onClick={() => removeProperty(index, key)}
                                className="button-icon-only"
                                aria-label={`Supprimer la propriété ${key}`}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

                {/* Sélection de texte et ajout de propriété */}
                {selectedText && activeMarkerIndex === index && (
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
                <div className="popup-section">
                  <button
                    onClick={() => handleStoreMetadata(marker)}
                    className="button button-accent"
                    disabled={storageStatus.loading}
                  >
                    {storageStatus.loading ? 'Stockage en cours...' : 'Stocker les métadonnées'}
                  </button>
                  
                  {storageStatus.error && (
                    <div className="error-message">
                      Erreur: {storageStatus.error}
                    </div>
                  )}

                  {storageStatus.success && (
                    <div className="success-message">
                      Données stockées avec succès!
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {globalDataset.length === 0 && (
        <div className="empty-state map-empty-state">
          <FiMapPin className="empty-icon" />
          <p>Cliquez sur la carte pour ajouter des jeux de données</p>
        </div>
      )}
    </div>
  );
}

export default MapAnnotator;