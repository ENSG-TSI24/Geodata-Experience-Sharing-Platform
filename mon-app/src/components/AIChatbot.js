"use client"

import { useState } from "react"
import "./AIChatbot.css"
import { FiMessageSquare, FiX, FiEdit3, FiSearch, FiCheckCircle } from "react-icons/fi"

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState("metadata")
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  const toggleChat = () => setIsOpen(!isOpen)

  const handleOptionChange = (option) => {
    setSelectedOption(option)
    addMessage("user", `🧭 Mode sélectionné : ${getLabel(option)}`)
  }

  const getLabel = (option) => {
    switch (option) {
      case "metadata":
        return "Saisie de métadonnées"
      case "search":
        return "Recherche de données"
      case "correction":
        return "Vérification / Correction"
      default:
        return ""
    }
  }

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }])
  }

  const handleSend = () => {
    if (!input.trim()) return
    addMessage("user", input)
    addMessage("bot", `🔍 Traitement (${getLabel(selectedOption)})...`) // Simulé pour le moment
    setInput("")
  }

  return (
    <>
      <div className="chatbot-icon" onClick={toggleChat}>
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </div>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h4>🤖 Assistant IA</h4>
            <div className="mode-selector">
              <button className={selectedOption === "metadata" ? "selected" : ""} onClick={() => handleOptionChange("metadata")}>
                <FiEdit3 /> Métadonnées
              </button>
              <button className={selectedOption === "search" ? "selected" : ""} onClick={() => handleOptionChange("search")}>
                <FiSearch /> Recherche
              </button>
              <button className={selectedOption === "correction" ? "selected" : ""} onClick={() => handleOptionChange("correction")}>
                <FiCheckCircle /> Vérification
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.sender}`}>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrivez votre message ici..."
            />
            <button onClick={handleSend}>Envoyer</button>
          </div>
        </div>
      )}
    </>
  )
}

export default AIChatbot
