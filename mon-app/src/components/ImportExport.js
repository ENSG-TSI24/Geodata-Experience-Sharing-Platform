import React, { useState, useRef } from 'react';
import { FiDownload, FiUpload } from "react-icons/fi";

function ImportExport({ globalDataset, setGlobalDataset, onImportData }) {
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
                console.log("Original file content:", event.target.result); // Log original file content
                const importedData = JSON.parse(event.target.result);
                console.log("Parsed data:", importedData); // Log parsed data
                
                if (Array.isArray(importedData) && importedData.length > 0) {
                    setGlobalDataset(importedData);
                    showNotification("Data imported successfully", "success");
                    
                    const firstItem = importedData[0];
                    console.log("First item data:", firstItem); // Log first item data
                    
                    if (onImportData && firstItem.Title && firstItem.Proprietees) {
                        onImportData({
                            title: firstItem.Title,
                            text: firstItem.Proprietees.description || ""
                        });
                    } else {
                        console.error("Data structure is not as expected:", firstItem);
                        showNotification("Data structure is incorrect", "error");
                    }
                } else {
                    console.error("Imported data is not an array or the array is empty");
                    showNotification("Imported data format is incorrect", "error");
                }
            } catch (error) {
                console.error("Import parsing error:", error);
                showNotification("File parsing failed", "error");
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
            
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default ImportExport;