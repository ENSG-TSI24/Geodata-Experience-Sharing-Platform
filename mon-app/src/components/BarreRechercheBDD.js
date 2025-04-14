"use client";

import { useState, useEffect } from "react";

function BarreRechercheBDD() {
  const [inputText, setInputText] = useState("");
  const [values, setValues] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("Title");
  const [properties, setProperties] = useState(["Title"]);
  const [selectedData, setSelectedData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetch('/api/listes/categories')
      .then(response => response.json())
      .then(data => {
        let categories = data.map(category => category.id);
        categories.push("Title");   
        setProperties(categories);
      })
      .catch(error => console.error('Erreur lors de la récupération des catégories:', error));
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetch(`/api/listes/values/${selectedProperty}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            console.warn(`⚠️ Données invalides reçues pour ${selectedProperty} :`, data);
            setValues([]);
            return;
          }

          const list = data.map(item => item.id);
          setValues(list);
        })
        .catch((error) => {
          console.error("❌ Erreur de récupération des noeuds de la BDD:", error);
          setValues([]);
        });
    }
  }, [selectedProperty]);

  function filteredValues(values, word) {
    if (!word) return [];
    
    const wordLower = word.toLowerCase();
    return values.filter(item => 
      item && item.toLowerCase().includes(wordLower)
    );
  }

  async function handleSearch(title) {
    console.log("🏷️ Titre sélectionné :", title);
    setInputText(title);
    setSelectedItem(title);
    
    try {
      const response = await fetch(`/api/listes/values/${selectedProperty}/${title}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn(`Données invalides reçues pour ${title}:`, data);
        return;
      }
      
      if (data[0]?.id?.properties) {
        setSelectedData(data[0].id.properties);
      } else {
        setSelectedData(null);
      }
    } catch (error) {
      console.error(`Erreur de récupération des valeurs pour ${title}:`, error);
      setSelectedData(null);
    }
  }

  return (
    <div className="recherche-content">
    <div className="live-search-display p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <label htmlFor="property-select" className="block mb-2 font-medium text-gray-700">
          Choisir une propriété :
        </label>
        <select
          id="select-input"
          value={selectedProperty}
          onChange={(e) => {
            setSelectedProperty(e.target.value);
            setSelectedItem(null);
            setSelectedData(null);
          }}
          className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Sélectionnez une propriété --</option>
          {properties.map((prop, index) => (
            <option key={index} value={prop}>
              {prop}
            </option>
          ))}
        </select>

        {selectedProperty && (
          <p className="mt-2 text-blue-600">
            Propriété sélectionnée : <strong>{selectedProperty}</strong>
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="live-search" className="block mb-2 font-medium text-gray-700">
          Rechercher :
        </label>
        <input
          id="live-search"
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setFilteredList(filteredValues(values, e.target.value));
            setSelectedItem(null);
            setSelectedData(null);
          }}
          placeholder="Tapez ici..."
          className="text-input"
        />
      </div>

      {/* Liste des résultats */}
      {!selectedItem && filteredList.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Résultats :</h3>
          <ul className="border border-gray-200 rounded-md shadow divide-y divide-gray-200">
            {filteredList.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSearch(item)}
                className="py-3 px-4 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    {item}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Affichage des données sélectionnées */}
      {selectedItem && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              Données pour : <span className="text-blue-600">{selectedItem}</span>
            </h3>
            <button
              onClick={() => {
                setSelectedItem(null);
                setSelectedData(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Retour à la liste
            </button>
          </div>

          {selectedData ? (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(selectedData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">Aucune donnée disponible pour cet élément.</p>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

export default BarreRechercheBDD;