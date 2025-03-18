import { useState } from 'react';
import './App.css';

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
  const [text, setText] = useState("");
  const [submittedTexts, setSubmittedTexts] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const [globalAnnotations, setGlobalAnnotations] = useState({});
  const [selectedText, setSelectedText] = useState("");
  const [annotationValue, setAnnotationValue] = useState("");
  const [hoveredText, setHoveredText] = useState(null); // Gère le texte survolé

  // Mise à jour du champ de texte
  const handleChange = (event) => {
    setText(event.target.value);
  };

  // Soumission du texte
  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.trim() !== "") {
      setSubmittedTexts((prevTexts) => [...prevTexts, text]);
      setText(""); // Réinitialiser le champ de saisie
    }
  };

  // Récupération du texte sélectionné
  const handleMouseUp = () => {
    const selected = window.getSelection().toString().trim();
    if (selected && !globalAnnotations[selected]) {
      setSelectedText(selected);
      setAnnotationValue("");
    }
  };

  // Soumission de l'annotation
  const handleAnnotationSubmit = () => {
    if (selectedText) {
      const updatedAnnotations = { ...annotations, [selectedText]: annotationValue };
      const updatedGlobalAnnotations = { ...globalAnnotations, [selectedText]: annotationValue };

      setAnnotations(updatedAnnotations);
      setGlobalAnnotations(updatedGlobalAnnotations);
      setSelectedText(""); // Réinitialiser la sélection
      setAnnotationValue(""); // Réinitialiser l'annotation
    }
  };

  // Fonction pour surligner le texte annoté
  const highlightText = (line) => {
    let result = [];
    let lastIndex = 0;

    Object.keys(globalAnnotations).forEach((annotatedText) => {
      let index = line.indexOf(annotatedText);
      if (index !== -1) {
        // Ajouter le texte avant l'annotation
        if (index > lastIndex) {
          result.push(line.substring(lastIndex, index));
        }
        // Ajouter le texte annoté avec le style
        result.push(
          <span
            key={index}
            style={{
              backgroundColor: "yellow",
              cursor: "pointer",
              position: "relative",
              padding: "2px",
            }}
            onMouseEnter={() => setHoveredText(annotatedText)}
            onMouseLeave={() => setHoveredText(null)}
          >
            {annotatedText}
            {/* Affichage du pop-up (tooltip) */}
            {hoveredText === annotatedText && (
              <span
                style={{
                  position: "absolute",
                  bottom: "25px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "black",
                  color: "white",
                  padding: "5px",
                  borderRadius: "5px",
                  whiteSpace: "nowrap",
                  zIndex: 1000,
                }}
              >
                {globalAnnotations[annotatedText]}
              </span>
            )}
          </span>
        );
        lastIndex = index + annotatedText.length;
      }
    });

    // Ajouter le reste du texte après la dernière annotation
    if (lastIndex < line.length) {
      result.push(line.substring(lastIndex));
    }

    return result.length > 0 ? result : line;
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
              {highlightText(line)}
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

      {/* Affichage des annotations */}
      {Object.keys(globalAnnotations).length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📌 Annotations enregistrées :</h3>
          <ul>
            {Object.entries(globalAnnotations).map(([text, annotation]) => (
              <li key={text}>
                <strong>{text} :</strong> {annotation}
              </li>
            ))}
          </ul>
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
