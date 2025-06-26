// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require("mongoose");
const catData = require("../data/catData");
const { generateCatEmbedding } = require('../services/openaiService');
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
  const textToEmbed = `${cat.description || ''} ${cat.story || ''} ${cat.breed || ''}`.trim();
  const embedding = await generateCatEmbedding(textToEmbed);
    // Create new cat
    const newCat = await Cat.create({...cat, embedding });

    // Update shelter's cats array
    await Shelter.findByIdAndUpdate(shelters[randomShelterIndex]._id, {
      $push: { cats: newCat._id },
    });
  }

  console.log("Cats seeded successfully");
};