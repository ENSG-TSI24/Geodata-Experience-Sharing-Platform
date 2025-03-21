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
    if (!globalAnnotations.length) return text

    const highlightedText = []
    let lastIndex = 0

    globalAnnotations.forEach((annotation, index) => {
      const pos = text.indexOf(annotation.text)
      if (pos !== -1) {
        if (pos > lastIndex) {
          highlightedText.push(text.substring(lastIndex, pos))
        }
        highlightedText.push(
          <span key={index} className="highlighted-text" title={annotation.annotation}>
            {annotation.text}
          </span>,
        )
        lastIndex = pos + annotation.text.length
      }
    })

    if (lastIndex < text.length) {
      highlightedText.push(text.substring(lastIndex))
    }

    return highlightedText
  }

  return (
    <div className="text-annotator">
      <form onSubmit={handleSubmit} className="text-form">
        <input type="text" value={text} onChange={handleChange} placeholder="Type here..." className="text-input" />
        <button type="submit" className="button button-primary">
          Add
        </button>
      </form>

      {submittedTexts.length > 0 && (
        <div onMouseUp={handleMouseUp} className="text-display">
          {submittedTexts.map((line, index) => (
            <p key={index} style={{ userSelect: "text" }}>
              {highlightAnnotatedText(line)}
            </p>
          ))}
        </div>
      )}

      {selectedText && (
        <div className="annotation-form">
          <p>
            Annotate: <strong>"{selectedText}"</strong>
          </p>
          <input
            type="text"
            value={annotationValue}
            onChange={(e) => setAnnotationValue(e.target.value)}
            placeholder="Add annotation"
            className="text-input"
          />
          <button onClick={handleAnnotationSubmit} className="button button-accent">
            Submit
          </button>
        </div>
      )}

      {globalAnnotations.length > 0 && (
        <div className="annotations-section">
          <h3>📌 Saved Annotations:</h3>
          <table className="annotations-table">
            <thead>
              <tr>
                <th>Text</th>
                <th>Annotation</th>
                <th>Child of</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {globalAnnotations.map((annotation) => (
                <tr key={annotation.id}>
                  <td>{annotation.text}</td>
                  <td>{annotation.annotation}</td>
                  <td>
                    <select
                      onChange={(e) => handleSetParent(annotation.annotation, e.target.value)}
                      value={annotation.parent || ""}
                      className="select-input"
                    >
                      <option value="">None</option>
                      {globalAnnotations.map(
                        (parent) =>
                          parent.annotation !== annotation.annotation && (
                            <option key={parent.id} value={parent.annotation}>
                              {parent.annotation}
                            </option>
                          ),
                      )}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteAnnotation(annotation.id)} className="button button-secondary">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TextAnnotator
