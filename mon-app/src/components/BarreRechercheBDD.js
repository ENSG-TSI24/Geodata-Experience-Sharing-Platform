"use client";

import { useState, useEffect } from "react";

function BarreRechercheBDD() {
  const [inputText, setInputText] = useState("");
  const [values, setValues] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("Title");
  const [properties, setProperties] = useState(["Title"]);
  
  const [selectedData, setSelectedData] = useState({});


  useEffect(() => {
  fetch('/api/listes/categories')
      .then(response => response.json())
        .then(data => {
          console.log("data" , data);
          
          let categories = data.map(category => category.id);
          categories.push("Title");   
          setProperties(categories);
      
    })
    .catch(error => console.error('Erreur lors de la récupération des catégories:', error));
  }, []);

  useEffect(() => {
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

        let list = [];
        

        
        data.forEach((item, index) => {
          
          list.push(item.id);
        });

        setValues(list);

      })
      .catch((error) => {
        console.error("❌ Erreur de récupération des noeuds de la BDD:", error);
        setValues([]);
      });
  }, [selectedProperty]);

  
  function filteredValues(values, word){
    let len_word = word.length;
    let list_filtered = [];
    let word_lower = word.toLowerCase();

    console.log(values)
    values.forEach(item => {
      if (item){
      let item_lower = item.toLowerCase();
      
      if (item_lower.substr(0,len_word) === word_lower){
      list_filtered.push(item);
      }}
    });
    console.log("dans la fonction : ", list_filtered);

    return list_filtered;
  }

  
  function handleChange(e){
      const value = e.target.value;
      setSelectedProperty(value);
      console.log("🔽 Propriété sélectionnée :", value);
    
  }

  async function handleClick(title) {
    console.log("🏷️ Titre sélectionné :", title);
    setInputText(title);
    fetch(`/api/listes/values/${selectedProperty}/${title}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            console.warn(`Données invalides reçues pour ${title}:`, data);
            return;
          }
          console.log(`Donnees reçues pour  ${title}:`, data[0].id.properties);
          if (data[0].id.properties){
          setSelectedData(data[0].id.properties);
          }
        })
        .catch(error => {
          console.error(`Erreur de récupération des valeurs pour ${title}:`, error);
          // Mettre une liste vide en cas d'erreur pour éviter le crash
        });
    }
  

  return (

    <div className="live-search-display">

<label htmlFor="property-select" className="block mb-2 font-medium">
        Choisir une propriété :
      </label>
      <select
        id="property-select"
        value={selectedProperty}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
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
          🏷️ Propriété sélectionnée : <strong>{selectedProperty}</strong>
        </p>
      )}
      <label htmlFor="live-search" className="block mb-2 font-medium text-lg">
        Rechercher :
      </label>
      <input
        id="live-search"
        type="text"
        value={inputText}
        onChange={(e) => {
          console.log("🖊️ Texte tapé :", e.target.value);
          setInputText(e.target.value);
          setFilteredList(filteredValues(values, e.target.value));
          console.log("dans le onchange", filteredList);
        }}
        placeholder="Tapez ici..."
        className="w-full p-2 border rounded-md mb-4"
      />

      {/* Liste des résultats */}
      {filteredList.length > 0 && (
        <ul className="border rounded-md shadow p-2 bg-white">
          {filteredList.map((item, index) => (
            <li
            key={index}
            onClick={() => handleClick(item)}

            className="py-1 px-2 hover:bg-blue-100 cursor-pointer"
          >
            {item}
          </li>
          ))}
        </ul>
      )}

      <p className="text-gray-700 whitespace-pre-wrap mt-4">
        <strong>Données reçues :</strong><br />
        {selectedData ? JSON.stringify(selectedData, null, 2) : "Aucune donnée sélectionnée"}
      </p>

    </div>
  );
}

export default BarreRechercheBDD;
