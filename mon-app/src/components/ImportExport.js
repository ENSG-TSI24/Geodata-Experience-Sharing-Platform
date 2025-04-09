import React, { useState, useRef, useEffect } from 'react';
import { FiArrowDownCircle, FiDownload, FiUpload } from "react-icons/fi";

function ImportExport (globalDataset,setGlobalDataset) {
    const [notification, setNotification] = useState(null);
    const fileInputRef = useRef(null);
    const showNotification = (message, type = "info") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
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
  return (
    <div>
                 <button
          className="button button-sm button-secondary"
          onClick={exportAnnotations}
          title="Exporter les annotations"
      >
          <FiDownload className="button-icon" />
          <span>Exporter</span>
      </button><input
              type="file"
              accept=".json"
              onChange={importAnnotations}
              ref={fileInputRef}
              style={{ display: "none" }} /><button
                  className="button button-sm button-secondary"
                  onClick={() => fileInputRef.current.click()}
                  title="Importer des annotations"
              >
              <FiUpload className="button-icon" />
              <span>Importer</span>
          </button>
          </div>
  );
};

export default ImportExport