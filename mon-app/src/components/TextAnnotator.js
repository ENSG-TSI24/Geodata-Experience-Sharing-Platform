import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiUpload } from "react-icons/fi";

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
  const [notification, setNotification] = useState(null);
  
  const textAreaRef = useRef(null);
  const mirrorRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/listes/categories')
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

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      showNotification("Texte publié avec succès", "success");
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
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.top + scrollTop + textarea.offsetHeight,
        left: rect.left + scrollLeft,
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

  const exportAnnotations = () => {
    const dataStr = JSON.stringify(globalDataset, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `text-annotations-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Annotations exportées avec succès", "success");
  };

  const importAnnotations = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          setGlobalDataset(importedData);
          showNotification("Annotations importées avec succès", "success");
        } else {
          showNotification("Format d'annotation invalide", "error");
        }
      } catch (error) {
        showNotification("Échec de l'analyse du fichier importé", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setText('');
    setAnnotations([]);
    setTitle('');
  };

  return (
    <div ref={containerRef}>
      <h1>Description de la métadonnée</h1>
      
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="input-group"> 
        <input
          type="text"
          className="text-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entrez le titre du texte"
        />
      </div>
      
      <div 
        className="input-group" 
        style={{ 
          position: 'relative', 
          fontFamily: 'monospace',
          lineHeight: '1.5',
          fontSize: '14px'
        }}
      >
        <textarea
          ref={textAreaRef}
          value={text}
          className="text-area" 
          onChange={handleChange}
          onMouseUp={handleTextSelection}
          placeholder="Tapez votre texte ici..."
          rows="5"
          cols="50"
        />
        <div
          ref={mirrorRef}
          className="text-overlay"
          dangerouslySetInnerHTML={{ __html: getAnnotatedHtml() }}
        />
      </div>

      <div className="action-buttons">
        <button className="mode-toggle" onClick={handlePublish}>Publier</button>
        <button className="mode-reinit" onClick={handleReset}>Réinitialiser</button>
        
        <button
          className="button button-sm button-secondary"
          onClick={exportAnnotations}
          title="Exporter les annotations"
        >
          <FiDownload className="button-icon" />
          <span>Exporter</span>
        </button>

        <input
          type="file"
          accept=".json"
          onChange={importAnnotations}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button
          className="button button-sm button-secondary"
          onClick={() => fileInputRef.current.click()}
          title="Importer des annotations"
        >
          <FiUpload className="button-icon" />
          <span>Importer</span>
        </button>
      </div>
      
      {showDropdown && (
        <div
          className="annotation-dropdown"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {categories.map((categoryId) => (
            <button
              key={categoryId}
              className="annotation-button"
              style={{ backgroundColor: categoryColors[categoryId] }}
              onClick={() => handleApplyAnnotation(categoryId)}
            >
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