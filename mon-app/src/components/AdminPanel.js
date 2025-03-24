import { useState } from "react";
import MapAnnotator from "./MapAnnotator";
import TextAnnotator from "./TextAnnotator";
import MyButtons from "./MyButtons";
import AboutPage from "./AboutPage";

function AdminPanel({ full_name, organization, fonction }) {
  const [isMap, setIsMap] = useState(false);
  const [globalDataset, setGlobalDataset] = useState([]); // Gestion de globalDataset ici
  
  return (
    <div>
      <h1>Bienvenue dans mon appli, {full_name.trim()}, de {organization.trim()} en position {fonction.trim()} </h1>
      <AboutPage />
      <MyButtons />
      <button onClick={() => setIsMap(!isMap)}>
        {isMap ? "Mode Texte" : "Mode Carte"}
      </button>
      
      {/* Passer globalDataset et setGlobalDataset à MapAnnotator */}
      {isMap ? (
        <MapAnnotator globalDataset={globalDataset} setGlobalDataset={setGlobalDataset} userFullName={full_name} />
      ) : (
        <TextAnnotator />
      )}

      {/* Afficher globalDataset ici */}
      <h2>Contenu de globalDataset:</h2>
      <pre>{JSON.stringify(globalDataset, null, 2)}</pre>
    </div>
  );
}

export default AdminPanel;
