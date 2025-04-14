"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"
import "leaflet/dist/leaflet.css"
import AdminPanel from "./components/AdminPanel"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import OnboardingTutorial from "./components/OnboardingTutorial"
import AIChatbot from "./components/AIChatbot"


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [full_name, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("editeur") // Default to editeur role
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Ajoutez ces lignes au début de la fonction App pour vérifier si les routes sont correctement configurées
  useEffect(() => {
    // Vérifier si les routes API sont correctement configurées
    const checkApiRoutes = async () => {
      try {
        console.log("Vérification des routes API...")
        const response = await fetch("/api/organizations/list")
        console.log("Route /api/organizations/list:", response.status, response.ok ? "OK" : "NON OK")

        if (response.ok) {
          const data = await response.json()
          console.log("Données reçues:", data)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des routes API:", error)
      }
    }

    checkApiRoutes()
  }, [])

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

        // Check if this is the first login (for onboarding)
        const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")
        if (!hasSeenOnboarding) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error("Erreur de parsing des données utilisateur:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Update the handleLogin function to handle the split name fields
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

    // Check if this is the first login (for onboarding)
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setFullName("")
    setOrganization("")
    setRole("editeur")
  }

  const completeOnboarding = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    setShowOnboarding(false)
  }

  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>
  }

  return (
    <Router>
      <div className="app-container">
        {showOnboarding && isLoggedIn ? (
          <OnboardingTutorial userName={full_name} userRole={role} onComplete={completeOnboarding} />
        ) : (
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginForm onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                isLoggedIn ? (
                  <AdminPanel
                    full_name={full_name}
                    organization={organization}
                    fonction={role}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        )}
      </div>
      <AIChatbot />
    </Router>
  )
}

export default App

