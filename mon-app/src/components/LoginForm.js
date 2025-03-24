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
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Organization</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Job</label>
          <input
            type="text"
            value={fonction}
            onChange={(e) => setFonction(e.target.value)}
            
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;