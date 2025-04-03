import React, { useState, useRef, useEffect } from 'react';
import { FiArrowDownCircle, FiDownload, FiUpload } from "react-icons/fi";

function TextAnnotator({ globalDataset, setGlobalDataset, userFullName }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('TEST_TITRE');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showDropdown,setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyStartPos, setPropertyStartPos] = useState(-1);
  const [propertyMode, setPropertyMode] = useState({
    active: false,
    name: null,
    startPos: -1,
    bracketEndPos: -1
  });
  const [activeProperty, setActiveProperty] = useState(null);
  const [propertyRange, setPropertyRange] = useState({ start: -1, end: -1 });
  const [storageStatus, setStorageStatus] = useState({ 
    loading: false, 
    error: null, 
    success: false 
  });
  
  const textAreaRef = useRef(null);
  const previewRef = useRef(null);
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

  const HideDiv = (event) => {
    const bigdiv = document.getElementById("big-div");
    if (getComputedStyle(bigdiv).display !== "none") {
      bigdiv.style.display = "none";
    } else {
      bigdiv.style.display = "block";
    }
  };

  const handleStoreMetadata = async (textData) => {
    try {
      setStorageStatus({ loading: true, error: null, success: false });
      
      const response = await fetch('/api/data/store-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            Title: textData.Title,
            Description: textData.Proprietees.description,
            ...textData.Proprietees
          },
          userFullName: userFullName
        })
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      setStorageStatus({ loading: false, error: null, success: true });
      setTimeout(() => setStorageStatus({ loading: false, error: null, success: false }), 3000);
      return result;
    } catch (error) {
      setStorageStatus({ loading: false, error: error.message, success: false });
      throw error;
    }
  };

  const handleKeyDown = (event) => {
    const textarea = textAreaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
  
    // Sortie du mode propriété si on est après le ] final
    if (propertyMode.active && cursorPos > propertyMode.bracketEndPos) {
      setPropertyMode({
        active: false,
        name: null,
        startPos: -1,
        bracketEndPos: -1
      });
    }
  
    // Gestion du #
    if (event.key === '#') {
      setPropertyMode({
        active: true,
        name: null,
        startPos: cursorPos,
        bracketEndPos: -1
      });
      setShowDropdown(true);
    }
  
    // Gestion de la touche ] pour fermer le mode propriété
    if (propertyMode.active && event.key === ']' && !propertyMode.name) {
      setPropertyMode(prev => ({
        ...prev,
        bracketEndPos: cursorPos + 1
      }));
    }
  };

  const handlePropertySelect = (propertyName) => {
    const textarea = textAreaRef.current;
    const cursorPos = textarea.selectionStart;
    
    // Insérer le format #[property[]] et placer le curseur entre les crochets
    const newText = text.slice(0, propertyMode.startPos) + 
                   `#${propertyName}[]` + 
                   text.slice(cursorPos);
    
    setText(newText);
    setPropertyMode(prev => ({
      ...prev,
      name: propertyName,
      bracketEndPos: propertyMode.startPos + propertyName.length + 2
    }));
    setShowDropdown(false);
  
    // Positionner le curseur entre les crochets
    setTimeout(() => {
      const pos = propertyMode.startPos + propertyName.length + 2;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
  
    // Si en mode propriété et qu'on tape après le ], sortir du mode
    const cursorPos = e.target.selectionStart;
    if (propertyMode.active && cursorPos > propertyMode.bracketEndPos && propertyMode.bracketEndPos !== -1) {
      setPropertyMode({
        active: false,
        name: null,
        startPos: -1,
        bracketEndPos: -1
      });
    }
  };
  

  const handlePublish = async () => {
    if (text.trim() !== '' && title.trim() !== '') {
      try {
        // Extraction des propriétés format #Nom[valeur]
        const propertyRegex = /#([^\[\]]+)\[([^\[\]]*)\]/g;
        let match;
        const properties = {};
        
        while ((match = propertyRegex.exec(text)) !== null) {
          properties[match[1]] = match[2]; // { Nom: "valeur" }
        }

        // Création de l'objet à envoyer
        const newText = {
          Title: title,
          Proprietees: { 
            description: text,
            ...properties,  // Ajout des propriétés détectées
            ...Object.fromEntries(
              annotations.map(ann => [
                ann.label, 
                text.substring(ann.start, ann.end)
              ])
            )
          },
        };

        console.log("Données envoyées :", newText); // Debug

        await handleStoreMetadata(newText);
        setGlobalDataset([...globalDataset, newText]);
        setText('');
        setTitle('');
        setAnnotations([]);
        showNotification("Texte publié avec succès", "success");
      } catch (error) {
        showNotification(`Erreur: ${error.message}`, "error");
      }
    }
};

  const handleTextSelection = () => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
  
    // Vérifier si un # est présent dans le texte
    const hasHash = currentText.includes('#');
    
    if (hasHash) {
      // Trouver la position du dernier #
      const lastHashPos = currentText.lastIndexOf('#');
      const cursorPos = textarea.selectionStart;
      
      // Si le curseur est après le #, afficher le dropdown des propriétés
      if (cursorPos > lastHashPos) {
        const rect = textarea.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        setDropdownPosition({
          top: rect.top + scrollTop + 30,
          left: rect.left + 10 + (cursorPos * 8), // Approximation de la position du curseur
        });
        setShowDropdown(true);
        return;
      }
    }
  
    // Gestion normale des sélections de texte pour les annotations
    if (start !== end) {
      const selected = currentText.substring(start, end);
      if (selected.trim().length > 0) {
        setSelectedText(selected);
        setSelectionRange({ start, end });
        
        const rect = textarea.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        setDropdownPosition({
          top: rect.top + scrollTop + 30,
          left: rect.left + 10,
        });
        setShowDropdown(true);
      }
    } else {
      setShowDropdown(false);
    }
  };
  
  
  const handleApplyAnnotation = (category) => {
    if (selectedText && category) {
      // Vérifier que le texte sélectionné existe toujours aux mêmes positions
      const currentSelectedText = text.substring(selectionRange.start, selectionRange.end);
      if (currentSelectedText !== selectedText) {
        showNotification("Le texte a été modifié, veuillez resélectionner", "error");
        return;
      }
  
      // Vérifier les chevauchements
      const overlap = annotations.some(ann => 
        (selectionRange.start < ann.end && selectionRange.end > ann.start)
      );
      
      if (!overlap) {
        setAnnotations([...annotations, {
          start: selectionRange.start,
          end: selectionRange.end,
          label: category,
          text: selectedText // On stocke le texte annoté
        }]);
        setShowDropdown(false);
        textAreaRef.current.setSelectionRange(selectionRange.end, selectionRange.end);
        textAreaRef.current.focus();
      } else {
        showNotification("Les annotations ne peuvent pas se chevaucher", "error");
      }
    }
  };
  
  const renderAnnotatedText = () => {
    if (!text) return null;
  
    let lastPos = 0;
    const elements = [];
    const propertyRegex = /(#([^\[]+)\[([^\]]*)\])/g;
  
    // 1. Détecter toutes les propriétés format #Nom[value]
    const propMatches = [];
    let match;
    while ((match = propertyRegex.exec(text)) !== null) {
      propMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        name: match[2],
        value: match[3],
        full: match[0],
        type: 'property'
      });
    }
  
    // 2. Filtrer les annotations normales (hors propriétés)
    const validAnnotations = annotations
      .filter(ann => {
        const isOutsideProperty = !propMatches.some(prop => 
          (ann.start >= prop.start && ann.end <= prop.end) || // Annotation entièrement dans une propri
          (ann.start < prop.end && ann.end > prop.start)      // Annotation qui chevauche
        );
        
        // Vérifier aussi que le texte n'a pas changé
        return isOutsideProperty && (text.substring(ann.start, ann.end) === ann.text);
      })
      .map(ann => ({ ...ann, type: 'annotation' }));
  
    // 3. Fusionner et trier tous les marqueurs
    const allMarkers = [...validAnnotations, ...propMatches]
      .sort((a, b) => a.start - b.start);
  
    // 4. Rendu
    allMarkers.forEach((marker, i) => {
      // Texte avant le marqueur
      if (marker.start > lastPos) {
        elements.push(text.substring(lastPos, marker.start));
      }
  
      // Rendu spécifique
      if (marker.type === 'property') {
        // Property format: #Nom[value]
        elements.push(
          <span key={`prop-${i}`}>
            <span style={{ color: '#999' }}>#{marker.name}[</span>
            <span style={{
              backgroundColor: categoryColors[marker.name] || '#ddd',
              padding: '2px 6px',
              borderRadius: '12px'
            }}>
              {marker.value}
            </span>
            <span style={{ color: '#999' }}>]</span>
          </span>
        );
      } else {
        // Annotation normale
        elements.push(
          <span 
            key={`ann-${i}`}
            style={{
              backgroundColor: categoryColors[marker.label],
              padding: '2px 6px',
              borderRadius: '12px'
            }}
          >
            {marker.text}
          </span>
        );
      }
  
      lastPos = marker.end;
    });
  
    // Texte après le dernier marqueur
    if (lastPos < text.length) {
      elements.push(text.substring(lastPos));
    }
  
    return elements;
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
    setTitle('');
    setAnnotations([]);
  };

  return (
    <div ref={containerRef}>
      <div className='entete-annot'>
        <h1>Description de la métadonnée</h1>
        <FiArrowDownCircle size={50} className="button-icon" id="deplie" onClick={HideDiv}></FiArrowDownCircle>
      </div>
      <div id="big-div">
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
        
        <div className="text-editor-container">
          {/* Prévisualisation avec annotations */}
          <div
            ref={previewRef}
            className="text-preview"
            onClick={() => textAreaRef.current.focus()}
          >
            {renderAnnotatedText()}
          </div>
          
          {/* Textarea invisible pour la saisie */}
           <textarea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onSelect={handleTextSelection}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          zIndex: 1,
          position: 'relative'
        }}
        placeholder="Tapez votre texte ici..."
      />
        </div>

        <div className="action-buttons">
          <button 
            className="mode-toggle" 
            onClick={handlePublish}
            disabled={storageStatus.loading}
          >
            {storageStatus.loading ? 'Publication en cours...' : 'Publier'}
          </button>

          {storageStatus.error && (
            <div className="error-message">
              Erreur: {storageStatus.error}
            </div>
          )}

          {storageStatus.success && (
            <div className="success-message">
              Données stockées avec succès dans Neo4J!
            </div>
          )}

          <button className="mode-reinit" onClick={handleReset}>
            Réinitialiser
          </button>
          
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
           position: 'absolute',
           top: `${dropdownPosition.top}px`,
           left: `${dropdownPosition.left}px`,
           backgroundColor: '#fff',
           border: '1px solid #ccc',
           borderRadius: '5px',
           padding: '5px',
           maxHeight: '20vh',
           maxWidth: '30vh',
           overflowY: 'auto',
           boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
           zIndex: 1000
         }}
         >

          
{(filteredCategories.length > 0 ? filteredCategories : categories).map((categoryId) => (
              <button
                key={categoryId}
                className="annotation-button"
                style={{ backgroundColor: categoryColors[categoryId] }}
                onClick={() => {
                  if (text.includes('#')) {
                    handlePropertySelect(categoryId);
                  } else {
                    handleApplyAnnotation(categoryId);
                  }
                }}
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
    </div>
  );
};

export default TextAnnotator;