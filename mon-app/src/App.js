import { useState } from 'react';
import './App.css';


import "leaflet/dist/leaflet.css";
import  './components/AboutPage';
import "./components/AboutPage";
import AdminPanel from './components/AdminPanel';
import './components/ClickableMap';
import LoginForm from './components/LoginForm';
import './components/MapAnnotator';
import './components/MyButtons';
import './components/TextAnnotator';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [organization, setOrganization] = useState("");
  const [fonction, setFonction] = useState("");

  let content;

  const handleLogin = (name,orga,job) => {
    setIsLoggedIn(true);
    setUsername(name);
    setOrganization(orga);
    setFonction(job); 
  };

  if (isLoggedIn) {
    content = <AdminPanel username={username} organization={organization} fonction={fonction}/>; 
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
