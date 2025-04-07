const driver = require('./driver')

// Get all organizations
async function getAllOrganizations() {
  const session = driver.session()
  try {
    console.log("DB: Exécution de la requête pour récupérer les organismes...")
    const result = await session.run(
      ` MATCH (n:Organisme) 
        RETURN DISTINCT n.name AS nom
        ORDER BY nom`,
    )

    console.log("DB: Nombre d'organismes trouvés:", result.records.length)

    const organizations = result.records.map((record) => ({
      id: record.get("nom").toString(),
    }))

    console.log("DB: Organismes formatés:", organizations)
    return organizations
  } catch (error) {
    console.error("DB: Erreur getAllOrganizations", error)
    throw new Error("Échec récupération organisations")
  } finally {
    await session.close()
  }
}

// Create a new organization
async function createOrganization(name, description = "") {
  const session = driver.session()
  try {
    const result = await session.run(
      `MERGE (o:Organisme {name: $name})
       ON CREATE SET o.description = $description,
                    o.date_creation = datetime()
       RETURN o`,
      { name, description },
    )

    if (result.records.length === 0) {
      throw new Error("Échec de création organisation")
    }

    return {
      success: true,
      organization: result.records[0].get("o").properties,
    }
  } catch (error) {
    console.error("Erreur createOrganization", error)
    throw new Error(`Échec création organisation: ${error.message}`)
  } finally {
    await session.close()
  }
}

// Update an organization
async function updateOrganization(id, name, description) {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (o:Organisme) WHERE id(o) = $id
       SET o.name = $name, o.description = $description
       RETURN o`,
      { id: Number.parseInt(id), name, description },
    )

    if (result.records.length === 0) {
      throw new Error("Organisation non trouvée")
    }

    return {
      success: true,
      organization: result.records[0].get("o").properties,
    }
  } catch (error) {
    console.error("Erreur updateOrganization", error)
    throw new Error(`Échec mise à jour organisation: ${error.message}`)
  } finally {
    await session.close()
  }
}

// Delete an organization
async function deleteOrganization(id) {
  const session = driver.session()
  try {
    // First check if organization has users
    const checkUsers = await session.run(
      `MATCH (o:Organisme)<-[:APPARTIENT_A]-(u:Utilisateur)
       WHERE id(o) = $id
       RETURN count(u) AS userCount`,
      { id: Number.parseInt(id) },
    )

    const userCount = checkUsers.records[0].get("userCount").toNumber()
    if (userCount > 0) {
      throw new Error("Impossible de supprimer une organisation avec des utilisateurs")
    }

    // Delete organization if no users
    const result = await session.run(
      `MATCH (o:Organisme) WHERE id(o) = $id
       DELETE o`,
      { id: Number.parseInt(id) },
    )

    return { success: true }
  } catch (error) {
    console.error("Erreur deleteOrganization", error)
    throw new Error(`Échec suppression organisation: ${error.message}`)
  } finally {
    await session.close()
  }
}

module.exports = {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
}

