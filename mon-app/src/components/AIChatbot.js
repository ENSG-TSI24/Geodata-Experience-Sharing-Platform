"use client"

import React, { useState, useEffect, useRef } from "react"
import "./AIChatbot.css"
import { FiMessageSquare, FiX, FiEdit3, FiSearch, FiCheckCircle } from "react-icons/fi"

const AIChatbot = ({ full_name, organization }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [mode, setMode] = useState(null)
  const MAX_WORDS = 500;
  const [wordCount, setWordCount] = useState(0);
  const messagesEndRef = useRef(null)
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const toggleChat = () => setIsOpen(!isOpen)

  useEffect(() => {
    // Message d'accueil à l'ouverture
    setMessages([
      {
        from: "bot",
        text: `Bonjour ! Je suis votre assistant - chatbot IA. J'interviens pour vous aider à publier, analyser vos retours d’expérience géographiques, mais également de parcourir d'autres métadonnées rédigés par d'autres utilisateurs de différents organismes.

Je suis disponible 24h/24, 7j/7. 

Avant de commencer , veuillez sélectionner l’une des trois opérations ci-dessus :)`,
      },
    ])
  }, [full_name])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Effect to handle session ID generation
  // This will generate a new session ID whenever the mode changes
  useEffect(() => {
    if (mode) {
      const newSessionId = `${full_name}-${mode}-${Date.now()}`;
      setCurrentSessionId(newSessionId);
    }
  }, [mode, full_name]);
  
  // Comptage de mots
  useEffect(() => {
    const words = input.trim() ? input.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [input])

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode)

    let modeResponse = ""
    if (selectedMode === "metadata") {
      modeResponse = `Merci pour votre choix !
Vous avez sélectionné: Saisie de métadonnées.

Ce mode vous permet de publier un retour d’expérience sur une donnée géographique que vous avez manipulée. Votre retour sera ajouté à la base sous votre nom (${full_name}) et votre organisation (${organization}).

Rédigez dès maintenant votre retour d’expérience. Décrivez bien la donnée concernée, son contexte, et tout élément utile.`
    } else if (selectedMode === "search") {
      modeResponse = `Merci pour votre choix !
Vous avez sélectionné: Recherche de données.

Ce mode vous permet d’interroger la base de données à graphes existante.

Je peux par exemple :
- Donner des statistiques (ex : combien de données avec une propriété donnée)
- Lister les noms des données répondant aux critères que vous cherchez
- Explorer des retours d'expérience sur des données similaires dans une zone
- Trouver les données créées à partir d’une date dans une zone donnée. 

Posez-moi votre question !`
    } else if (selectedMode === "check") {
      modeResponse = `Merci pour votre choix !
Vous avez sélectionné: Vérification / Correction.

Ce mode vous permet de vérifier la cohérence de votre retour d’expérience :
- Lieu cohérent ?
- Nom d’organisation correct ? (ex : ignn vs IGN)
- Retour clair et exploitable ?

Envoyez-moi votre texte et je vous aiderai à le corriger si besoin.`
    }
    setMessages((prev) => [...prev, { from: "bot", text: modeResponse }])
  }

  const handleSend = async () => {
    if (!input.trim()) return ;

    if (wordCount > MAX_WORDS) {
      setMessages(prev => [...prev, {
        from: "bot",
        text: `Votre message dépasse la limite de ${MAX_WORDS} mots. Veuillez le raccourcir.`
      }]) ;
      return ;
    }

    const userMessage = { from: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    if (!mode) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Je suis ravi de t’aider, mais merci de sélectionner d’abord un mode parmi les 3 modes en haut." },
      ])
      
    } else if (mode === "metadata") {
      try {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Je traite votre retour d'expérience..." },
        ]);

        const response = await fetch('/api/llm/process-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: input,
            userId: full_name,
            full_name
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            { 
              from: "bot", 
              text: `Merci ! Votre retour "${result.data.Title}" a été enregistré avec succès. 
                     Vous pouvez continuer à ajouter des détails ou passer à un autre mode.`
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { 
              from: "bot", 
              text: `Désolé, je n'ai pas pu traiter votre demande: ${result.message} 
                     Pouvez-vous reformuler votre retour d'expérience ?`
            },
          ]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { 
            from: "bot", 
            text: "Une erreur est survenue. Veuillez vérifier que votre description est complète et réessayer."
          },
        ]);
      }
    }
    // ... (autres modes à implémenter)

    setInput("");
  };

  return (
    <>
      <div className="chatbot-icon" onClick={toggleChat}>
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </div>
      {isOpen && (
    <div className="chatbot-container">
      <div className="chatbot-header">
      <h4>🤖 Votre Assistant IA 🤖</h4>
        <button onClick={() => handleModeSelection("metadata")}><FiEdit3 />Saisie de métadonnées</button>
        <button onClick={() => handleModeSelection("search")}><FiSearch /> Recherche de données</button>
        <button onClick={() => handleModeSelection("check")}><FiCheckCircle />Vérification / Correction</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
  <div className="chatbot-input-row">
    <input
      type="text"
      value={input}
      placeholder={
        mode === "metadata" ? "Décrivez votre retour d'expérience..." :
        mode === "search" ? "Posez votre question de recherche..." :
        "Saisissez le texte à vérifier..."
      }
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
    />
    <button onClick={handleSend}>Envoyer</button>
  </div>
  <div className="word-counter">
  {wordCount} / {MAX_WORDS} mots
  {wordCount > MAX_WORDS && (
    <span className="limit-exceeded"> - Limite dépassée</span>
  )}
</div>
</div>



    </div>
   )}
   </>
 )
}

export default AIChatbot