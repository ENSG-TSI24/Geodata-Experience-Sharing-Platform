"use client"

import { useState, useEffect } from "react"
import { FiCheck, FiX, FiAlertTriangle, FiRefreshCw } from "react-icons/fi"
import PermissionRequestForm from "./PermissionRequestForm"

function UserPermissions({ full_name, fonction, isAdmin }) {
  const [permissionRequests, setPermissionRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch permission requests from the backend
  useEffect(() => {
    const fetchPermissionRequests = async () => {
      setLoading(true)
      setError(null)

      try {
        // If admin, fetch all requests, otherwise fetch only user's requests
        const endpoint = isAdmin ? "/api/users/permission-requests" : `/api/users/permission-requests/${full_name}`

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des demandes")
        }

        const data = await response.json()
        setPermissionRequests(data)
      } catch (err) {
        console.error("Erreur:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissionRequests()
  }, [full_name, isAdmin, refreshTrigger])

  // Handle permission request response (approve/reject)
  const handlePermissionResponse = async (requestId, approved) => {
    try {
      const response = await fetch(`/api/users/respond-permission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          approved,
          respondedBy: full_name,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du traitement de la demande")
      }

      // Refresh the list
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err.message)
    }
  }

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Render permission requests list
  const renderPermissionRequests = () => {
    if (loading) {
      return <div className="loading">Chargement des demandes...</div>
    }

    if (error) {
      return (
        <div className="error-message">
          <FiAlertTriangle className="icon" />
          <span>{error}</span>
          <button className="button button-sm" onClick={handleRefresh}>
            <FiRefreshCw className="button-icon" />
            <span>Réessayer</span>
          </button>
        </div>
      )
    }

    if (permissionRequests.length === 0) {
      return (
        <div className="empty-state">
          <p>Aucune demande de permission {isAdmin ? "en attente" : "trouvée"}.</p>
          <button className="button button-sm" onClick={handleRefresh}>
            <FiRefreshCw className="button-icon" />
            <span>Actualiser</span>
          </button>
        </div>
      )
    }

    return (
      <div className="permission-requests">
        <div className="section-header">
          <h3>{isAdmin ? "Demandes en attente" : "Vos demandes"}</h3>
          <button className="button button-sm" onClick={handleRefresh}>
            <FiRefreshCw className="button-icon" />
            <span>Actualiser</span>
          </button>
        </div>

        {permissionRequests.map((request) => (
          <div key={request.id} className={`permission-request ${request.status}`}>
            <div className="request-header">
              <div className="request-user">
                <strong>{request.username}</strong>
                <span className="request-date">{new Date(request.date).toLocaleDateString()}</span>
              </div>
              <div className="request-status">
                {request.status === "pending" && "En attente"}
                {request.status === "approved" && (
                  <span className="status-approved">
                    <FiCheck /> Approuvé
                  </span>
                )}
                {request.status === "rejected" && (
                  <span className="status-rejected">
                    <FiX /> Rejeté
                  </span>
                )}
              </div>
            </div>

            <div className="request-details">
              <div className="request-roles">
                <div className="role-change">
                  <span className={`role-badge ${request.currentRole}`}>
                    {request.currentRole === "admin" && "Admin"}
                    {request.currentRole === "editeur" && "Éditeur"}
                    {request.currentRole === "anonyme" && "Anonyme"}
                  </span>
                  <span className="role-arrow">→</span>
                  <span className={`role-badge ${request.requestedRole}`}>
                    {request.requestedRole === "admin" && "Admin"}
                    {request.requestedRole === "editeur" && "Éditeur"}
                  </span>
                </div>
              </div>

              <div className="request-reason">
                <strong>Raison:</strong> {request.reason}
              </div>

              {isAdmin && request.status === "pending" && (
                <div className="request-actions">
                  <button
                    className="button button-danger button-sm"
                    onClick={() => handlePermissionResponse(request.id, false)}
                  >
                    <FiX className="button-icon" />
                    <span>Refuser</span>
                  </button>
                  <button
                    className="button button-primary button-sm"
                    onClick={() => handlePermissionResponse(request.id, true)}
                  >
                    <FiCheck className="button-icon" />
                    <span>Approuver</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="user-permissions">
      {!isAdmin && (
        <PermissionRequestForm
          currentRole={fonction}
          full_name={full_name}
          onRequestSent={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {renderPermissionRequests()}
    </div>
  )
}

export default UserPermissions

