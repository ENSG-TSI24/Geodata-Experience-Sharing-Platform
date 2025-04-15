"use client";

import { useState } from "react";
import "./Commentaire.css";
function Commentaire({ userFullName, donnee }) {
  const [storageStatus, setStorageStatus] = useState({ 
    loading: false, 
    error: null, 
    success: false 
  });
  const [commentText, setCommentText] = useState("");

  const handleStoreComment = async (textData) => {
    console.log("texte : ",textData)
    console.log("user : ",userFullName.userFullName)
    console.log("donnee : ",donnee)
    try {

      setStorageStatus({ loading: true, error: null, success: false });
      
      const response = await fetch('/api/solutions/addcommentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solution: textData, 
          userFullName: userFullName.userFullName,
          donnee: donnee 
        })
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Erreur HTTP: ${response.status}`);
      }
      
      setStorageStatus({ loading: false, error: null, success: true });
      setCommentText("");
      setTimeout(() => setStorageStatus({ loading: false, error: null, success: false }), 3000);
      return result;
    } catch (error) {
      setStorageStatus({ loading: false, error: error.message, success: false });
      throw error;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      handleStoreComment(commentText);
    }
  };

  return (
    <div className="ajout-commentaire">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="text-input"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Écrivez votre commentaire ici..."
        />
        <button
          type="submit"
          disabled={storageStatus.loading || !commentText.trim()}
          className={`mode-toggle ${storageStatus.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {storageStatus.loading ? "Envoi en cours..." : "Envoyer"}
        </button>
      </form>

      {storageStatus.error && (
        <p className="mt-2 text-red-500">{storageStatus.error}</p>
      )}
      {storageStatus.success && (
        <p className="mt-2 text-green-500">Commentaire envoyé avec succès!</p>
      )}
    </div>
  );
}

export default Commentaire;