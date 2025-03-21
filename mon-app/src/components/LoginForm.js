import React, { useState } from 'react'; // Import useState

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [organization, setOrganization] = useState("");
  const [fonction, setFonction] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && organization.trim()) {
      onLogin(username, organization, fonction); 
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Annotation Dashboard</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="organization">Organization</label>
          <input
            id="organization"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="fonction">Job Title</label>
          <input id="fonction" type="text" value={fonction} onChange={(e) => setFonction(e.target.value)} />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  )
}

export default LoginForm;