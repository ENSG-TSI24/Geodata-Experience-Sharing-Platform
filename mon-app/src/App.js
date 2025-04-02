"use client"

import { useState, useEffect } from "react"
import "./App.css"
import "leaflet/dist/leaflet.css"
import AdminPanel from "./components/AdminPanel"
import LoginForm from "./components/LoginForm"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [full_name, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("editeur") // Default to editeur role
  const [isLoading, setIsLoading] = useState(true)

  // Vérification de l'authentification au montage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setFullName(userData.full_name)
        setOrganization(userData.organization)
        setRole(userData.fonction || "editeur") // Default to editeur if not specified
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Erreur de parsing des données utilisateur:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (name, orga, userRole) => {
    // Sauvegarde dans localStorage
    const userData = {
      full_name: name,
      organization: orga,
      fonction: userRole,
    }
    localStorage.setItem("user", JSON.stringify(userData))

    setIsLoggedIn(true)
    setFullName(name)
    setOrganization(orga)
    setRole(userRole)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setFullName("")
    setOrganization("")
    setRole("editeur")
  }

  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>
  }

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <AdminPanel full_name={full_name} organization={organization} fonction={role} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App

