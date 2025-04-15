const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { createDataNode } = require('./dataOperations');
const { incrementUserMetadataCount } = require('./userOperations');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ici je charg les prompts
const PROMPTS = {
  metadata: fs.readFileSync(path.join(__dirname, '../genAI/prompt_metadata.txt'), 'utf8'),
  // Les autres prompts je vais les ajouter ici
};

class ChatSession {
  constructor(userId, mode) {
    this.userId = userId;
    this.mode = mode;
    this.history = [];
    this.initializeSession();
  }

  initializeSession() {
    if (this.mode === 'metadata') {
      this.history = [
        {
          role: "system",
          content: PROMPTS.metadata
        }
      ];
    }
    // else if for other initialisations
  }

  addMessage(role, content) {
    this.history.push({ role, content });
  }

  getHistory() {
    return this.history;
  }
}

const activeSessions = new Map();

function getSession(userId, mode) {
  if (!activeSessions.has(userId)) {
    activeSessions.set(userId, new ChatSession(userId, mode));
  }
  return activeSessions.get(userId);
}

async function generateMetadataJSON(text, userId) {
  try {
    const session = getSession(userId, 'metadata');
    session.addMessage("user", text);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: session.getHistory(),
      temperature: 0.1, // I think no need for high temperature otherwise thrre's is a risk of errorrs. 
      max_tokens: 2000
    });

    const completion = response.choices[0].message.content;
    session.addMessage("assistant", completion);

    // Validation et parsing du JSON resultantn par chatGPT 
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(completion);
    } catch (e) {
      throw new Error("Le format de la réponse n'est pas un JSON valide");
    }

    // Validation de la structure de base
    if (!jsonResponse.Title || !jsonResponse.Proprietees || !jsonResponse.Proprietees.description) {
      throw new Error("La structure du JSON ne correspond pas au format attendu");
    }

    return jsonResponse;
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    throw error;
  }
}

async function processMetadataSubmission(text, userId, full_name) {
  try {
    // Génération du JSON structure
    const metadata = await generateMetadataJSON(text, userId);

    function adaptLLMOutputForNeo4j(llmData) {
      return {
        Title: llmData.Title,
        Description: llmData.Proprietees.description,
        ...llmData.Proprietees, 
        
        
        Proprietees: undefined
      };
    }
    
      // because even if I gave a strict promtp the openAI still sometimes does what he wants
      function validateLLMOutput(data) {
        const ALLOWED_PROPERTIES = new Set(["Droits_usage", "Zone_Localisation", "Mode_Acquisition", "Solution_SIG", 
          "Systeme_de_coordonnees", "Format_Fichier", "Source", "Description", "Position", "Title", "Problème", "Résolution_Spatiale", 
          "Catégorie_Données", "CreatedBy", "isPrivate", "Degré", "Spécification", "Unite_Geo", "Emprise", "Généalogie", 
          "DateModification_RetourExperience", "DatePublication_RetourExperience", "DatePrise_Donnee", "DateMiseaJour_Donnee"]);
      
        // Filtrer les propriétés non autorisées
        const filteredProps = {};
        for (const [key, value] of Object.entries(data.Proprietees)) {
          if (ALLOWED_PROPERTIES.has(key)) {
            filteredProps[key] = value;
          } else {
            console.warn(`Propriété non autorisée filtrée: ${key}`);
          }
        }
      
        return {
          Title: data.Title,
          Proprietees: filteredProps
        };
      }
      
      // Utilisation :
      
    
      const validatedData = validateLLMOutput(metadata);
      const neo4jReadyData = adaptLLMOutputForNeo4j(validatedData);
    const result = await createDataNode(neo4jReadyData, full_name);
    await incrementUserMetadataCount(full_name);

    return {
      success: true,
      message: `Votre retour d'expérience "${metadata.Title}" a été enregistré avec succès.`,
      data: result
    };
  } catch (error) {
    console.error("Erreur lors du traitement des métadonnées:", error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors de l'enregistrement",
      error: error
    };
  }
}

module.exports = {
  generateMetadataJSON,
  processMetadataSubmission,
  getSession
};
