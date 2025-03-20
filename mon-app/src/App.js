import { useState } from 'react';
import './App.css';

import { MapContainer, TileLayer, Marker, Popup , useMapEvents} from "react-leaflet";
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
