import React, { useState } from 'react';

const TextAnnotator = () => {
  // Création d'un état pour stocker le texte actuellement tapé
  const [text, setText] = useState('');
  // Création d'un état pour stocker le titre du texte
  const [title, setTitle] = useState('');
  // Création d'un état pour stocker tous les textes publiés
  const [publishedTexts, setPublishedTexts] = useState([]);
  // Création d'un état pour gérer l'option sélectionnée dans le menu
  const [selectedOption, setSelectedOption] = useState('');
  // Création d'un état pour stocker la sélection de texte et son index
  const [selectionRange, setSelectionRange] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(null);

  // Dataset global (initialement vide)
  const [globalDataset, setGlobalDataset] = useState([]);

  // Liste des options pour le surlignage
  const options = ['adresse', 'date', 'problème', 'solution'];

  // Fonction pour gérer le changement dans le champ de texte
  const handleChange = (event) => {
    setText(event.target.value);
  };

  // Fonction pour publier un texte avec un titre
  const handlePublish = () => {
    if (text.trim() !== '' && title.trim() !== '') {
      // On ajoute l'élément au dataset global sans surligner automatiquement
      const newText = { Title: title, Proprietees: { description: text } };
      setGlobalDataset([...globalDataset, newText]);

      // Réinitialiser le texte et le titre après publication
      setText('');
      setTitle('');
      setPublishedTexts([...publishedTexts, newText]);
    }
  };

  // Fonction pour gérer la sélection de texte
  const handleTextSelection = (event, textIndex) => {
    const selectedText = window.getSelection();
    if (selectedText.rangeCount > 0) {
      setSelectionRange(selectedText.getRangeAt(0));
      setCurrentTextIndex(textIndex);
    }
  };

  // Fonction pour appliquer l'annotation au texte sélectionné
  const handleApplyAnnotation = () => {
    if (selectionRange && selectedOption && currentTextIndex !== null) {
      const selectedText = window.getSelection().toString();

      // On modifie l'élément dans globalDataset en ajoutant une annotation
      const updatedDataset = [...globalDataset];
      const textElement = updatedDataset[currentTextIndex];

      // Ajouter la nouvelle annotation au texte
      const newAnnotations = {
        ...textElement.Proprietees,
        [selectedOption]: selectedText,
      };

      // Mettre à jour l'élément dans le dataset global
      updatedDataset[currentTextIndex] = {
        ...textElement,
        Proprietees: newAnnotations,
      };

      setGlobalDataset(updatedDataset);
      setPublishedTexts(updatedDataset);

      // Réinitialiser l'annotation
      setSelectedOption('');
      setSelectionRange(null);
      setCurrentTextIndex(null);
    }
  };

  // Fonction pour gérer le changement dans le menu déroulant
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div>
      <h1>Text Annotator</h1>
      {/* Zone de texte pour entrer le contenu */}
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Tapez votre texte ici..."
        rows="5"
        cols="50"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Entrez le titre du texte"
      />
      <button onClick={handlePublish}>Publier</button>

      <div>
        <h2>Choisissez une étiquette :</h2>
        <select onChange={handleOptionChange} value={selectedOption}>
          <option value="">Sélectionner une étiquette</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button onClick={handleApplyAnnotation} disabled={!selectedOption || !selectionRange}>
          Appliquer l'annotation
        </button>
      </div>

      <div>
        <h2>Textes publiés :</h2>
        {publishedTexts.length > 0 ? (
          <ul>
            {publishedTexts.map((publishedText, textIndex) => (
              <li key={textIndex}>
                <h3>{publishedText.Title}</h3> {/* Affichage du titre */}
                <p onMouseUp={(e) => handleTextSelection(e, textIndex)}>
                  {publishedText.Proprietees.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun texte publié pour le moment.</p>
        )}
      </div>

      {/* Affichage du globalDataset */}
      <div>
        <h2>Dataset Global</h2>
        <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TextAnnotator;
