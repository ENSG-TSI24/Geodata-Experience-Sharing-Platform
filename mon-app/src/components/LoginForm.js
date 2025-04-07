"use client"

import { useState, useEffect } from "react"
import { FiUser, FiHome, FiShield, FiInfo, FiLogIn, FiUserPlus } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function LoginForm({ onLogin }) {
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("editeur") // Default to editeur role now
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [organizations, setOrganizations] = useState([])
  const navigate = useNavigate()

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        console.log("Fetching organizations for login form...")
        const response = await fetch("/api/organizations/orgs")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("Organizations fetched successfully:", data)
        setOrganizations(data)
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      }
    }

    fetchOrganizations()
  }, [])

  // Validate form fields before submission
  const validate = () => {
    const newErrors = {}
    if (role !== "anonyme") {
      if (!nom.trim()) newErrors.nom = "Nom requis"
      if (!prenom.trim()) newErrors.prenom = "Prénom requis"
      if (!organization.trim()) newErrors.organization = "Organisation requise"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setLoginError("")

    try {
      // Combine nom and prenom for full_name
      const full_name = `${prenom} ${nom}`.trim()

      // For anonymous users, use default values
      const userData = {
        full_name: role === "anonyme" ? "Utilisateur Anonyme" : full_name,
        organization: role === "anonyme" ? "Non spécifié" : organization,
        fonction: role,
      }

      // If not anonymous, check if user exists in database
      if (role !== "anonyme") {
        const checkResponse = await fetch("/api/users/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: userData.full_name }),
        })

        const checkResult = await checkResponse.json()

        if (!checkResponse.ok) {
          throw new Error(checkResult.error || "Erreur serveur")
        }

        if (!checkResult.exists) {
          setLoginError("Utilisateur non trouvé. Veuillez vous inscrire d'abord.")
          setIsSubmitting(false)
          return
        }

        // Check if role matches
        if (checkResult.role !== userData.fonction) {
          setLoginError(`Rôle incorrect. Votre rôle est "${checkResult.role}".`)
          setIsSubmitting(false)
          return
        }
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
      setLoginError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterClick = () => {
    navigate("/register")
  }

  return (
    <div className="login-container">
      <div className="login-card slide-in">
        <div className="login-header">
          <div className="logo">📊</div>
          <h2>Smart Data Experiences' Sharing Platform</h2>
          <p>Connectez-vous pour accéder aux outils d'annotation</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`form-group ${errors.prenom ? "has-error" : ""}`}>
            <label htmlFor="prenom">
              <FiUser className="input-icon" />
              Prénom
              {role !== "anonyme" && <span className="required-field">*</span>}
            </label>
            <input
              id="prenom"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Votre prénom"
              aria-invalid={!!errors.prenom}
              disabled={role === "anonyme"}
              required={role !== "anonyme"}
              className="text-input"
            />
            {errors.prenom && <div className="error-message">{errors.prenom}</div>}
          </div>

          <div className={`form-group ${errors.nom ? "has-error" : ""}`}>
            <label htmlFor="nom">
              <FiUser className="input-icon" />
              Nom
              {role !== "anonyme" && <span className="required-field">*</span>}
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Votre nom"
              aria-invalid={!!errors.nom}
              disabled={role === "anonyme"}
              required={role !== "anonyme"}
              className="text-input"
            />
            {errors.nom && <div className="error-message">{errors.nom}</div>}
          </div>

          <div className={`form-group ${errors.organization ? "has-error" : ""}`}>
            <label htmlFor="organization">
              <FiHome className="input-icon" />
              Organisation
              {role !== "anonyme" && <span className="required-field">*</span>}
            </label>
            <select
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="select-input"
              disabled={role === "anonyme"}
              required={role !== "anonyme"}
            >
              <option value="">Sélectionnez une organisation</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.id}
                </option>
              ))}
            </select>
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

          {loginError && <div className="error-message">{loginError}</div>}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            <FiLogIn className="button-icon" />
            {isSubmitting ? "Connexion en cours..." : "Connexion"}
          </button>

          <div className="auth-links">
            <button type="button" className="link-button" onClick={handleRegisterClick}>
              <FiUserPlus className="button-icon" />
              Nouveau utilisateur ? Créer un compte
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm

