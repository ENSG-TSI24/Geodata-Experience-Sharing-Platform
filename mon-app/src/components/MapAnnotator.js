import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ClickableMap from "./ClickableMap";

function MapAnnotator() {
  const [markers, setMarkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [markerData, setMarkerData] = useState({ title: "", description: "" });
  const [annotations, setAnnotations] = useState([]);
  const [showDeleteAnnotationConfirm, setShowDeleteAnnotationConfirm] = useState(false);
  const [annotationToDelete, setAnnotationToDelete] = useState(null);
  const [markerTitleForAnnotation, setMarkerTitleForAnnotation] = useState(null);

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: "1000",
  };

  const handleMapClick = (latlng) => {
    setNewMarker(latlng);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setMarkerData({ ...markerData, [e.target.name]: e.target.value });
  };

  const handleAddMarker = () => {
    if (!markerData.title.trim()) return;

    const markerWithData = {
      ...newMarker,
      title: markerData.title,
      description: markerData.description,
    };

    setMarkers([...markers, markerWithData]);

    setAnnotations((prev) => [
      ...prev,
      {
        nom: markerData.title,
        annotations: [
          { texte: "nom", note: markerData.title, parent: null },
          { texte: "Coordonnées", note: `(${newMarker.lat}, ${newMarker.lng})`, parent: null },
        ],
      },
    ]);

    setShowModal(false);
    setMarkerData({ title: "", description: "" });
    setNewMarker(null);
  };

  const handleDeleteAnnotation = (markerTitle, annotationText) => {
    setShowDeleteAnnotationConfirm(true);
    setAnnotationToDelete(annotationText);
    setMarkerTitleForAnnotation(markerTitle);
  };

  const confirmDeleteAnnotation = (confirm) => {
    if (confirm && markerTitleForAnnotation && annotationToDelete) {
      setAnnotations((prev) =>
        prev.map((entry) =>
          entry.nom === markerTitleForAnnotation
            ? { 
                ...entry,
                annotations: entry.annotations.filter((ann) => ann.texte !== annotationToDelete)
              }
            : entry
        )
      );
    }
    setShowDeleteAnnotationConfirm(false);
    setAnnotationToDelete(null);
    setMarkerTitleForAnnotation(null);
  };

  const handleTextSelection = (markerTitle) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      const annotationText = prompt(`Ajoutez une annotation pour : "${selection}"`);
      if (annotationText) {
        const parentAnnotation = prompt(`Cette annotation dépend-elle d'une autre ? (Laisser vide si non)`);

        setAnnotations((prev) =>
          prev.map((entry) =>
            entry.nom === markerTitle
              ? {
                  ...entry,
                  annotations: [
                    ...entry.annotations,
                    {
                      texte: selection,
                      note: annotationText,
                      parent: parentAnnotation || null, 
                    },
                  ],
                }
              : entry
          )
        );
      }
    }
  };

  const handleDeleteMarker = (markerTitle) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer le marqueur "${markerTitle}" ?`);
    if (confirmDelete) {
      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.title !== markerTitle));
      setAnnotations((prevAnnotations) => prevAnnotations.filter((entry) => entry.nom !== markerTitle));
    }
  };

  const highlightAnnotatedText = (text, markerAnnotations) => {
    let newText = text;

    markerAnnotations.forEach((ann) => {
      if (ann.texte !== "nom" && ann.texte !== "Coordonnées") {
        const highlighted = `<span class="highlight" title="${ann.note}">${ann.texte}</span>`;
        newText = newText.replaceAll(ann.texte, highlighted);
      }
    });

    return newText;
  };

  return (
    <div>
      <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickableMap addMarker={handleMapClick} />
        {markers.map((marker, index) => {
          const markerAnnotations = annotations.find((entry) => entry.nom === marker.title)?.annotations || [];
          const formattedDescription = highlightAnnotatedText(marker.description, markerAnnotations);

          return (
            <Marker key={index} position={[marker.lat, marker.lng]}>
              <Popup>
                <h3>{marker.title}</h3>
                <p
                  onMouseUp={() => handleTextSelection(marker.title)}
                  style={{ cursor: "text" }}
                  dangerouslySetInnerHTML={{ __html: formattedDescription }}
                />
                <h4>Annotations :</h4>
                <ul>
                  {markerAnnotations.map((annotation, i) => (
                    <li key={i}>
                      {annotation.texte}: {annotation.note} 
                      <button onClick={() => handleDeleteAnnotation(marker.title, annotation.texte)}>Supprimer</button>
                    </li>
                  ))}
                </ul>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {showModal && (
        <div style={modalStyle}>
          <h2>Ajouter un marqueur</h2>
          <label>Titre :</label>
          <input type="text" name="title" value={markerData.title} onChange={handleInputChange} />
          <label>Description :</label>
          <textarea name="description" value={markerData.description} onChange={handleInputChange} />
          <button onClick={handleAddMarker}>Ajouter</button>
          <button onClick={() => setShowModal(false)}>Annuler</button>
        </div>
      )}

      {showDeleteAnnotationConfirm && (
        <div style={modalStyle}>
          <h2>Confirmer la suppression</h2>
          <p>Voulez-vous vraiment supprimer cette annotation ?</p>
          <button onClick={() => confirmDeleteAnnotation(true)}>Oui</button>
          <button onClick={() => confirmDeleteAnnotation(false)}>Non</button>
        </div>
      )}

      <h2>Dictionnaire d'annotations</h2>
      <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Annotations</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {annotations.map((entry, index) => (
            <tr key={index}>
              <td>{entry.nom}</td>
              <td>
                <ul>
                  {entry.annotations
                    .filter((ann) => !ann.parent)
                    .map((ann, i) => (
                      <li key={i}>
                        <strong>{ann.texte} :</strong> {ann.note}
                        <ul>
                          {entry.annotations
                            .filter((child) => child.parent === ann.texte)
                            .map((child, j) => (
                              <li key={j}>
                                ↳ <strong>{child.texte} :</strong> {child.note}
                              </li>
                            ))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </td>
              <td>
                <button onClick={() => handleDeleteMarker(entry.nom)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>
        {`
          .highlight {
            background-color: yellow;
            cursor: pointer;
            padding: 2px;
            border-radius: 3px;
          }
        `}
      </style>
    </div>
  );
}

export default MapAnnotator;
