"use client"

import { useState } from "react"
import { FiUser, FiHome, FiBriefcase } from "react-icons/fi"

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("")
  const [organization, setOrganization] = useState("")
  const [fonction, setFonction] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = "Username is required"
    if (!organization.trim()) newErrors.organization = "Organization is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onLogin(username, organization, fonction)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">📊</div>
          <h2>Annotation Dashboard</h2>
          <p>Sign in to access your annotation tools</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`form-group ${errors.username ? "has-error" : ""}`}>
            <label htmlFor="username">
              <FiUser className="input-icon" />
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              aria-invalid={errors.username ? "true" : "false"}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className={`form-group ${errors.organization ? "has-error" : ""}`}>
            <label htmlFor="organization">
              <FiHome className="input-icon" />
              Organization
            </label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter your organization"
              aria-invalid={errors.organization ? "true" : "false"}
            />
            {errors.organization && <div className="error-message">{errors.organization}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="fonction">
              <FiBriefcase className="input-icon" />
              Job Title
            </label>
            <input
              id="fonction"
              type="text"
              value={fonction}
              onChange={(e) => setFonction(e.target.value)}
              placeholder="Enter your job title (optional)"
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="remember-me" className="checkbox-label">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm