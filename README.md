# 🌍 GeoFeedback Platform - Geographic Data Feedback and Knowledge Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Neo4j](https://img.shields.io/badge/Neo4j-4.4.12-green)](https://neo4j.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey)](https://expressjs.com/)

**A collaborative platform for geographic data with knowledge graphs and AI assistance**  
Submit feedback, visualize relationships, and get AI-powered insights for geographic datasets.

---

## 📋 Table of Contents
- [🌍 GeoFeedback Platform - Geographic Data Feedback and Knowledge Management Platform](#-geofeedback-platform---geographic-data-feedback-and-knowledge-management-platform)
  - [📋 Table of Contents](#-table-of-contents)
  - [🌟 Core Features](#-core-features)
  - [🛠️ Technical Architecture](#️-technical-architecture)
  - [🚀 Quick Start](#-quick-start)
  - [🗺️ Usage Guide](#️-usage-guide)
    - [1. **Authentication** 🔑](#1-authentication-)
    - [2. **Submit Feedback** 📤](#2-submit-feedback-)
    - [3. **Explore Data** 🔍](#3-explore-data-)
    - [4. **Export Data** 📥](#4-export-data-)
  - [⚙️ Configuration](#️-configuration)
  - [🆘 Support](#-support)
  - [📜 License](#-license)

---

## 🌟 Core Features

| Feature                | Description                                                                 |  
|------------------------|-----------------------------------------------------------------------------|  
| **📝 Feedback Management** | Submit/browse data feedback with **AI auto-tagging** (GPT-4) and issue tracking. |  
| **🌐 Knowledge Graph**    | Neo4j-powered metadata network for visualizing complex geographic relationships. |  
| **🤖 AI Assistance**      | Natural language Q&A and context-aware metadata suggestions.               |  
| **🔒 Role-Based Access**  | JWT authentication with roles: *Editeur*, *Admin*.              |  

---
## 🛠️ Technical Architecture
%%{init: {'theme': 'base', 'flowchart': {'curve': 'basis'}}}%%
flowchart TD
    Frontend["🖥️ Frontend (React)"] -->|API Calls| Backend["🛠️ Backend (Express.js)"]
    Backend -->|Cypher Queries| Database["🗃️ Database (Neo4j)"]
    Backend -->|API Integration| AIAgent["🤖 AI Agent"]


- **Frontend**: React + Leaflet 
- **Backend**: Express.js + Neo4j Driver
- **Database**: Neo4j Relational Database (Docker deployment)  
- **AI Service**: Chatbot that runs on OpenAI gpt-3.5-turbo
- **Deployment**: Docker 
---
## 🚀 Quick Start  

1. **Clone Repository**  
   ```bash
   git clone https://github.com/ENSG-TSI24/Geodata-Experience-Sharing-Platform.git
   cd Geodata-Experience-Sharing-Platform/mon-app
   ```

2. **Environment Setup**  
   - Create a `.env` file in the root directory with required configurations (e.g., Neo4j credentials, OpenAI API key). To have the password and API key contact us !
    NEO4J_URI="neo4j+s://a3fd1456.databases.neo4j.io"
    NEO4J_USER="neo4j"
    NEO4J_PASSWORD=
    OPENAI_API_KEY=

3. **Docker Deployment**  
   - *If it's the first time you download the project*:  
     ```bash  
     sudo -s  # If permissions are needed  
     docker-compose build --no-cache   
     docker-compose up 
     ```  
   - *If you have already build the docker and just want to launch existing container*:  
     ```bash  
     docker-compose up  # Launch existing containers  
     ```  

4. **Access the Platform**  
   - Open your browser and navigate to:  
     ```  
     http://localhost:5000   
     ```  

5. **Stop Services**  
   ```bash  
   docker-compose down --volumes --remove-orphans 
   ```  

---

## 🗺️ Usage Guide  

### 1. **Authentication** 🔑  
   - **Sign Up**:  
     - Click "Register" → Fill in username, password, organisation and email". If you chose an admin role, write down the purpose for your request and wait for approval. You can log is as an anonymous member. 
   - **Log In**:  
     - Use credentials to access the platform, and select well your role.  

### 2. **Submit Feedback** 📤  
   - Go to *Feedback* → Add a description of the experience feedback regarding the geographic data you used.  
   - You can also make use of the LLM power so as to generate and store metadata automatically from the Experience Feedback you write in human language without annotation.  

### 3. **Explore Data** 🔍  
   - Use the **Recherche section** to:  
     - Visualize metadata connections.  
     - Filter by properties, date, and see the comments below.  
   
### 4. **Export Data** 📥  
   - Select datasets → Choose *Export* → Download as JSON.  

---

## ⚙️ Configuration  

- **Neo4j Database**: Ensure the instance is valid' 
---

## 🆘 Support  

Contact the team by opening an issue on [GitHub](https://github.com/ENSG-TSI24/Geodata-Experience-Sharing-Platform).  


[MIT License](https://opensource.org/licenses/MIT)  
Copyright (c) 2025 ENSG-TSI24

---

**Screenshots & Demos**  
![Knowledge Graph Visualization](https://example.com/screenshot-graph.png)  
*Figure: Neo4j-based metadata relationship network*
