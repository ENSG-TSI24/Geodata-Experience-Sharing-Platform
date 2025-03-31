"use client"

import { useState } from "react"
import { FiUser, FiHome, FiLock } from "react-icons/fi"

function LoginForm({ onLogin }) {
  const [full_name, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("visiteur") // Default to visiteur
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})

  // Validate form fields before submission
  const validate = () => {
    const newErrors = {}
    if (!full_name.trim()) newErrors.full_name = "Nom complet requis"
    if (!organization.trim()) newErrors.organization = "Organisation requise"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      // Set a loading state
      setErrors({ ...errors, submit: null })
      let loginSuccessful = false

      try {
        // Try to connect to the backend first
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name,
            organization,
            fonction: role, // Use the selected role as fonction
          }),
        })

        if (response.ok) {
          const result = await response.json()
          loginSuccessful = true
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur serveur")
        }
      } catch (apiError) {
        console.warn("Backend connection failed, using fallback login:", apiError)

        // Fallback: If the API call fails, we'll still allow login but with a warning
        setErrors({
          fallback: "Connexion au serveur impossible. Mode hors ligne activé.",
        })

        // Small delay to show the message
        await new Promise((resolve) => setTimeout(resolve, 1000))
        loginSuccessful = true
      }

      if (loginSuccessful) {
        // Proceed with login
        onLogin(full_name, organization, role)

        if (rememberMe) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              full_name,
              organization,
              fonction: role,
            }),
          )
        }
      }
    } catch (error) {
      console.error("Échec login:", error)
      setErrors({ submit: error.message })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">📊</div>
          <h2>Smart Data Experiences' Sharing Platform</h2>
          <p>Connectez-vous pour accéder aux outils d'annotation</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`form-group ${errors.full_name ? "has-error" : ""}`}>
            <label htmlFor="full_name">
              <FiUser className="input-icon" />
              Nom complet
            </label>
            <input
              id="full_name"
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom et prénom"
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && <div className="error-message">{errors.full_name}</div>}
          </div>

          <div className={`form-group ${errors.organization ? "has-error" : ""}`}>
            <label htmlFor="organization">
              <FiHome className="input-icon" />
              Organisation
            </label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Votre organisation"
              aria-invalid={!!errors.organization}
            />
            {errors.organization && <div className="error-message">{errors.organization}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <FiLock className="input-icon" />
              Rôle
            </label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="select-input">
              <option value="admin">Admin</option>
              <option value="editeur">Éditeur</option>
              <option value="visiteur">Visiteur</option>
              <option value="anonyme">Anonyme</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="remember-me" className="checkbox-label">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Se souvenir de moi</span>
            </label>
          </div>

          {errors.fallback && (
            <div className="fallback-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-message">{errors.fallback}</div>
            </div>
          )}

          {errors.submit && <div className="form-error">{errors.submit}</div>}

          <button type="submit" className="login-button">
            Connexion
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm

