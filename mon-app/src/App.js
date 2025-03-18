import { useState } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { MapContainer, TileLayer, Marker, Popup , useMapEvents} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MyButtons() {
  return (
    <>
      <h1>Banderolle</h1>
      <div className="buttons">
        <button className="ImportButton">Importer métadonnées</button>
        <button className="ExportButton">Exporter métadonnées</button>
      </div>
    </>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <h1>À propos</h1>
      <p>Bien le bonjour.<br />Comment ça va ?</p>
    </>
  );
}

function ClickableMap({ addMarker }) {
  useMapEvents({
    click(e) {
      addMarker(e.latlng);
    },
  });

  return null;
}

function MapAnnotator() {
  const [markers, setMarkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [markerData, setMarkerData] = useState({ title: "", description: "" });
  const [annotations, setAnnotations] = useState([]);
  const [showDeleteAnnotationConfirm, setShowDeleteAnnotationConfirm] = useState(false);
  const [annotationToDelete, setAnnotationToDelete] = useState(null);
  const [markerTitleForAnnotation, setMarkerTitleForAnnotation] = useState(null);

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

    // Ajouter "nom" et "Coordonnées" au dictionnaire
    setAnnotations((prev) => [
      ...prev,
      {
        nom: markerData.title,
        annotations: [
          { texte: "nom", note: markerData.title },
          { texte: "Coordonnées", note: `(${newMarker.lat}, ${newMarker.lng})` },
        ],
      },
    ]);

    setShowModal(false);
    setMarkerData({ title: "", description: "" });
    setNewMarker(null);
  };

  const handleDeleteAnnotation = (markerTitle, annotationText) => {
    // Afficher la fenêtre de confirmation pour supprimer l'annotation
    setShowDeleteAnnotationConfirm(true);
    setAnnotationToDelete(annotationText);
    setMarkerTitleForAnnotation(markerTitle);
  };

  const confirmDeleteAnnotation = (confirm) => {
    if (confirm && markerTitleForAnnotation && annotationToDelete) {
      // Supprimer l'annotation spécifique du marqueur
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
        setAnnotations((prev) =>
          prev.map((entry) =>
            entry.nom === markerTitle
              ? { ...entry, annotations: [...entry.annotations, { texte: selection, note: annotationText }] }
              : entry
          )
        );
      }
    }
  };

  const handleDeleteMarker = (markerTitle) => {
    // Demande de confirmation pour la suppression du marqueur
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
                  {entry.annotations.map((ann, i) => (
                    <li key={i}>
                      <strong>{ann.texte} :</strong> {ann.note}
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

// Style de la fenêtre modale
const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  padding: "20px",
  boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};


function TextAnnotator() {
  //variable global
  const [text, setText] = useState("");
  const [submittedTexts, setSubmittedTexts] = useState([]);
  const [globalAnnotations, setGlobalAnnotations] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [annotationValue, setAnnotationValue] = useState("");

  
  const handleChange = (event) => {
    setText(event.target.value);
  };

  // Soumission du texte
  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.trim() !== "") {
      setSubmittedTexts((prevTexts) => [...prevTexts, text]);
      setText(""); 
    }
  };

  // Sélection du texte pour annotation
  const handleMouseUp = () => {
    const selected = window.getSelection().toString().trim();
    if (selected && !globalAnnotations.some((a) => a.text === selected)) {
      setSelectedText(selected);
      setAnnotationValue("");
    }
  };

  // Ajout d'une annotation
  const handleAnnotationSubmit = () => {
    if (selectedText) {
      const newAnnotation = { id: Date.now().toString(), text: selectedText, annotation: annotationValue };
      setGlobalAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedText(""); // Réinitialisation
      setAnnotationValue("");
    }
  };

  // Gestion du déplacement des annotations (tableau)
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newList = Array.from(globalAnnotations);
    const [movedItem] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, movedItem);

    setGlobalAnnotations(newList);
  };

  // Fonction pour surligner les parties annotées
  const highlightAnnotatedText = (text) => {
    if (!globalAnnotations.length) return text;

    let highlightedText = [];
    let lastIndex = 0;

    globalAnnotations.forEach((annotation, index) => {
      const pos = text.indexOf(annotation.text);
      if (pos !== -1) {
        // Ajouter le texte normal avant l'annotation
        if (pos > lastIndex) {
          highlightedText.push(text.substring(lastIndex, pos));
        }

        // Ajouter le texte annoté surligné
        highlightedText.push(
          <span
            key={index}
            style={{
              backgroundColor: "yellow",
              cursor: "pointer",
              position: "relative",
            }}
            title={annotation.annotation} // Pop-up au survol
          >
            {annotation.text}
          </span>
        );

        lastIndex = pos + annotation.text.length;
      }
    });

    // Ajouter le reste du texte après la dernière annotation
    if (lastIndex < text.length) {
      highlightedText.push(text.substring(lastIndex));
    }

    return highlightedText;
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      {/* Formulaire de texte */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Tapez ici..."
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button type="submit">Ajouter</button>
      </form>

      {/* Affichage des textes soumis avec annotations */}
      {submittedTexts.length > 0 && (
        <div onMouseUp={handleMouseUp} style={{ cursor: "text" }}>
          {submittedTexts.map((line, index) => (
            <p key={index} style={{ userSelect: "text" }}>
              {highlightAnnotatedText(line)}
            </p>
          ))}
        </div>
      )}

      {/* Formulaire d'annotation */}
      {selectedText && (
        <div style={{ marginTop: "20px" }}>
          <p>Annoter : <strong>"{selectedText}"</strong></p>
          <input
            type="text"
            value={annotationValue}
            onChange={(e) => setAnnotationValue(e.target.value)}
            placeholder="Ajouter une annotation"
            style={{ padding: "5px", marginRight: "10px" }}
          />
          <button onClick={handleAnnotationSubmit}>Valider</button>
        </div>
      )}

      {/* Tableau interactif des annotations */}
      {globalAnnotations.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📌 Annotations enregistrées :</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="annotations">
              {(provided) => (
                <table
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#ccc" }}>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>#</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Texte</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Annotation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalAnnotations.map((annotation, index) => (
                      <Draggable key={annotation.id} draggableId={annotation.id} index={index}>
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              cursor: "grab",
                              backgroundColor: "#f9f9f9",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{index + 1}</td>
                            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{annotation.text}</td>
                            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{annotation.annotation}</td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ username }) {
  let button;
  let content;
  const [isMap, setIsMap] = useState(false);

  const handleMap = (name) => {
    setIsMap(true);  
  };
  const handleText = (name) => {
    setIsMap(false);  
  };

  if (isMap) {
    button = <button className="textButton" onClick={handleText}>Mode Texte</button>;
    content = <MapAnnotator />;
  } else {
    button = <button className="mapButton" onClick={handleMap}>Mode Carte</button>;
    content = <TextAnnotator />

  }
  return (
    <div>
      <h1>Bienvenue dans mon appli, {username.trim()}</h1>
      <AboutPage />
      <MyButtons />
      {button}
      {content}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); 
  let content;

  const handleLogin = (name) => {
    setIsLoggedIn(true);
    setUsername(name); 
  };

  if (isLoggedIn) {
    content = <AdminPanel username={username} />; 
  } else {
    content = <LoginForm onLogin={handleLogin} />; 
  }

  return (
    <div>
      {content}
    </div>
  );
}

export default App;
