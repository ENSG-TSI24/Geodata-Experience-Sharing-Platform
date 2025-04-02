"use client"

import { useState } from "react"
import { FiUser, FiHome, FiShield, FiInfo } from "react-icons/fi"

function LoginForm({ onLogin }) {
  const [full_name, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("editeur") // Default to editeur role now
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})

  // Validate form fields before submission
  const validate = () => {
    const newErrors = {}
    if (role !== "anonyme") {
      if (!full_name.trim()) newErrors.full_name = "Nom complet requis"
      if (!organization.trim()) newErrors.organization = "Organisation requise"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      // For anonymous users, use default values
      const userData = {
        full_name: role === "anonyme" ? "Utilisateur Anonyme" : full_name,
        organization: role === "anonyme" ? "Non spécifié" : organization,
        fonction: role,
      }

      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur serveur")
      }

      const result = await response.json()
      onLogin(userData.full_name, userData.organization, role)

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData))
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
              {role !== "anonyme" && <span className="required-field">*</span>}
            </label>
            <input
              id="full_name"
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom et prénom"
              aria-invalid={!!errors.full_name}
              disabled={role === "anonyme"}
              required={role !== "anonyme"}
            />
            {errors.full_name && <div className="error-message">{errors.full_name}</div>}
          </div>

          <div className={`form-group ${errors.organization ? "has-error" : ""}`}>
            <label htmlFor="organization">
              <FiHome className="input-icon" />
              Organisation
              {role !== "anonyme" && <span className="required-field">*</span>}
            </label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Votre organisation"
              aria-invalid={!!errors.organization}
              disabled={role === "anonyme"}
              required={role !== "anonyme"}
            />
            {errors.organization && <div className="error-message">{errors.organization}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <FiShield className="input-icon" />
              Rôle
            </label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="select-input">
              <option value="editeur">Éditeur</option>
              <option value="admin">Admin</option>
              <option value="anonyme">Anonyme</option>
            </select>
            <div className="role-info">
              <FiInfo className="info-icon" />
              <small>
                {role === "admin" && "Accès complet à toutes les fonctionnalités"}
                {role === "editeur" && "Peut créer et modifier, mais pas supprimer"}
                {role === "anonyme" && "Accès limité aux données agrégées"}
              </small>
            </div>
          </div>

          {role === "anonyme" && (
            <div className="anonymous-note">
              <FiInfo className="info-icon" />
              <p>En mode anonyme, vous aurez un accès limité aux données agrégées uniquement.</p>
            </div>
          )}

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

