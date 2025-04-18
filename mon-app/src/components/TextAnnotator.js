import React, { useState, useRef, useEffect } from 'react';
import { FiArrowDownCircle, FiDownload, FiUpload } from "react-icons/fi";
import ImportExport from './ImportExport';
import MapAdd from './MapAdd';
import "./TextAnnotator.css";
function TextAnnotator({ globalDataset, setGlobalDataset, userFullName }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [draftData, setDraftData] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [categories, setCategories] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});
  const [notification, setNotification] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showValuesDropdown, setShowValuesDropdown] = useState(false);
  const [values, setValues] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [propertyMode, setPropertyMode] = useState({
    active: false,
    name: null,
    startPos: -1,
    bracketEndPos: -1
  });
  const [propertySearch, setPropertySearch] = useState('');
  const [valueSearch, setValueSearch] = useState('');
  const [storageStatus, setStorageStatus] = useState({ 
    loading: false, 
    error: null, 
    success: false 
  });
  
  const textAreaRef = useRef(null);
  const previewRef = useRef(null);


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

  useEffect(() => {
    if (selectedProperty) {
      fetch(`/api/listes/values?propriete=${selectedProperty}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            console.warn(`Données invalides reçues pour ${selectedProperty}:`, data);
            setValues([]);
            return;
          }
          setValues(data);
        })
        .catch(error => {
          console.error(`Erreur de récupération des valeurs pour ${selectedProperty}:`, error);
          setValues([]); // Mettre une liste vide en cas d'erreur pour éviter le crash
        });
    }
  }, [selectedProperty]);
  

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

  const hideentetediv = (event) => {
    const entetediv = document.getElementById("entete-annot");
    entetediv.style.display = "none";
  }

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
  
      const result = await response.json();
      
      if (!response.ok) {
        // Si le backend a renvoyé une erreur avec un message
        if (result.error) {
          throw new Error(result.error);
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
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
  
    // Sortie du mode propriété si on est après le ] final
    if (propertyMode.active && cursorPos > propertyMode.bracketEndPos) {
      setPropertyMode({
        active: false,
        name: null,
        startPos: -1,
        bracketEndPos: -1
      });
      
    }

    if (event.key === 'Escape'){
      setShowDropdown(false);
      setShowValuesDropdown(false);
    }
  
    // Gestion du #
    if (event.key === '#') {
      
      event.preventDefault();
      setPropertyMode({
        active: true,
        name: null,
        startPos: cursorPos,
        bracketEndPos: -1
      });
      setPropertySearch('');
      
      const rect = textarea.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.top + scrollTop + 30,
        left: rect.left + scrollLeft
      });
      setShowDropdown(true);
      
    }
  
    
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
  
    // Vérifier si la propriété est déjà présente dans le texte pour éviter les doublons
    if (!text.includes(`#${propertyName}[]`)) {
      // Insérer `#Propriété[]` dans le texte
      const newText = text.slice(0, cursorPos) + `#${propertyName}[]` + text.slice(cursorPos);
      setText(newText);
  
      // Définir la propriété sélectionnée
      setSelectedProperty(propertyName);
      setShowDropdown(false);
      setValueSearch(''); 
  
      fetch(`/api/listes/values/${propertyName}`)
        .then(response => response.json())
        .then(data => {
          setValues(data);
          setShowValuesDropdown(true);
        })
        .catch(error => console.error("Error fetching values:", error));
  
     
      setTimeout(() => {
        const newCursorPos = cursorPos + propertyName.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const handleValueSelect = (value) => {
    const textarea = textAreaRef.current;
    const cursorPos = textarea.selectionStart;
    const propertyStartPos = text.lastIndexOf(`#${selectedProperty}[`);
  
    
    const newText = text.slice(0, propertyStartPos) +
                    `#${selectedProperty}[${value}` +
                    text.slice(cursorPos);
  
    setText(newText);
    setShowValuesDropdown(false);
  
    // Positionner le curseur après la valeur
    setTimeout(() => {
      const newCursorPos = propertyStartPos + selectedProperty.length + value.length + 3; // #Propriété[valeur]
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
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

  const handleTextSelection = () => {
    // Désactivé pour empêcher les annotations par sélection de texte
    return;
  };

  const filteredProperties = categories.filter(category => 
    category.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const filteredValues = Array.isArray(values)
  ? values.filter(value => value.id?.toLowerCase().includes(valueSearch.toLowerCase()))
  : [];
  
  const handlePublish = async () => {
    if (text.trim() !== '' && title.trim() !== '') {
      try {
        // Extraction des propriétés format #Nom[valeur]
        const propertyRegex = /#([^\[\]]+)\[([^\[\]]*)\]/g;
        let match;
        const properties = {};
  
        while ((match = propertyRegex.exec(text)) !== null) {
          const propName = match[1].replace(/^#/, '');  // Supprimer le # au début de la propriété
          properties[propName] = match[2]; // { Nom: "valeur" }
        }
  
        // Création de l'objet à envoyer
        const newText = {
          Title: title,
          Proprietees: { 
            description: text,
            ...properties  // Ajout des propriétés détectées
          },
        };
        // jsp si on fera géocodage donc dans le doute 
        //if (!properties.Zone_Localisation){
         alert("Veuillez placez le lieu correspondant à votre retour sur la carte ! ") 
           
           HideDiv();
           hideentetediv();
           setDraftData(newText); 
           setShowMap(true);
           
       
        //}
          //finalizePublication(newText);
      } catch (error) {
        showNotification("Texte publié avec succès", "success");
      }
    }
  };
  const finalizePublication = async (data) => {
    try {
      await handleStoreMetadata(data);
      setGlobalDataset([...globalDataset, data]);
      setText('');
      setTitle('');
      setDraftData(null);
      showNotification("Texte publié avec succès", "success");
    } catch (error) {
      showNotification("Texte publié avec succès", "success");
      throw error;
    }
  };
  
  // Gestion du retour depuis MapAdd
  const handleMapComplete = (position) => {
    if (position && draftData) {
      const updatedData = {
        ...draftData,
        Proprietees: {
          ...draftData.Proprietees,
          Lieu: `${position.lat},${position.lng}`
        }
      };
      finalizePublication(updatedData);
    }
    setShowMap(false);
    handleReset();
  };
  const renderAnnotatedText = () => {
    if (!text) return null;
  
    let lastPos = 0;
    const elements = [];
    const propertyRegex = /(#([^\[]+)\[([^\]]*)\])/g;
  
    // Détecter toutes les propriétés format #Nom[value]
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
  
    // Rendu
    propMatches.forEach((marker, i) => {
      // Texte avant le marqueur
      if (marker.start > lastPos) {
        elements.push(text.substring(lastPos, marker.start));
      }
  
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
  
      lastPos = marker.end;
    });
  
    // Texte après le dernier marqueur
    if (lastPos < text.length) {
      elements.push(text.substring(lastPos));
    }
  
    return elements;
  };

 const handleReset = () => {
    setText('');
    setTitle('');
    setShowDropdown(false);
    setShowValuesDropdown(false);
  };

  return (
    <div>
      <div id="entete-annot">
        <h2>Créer un retour d'experience</h2>
        <FiArrowDownCircle size={50} className="button-icon" id="deplie" onClick={HideDiv}></FiArrowDownCircle>
      </div>
      {showMap ? (
      <MapAdd  draftData={draftData}
      onComplete={handleMapComplete}
      onCancel={() => setShowMap(false)}/>
    ) : (
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
        
        <div className="text-editor-container"  style={{
              width: '100%',
              margin: 0
            }}>
          
          <div
            ref={previewRef}
            className="text-preview"          
            onClick={() => textAreaRef.current.focus()}
          >
            {renderAnnotatedText()}
          </div>
          
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={handleInputChange}
            onSelect={handleTextSelection}
            onKeyDown={handleKeyDown}
            wrap="soft"
            style={{
              width: '100%',        
              maxWidth: '100%',
              minHeight: '30vh',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'none',
              whiteSpace: 'pre-wrap',         
              wordBreak: 'break-word',       
              overflowWrap: 'break-word',     
              boxSizing: 'border-box',     
              backgroundColor: 'rgba(255,255,255,0.9)',
              overflow: 'auto',
              zIndex: 1,
              position: 'relative'
            }}
            placeholder="Tapez votre texte ici (utilisez # pour ajouter une annotation et [ ] pour encapsuler l'annotation)..."
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
          
          <ImportExport 
            globalDataset={globalDataset}
            setGlobalDataset={setGlobalDataset}
            onImportData={({ title, text }) => { 
              setTitle(title);
              setText(text);
              console.log("Imported data in TextAnnotator:", title, text);
            }}
          />
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
            <input
              type="text"
              autoFocus
              placeholder="Rechercher une propriété..."
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              style={{
                width: '100%',
                padding: '5px',
                marginBottom: '5px',
                boxSizing: 'border-box'
              }}
            />
            {filteredProperties.length > 0 ? (
              filteredProperties.map((categoryId) => (
                <button 
                  key={categoryId} 
                  className="annotation-button" 
                  onClick={() => handlePropertySelect(categoryId)}
                  style={{ backgroundColor: categoryColors[categoryId] }}
                >
                  {categoryId}
                </button>
              ))
            ) : (
              <div style={{ padding: '5px', color: '#666' }}>Aucune propriété trouvée</div>
            )}
          </div>
        )}

        {showValuesDropdown && (
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
            <input
              type="text"
              autoFocus
              placeholder={`Rechercher une valeur pour ${selectedProperty}...`}
              value={valueSearch}
              onChange={(e) => setValueSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '5px',
                marginBottom: '5px',
                boxSizing: 'border-box'
              }}
            />
            {filteredValues.length > 0 ? (
              filteredValues.map((val) => (
                <button
                  key={val.id}
                  className="annotation-button"
                  onClick={() => handleValueSelect(val.id)}
                >
                  {val.id}
                </button>
              ))
            ) : (
              <button
              onClick={() => handleValueSelect(valueSearch)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                width: '100%'
              }}
            >
              Confirmer {valueSearch}
            </button>
            )}
          </div>
        )}
        

        <div>
          <h2>Dataset Global</h2>
          <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
        </div>
      </div>
    )}
    </div>
  );
};

export default TextAnnotator;