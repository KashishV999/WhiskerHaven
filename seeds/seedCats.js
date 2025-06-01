// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require("mongoose");
const catData = require("../data/catData");

// =============================================================================
// CAT SEEDING MODULE
// =============================================================================

module.exports = async (Cat, Shelter) => {
  
  
  // Clear existing cats
  await Cat.deleteMany({});
  
  // Get all available shelters
  const shelters = await Shelter.find({});
  
  if (shelters.length === 0) {
    throw new Error("No shelters found in the database");
  }


  
  for (const cat of catData) {
    // Get random shelter index
    const randomShelterIndex = Math.floor(Math.random() * shelters.length);
    
    // Assign shelter to cat
    cat.shelter = shelters[randomShelterIndex]._id;
    
    // Create new cat
    const newCat = await Cat.create(cat);

    // Update shelter's cats array
    await Shelter.findByIdAndUpdate(shelters[randomShelterIndex]._id, {
      $push: { cats: newCat._id },
    });
  }

  console.log("Cats seeded successfully");
};