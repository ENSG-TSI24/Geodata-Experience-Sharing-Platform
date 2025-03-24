import { useState } from 'react';
import './App.css';


import "leaflet/dist/leaflet.css";
import  './components/AboutPage';
import "./components/AboutPage";
import AdminPanel from './components/AdminPanel';
import LoginForm from './components/LoginForm';
import './components/MapAnnotator';
import './components/MyButtons';
import './components/TextAnnotator';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [full_name, setfull_name] = useState("");
  const [organization, setOrganization] = useState("");
  const [fonction, setFonction] = useState("");

  let content;

  const handleLogin = (name,orga,job) => {
    setIsLoggedIn(true);
    setfull_name(name);
    setOrganization(orga);
    setFonction(job); 
  };

  if (isLoggedIn) {
    content = <AdminPanel full_name={full_name} organization={organization} fonction={fonction}/>; 
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
