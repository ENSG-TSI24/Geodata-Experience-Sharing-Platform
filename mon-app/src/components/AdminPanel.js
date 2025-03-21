import { useState } from "react";
import MapAnnotator from "./MapAnnotator";
import TextAnnotator from "./TextAnnotator";
import MyButtons from "./MyButtons";
import AboutPage from "./AboutPage";


function AdminPanel({ username , organization , fonction }) {
    const [isMap, setIsMap] = useState(false);
  
    return (
      <div>
        <h1>Bienvenue dans mon appli, {username.trim()}, de {organization.trim()} en position {fonction.trim()} </h1>
        <AboutPage />
        <MyButtons />
        <button onClick={() => setIsMap(!isMap)}>
          {isMap ? "Mode Texte" : "Mode Carte"}
        </button>
        {isMap ? <MapAnnotator /> : <TextAnnotator />}
      </div>
    );
  }

export default AdminPanel;

