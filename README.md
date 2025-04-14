# WhiskerWay

WhiskerWay is a modern cat  platform connecting feline friends with forever homes. It helps users browse adoptable cats from local shelters, view detailed profiles, and streamline the adoption process.

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
├── seeds/                    # Scripts to seed the database
│   ├── seedCats.js           # Script to seed cats into the database
│   └── seedShelters.js       # Script to seed shelters into the database




