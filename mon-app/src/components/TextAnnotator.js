import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiLock,
  FiFilter,
  FiDownload,
  FiUpload,
  FiCopy,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const TextAnnotator = () => {
 
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [publishedTexts, setPublishedTexts] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(null);
  const [globalDataset, setGlobalDataset] = useState([]);

  
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAnnotation, setExpandedAnnotation] = useState(null);
  const fileInputRef = useRef(null);


  const options = ['adresse', 'date', 'problème', 'solution'];

 
  const categories = [
    { id: "Catégorie_Données", name: "Catégorie Données", color: "#3498db" },
    { id: "Zone_Localisation", name: "Zone Localisation", color: "#2ecc71" },
    { id: "Mode_Acquisition", name: "Mode Acquisition", color: "#e74c3c" },
    { id: "Résolution_Spatiale", name: "Résolution Spatiale", color: "#f39c12" },
    { id: "Solution_SIG", name: "Solution SIG", color: "#9b59b6" },
    { id: "Systeme_de_coordonnees", name: "Système coordonnées", color: "#1abc9c" },
    { id: "Format_Fichier", name: "Format Fichier", color: "#d35400" },
    { id: "Droits_usage", name: "Droits usage", color: "#34495e" },
    { id: "Date", name: "Date", color: "#16a085" },
    { id: "Source", name: "Source", color: "#c0392b" },
    { id: "Problème", name: "Problème", color: "#8e44ad" },
    { id: "Date_création", name: "Date création", color: "#27ae60" },
    { id: "Date_modification", name: "Date modification", color: "#e67e22" }
  ];
  
  useEffect(() => {
    const savedTexts = localStorage.getItem('publishedTexts');
    const savedDataset = localStorage.getItem('globalDataset');

    if (savedTexts) {
      try {
        setPublishedTexts(JSON.parse(savedTexts));
      } catch (error) {
        console.error("Failed to parse saved texts:", error);
      }
    }

    if (savedDataset) {
      try {
        setGlobalDataset(JSON.parse(savedDataset));
      } catch (error) {
        console.error("Failed to parse saved dataset:", error);
      }
    }
  }, []);

   
  useEffect(() => {
    localStorage.setItem('publishedTexts', JSON.stringify(publishedTexts));
    localStorage.setItem('globalDataset', JSON.stringify(globalDataset));
  }, [publishedTexts, globalDataset]);

  
  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handlePublish = () => {
    if (text.trim() !== '' && title.trim() !== '') {
      const newText = { Title: title, Proprietees: { description: text } };
      setGlobalDataset([...globalDataset, newText]);
      setText('');
      setTitle('');
      setPublishedTexts([...publishedTexts, newText]);
      showNotification("Texte publié avec succès", "success");
    }
  };

  const handleTextSelection = (event, textIndex) => {
    const selectedText = window.getSelection();
    if (selectedText.rangeCount > 0) {
      setSelectionRange(selectedText.getRangeAt(0));
      setCurrentTextIndex(textIndex);
    }
  };

  const handleApplyAnnotation = () => {
    if (selectionRange && selectedOption && currentTextIndex !== null) {
      const selectedText = window.getSelection().toString();

      const updatedDataset = [...globalDataset];
      const textElement = updatedDataset[currentTextIndex];

      const newAnnotations = {
        ...textElement.Proprietees,
        [selectedOption]: selectedText,
      };

      updatedDataset[currentTextIndex] = {
        ...textElement,
        Proprietees: newAnnotations,
      };

      setGlobalDataset(updatedDataset);
      setPublishedTexts(updatedDataset);
      setSelectedOption('');
      setSelectionRange(null);
      setCurrentTextIndex(null);
      showNotification("Annotation appliquée avec succès", "success");
    }
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const highlightAnnotatedText = (textContent, annotations) => {
    if (!annotations) return textContent;

    const highlightedText = [];
    let lastIndex = 0;

    Object.entries(annotations).forEach(([key, value], index) => {
      if (key === 'description') return;

      const pos = textContent.indexOf(value);
      if (pos !== -1 && pos >= lastIndex) {
        if (pos > lastIndex) {
          highlightedText.push(textContent.substring(lastIndex, pos));
        }

        const category = categories.find(c => c.id === key) || { color: '#ffeb3b' };

        highlightedText.push(
          <span
            key={index}
            className="highlighted-text"
            style={{
              backgroundColor: category.color + "80",
              borderBottom: `2px solid ${category.color}`,
            }}
            title={`${key}: ${value}`}
          >
            {value}
            {isPrivate && <FiLock className="private-icon" />}
          </span>
        );
        lastIndex = pos + value.length;
      }
    });

    if (lastIndex < textContent.length) {
      highlightedText.push(textContent.substring(lastIndex));
    }

    return highlightedText.length > 0 ? highlightedText : textContent;
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
          setPublishedTexts(importedData);
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

  return (
    <div className="text-annotator">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === "success" && <FiCheckCircle />}
          {notification.type === "error" && <FiAlertTriangle />}
          {notification.type === "info" && <FiInfo />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="notification-close">
            <FiX />
          </button>
        </div>
      )}

      <div className="text-input-section">
        <h1>Text Annotator</h1>
        
        <div className="input-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entrez le titre du texte"
            className="text-input"
          />
        </div>

        <div className="input-group">
          <textarea
            value={text}
            onChange={handleChange}
            placeholder="Tapez votre texte ici..."
            className="text-input text-area"
            rows="5"
          />
        </div>

        <button onClick={handlePublish} className="button button-primary" disabled={!text.trim() || !title.trim()}>
          <FiPlus className="button-icon" />
          <span>Publier</span>
        </button>
      </div>

      <div className="annotation-controls">
        <div className="input-group">
          <label htmlFor="annotation-category">Catégorie :</label>
          <select onChange={handleOptionChange} value={selectedOption} className="select-input">
          <option value="">Sélectionner une catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="annotation-private" className="checkbox-label">
            <input
              id="annotation-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>Privé</span>
          </label>
        </div>

        <button 
          onClick={handleApplyAnnotation} 
          className="button button-accent"
          disabled={!selectedOption || !selectionRange}
        >
          <FiSave className="button-icon" />
          <span>Appliquer l'annotation</span>
        </button>
      </div>

      {publishedTexts.length > 0 ? (
        <div className="text-display-container">
          <div className="section-header">
            <h3>Textes publiés</h3>
            <div className="section-actions">
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
          </div>

          <div className="search-container">
            <input
              type="search"
              placeholder="Rechercher dans les textes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="text-display">
            {publishedTexts
              .filter(text => 
                text.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                text.Proprietees.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((publishedText, textIndex) => (
                <div key={textIndex} className="text-item">
                  <h3>{publishedText.Title}</h3>
                  <p onMouseUp={(e) => handleTextSelection(e, textIndex)}>
                    {highlightAnnotatedText(
                      publishedText.Proprietees.description, 
                      publishedText.Proprietees
                    )}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>Aucun texte publié pour le moment.</p>
        </div>
      )}

      <div className="annotations-section">
        <div className="section-header">
          <h3>Dataset Global</h3>
        </div>
        <div className="dataset-preview">
          <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default TextAnnotator;