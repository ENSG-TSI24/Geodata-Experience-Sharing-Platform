"use client"

import React, { useState, useEffect } from "react"
import "./AIChatbot.css"
import { FiMessageSquare, FiX, FiEdit3, FiSearch, FiCheckCircle } from "react-icons/fi"

const AIChatbot = ({ full_name, organization }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [mode, setMode] = useState(null)
  const toggleChat = () => setIsOpen(!isOpen)

  useEffect(() => {
    // Message d'accueil à l'ouverture
    setMessages([
      {
        from: "bot",
        text: `Bonjour ! Je suis votre assistant - chatbot IA - pour l’analyse et la valorisation de vos retours d’expérience géographiques.
Je suis disponible 24h/24, 7j/7.
Avant de commencer, votre demande concerne :`,
      },
    ])
  }, [])

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode)

    let modeResponse = ""
    if (selectedMode === "metadata") {
      modeResponse = `Merci pour votre choix !
Vous avez sélectionné **<FiEdit3 /> Saisie de métadonnées**.

Ce mode vous permet de publier un retour d’expérience sur une donnée géographique que vous avez manipulée. Votre retour sera ajouté à la base sous votre nom (${full_name}) et votre organisation (${organization}).

Rédigez dès maintenant votre retour d’expérience. Décrivez bien la donnée concernée, son contexte, et tout élément utile.`
    } else if (selectedMode === "search") {
      modeResponse = `Merci pour votre choix !
Vous avez sélectionné **<FiSearch /> Recherche de données**.

Ce mode vous permet d’interroger la base de données à graphes existante.

Je peux par exemple :
- Donner des statistiques (ex : combien de données avec une propriété donnée)
- Lister les noms des données répondant aux critères que vous cherchez
- Explorer des retours d'expérience sur des données similaires dans une zone
- Trouver les données créées à partir d’une date dans une zone donnée. 

Posez-moi votre question !`
    } else if (selectedMode === "check") {
      modeResponse = `Merci pour votre choix !
Vous avez sélectionné **Vérification / Correction**.

Ce mode vous permet de vérifier la cohérence de votre retour d’expérience :
- Lieu cohérent ?
- Nom d’organisation correct ? (ex : ignn vs IGN)
- Retour clair et exploitable ?

Envoyez-moi votre texte et je vous aiderai à le corriger si besoin.`
    }
    setMessages((prev) => [...prev, { from: "bot", text: modeResponse }])
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { from: "user", text: input }
    setMessages((prev) => [...prev, userMessage])

    if (!mode) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Je suis ravi de t’aider, mais merci de sélectionner d’abord un mode parmi les 3 modes en haut." },
      ])
    } else {
      // to change here whether data well created or here are the data you were looking for
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Merci pour votre message. (Réponse intelligente à implémenter ici...)" },
      ])
    }

    setInput("")
  }

  return (
    <>
      <div className="chatbot-icon" onClick={toggleChat}>
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </div>
      {isOpen && (
    <div className="chatbot-container">
      <div className="chatbot-header">
      <h4>Votre Assistant IA</h4>
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
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          placeholder="Écrivez votre message ici..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Envoyer</button>
      </div>
    </div>
   )}
   </>
 )
}

export default AIChatbot