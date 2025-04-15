const driver = require("./driver")
// const logger = require('../utils/logger');

// implement of our Neo4J architecture, the user and organisation he belongs to into nodes along with relationship
async function createUser_and_OrganisationNodes(full_name, organization, fonction) {
  const session = driver.session()
  try {
    console.log("Tentative de création pour:", { full_name, organization, fonction })
    const result = await session.run(
      `MERGE (u:Utilisateur {full_name: $full_name})
       ON CREATE SET u.fonction = $fonction,
                    u.nombre_metadonnees = 0,
                    u.date_creation = datetime()
       MERGE (o:Organisme {name: $organization})
       MERGE (u)-[:APPARTIENT_A]->(o)
       RETURN u, o`,
      { full_name, organization, fonction: fonction || null },
    )

    console.log("Résultat Neo4j:", result)
    if (result.records.length === 0) {
      throw new Error("Échec de création utilisateur")
    }

    return {
      user: result.records[0].get("u"),
      organization: result.records[0].get("o"),
    }
  } catch (error) {
    console.error("ERREUR CRITIQUE:", error) // Log visible
    throw new Error(`Échec création: ${error.message}`)
  } finally {
    await session.close()
  }
}

// Check if user exists in the database
async function checkUserExists(full_name) {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (u:Utilisateur {full_name: $full_name})
       RETURN u.full_name AS username, u.fonction AS role`,
      { full_name },
    )

    if (result.records.length === 0) {
      return { exists: false }
    }

    return {
      exists: true,
      username: result.records[0].get("username"),
      role: result.records[0].get("role"),
    }
  } catch (error) {
    console.error("Erreur checkUserExists", error)
    throw new Error("Échec vérification utilisateur")
  } finally {
    await session.close()
  }
}

// Register a new user
async function registerUser(full_name, email, organization, isNewOrganization, role, reason, nom, prenom) {
  const session = driver.session()
  try {
    // Check if user already exists
    const userExists = await checkUserExists(full_name)
    if (userExists.exists) {
      throw new Error("Un utilisateur avec ce nom existe déjà")
    }

    // Create user node
    let result

    if (role === "admin") {
      // For admin requests, create user with pending_admin role and create permission request
      result = await session.run(
        `CREATE (u:Utilisateur {
          full_name: $full_name,
          nom: $nom,
          prenom: $prenom,
          email: $email,
          fonction: "pending_admin",  // Special status for pending admin approval
          nombre_metadonnees: 0,
          date_creation: datetime()
        })
        WITH u
        MATCH (o:Organisme {name: $organization})
        MERGE (u)-[:APPARTIENT_A]->(o)
        WITH u
        CREATE (p:PermissionRequest {
          currentRole: "editeur",
          requestedRole: "admin",
          reason: $reason,
          status: "pending",
          date: datetime()
        })
        CREATE (u)-[:A_DEMANDE]->(p)
        RETURN u, p`,
        {
          full_name,
          nom,
          prenom,
          email,
          organization,
          reason,
        },
      )
    } else {
      // For regular users, create with requested role
      result = await session.run(
        `CREATE (u:Utilisateur {
          full_name: $full_name,
          nom: $nom,
          prenom: $prenom,
          email: $email,
          fonction: $role,
          nombre_metadonnees: 0,
          date_creation: datetime()
        })
        WITH u
        MERGE (o:Organisme {name: $organization})
        MERGE (u)-[:APPARTIENT_A]->(o)
        RETURN u`,
        {
          full_name,
          nom,
          prenom,
          email,
          organization,
          role,
        },
      )
    }

    if (result.records.length === 0) {
      throw new Error("Échec de création utilisateur")
    }

    return {
      success: true,
      user: result.records[0].get("u").properties,
      role: role === "admin" ? "editeur (admin en attente)" : role,
    }
  } catch (error) {
    console.error("Erreur registerUser", error)
    throw new Error(`Échec inscription: ${error.message}`)
  } finally {
    await session.close()
  }
}

// I have done this so asto increment the count each time a user creates data
async function incrementUserMetadataCount(full_name) {
  const session = driver.session()
  try {
    await session.run(
      `MATCH (u:Utilisateur {full_name: $full_name})
       SET u.nombre_metadonnees = COALESCE(u.nombre_metadonnees, 0) + 1`,
      { full_name },
    )
  } catch (error) {
    console.error("Erreur incrementUserMetadataCount", {
      error: error.message,
      full_name,
    })
    throw new Error("Échec mise à jour compteur")
  } finally {
    await session.close()
  }
}

// Get all users from the database
async function getAllUsers() {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (u:Utilisateur)-[:APPARTIENT_A]->(o:Organisme)
       RETURN u.full_name AS username, u.fonction AS role, o.name AS organization, 
              id(u) AS id, u.date_creation AS date_creation`,
    )

    return result.records.map((record) => ({
      id: record.get("id").toString(),
      username: record.get("username"),
      role: record.get("role"),
      organization: record.get("organization"),
      date_creation: record.get("date_creation"),
    }))
  } catch (error) {
    console.error("Erreur getAllUsers", error)
    throw new Error("Échec récupération utilisateurs")
  } finally {
    await session.close()
  }
}

// Update user information
async function updateUser(id, full_name, organization, fonction) {
  const session = driver.session()
  try {
    // Update user node
    await session.run(
      `MATCH (u:Utilisateur) WHERE id(u) = $id
       SET u.full_name = $full_name, u.fonction = $fonction
       WITH u
       OPTIONAL MATCH (u)-[r:APPARTIENT_A]->(:Organisme)
       DELETE r
       WITH u
       MERGE (o:Organisme {name: $organization})
       MERGE (u)-[:APPARTIENT_A]->(o)
       RETURN u, o`,
      { id: Number.parseInt(id), full_name, organization, fonction },
    )

    return { success: true }
  } catch (error) {
    console.error("Erreur updateUser", error)
    throw new Error("Échec mise à jour utilisateur")
  } finally {
    await session.close()
  }
}

// Delete user
async function deleteUser(id) {
  const session = driver.session()
  try {
    // Delete user node and its relationships
    await session.run(
      `MATCH (u:Utilisateur) WHERE id(u) = $id
       OPTIONAL MATCH (u)-[r]-()
       DELETE r, u`,
      { id: Number.parseInt(id) },
    )

    return { success: true }
  } catch (error) {
    console.error("Erreur deleteUser", error)
    throw new Error("Échec suppression utilisateur")
  } finally {
    await session.close()
  }
}

// Create a permission request
async function createPermissionRequest(full_name, currentRole, requestedRole, reason) {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (u:Utilisateur {full_name: $full_name})
       CREATE (p:PermissionRequest {
         currentRole: $currentRole,
         requestedRole: $requestedRole,
         reason: $reason,
         status: 'pending',
         date: datetime()
       })
       CREATE (u)-[:A_DEMANDE]->(p)
       RETURN p, u`,
      { full_name, currentRole, requestedRole, reason },
    )

    if (result.records.length === 0) {
      throw new Error("Échec de création de la demande de permission")
    }

    return {
      id: result.records[0].get("p").identity.toString(),
      username: full_name,
      currentRole,
      requestedRole,
      reason,
      status: "pending",
      date: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Erreur createPermissionRequest", error)
    throw new Error("Échec création demande de permission")
  } finally {
    await session.close()
  }
}

// Get all permission requests
async function getAllPermissionRequests() {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (u:Utilisateur)-[:A_DEMANDE]->(p:PermissionRequest)
       RETURN p, u.full_name AS username, id(p) AS id
       ORDER BY p.date DESC`,
    )

    return result.records.map((record) => {
      const props = record.get("p").properties
      return {
        id: record.get("id").toString(),
        username: record.get("username"),
        currentRole: props.currentRole,
        requestedRole: props.requestedRole,
        reason: props.reason,
        status: props.status,
        date: props.date.toString(),
      }
    })
  } catch (error) {
    console.error("Erreur getAllPermissionRequests", error)
    throw new Error("Échec récupération demandes de permission")
  } finally {
    await session.close()
  }
}

// Get permission requests for a specific user
async function getUserPermissionRequests(full_name) {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (u:Utilisateur {full_name: $full_name})-[:A_DEMANDE]->(p:PermissionRequest)
       RETURN p, id(p) AS id
       ORDER BY p.date DESC`,
      { full_name },
    )

    return result.records.map((record) => {
      const props = record.get("p").properties
      return {
        id: record.get("id").toString(),
        username: full_name,
        currentRole: props.currentRole,
        requestedRole: props.requestedRole,
        reason: props.reason,
        status: props.status,
        date: props.date.toString(),
      }
    })
  } catch (error) {
    console.error("Erreur getUserPermissionRequests", error)
    throw new Error("Échec récupération demandes de permission utilisateur")
  } finally {
    await session.close()
  }
}

// Respond to a permission request (approve/reject)
async function respondToPermissionRequest(requestId, approved, respondedBy) {
  const session = driver.session()
  try {
    // First get the request details
    const getRequest = await session.run(
      `MATCH (p:PermissionRequest) WHERE id(p) = $requestId
       MATCH (u:Utilisateur)-[:A_DEMANDE]->(p)
       RETURN p, u`,
      { requestId: Number.parseInt(requestId) },
    )

    if (getRequest.records.length === 0) {
      throw new Error("Demande de permission non trouvée")
    }

    const request = getRequest.records[0].get("p").properties
    const user = getRequest.records[0].get("u")

    // Update the request status
    await session.run(
      `MATCH (p:PermissionRequest) WHERE id(p) = $requestId
       SET p.status = $status, 
           p.respondedBy = $respondedBy,
           p.responseDate = datetime()`,
      {
        requestId: Number.parseInt(requestId),
        status: approved ? "approved" : "rejected",
        respondedBy,
      },
    )

    // If approved, update the user's role
    if (approved) {
      await session.run(
        `MATCH (u:Utilisateur)-[:A_DEMANDE]->(p:PermissionRequest) 
         WHERE id(p) = $requestId
         SET u.fonction = $newRole,
             p.responseDate = datetime(),
             p.respondedBy = $respondedBy
         RETURN u`,
        { requestId: Number.parseInt(requestId), newRole: request.requestedRole, respondedBy },
      )
    }

    return {
      success: true,
      status: approved ? "approved" : "rejected",
      username: user.properties.full_name,
    }
  } catch (error) {
    console.error("Erreur respondToPermissionRequest", error)
    throw new Error("Échec réponse à la demande de permission")
  } finally {
    await session.close()
  }
}


module.exports = {
  createUser_and_OrganisationNodes,
  incrementUserMetadataCount,
  getAllUsers,
  updateUser,
  deleteUser,
  createPermissionRequest,
  getAllPermissionRequests,
  getUserPermissionRequests,
  respondToPermissionRequest,
  checkUserExists,
  registerUser,
}

