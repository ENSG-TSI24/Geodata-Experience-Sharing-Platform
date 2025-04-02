"use client"

import { useState } from "react"
import { FiArrowUp, FiInfo, FiSend } from "react-icons/fi"

function PermissionRequestForm({ currentRole, full_name, onRequestSent }) {
  const [requestedRole, setRequestedRole] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Determine available roles based on current role
  const getAvailableRoles = () => {
    switch (currentRole) {
      case "anonyme":
        return [{ value: "editeur", label: "Éditeur" }]
      case "editeur":
        return [{ value: "admin", label: "Admin" }]
      default:
        return []
    }
  }

  const availableRoles = getAvailableRoles()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!requestedRole || !reason.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/users/request-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name,
          currentRole,
          requestedRole,
          reason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'envoi de la demande")
      }

      setSuccess(true)
      setReason("")
      setRequestedRole("")
      if (onRequestSent) onRequestSent()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't show the form for admins or if there are no available roles
  if (currentRole === "admin" || availableRoles.length === 0) {
    return (
      <div className="permission-info">
        <FiInfo className="info-icon" />
        {currentRole === "admin" ? (
          <p>En tant qu'administrateur, vous disposez déjà des privilèges maximaux.</p>
        ) : (
          <p>Aucune demande de permission n'est disponible pour votre rôle actuel.</p>
        )}
      </div>
    )
  }

  return (
    <div className="permission-request-form">
      <h3>
        <FiArrowUp className="icon" /> Demande d'élévation de privilèges
      </h3>

      {success ? (
        <div className="success-message">
          <p>Votre demande a été envoyée avec succès et est en attente d'approbation.</p>
          <button className="button button-secondary" onClick={() => setSuccess(false)}>
            Faire une autre demande
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="current-role">Rôle actuel</label>
            <input
              id="current-role"
              type="text"
              value={currentRole === "admin" ? "Admin" : currentRole === "editeur" ? "Éditeur" : "Anonyme"}
              disabled
              className="text-input disabled"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requested-role">Rôle demandé</label>
            <select
              id="requested-role"
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              className="select-input"
              required
            >
              <option value="">Sélectionnez un rôle</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="request-reason">Motif de la demande</label>
            <textarea
              id="request-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi vous avez besoin de ce niveau d'accès..."
              rows="4"
              className="text-input"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            <FiSend className="button-icon" />
            <span>{isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}</span>
          </button>
        </form>
      )}
    </div>
  )
}

export default PermissionRequestForm

