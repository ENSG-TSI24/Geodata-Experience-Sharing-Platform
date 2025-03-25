import React, { useState } from 'react'; // Import useState

function LoginForm({ onLogin }) {
  const [full_name, setfull_name] = useState("");
  const [organization, setOrganization] = useState("");
  const [fonction, setFonction] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    if (full_name.trim() && organization.trim()) {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, organization, fonction })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }

      const result = await response.json();
      onLogin(full_name, organization, fonction);
    }
  } catch (error) {
    console.error('Échec login:', error);
    alert(`Erreur: ${error.message}`); 
  }
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div>
          <label>Votre Nom et Prénom</label>
          <input
            type="text"
            value={full_name}
            onChange={(e) => setfull_name(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Votre Organization</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Votre Fonction</label>
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