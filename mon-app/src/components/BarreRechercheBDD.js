"use client";

import { useState, useEffect } from "react";
import Commentaire from "./Commentaire";
import "./BarreRechercheBDD.css";

function BarreRechercheBDD(userFullName) {
  const [inputText, setInputText] = useState("");
  const [values, setValues] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("Title");
  const [properties, setProperties] = useState(["Title"]);
  const [selectedData, setSelectedData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [commentaires, setCommentaires] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showcomm, setshowcomm] = useState(false);
  const [selectedItemForComment, setSelectedItemForComment] = useState(null);

  // affiche la liste des propriétés pour séléction
  useEffect(() => {
    fetch("/api/listes/categories")
      .then((response) => response.json())
      .then((data) => {
        let categories = data.map((category) => category.id);
        categories.push("Title");
        setProperties(categories);
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des catégories:", error)
      );
  }, []);

  // retourne les valeurs associés à une propriété choisie
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
          const list = data.map((item) => item.id);
          setValues(list);
        })
        .catch((error) => {
          console.error("❌ Erreur de récupération des noeuds de la BDD:", error);
          setValues([]);
        });
    }
  }, [selectedProperty]);

  useEffect(() => {
    const fetchCommentaires = async () => {
      if (!selectedItem?.properties?.Title) return;
  
      try {
        const encodedTitle = encodeURIComponent(selectedItem.properties.Title);
        const response = await fetch(`/api/listes/comms/${encodedTitle}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des commentaires");
        const data = await response.json();
        setCommentaires(data);
      } catch (error) {
        console.error("Erreur de chargement des commentaires :", error);
        setCommentaires([]);
      }
    };
  
    fetchCommentaires();
  }, [selectedItem]);
  function filteredValues(values, word) {
    if (!word) return [];
    const wordLower = word.toLowerCase();
    return values.filter((item) => item && item.toLowerCase().includes(wordLower));
  }

  // Tape dans l'api pour retourner dynamiquement les titre associé à la recherche
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputText.length > 1) {
        setIsLoading(true);
        const filtered = filteredValues(values, inputText);

        const results = await Promise.all(
          filtered.map(async (item) => {
            try {
              const response = await fetch(`/api/listes/values/${selectedProperty}/${item}`);
              const data = await response.json();
        
              return data.map((node) => ({
                id: item,
                title: node?.id?.properties?.Title || item,
                properties: node?.id?.properties || {},
              }));
            } catch (err) {
              console.error(`Erreur lors de la récupération des titres pour "${item}":`, err);
              return [];
            }
          })
        );

        setSearchResults(results.flat());
        setIsLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText, values, selectedProperty]);

  // Tape dans l'api lorsque on voit les détails et affiche la donnée
  async function handleSearch(item) {
    try {
      setshowcomm(false);
      if (item.properties) {
        setSelectedItem(item);
        setSelectedData(item.properties);
      } else {
        const response = await fetch(`/api/listes/values/${selectedProperty}/${item}`);
        const data = await response.json();
        if (data[0]?.id?.properties) {
          setSelectedItem(data[0].id);
          setSelectedData(data[0].id.properties);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }
  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
                        ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
                        ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
    return color.slice(0, 7); // Retourne une couleur hex valide
  }

  const handleExport = (item) => {
    try {
      // Créer l'objet à exporter
      const dataToExport = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: userFullName,
          source: "Application de recherche"
        },
        data: {
          ...item.properties,
          title: item.properties?.Title || item.title || "Sans titre"
        }
      };
  
      // Convertir en JSON
      const jsonData = JSON.stringify(dataToExport, null, 2);
      
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${item.title || 'data'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  
      console.log('Export réussi:', dataToExport);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Une erreur est survenue lors de l\'export');
    }
  };
  

  async function Addcomment(item) {
    setSelectedItemForComment(item);
    setSelectedData(item.properties); 
    setshowcomm(true);
  }

  return (
    <div className="recherche-content">
      <div className="live-search-display p-4 max-w-4xl mx-auto">
        {/* Choix de la propriété */}
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
              setInputText("");
              setSearchResults([]);
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
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tapez ici (min. 3 caractères)..."
            className="text-input"
          />
          {isLoading && <p className="text-sm text-gray-500">Recherche en cours...</p>}
        </div>

     
        {!selectedItem && searchResults.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <h3>Résultats :</h3>
            <table>
              <thead className="bg-gray-50">
                <tr>
                  <th>Titre</th>
                  <th>Voir détails</th>
                  <th>Commenter</th>
                  <th>Exporter</th>
                  
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="px-4 py-3">
                      <span className="text-blue-600 font-medium">{item.title}</span>
                    </td>
                    <td>
                      <button onClick={() => handleSearch(item)} className="mode-toggle">
                        Voir détails
                      </button>
                      </td>
                      <td>
                      <button onClick={() => Addcomment(item)} className="button button-primary">
                        Commenter
                      </button>
                      </td>
                      <td>
                      <button  onClick={() => handleExport(item)} className="button button-secondary">Exporter</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Détails sélectionnés */}
        {selectedItem && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Détails pour :{" "}
                <span className="text-blue-600">
                  {selectedItem.properties?.Title || selectedItem.Title || selectedItem}
                </span>
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setSelectedData(null);
                }}
                className="mode-toggle"
              >
                Retour aux résultats
              </button>
            </div>

            {selectedData ? (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div>
                <h4 className="font-medium mb-2">Données complètes :</h4>
                <pre className="text-sm text-gray-800 overflow-x-auto">
                {selectedData && typeof selectedData === 'object' ? (
                <table className="table-auto w-full border border-gray-300 mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border text-left">Attribut</th>
                      <th className="px-4 py-2 border text-left">Valeur</th>
                      <th className="px-4 py-2 border text-right relative">
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button 
                        className="mode-toggle" 
                        onClick={() => setIsTableOpen(!isTableOpen)}
                       
                      >
                        {isTableOpen ? "Fermer" : "Ouvrir"}
                      </button>
                      </div>
                      </th>
                    </tr>
                  </thead>
                  {isTableOpen && (
                    <tbody>
                      {Object.entries(selectedData).map(([key, value], index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border font-medium"><strong>{key}</strong></td>
                          <td className="px-4 py-2 border">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </td>
                          <td className="px-4 py-2 border"></td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              ) : (
                <p className="text-gray-500">Aucune donnée disponible</p>
              )}
                </pre>
                </div>
                <div>
                <h4 className="font-medium mb-2">Commentaires :</h4>
                {commentaires.length > 0 ? (
                <ul>
                  {commentaires.map((comm, index) => (
                  <li key={index}>
                  <strong  style={{ color: stringToColor(comm.user) }}>{comm.user}</strong> - {comm.data}
                </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Aucun commentaire trouvé.</p>
              )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Chargement des données...</p>
            )}
          </div>
        )}

        
        {showcomm && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Commentaire pour :{" "}
                {selectedItemForComment?.properties?.Title || selectedItemForComment?.Title}
              </h3>
              <button onClick={() => setshowcomm(false)} className="mode-reinit">
                Fermer
              </button>
            </div>
            <Commentaire userFullName={userFullName} donnee={selectedItemForComment?.properties.Title} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BarreRechercheBDD;
