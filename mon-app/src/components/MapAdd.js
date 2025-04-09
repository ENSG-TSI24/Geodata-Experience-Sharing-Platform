"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function MapAdd() {
    const customIcon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      })
      function AddMarkerOnClick({ markers, setMarkers }) {
        const [position, setPosition] = useState(null)
      
        useMapEvents({
          click(e) {
            setPosition(e.latlng)
          },
        })
      
        return position ? (
          <Marker
            position={position}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                setMarkers([...markers, position])
                setPosition(null)
              },
            }}
          >
            <Popup>
              <div>
                <p>Cliquez pour ajouter ce marqueur</p>
                <button onClick={() => setPosition(null)}>Annuler</button>
              </div>
            </Popup>
          </Marker>
        ) : null
      }
      
      function SimpleMap() {
        const [markers, setMarkers] = useState([])
      
        return (
          <div style={{ height: "500px", width: "100%" }}>
            <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <AddMarkerOnClick markers={markers} setMarkers={setMarkers} />
              
              {markers.map((position, index) => (
                <Marker key={index} position={position} icon={customIcon}>
                  <Popup>
                    <div>
                      <p>Marqueur {index + 1}</p>
                      <p>Latitude: {position.lat.toFixed(4)}</p>
                      <p>Longitude: {position.lng.toFixed(4)}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )
      }
}

export default MapAdd;