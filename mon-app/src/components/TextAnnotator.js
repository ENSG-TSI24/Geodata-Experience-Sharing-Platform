import React, { useState, useRef, useEffect } from 'react';

const TextAnnotator = () => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [globalDataset, setGlobalDataset] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [categories, setCategories] = useState([]);  // Etat pour les catégories (uniquement des ids)
  const textAreaRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/listes/categories')
      .then(response => response.json())
      .then(data => {
        const categoryIds = data.map(category => category.id);
        setCategories(categoryIds);
      })
      .catch(error => console.error('Erreur lors de la récupération des catégories:', error));
  }, []);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handlePublish = () => {
    if (text.trim() !== '' && title.trim() !== '') {
      const newText = {
        Title: title,
        Proprietees: { description: text },
      };

      annotations.forEach(({ label, start, end }) => {
        const annotatedText = text.substring(start, end);
        newText.Proprietees[label] = annotatedText;
      });

      setGlobalDataset([...globalDataset, newText]);
      setText('');
      setTitle('');
      setAnnotations([]);
    }
  };

  const handleTextSelection = () => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = text.substring(start, end);
      setSelectedText(selected);
      setSelectionRange({ start, end });
      const rect = textarea.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top + window.scrollY + 30,
        left: rect.left + window.scrollX + start * 6,
      });
      setShowDropdown(true);
    }
  };

  const handleApplyAnnotation = (category) => {
    if (selectedText && category) {
      setAnnotations([
        ...annotations,
        { start: selectionRange.start, end: selectionRange.end, label: category }
      ]);
      setShowDropdown(false);
    }
  };

  const getAnnotatedText = () => {
    if (annotations.length === 0) return text;
    let annotatedText = [];
    let lastIndex = 0;

    annotations.sort((a, b) => a.start - b.start).forEach(({ start, end, label }, index) => {
      annotatedText.push(text.substring(lastIndex, start));
      annotatedText.push(
        <span key={index} style={{ backgroundColor: '#ccc', padding: '2px', borderRadius: '3px' }}>
          {text.substring(start, end)}
        </span>
      );
      lastIndex = end;
    });

    annotatedText.push(text.substring(lastIndex));
    return annotatedText;
  };

  const handleKeyDown = (event) => {
    if (event.key === '#') {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (event) => {
    setText(event.target.value);
    if (event.target.value.includes('#')) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleReset = () => {
    setText('');
    setAnnotations([]);
    setTitle('');
  };

  return (
    <div>
      <h1>Description de la métadonnée</h1>
      <div className="input-group"> 
        <input
          type="text"
          className="text-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entrez le titre du texte"
        />
      </div>
      <div className="input-group">
        <textarea
          ref={textAreaRef}
          value={text}
          className="text-input text-area"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onMouseUp={handleTextSelection}
          placeholder="Tapez votre texte ici..."
          rows="5"
          cols="50"
        />
      </div>
      <button className="mode-toggle" onClick={handlePublish}>Publier</button>
      <button className="mode-reinit" onClick={handleReset}>Réinitialiser</button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            backgroundColor: 'white',
            border: '1px solid black',
            padding: '5px',
          }}
        >
          {categories.map((categoryId) => (
            <button
              key={categoryId}
              onClick={() => handleApplyAnnotation(categoryId)}  // Pass the 'id' directly
            >
              {categoryId}  {/* Affichage de l'ID */}
            </button>
          ))}
        </div>
      )}

      <div>
        <h2>Texte annoté :</h2>
        <p>{getAnnotatedText()}</p>
      </div>

      <div>
        <h2>Dataset Global</h2>
        <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TextAnnotator;