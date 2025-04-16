"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapRecherche() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const fetchMarkers = async () => {
    try {
      const response = await fetch('/api/listes/withposition');
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      const data = await response.json();
      
    
      const formattedMarkers = data
        .map(item => {
          const [lat, lng] = item.data.properties.Lieu.split(',').map(Number);
          return {
            lat,
            lng,
            position: item.data.properties.Lieu,
            title : item.data.properties.Title
          };
        })
        .filter(marker => !isNaN(marker.lat) && !isNaN(marker.lng));
      setMarkers(formattedMarkers);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  if (loading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[48.8566, 2.3522]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            position={[marker.lat, marker.lng]} 
            icon={customIcon}
          >
            <Popup>
              <div>
                <h3>Titre : {marker.title}</h3>
                <p>Latitude: {marker.lat.toFixed(6)}</p>
                <p>Longitude: {marker.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
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
        <h3>Points affichés: {markers.length}</h3>
      </div>
    </div>
  );
}

export default MapRecherche;