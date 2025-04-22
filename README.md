# WhiskerWay

WhiskerWay is a modern cat adoption platform connecting feline friends with forever homes. It helps users browse adoptable cats from local shelters, view detailed profiles, and streamline the adoption process.

## Features

- **Cat Profiles**: View detailed profiles of adoptable cats, including their breed, age, color, weight, and personality description.
- **Shelter Information**: Learn about local shelters, their mission, and contact details.
- **CRUD Operations**: Full Create, Read, Update, and Delete functionality for managing cats and shelters.
- **Database Integration**: Uses MongoDB to store and manage data for cats and shelters.

## Project Structure

```WhiskerWay/
├── .gitignore                # Specifies files and directories to ignore in Git
├── LICENSE                   # MIT License for the project
├── README.md                 # Project documentation
├── app.js                    # Entry point of the application
├── package.json              # Project metadata and dependencies
├── config/                   # Configuration files
│   └── database.js           # MongoDB connection setup
├── data/                     # Seed data for the database
│   ├── catData.js            # Array of cat data
│   └── shelterData.js        # Array of shelter data
├── models/                   # Mongoose schemas and models
│   ├── cat.js                # Cat schema and model
│   └── shelter.js            # Shelter schema and model
├── public/                   # Static assets (e.g., images, CSS, JS)
│   ├── css/                  # Custom CSS files (optional)
│   ├── js/                   # Custom JavaScript files (optional)
│   └── assets/               # Other static assets (e.g., logos, icons)
├── routes/                   # Application routes
│   ├── catsRoute.js          # Routes for cats
│   └── shelterRoute.js       # Routes for shelters
├── seeds/                    # Scripts to seed the database
│   ├── seedCats.js           # Script to seed cats into the database
│   └── seedShelters.js       # Script to seed shelters into the database
├── views/                    # EJS templates for rendering pages
│   ├── layouts/              # Layout templates
│   │   └── layout.ejs        # Main layout template
│   ├── partials/             # Reusable partial templates
│   │   ├── header.ejs        # Header partial
│   │   └── footer.ejs        # Footer partial
│   ├── cats/                 # Templates for cats
│   │   ├── index.ejs         # List all cats
│   │   ├── show.ejs          # Show details of a single cat
│   │   ├── new.ejs           # Form to add a new cat
│   │   └── edit.ejs          # Form to edit a cat
│   ├── shelters/             # Templates for shelters
│   │   ├── index.ejs         # List all shelters
│   │   ├── show.ejs          # Show details of a single shelter
│   │   ├── new.ejs           # Form to add a new shelter
│   │   └── edit.ejs          # Form to edit a shelter
│   └── home.ejs              # Homepage template



