"use client"
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapAdd({ draftData, onComplete, onCancel }) {
  const [position, setPosition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
        // Ouvrir automatiquement le popup après avoir défini la position
        setTimeout(() => {
          const marker = document.querySelector(".leaflet-marker-icon");
          if (marker) {
            marker.click(); // Simule un clic sur le marqueur pour ouvrir le popup
          }
        }, 100);
      },
    });

    return position ? (
      <Marker position={position} icon={customIcon}>
        <Popup autoClose={false} closeOnClick={false}>
          <div style={{ padding: '10px' }}>
            <p>Position sélectionnée:</p>
            <p>Latitude: {position.lat.toFixed(4)}</p>
            <p>Longitude: {position.lng.toFixed(4)}</p>
            <button className="mode-toggle"
              onClick={() => {
                setIsSubmitting(true);
                onComplete(position);
              }}
              disabled={isSubmitting}
          
            >
              {isSubmitting ? 'Enregistrement...' : 'Confirmer cette position'}
            </button>
          </div>
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[46.603354, 1.888334]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)'
      }}>
        <h3>Ajouter une position</h3>
        <p>Cliquez sur la carte pour sélectionner un lieu</p>
        {draftData && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Titre:</strong> {draftData.Title}</p>
            <p><strong>Description:</strong> {draftData.Proprietees.description.substring(0, 50)}...</p>
          </div>
        )}
      </div>

      <button 
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '10px',
          backgroundColor: 'red',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Annuler
      </button>
    </div>
  );
}

export default MapAdd;