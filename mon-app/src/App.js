"use client"

import { useState, useEffect } from "react"
import "./App.css"

import "leaflet/dist/leaflet.css"
import AdminPanel from "./components/AdminPanel"
import LoginForm from "./components/LoginForm"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [organization, setOrganization] = useState("")
  const [fonction, setFonction] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Check for saved login info on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUsername(userData.username)
        setOrganization(userData.organization)
        setFonction(userData.fonction)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Failed to parse saved user data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (name, orga, job) => {
    // Save user data to localStorage
    const userData = { username: name, organization: orga, fonction: job }
    localStorage.setItem("user", JSON.stringify(userData))

    setIsLoggedIn(true)
    setUsername(name)
    setOrganization(orga)
    setFonction(job)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUsername("")
    setOrganization("")
    setFonction("")
  }

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <AdminPanel username={username} organization={organization} fonction={fonction} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App

