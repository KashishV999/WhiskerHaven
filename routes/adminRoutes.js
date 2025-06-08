// =============================================================================
// Admin Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, EJS, Chart.js
// Description: This file defines all admin-related routes for managing cats, shelters, and applications.
// =============================================================================

const express = require("express");
const router = express.Router();
const { isAdmin } = require("../config/passportJwt");
const AppError = require("../AppError");

module.exports = (Cat, Shelter, Application) => {
  // =============================================================================
  // Admin - Manage Cats
  // =============================================================================
  router.get("/cats", async (req, res) => {
    try {
      const cats = await Cat.find({}).populate("shelter");
      res.render("adminDashboard/catsManage.ejs", { cats });
    } catch (err) {
      console.error("Error fetching cats:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - Manage Shelters
  // =============================================================================
  router.get("/shelters", async (req, res) => {
    try {
      const shelters = await Shelter.find({});
      res.render("adminDashboard/sheltersManage.ejs", { shelters });
    } catch (err) {
      console.error("Error fetching shelters:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - View All Applications
  // =============================================================================
  router.get("/applications", isAdmin, async (req, res) => {
    try {
      const applications = await Application.find({})
        .populate("cat")
        .populate("user")
        .populate("shelter");
      res.render("adminDashboard/applicationsManage.ejs", { applications });
    } catch (err) {
      console.error("Error fetching applications:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - View Single Application
  // =============================================================================
  router.get("/applications/:id", isAdmin, async (req, res, next) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate("cat")
        .populate("user")
        .populate("shelter");
      if (!application) {
        return next(new AppError("Application not found", 404));
      }
      res.render("adminDashboard/showApplication.ejs", { application });
    } catch (err) {
      console.error("Error fetching application:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - Update Application Status
  // =============================================================================
  router.patch("/applications/:id", isAdmin, async (req, res, next) => {
    try {
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!application) {
        return next(new AppError("Application not found", 404));
      }

      // Return a JSON response instead of redirecting
      res
        .status(200)
        .json({ message: "Application updated successfully", application });



    } catch (err) {
      console.error("Error updating application:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - Dashboard
  // =============================================================================

  router.get("/dashboard", async (req, res) => {
    //Total Cats
    const numCats = await Cat.countDocuments({});

    //Total Shelters
    const numShelters = await Shelter.countDocuments({});

    //Total Applications
    const numApplications = await Application.countDocuments({});

    // =============================================================================
    //cats by Shelter
    const countsByShelter = await Cat.aggregate([
      {
        $lookup: {
          from: "shelters", // name of the Shelter collection in MongoDB
          localField: "shelter", // field in Cat pointing to shelter _id
          foreignField: "_id", // _id field in Shelter collection
          as: "shelter_info",
        },
      },
      {
        $unwind: "$shelter_info", // convert array to object
      },
      {
        $group: {
          _id: "$shelter_info.name", // group by shelter name
          count: { $sum: 1 },
        },
      },
    ]);

    const labelsShelter = countsByShelter.map((item) => item._id); //shelterName
    const dataShelter = countsByShelter.map((item) => item.count); //count of cats in each shelter
    // =============================================================================

    //cat by status

    const countsByStatus = await Cat.aggregate([
      {
        $group: {
          _id: "$status", // Group by status field
          count: { $sum: 1 }, // Count cats in each status
        },
      },
    ]);

    const labelStatus = countsByStatus.map((item) => item._id); //status
    const dataStatus = countsByStatus.map((item) => item.count); //count of cats in each status
    // =============================================================================

    //application by status
    const countsByApplicationStatus = await Application.aggregate([
      {
        $group: {
          _id: "$status", // Group by status field
          count: { $sum: 1 }, // Count applications in each status
        },
      },
    ]);

    const labelApplicationStatus = countsByApplicationStatus.map(
      (item) => item._id
    ); //status
    const dataApplicationStatus = countsByApplicationStatus.map(
      (item) => item.count
    ); //count of applications in each status
    // =============================================================================

    //cat age districution
    const ageDistribution = await Cat.aggregate([
      {
        $bucket: {
          groupBy: "$age", // Group by age field
          boundaries: [0, 1, 3, 5, 8, 10], // Define age buckets
          default: "Other", // Default bucket for ages not in boundaries
        },
      },
    ]);

    const labelAge = ageDistribution.map((bucket) => {
      if (bucket._id === "Other") return "Other";
      return `${bucket._id} - ${bucket._id + 1}`;
    });
    const dataAgeDistribution = ageDistribution.map((item) => item.count); //count of cats in each age bucket
    // =============================================================================

    console.log("Number of cats:", numCats);
    console.log("Number of shelters:", numShelters);
    console.log("Number of applications:", numApplications);
    console.log("Counts by Application Status:", countsByApplicationStatus);
    console.log("Counts by Shelter:", countsByShelter);
    console.log("Counts by Status:", countsByStatus);
    console.log("Age Distribution:", ageDistribution);
    console.log("Labels for Shelter:", labelsShelter);
    console.log("Data for Shelter:", dataShelter);



res.render("adminDashboard/dashBoard.ejs", {
      numCats,
      numShelters,
      numApplications,
      labelsShelter: JSON.stringify(labelsShelter),
      dataShelter: JSON.stringify(dataShelter),
      labelStatus: JSON.stringify(labelStatus),
      dataStatus: JSON.stringify(dataStatus),
      labelApplicationStatus: JSON.stringify(labelApplicationStatus),
      dataApplicationStatus: JSON.stringify(dataApplicationStatus),
      labelAge: JSON.stringify(labelAge),
      dataAgeDistribution: JSON.stringify(dataAgeDistribution),
});
  });

  return router;
};
