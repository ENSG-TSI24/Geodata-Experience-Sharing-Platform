const express = require("express")
const {
  createUser_and_OrganisationNodes,
  getAllUsers,
  updateUser,
  deleteUser,
  createPermissionRequest,
  getAllPermissionRequests,
  getUserPermissionRequests,
  respondToPermissionRequest,
} = require("../neo4jDatabase/userOperations")
const router = express.Router()

router.post("/login", async (req, res) => {
  try {
    const { full_name, organization, fonction } = req.body
    console.log("Reçu:", { full_name, organization, fonction })
    const result = await createUser_and_OrganisationNodes(full_name, organization, fonction)
    console.log("Résultat:", result)
    res.json(result)
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, details: process.env.NODE_ENV === "development" ? error.stack : undefined })
  }
})

// Get all users
router.get("/list", async (req, res) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Update user
router.post("/update", async (req, res) => {
  try {
    const { id, full_name, organization, fonction } = req.body
    const result = await updateUser(id, full_name, organization, fonction)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Delete user
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await deleteUser(id)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Create permission request
router.post("/request-permission", async (req, res) => {
  try {
    const { full_name, currentRole, requestedRole, reason } = req.body
    const result = await createPermissionRequest(full_name, currentRole, requestedRole, reason)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Get all permission requests (admin only)
router.get("/permission-requests", async (req, res) => {
  try {
    const requests = await getAllPermissionRequests()
    res.json(requests)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Get permission requests for a specific user
router.get("/permission-requests/:full_name", async (req, res) => {
  try {
    const { full_name } = req.params
    const requests = await getUserPermissionRequests(full_name)
    res.json(requests)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Respond to permission request (admin only)
router.post("/respond-permission", async (req, res) => {
  try {
    const { requestId, approved, respondedBy } = req.body
    const result = await respondToPermissionRequest(requestId, approved, respondedBy)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

module.exports = router

