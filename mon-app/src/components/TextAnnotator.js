import React, { useState } from 'react';  // Import useState from React

function TextAnnotator() {
  const [text, setText] = useState("");
  const [submittedTexts, setSubmittedTexts] = useState([]);
  const [globalAnnotations, setGlobalAnnotations] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [annotationValue, setAnnotationValue] = useState("");

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.trim() !== "") {
      setSubmittedTexts((prevTexts) => [...prevTexts, text]);
      setText("");
    }
  };

  const handleMouseUp = () => {
    const selected = window.getSelection().toString().trim();
    if (selected && !globalAnnotations.some((a) => a.text === selected)) {
      setSelectedText(selected);
      setAnnotationValue("");
    }
  };

  const handleAnnotationSubmit = () => {
    if (selectedText) {
      const newAnnotation = { id: Date.now().toString(), text: selectedText, annotation: annotationValue, children: [] };
      setGlobalAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedText("");
      setAnnotationValue("");
    }
  };

  const handleDeleteAnnotation = (id) => {
    setGlobalAnnotations((prev) => prev.filter(annotation => annotation.id !== id));
  };

  const handleSetParent = (childAnnotation, parentAnnotation) => {
    setGlobalAnnotations((prevAnnotations) => {
      return prevAnnotations.map((annotation) => {
        if (annotation.annotation === parentAnnotation) {
          return { ...annotation, children: [...annotation.children, childAnnotation] };
        }
        if (annotation.annotation === childAnnotation) {
          return { ...annotation, parent: parentAnnotation };
        }
        return annotation;
      });
    });
  };

  const highlightAnnotatedText = (text) => {
    if (!globalAnnotations.length) return text;

    let highlightedText = [];
    let lastIndex = 0;

    globalAnnotations.forEach((annotation, index) => {
      const pos = text.indexOf(annotation.text);
      if (pos !== -1) {
        if (pos > lastIndex) {
          highlightedText.push(text.substring(lastIndex, pos));
        }
        highlightedText.push(
          <span
            key={index}
            style={{ backgroundColor: "yellow", cursor: "pointer", position: "relative" }}
            title={annotation.annotation}
          >
            {annotation.text}
          </span>
        );
        lastIndex = pos + annotation.text.length;
      }
    });

    if (lastIndex < text.length) {
      highlightedText.push(text.substring(lastIndex));
    }

    return highlightedText;
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input type="text" value={text} onChange={handleChange} placeholder="Tapez ici..." style={{ padding: "5px", marginRight: "10px" }} />
        <button type="submit">Ajouter</button>
      </form>

      {submittedTexts.length > 0 && (
        <div onMouseUp={handleMouseUp} style={{ cursor: "text" }}>
          {submittedTexts.map((line, index) => (
            <p key={index} style={{ userSelect: "text" }}>
              {highlightAnnotatedText(line)}
            </p>
          ))}
        </div>
      )}

      {selectedText && (
        <div style={{ marginTop: "20px" }}>
          <p>Annoter : <strong>"{selectedText}"</strong></p>
          <input type="text" value={annotationValue} onChange={(e) => setAnnotationValue(e.target.value)} placeholder="Ajouter une annotation" style={{ padding: "5px", marginRight: "10px" }} />
          <button onClick={handleAnnotationSubmit}>Valider</button>
        </div>
      )}

      {globalAnnotations.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📌 Annotations enregistrées :</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#ccc" }}>
                <th>Texte</th>
                <th>Annotation</th>
                <th>Est enfant de</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {globalAnnotations.map((annotation, index) => (
                <tr key={annotation.id} style={{ backgroundColor: "#f9f9f9" }}>
                  <td>{annotation.text}</td>
                  <td>{annotation.annotation}</td>
                  <td>
                    <select onChange={(e) => handleSetParent(annotation.annotation, e.target.value)} value={annotation.parent || ""}>
                      <option value="">Aucun</option>
                      {globalAnnotations.map((parent) => (
                        parent.annotation !== annotation.annotation && (
                          <option key={parent.id} value={parent.annotation}>
                            {parent.annotation}
                          </option>
                        )
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteAnnotation(annotation.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>📌 Dictionnaire des annotations :</h3>
          <pre>{JSON.stringify(globalAnnotations, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default TextAnnotator;