import { useState } from 'react';
import './App.css';

function MyButtons() {
  return (
    <>
      <h1>Banderolle</h1>
      <div className="buttons">
        <button className="mapButton">Map</button>
        <button className="ImportButton">Importer métadonnées</button>
        <button className="ExportButton">Exporter métadonnées</button>
      </div>
    </>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username); 
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <h1>À propos</h1>
      <p>Bien le bonjour.<br />Comment ça va ?</p>
    </>
  );
}

function AdminPanel({ username }) {
  return (
    <div>
      <h1>Bienvenue dans mon appli, {username.trim()}</h1>
      <MyButtons />
      <AboutPage />
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); 
  let content;

  const handleLogin = (name) => {
    setIsLoggedIn(true);
    setUsername(name); 
  };

  if (isLoggedIn) {
    content = <AdminPanel username={username} />; 
  } else {
    content = <LoginForm onLogin={handleLogin} />; 
  }

  return (
    <div>
      {content}
    </div>
  );
}

export default App;
