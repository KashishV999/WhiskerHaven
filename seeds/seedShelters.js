// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require("mongoose");
const { Schema } = mongoose;
const shelterData = require("../data/shelterData");

// =============================================================================
// SHELTER SEEDING MODULE
// =============================================================================

module.exports = async (Shelter) => {
  
  try {
    await Shelter.deleteMany({});
    await Shelter.insertMany(shelterData);
    console.log("Shelters seeded successfully");

  } catch (err) {
    console.error("Error seeding shelters:", err);
    throw err;
  }
};