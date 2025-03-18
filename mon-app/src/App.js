import { useState } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"


function MyButtons() {
  return (
    <>
      <h1>Banderolle</h1>
      <div className="buttons">
        <button className="mapButton">Map</button>
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
  return (
    <div>
      <h1>Bienvenue dans mon appli, {username.trim()}</h1>
      <MyButtons />
      <AboutPage />
      <TextAnnotator />
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
