import { useState } from "react";
import { FiUser, FiHome, FiShield } from "react-icons/fi";
 

function LoginForm({ onLogin }) {
  const [full_name, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [fonction, setFonction] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form fields before submission
  const validate = () => {
    const newErrors = {};
    if (!full_name.trim()) newErrors.full_name = "Nom complet requis";
    if (!organization.trim()) newErrors.organization = "Organisation requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
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
      
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify({
          full_name, organization, fonction
        }));
      }
    } catch (error) {
      console.error('Échec login:', error);
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">📊</div>
          <h2>Smart Data Experiences' Sharing Platform</h2>
          <p>Connectez-vous pour accéder aux outils d'annotation</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`form-group ${errors.full_name ? "has-error" : ""}`}>
            <label htmlFor="full_name">
              <FiUser className="input-icon" />
              Nom complet
            </label>
            <input
              id="full_name"
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom et prénom"
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && <div className="error-message">{errors.full_name}</div>}
          </div>

          <div className={`form-group ${errors.organization ? "has-error" : ""}`}>
            <label htmlFor="organization">
              <FiHome className="input-icon" />
              Organisation
            </label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Votre organisation"
              aria-invalid={!!errors.organization}
            />
            {errors.organization && <div className="error-message">{errors.organization}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="fonction">
              <FiShield className="input-icon" />
              Fonction
            </label>
            <input
              id="fonction"
              type="text"
              value={fonction}
              onChange={(e) => setFonction(e.target.value)}
              placeholder="Votre fonction"
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
              <span>Se souvenir de moi</span>
            </label>
          </div>

          {errors.submit && <div className="form-error">{errors.submit}</div>}

          <button type="submit" className="login-button">
            Connexion
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;