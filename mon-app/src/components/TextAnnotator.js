import React, { useState, useRef, useEffect } from 'react';
import { FiArrowDownCircle, FiDownload, FiUpload } from "react-icons/fi";

<<<<<<< HEAD

function TextAnnotator({ globalDataset, setGlobalDataset, userFullName }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
=======
function TextAnnotator({ globalDataset, setGlobalDataset, userFullName }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [title, setTitle] = useState('TEST_TITRE');
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [categories, setCategories] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});
  const [notification, setNotification] = useState(null);
<<<<<<< HEAD
<<<<<<< HEAD
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showValuesDropdown, setShowValuesDropdown] = useState(false);
  const [values, setValues] = useState([]);
=======
  const [showDropdown,setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyStartPos, setPropertyStartPos] = useState(-1);
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showValuesDropdown, setShowValuesDropdown] = useState(false);
  const [values, setValues] = useState([]);
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
  const [propertyMode, setPropertyMode] = useState({
    active: false,
    name: null,
    startPos: -1,
    bracketEndPos: -1
  });
<<<<<<< HEAD
<<<<<<< HEAD
  const [propertySearch, setPropertySearch] = useState('');
  const [valueSearch, setValueSearch] = useState('');
=======
  const [activeProperty, setActiveProperty] = useState(null);
  const [propertyRange, setPropertyRange] = useState({ start: -1, end: -1 });
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
  const [propertySearch, setPropertySearch] = useState('');
  const [valueSearch, setValueSearch] = useState('');
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
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

<<<<<<< HEAD


=======
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
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
<<<<<<< HEAD
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
        .catch(error => console.error("Erreur de récupération des valeurs:", error));
  
     
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
  
        console.log("Données envoyées :", newText); // Debug
  
        await handleStoreMetadata(newText);
        setGlobalDataset([...globalDataset, newText]);
        setText('');
        setTitle('');
        showNotification("Texte publié avec succès", "success");
      } catch (error) {
        showNotification(`Erreur: ${error.message}`, "error");
      }
    }
  };

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
        .catch(error => console.error("Erreur de récupération des valeurs:", error));
  
     
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
  
        console.log("Données envoyées :", newText); // Debug
  
        await handleStoreMetadata(newText);
        setGlobalDataset([...globalDataset, newText]);
        setText('');
        setTitle('');
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
  

=======
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
        .catch(error => console.error("Erreur de récupération des valeurs:", error));
  
     
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
  
        console.log("Données envoyées :", newText); // Debug
  
        await handleStoreMetadata(newText);
        setGlobalDataset([...globalDataset, newText]);
        setText('');
        setTitle('');
        showNotification("Texte publié avec succès", "success");
      } catch (error) {
        showNotification(`Erreur: ${error.message}`, "error");
      }
    }
  };

<<<<<<< HEAD
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
  
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
  const renderAnnotatedText = () => {
    if (!text) return null;
  
    let lastPos = 0;
    const elements = [];
    const propertyRegex = /(#([^\[]+)\[([^\]]*)\])/g;
  
<<<<<<< HEAD
<<<<<<< HEAD
    // Détecter toutes les propriétés format #Nom[value]
=======
    // 1. Détecter toutes les propriétés format #Nom[value]
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
    // Détecter toutes les propriétés format #Nom[value]
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
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
  
<<<<<<< HEAD
<<<<<<< HEAD
    // Rendu
    propMatches.forEach((marker, i) => {
=======
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
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
    // Rendu
    propMatches.forEach((marker, i) => {
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
      // Texte avant le marqueur
      if (marker.start > lastPos) {
        elements.push(text.substring(lastPos, marker.start));
      }
  
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
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
<<<<<<< HEAD
          </span>
          <span style={{ color: '#999' }}>]</span>
        </span>
      );
=======
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
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
          </span>
          <span style={{ color: '#999' }}>]</span>
        </span>
      );
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
  
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    setShowDropdown(false);
    setShowValuesDropdown(false);
=======
    setAnnotations([]);
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
=======
    setShowDropdown(false);
    setShowValuesDropdown(false);
>>>>>>> 971587e (version textannotator a merge)
  };

  return (
    <div ref={containerRef}>
      <div className='entete-annot'>
<<<<<<< HEAD
<<<<<<< HEAD
        <h2>Créer un retour d'experience</h2>
=======
        <h1>Description de la métadonnée</h1>
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
        <h2>Créer un retour d'experience</h2>
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
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
        
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 971587e (version textannotator a merge)
        <div className="text-editor-container"  style={{
              width: '100%',
              maxWidth: '700px',
              margin: 0
            }}>
          
<<<<<<< HEAD
          <div
            ref={previewRef}
            className="text-preview"          
=======
        <div className="text-editor-container">
          {/* Prévisualisation avec annotations */}
          <div
            ref={previewRef}
            className="text-preview"
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
          <div
            ref={previewRef}
            className="text-preview"          
>>>>>>> 971587e (version textannotator a merge)
            onClick={() => textAreaRef.current.focus()}
          >
            {renderAnnotatedText()}
          </div>
          
<<<<<<< HEAD
<<<<<<< HEAD
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

=======
          {/* Textarea invisible pour la saisie */}
<<<<<<< HEAD
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
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======
=======
>>>>>>> 971587e (version textannotator a merge)
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
<<<<<<< HEAD
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
=======

>>>>>>> 971587e (version textannotator a merge)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
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
<<<<<<< HEAD

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
=======
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
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
=======

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
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
          </div>
        )}

        <div>
          <h2>Dataset Global</h2>
          <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
        </div>
<<<<<<< HEAD
      </div>
=======
>>>>>>> a5cb895 (push intermediaire, travail sur le #)
      </div>
   
  );
};

export default TextAnnotator;