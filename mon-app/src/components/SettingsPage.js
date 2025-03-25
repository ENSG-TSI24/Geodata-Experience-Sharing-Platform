"use client"

import { useState } from "react"
import { FiSettings, FiUsers, FiTag, FiSave } from "react-icons/fi"

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("tags")
  const [tags, setTags] = useState([
    { id: 1, name: "Address", color: "#3498db" },
    { id: 2, name: "Date", color: "#2ecc71" },
    { id: 3, name: "Issue", color: "#e74c3c" },
    { id: 4, name: "Solution", color: "#f39c12" },
  ])
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3498db")

  const [users, setUsers] = useState([
    { id: 1, username: "admin", role: "admin", organization: "Admin Org" },
    { id: 2, username: "user1", role: "user", organization: "Test Org" },
  ])

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

  // Render tag management UI component
  const renderTagsSettings = () => (
    <div className="settings-section">
      <h3>Annotation Tags</h3>
      <p>Manage the tags available for annotations.</p>

      <div className="tags-list">
        {tags.map((tag) => (
          <div key={tag.id} className="tag-item" style={{ borderLeft: `4px solid ${tag.color}` }}>
            <div className="tag-name">{tag.name}</div>
            <div className="tag-actions">
              <button className="button button-danger button-sm" onClick={() => handleDeleteTag(tag.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTag} className="add-tag-form">
        <div className="form-group">
          <label htmlFor="tag-name">Tag Name</label>
          <input
            id="tag-name"
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tag-color">Tag Color</label>
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
          <span>Add Tag</span>
        </button>
      </form>
    </div>
  )

  // Render user management UI component
  const renderUserSettings = () => (
    <div className="settings-section">
      <h3>User Management</h3>
      <p>View and manage user accounts and permissions.</p>

      <div className="table-responsive">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.organization}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <button className="button button-secondary button-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <FiSettings className="icon" />
          System Settings
        </h2>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === "tags" ? "active" : ""}`}
            onClick={() => setActiveTab("tags")}
          >
            <FiTag className="tab-icon" />
            <span>Tags</span>
          </button>
          <button
            className={`settings-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FiUsers className="tab-icon" />
            <span>Users</span>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "tags" && renderTagsSettings()}
          {activeTab === "users" && renderUserSettings()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
