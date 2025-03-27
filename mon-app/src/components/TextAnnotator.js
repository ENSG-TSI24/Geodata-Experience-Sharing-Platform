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
  const [categories, setCategories] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});
  const textAreaRef = useRef(null);
  const mirrorRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/listes/categories')
      .then(response => response.json())
      .then(data => {
        const categoryMap = {};
        data.forEach(category => {
          categoryMap[category.id] = category.color || '#ffcc00';
        });
        setCategories(data.map(category => category.id));
        setCategoryColors(categoryMap);
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
        newText.Proprietees[label] = text.substring(start, end);
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
      setSelectedText(text.substring(start, end));
      setSelectionRange({ start, end });
      const rect = textarea.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top + window.scrollY + textarea.offsetHeight,
        left: rect.left + window.scrollX + start * 7,
      });
      setShowDropdown(true);
    }
  };

  const handleApplyAnnotation = (category) => {
    if (selectedText && category) {
      setAnnotations([...annotations, { start: selectionRange.start, end: selectionRange.end, label: category }]);
      setShowDropdown(false);
    }
  };

  const getAnnotatedHtml = () => {
    if (annotations.length === 0) return text.replace(/\n/g, '<br/>');
    let html = '';
    let lastIndex = 0;

    annotations.sort((a, b) => a.start - b.start).forEach(({ start, end, label }) => {
      html += text.substring(lastIndex, start).replace(/\n/g, '<br/>');
      html += `<span style="background-color: ${categoryColors[label]}; padding: 2px; border-radius: 3px;">`;
      html += text.substring(start, end).replace(/\n/g, '<br/>');
      html += '</span>';
      lastIndex = end;
    });

    html += text.substring(lastIndex).replace(/\n/g, '<br/>');
    return html;
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
      <div className="input-group" style={{ position: 'relative', fontFamily: 'monospace' }}>
        <div
          ref={mirrorRef}
          className="text-overlay"
          style={{
            position: 'absolute',
            whiteSpace: 'pre-wrap',
            pointerEvents: 'none',
            color: 'transparent',
            background: 'transparent',
            zIndex: 1,
            width: '100%',
            height: '100%',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: 'inherit',
          }}
          dangerouslySetInnerHTML={{ __html: getAnnotatedHtml() }}
        />
        <textarea
          ref={textAreaRef}
          value={text}
          className="text-input text-area"
          onChange={handleChange}
          onMouseUp={handleTextSelection}
          placeholder="Tapez votre texte ici..."
          rows="5"
          cols="50"
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            color: 'black',
            caretColor: 'black',
            fontFamily: 'monospace',
          }}
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
            zIndex: 10,
          }}
        >
          {categories.map((categoryId) => (
            <button key={categoryId} onClick={() => handleApplyAnnotation(categoryId)}>
              {categoryId}
            </button>
          ))}
        </div>
      )}
      

      <div>
        <h2>Dataset Global</h2>
        <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TextAnnotator;
