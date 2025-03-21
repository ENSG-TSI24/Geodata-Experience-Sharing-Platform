import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const propertyOptions = ["adresse", "date", "problème", "solution"];

function AddMarkerOnClick({ setGlobalDataset }) {
  useMapEvents({
    click(e) {
      const title = prompt("Nom du jeu de données:");
      const description = prompt("Description du jeu de données:");
      if (title && description) {
        const newMarker = {
          Title: title,
          Proprietes: {
            Description: description,
            Position: e.latlng,
          },
        };
        setGlobalDataset((prevDataset) => [...prevDataset, newMarker]);
      }
    },
  });
  return null;
}

function MapAnnotator({ globalDataset, setGlobalDataset }) {
  const [selectedText, setSelectedText] = useState("");
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(null);

  const handleTextSelection = (index) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      setSelectedText(selection);
      setActiveMarkerIndex(index);
    }
  };

  const addPropertyToMarker = (property) => {
    if (activeMarkerIndex !== null && selectedText) {
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
    }
  };

  const removeProperty = (markerIndex, propertyKey) => {
    setGlobalDataset((prevDataset) =>
      prevDataset.map((marker, i) => {
        if (i === markerIndex) {
          const updatedProperties = { ...marker.Proprietes };
          delete updatedProperties[propertyKey];  // Supprime la propriété spécifique
          return { ...marker, Proprietes: updatedProperties };
        }
        return marker;
      })
    );
  };

  return (
    <div>
      <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AddMarkerOnClick setGlobalDataset={setGlobalDataset} />
        {globalDataset.map((marker, index) => (
          <Marker key={index} position={marker.Proprietes.Position} icon={customIcon}>
            <Popup>
              <strong>Nom du jeu de données:</strong> {marker.Title}
              <br />
              <span
                onMouseUp={() => handleTextSelection(index)}
                style={{ cursor: "text", backgroundColor: "#f0f0f0", padding: "2px" }}
              >
                <strong>Description du jeu de données:</strong>
                {marker.Proprietes.Description}
                <br />
              </span>
              <br />
              <strong>Propriétées:</strong>
              <br />
              {Object.entries(marker.Proprietes).map(([key, value]) => (
                key !== "Position" && key !== "Description" && (
                  <div key={key}>
                    <strong>{key}:</strong> {value}
                    <button onClick={() => removeProperty(index, key)} style={{ marginLeft: "10px", color: "red" }}>
                      Supprimer
                    </button>
                  </div>
                )
              ))}
              {selectedText && activeMarkerIndex === index && (
                <select onChange={(e) => addPropertyToMarker(e.target.value)}>
                  <option value="">Sélectionner une propriété</option>
                  {propertyOptions.map((prop) => (
                    <option key={prop} value={prop}>{prop}</option>
                  ))}
                </select>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapAnnotator;
