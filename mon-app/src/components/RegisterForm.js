"use client"

import { useState, useEffect } from "react"
import { FiUser, FiHome, FiShield, FiInfo, FiUserPlus, FiArrowLeft, FiCheck, FiPlus } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function RegisterForm() {
  const [step, setStep] = useState(1)
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [newOrganization, setNewOrganization] = useState("")
  const [role, setRole] = useState("editeur")
  const [reason, setReason] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [createNewOrg, setCreateNewOrg] = useState(false)
  const navigate = useNavigate()

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        console.log("Fetching organizations...")
        const response = await fetch("/api/organizations/list")
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

  // Validate form fields for each step
  const validateStep = (currentStep) => {
    const newErrors = {}

    if (currentStep === 1) {
      if (!nom.trim()) newErrors.nom = "Nom requis"
      if (!prenom.trim()) newErrors.prenom = "Prénom requis"
      if (!email.trim()) newErrors.email = "Email requis"
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide"
    } else if (currentStep === 2) {
      if (createNewOrg) {
        if (!newOrganization.trim()) newErrors.newOrganization = "Nom de l'organisation requis"
      } else {
        if (!organization) newErrors.organization = "Sélection d'une organisation requise"
      }
    } else if (currentStep === 3) {
      if (role === "admin" && !reason.trim()) {
        newErrors.reason = "Veuillez expliquer pourquoi vous avez besoin des privilèges d'administrateur"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step button click
  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  // Handle back button click
  const handleBackStep = () => {
    setStep(step - 1)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setIsSubmitting(true)

    try {
      // Combine nom and prenom for full_name
      const full_name = `${prenom} ${nom}`.trim()

      // Prepare registration data
      const registrationData = {
        full_name,
        nom,
        prenom,
        email,
        organization: createNewOrg ? newOrganization : organization,
        isNewOrganization: createNewOrg,
        role,
        reason: role === "admin" ? reason : "",
      }

      // Send registration request
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'inscription")
      }

      // Registration successful
      setRegistrationSuccess(true)

      // If admin role was requested, show success message but don't auto-redirect
      if (role !== "admin") {
        // Auto-redirect to login after 3 seconds for non-admin registrations
        setTimeout(() => {
          navigate("/")
        }, 3000)
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render registration success message
  if (registrationSuccess) {
    return (
      <div className="login-container">
        <div className="login-card slide-in">
          <div className="login-header">
            <div className="logo success-logo">✓</div>
            <h2>Inscription Réussie!</h2>
            {role === "admin" ? (
              <p>
                Votre demande d'accès administrateur a été soumise et est en attente d'approbation. Vous recevrez une
                notification lorsque votre demande sera approuvée et pourrez alors vous connecter.
              </p>
            ) : (
              <p>Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.</p>
            )}
          </div>
          <div className="login-form">
            <div className="registration-success">
              <FiCheck className="success-icon" />
              <div className="success-details">
                <p>
                  <strong>Nom:</strong> {nom}
                </p>
                <p>
                  <strong>Prénom:</strong> {prenom}
                </p>
                <p>
                  <strong>Organisation:</strong> {createNewOrg ? newOrganization : organization}
                </p>
                <p>
                  <strong>Rôle:</strong> {role === "admin" ? "Admin (en attente)" : "Éditeur"}
                </p>
              </div>
            </div>
            <button type="button" className="login-button" onClick={() => navigate("/")}>
              <FiArrowLeft className="button-icon" />
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card slide-in">
        <div className="login-header">
          <div className="logo">📊</div>
          <h2>Créer un compte</h2>
          <p>Rejoignez la plateforme d'annotation de données</p>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="form-step">
              <h3 className="step-title">Informations de base</h3>

              <div className={`form-group ${errors.prenom ? "has-error" : ""}`}>
                <label htmlFor="prenom">
                  <FiUser className="input-icon" />
                  Prénom
                  <span className="required-field">*</span>
                </label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  className="text-input"
                  required
                />
                {errors.prenom && <div className="error-message">{errors.prenom}</div>}
              </div>

              <div className={`form-group ${errors.nom ? "has-error" : ""}`}>
                <label htmlFor="nom">
                  <FiUser className="input-icon" />
                  Nom
                  <span className="required-field">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  className="text-input"
                  required
                />
                {errors.nom && <div className="error-message">{errors.nom}</div>}
              </div>

              <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="email">
                  <FiUser className="input-icon" />
                  Email
                  <span className="required-field">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="text-input"
                  required
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={() => navigate("/")}>
                  <FiArrowLeft className="button-icon" />
                  Retour
                </button>
                <button type="button" className="button button-primary" onClick={handleNextStep}>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Organization */}
          {step === 2 && (
            <div className="form-step">
              <h3 className="step-title">Votre Organisation</h3>

              {!createNewOrg ? (
                <div className={`form-group ${errors.organization ? "has-error" : ""}`}>
                  <label htmlFor="organization">
                    <FiHome className="input-icon" />
                    Organisation
                    <span className="required-field">*</span>
                  </label>
                  <select
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="select-input"
                    required
                  >
                    <option value="">Sélectionnez une organisation</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  {errors.organization && <div className="error-message">{errors.organization}</div>}

                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => setCreateNewOrg(true)}
                  >
                    <FiPlus className="button-icon" />
                    Créer une nouvelle organisation
                  </button>
                </div>
              ) : (
                <div className={`form-group ${errors.newOrganization ? "has-error" : ""}`}>
                  <label htmlFor="new-organization">
                    <FiHome className="input-icon" />
                    Nom de la nouvelle organisation
                    <span className="required-field">*</span>
                  </label>
                  <input
                    id="new-organization"
                    type="text"
                    value={newOrganization}
                    onChange={(e) => setNewOrganization(e.target.value)}
                    placeholder="Nom de votre organisation"
                    className="text-input"
                    required
                  />
                  {errors.newOrganization && <div className="error-message">{errors.newOrganization}</div>}

                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => setCreateNewOrg(false)}
                  >
                    <FiArrowLeft className="button-icon" />
                    Revenir à la sélection
                  </button>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={handleBackStep}>
                  <FiArrowLeft className="button-icon" />
                  Retour
                </button>
                <button type="button" className="button button-primary" onClick={handleNextStep}>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Role and Permissions */}
          {step === 3 && (
            <div className="form-step">
              <h3 className="step-title">Rôle et Permissions</h3>

              <div className="form-group">
                <label htmlFor="role">
                  <FiShield className="input-icon" />
                  Rôle souhaité
                </label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="select-input">
                  <option value="editeur">Éditeur</option>
                  <option value="admin">Administrateur</option>
                </select>
                <div className="role-info">
                  <FiInfo className="info-icon" />
                  <small>
                    {role === "admin"
                      ? "Accès complet à toutes les fonctionnalités. Nécessite l'approbation d'un administrateur existant avant de pouvoir se connecter."
                      : "Peut créer et modifier, mais pas supprimer. Accès immédiat après inscription."}
                  </small>
                </div>
              </div>

              {role === "admin" && (
                <div className={`form-group ${errors.reason ? "has-error" : ""}`}>
                  <label htmlFor="reason">
                    <FiInfo className="input-icon" />
                    Raison de la demande d'accès administrateur
                    <span className="required-field">*</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Expliquez pourquoi vous avez besoin des privilèges d'administrateur..."
                    className="text-input"
                    rows={4}
                    required
                  />
                  {errors.reason && <div className="error-message">{errors.reason}</div>}

                  <div className="admin-request-note">
                    <FiInfo className="info-icon" />
                    <p>
                      Les demandes d'accès administrateur sont soumises à l'approbation d'un administrateur existant.
                      Vous ne pourrez pas vous connecter tant que votre demande n'aura pas été approuvée. Vous recevrez
                      une notification lorsque votre demande aura été traitée.
                    </p>
                  </div>
                </div>
              )}

              {errors.submit && <div className="error-message">{errors.submit}</div>}

              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={handleBackStep}>
                  <FiArrowLeft className="button-icon" />
                  Retour
                </button>
                <button type="submit" className="button button-primary" disabled={isSubmitting}>
                  <FiUserPlus className="button-icon" />
                  {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default RegisterForm

