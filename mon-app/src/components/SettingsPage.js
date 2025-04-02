"use client"

import { useState, useEffect } from "react"
import { FiSettings, FiUsers, FiTag, FiSave, FiEdit, FiTrash2, FiLock, FiAlertTriangle } from "react-icons/fi"
import UserPermissions from "./UserPermissions"

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [tags, setTags] = useState([
    { id: 1, name: "Catégorie Données", color: "#3498db" },
    { id: 2, name: "Zone Localisation", color: "#2ecc71" },
    { id: 3, name: "Mode Acquisition", color: "#e74c3c" },
    { id: 4, name: "Solution SIG", color: "#f39c12" },
  ])
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3498db")

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editingUser, setEditingUser] = useState(null)
  const [newUsername, setNewUsername] = useState("")
  const [newRole, setNewRole] = useState("editeur")
  const [newOrganization, setNewOrganization] = useState("")

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // Add state for loading users
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Add useEffect to fetch users from Neo4j
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const response = await fetch("/api/users/list")
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs")
        }
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Function to handle adding new annotation tag
  const handleAddTag = (e) => {
    e.preventDefault()
    if (newTagName.trim()) {
      setTags([
        ...tags,
        {
          id: Date.now(),
          name: newTagName.trim(),
          color: newTagColor,
        },
      ])
      setNewTagName("")
    }
  }

  // Function to remove existing annotation tag
  const handleDeleteTag = (id) => {
    setTags(tags.filter((tag) => tag.id !== id))
  }

  // Start editing a user
  const handleEditUser = (user) => {
    setEditingUser(user)
    setNewUsername(user.username)
    setNewRole(user.role)
    setNewOrganization(user.organization)
  }

  // Save edited user
  const handleSaveUser = async () => {
    if (!newUsername.trim() || !newOrganization.trim()) return

    try {
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          full_name: newUsername,
          organization: newOrganization,
          fonction: newRole,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur")
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? { ...user, username: newUsername, role: newRole, organization: newOrganization }
            : user,
        ),
      )

      setEditingUser(null)
      setNewUsername("")
      setNewRole("editeur")
      setNewOrganization("")
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUser(null)
    setNewUsername("")
    setNewRole("editeur")
    setNewOrganization("")
  }

  // Confirm user deletion
  const handleConfirmDelete = (user) => {
    setUserToDelete(user)
    setShowConfirmation(true)
  }

  // Delete user after confirmation
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/users/delete/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'utilisateur")
      }

      // Update local state
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setShowConfirmation(false)
      setUserToDelete(null)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  // Cancel deletion
  const handleCancelDelete = () => {
    setShowConfirmation(false)
    setUserToDelete(null)
  }

  // Render tag management UI component
  const renderTagsSettings = () => (
    <div className="settings-section">
      <h3>Gestion des Catégories</h3>
      <p>Gérez les catégories disponibles pour les annotations.</p>

      <div className="tags-list">
        {tags.map((tag) => (
          <div key={tag.id} className="tag-item" style={{ borderLeft: `4px solid ${tag.color}` }}>
            <div className="tag-name">{tag.name}</div>
            <div className="tag-actions">
              <button className="button button-danger button-sm" onClick={() => handleDeleteTag(tag.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTag} className="add-tag-form">
        <div className="form-group">
          <label htmlFor="tag-name">Nom de la catégorie</label>
          <input
            id="tag-name"
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Entrez le nom de la catégorie"
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tag-color">Couleur</label>
          <input
            id="tag-color"
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="color-input"
          />
        </div>

        <button type="submit" className="button button-primary" disabled={!newTagName.trim()}>
          <FiSave className="button-icon" />
          <span>Ajouter</span>
        </button>
      </form>
    </div>
  )

  // Render user management UI component
  const renderUserSettings = () => (
    <div className="settings-section">
      <h3>Gestion des Utilisateurs</h3>
      <p>Consultez et gérez les comptes utilisateurs et leurs permissions.</p>

      <div className="table-responsive">
        {loadingUsers ? (
          <div className="loading">Chargement des utilisateurs...</div>
        ) : (
          <table className="settings-table">
            <thead>
              <tr>
                <th>Nom d'utilisateur</th>
                <th>Organisation</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.organization}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === "admin" && "Admin"}
                      {user.role === "editeur" && "Éditeur"}
                      {user.role === "anonyme" && "Anonyme"}
                    </span>
                  </td>
                  <td>
                    <div className="button-group">
                      <button className="button button-secondary button-sm" onClick={() => handleEditUser(user)}>
                        <FiEdit />
                      </button>
                      <button className="button button-danger button-sm" onClick={() => handleConfirmDelete(user)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div className="edit-user-form">
          <h4>Modifier l'utilisateur</h4>
          <div className="form-group">
            <label htmlFor="edit-username">Nom d'utilisateur</label>
            <input
              id="edit-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-organization">Organisation</label>
            <input
              id="edit-organization"
              type="text"
              value={newOrganization}
              onChange={(e) => setNewOrganization(e.target.value)}
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-role">Rôle</label>
            <select
              id="edit-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="select-input"
            >
              <option value="admin">Admin</option>
              <option value="editeur">Éditeur</option>
              <option value="anonyme">Anonyme</option>
            </select>
          </div>

          <div className="form-actions">
            <button className="button button-secondary" onClick={handleCancelEdit}>
              Annuler
            </button>
            <button
              className="button button-primary"
              onClick={handleSaveUser}
              disabled={!newUsername.trim() || !newOrganization.trim()}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {showConfirmation && userToDelete && (
        <div className="confirmation-dialog">
          <div className="confirmation-content">
            <FiAlertTriangle className="warning-icon" />
            <h4>Confirmer la suppression</h4>
            <p>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.username}</strong> ?
            </p>
            <p>Cette action est irréversible.</p>

            <div className="confirmation-actions">
              <button className="button button-secondary" onClick={handleCancelDelete}>
                Annuler
              </button>
              <button className="button button-danger" onClick={handleDeleteUser}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Render permission requests UI component
  const renderPermissionRequests = () => (
    <div className="settings-section">
      <h3>Demandes de Permissions</h3>
      <p>Gérez les demandes d'accès et de changement de rôle.</p>

      <UserPermissions full_name="admin" fonction="admin" isAdmin={true} />
    </div>
  )

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <FiSettings className="icon" />
          Paramètres du Système
        </h2>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FiUsers className="tab-icon" />
            <span>Utilisateurs</span>
          </button>
          <button
            className={`settings-tab ${activeTab === "permissions" ? "active" : ""}`}
            onClick={() => setActiveTab("permissions")}
          >
            <FiLock className="tab-icon" />
            <span>Permissions</span>
          </button>
          <button
            className={`settings-tab ${activeTab === "tags" ? "active" : ""}`}
            onClick={() => setActiveTab("tags")}
          >
            <FiTag className="tab-icon" />
            <span>Catégories</span>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "tags" && renderTagsSettings()}
          {activeTab === "users" && renderUserSettings()}
          {activeTab === "permissions" && renderPermissionRequests()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

