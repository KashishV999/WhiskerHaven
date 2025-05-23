# WhiskerWay
> 🚧 **Project Status**: Work in Progress  
> This project is still under development.

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


erDiagram
    USERS ||--o{ FAVORITES : has
    USERS ||--o{ ADOPTION_APPLICATIONS : submits
    USERS ||--o{ DONATIONS : makes
    SHELTERS ||--o{ CATS : houses
    SHELTERS ||--o{ SHELTER_EVENTS : hosts
    CATS ||--o{ CAT_IMAGES : has
    CATS ||--o{ FAVORITES : marked_as
    CATS ||--o{ ADOPTION_APPLICATIONS : subject_of
    CATS ||--o{ SUCCESS_STORIES : featured_in
    
    USERS {
        UUID id PK
        string name
        string email
        string password_hash
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    SHELTERS {
        UUID id PK
        string name
        string location
        string address
        string phone
        string email
        string website
        text description
        string image_url
        json hours
        text mission
        timestamp created_at
        timestamp updated_at
    }
    
    CATS {
        UUID id PK
        UUID shelter_id FK
        string name
        string breed
        string age
        string gender
        string color
        string weight
        text description
        string status
        date arrival_date
        decimal adoption_fee
        boolean spayed_neutered
        boolean vaccinated
        boolean microchipped
        boolean special_needs
        boolean house_trained
        string activity_level
        string coat_length
        boolean good_with_children
        boolean good_with_cats
        boolean good_with_dogs
        text story
        timestamp created_at
        timestamp updated_at
    }
    
    CAT_IMAGES {
        UUID id PK
        UUID cat_id FK
        string image_url
        boolean is_primary
        timestamp created_at
    }
    
    ADOPTION_APPLICATIONS {
        UUID id PK
        UUID user_id FK
        UUID cat_id FK
        UUID shelter_id FK
        string status
        string first_name
        string last_name
        string email
        string phone
        text address
        string city
        string state
        string zip_code
        string housing_type
        string own_rent
        string landlord_contact
        boolean has_children
        string children_ages
        boolean has_other_pets
        text other_pets_details
        string employment_status
        string veterinarian_name
        string veterinarian_phone
        text previous_pets
        text why_adopt
        text care_provisions
        boolean agree_terms
        text admin_notes
        timestamp submitted_at
        timestamp updated_at
    }
    
    FAVORITES {
        UUID id PK
        UUID user_id FK
        UUID cat_id FK
        timestamp created_at
    }
    
    SHELTER_EVENTS {
        UUID id PK
        UUID shelter_id FK
        string title
        text description
        date event_date
        string event_time
        text location
        timestamp created_at
        timestamp updated_at
    }
    
    SUCCESS_STORIES {
        UUID id PK
        UUID cat_id FK
        string adopter_name
        date adoption_date
        text story
        string image_url
        text quote
        boolean is_featured
        timestamp created_at
        timestamp updated_at
    }
    
    DONATIONS {
        UUID id PK
        UUID user_id FK
        UUID shelter_id FK
        decimal amount
        timestamp donation_date
        string payment_method
        boolean is_anonymous
        text message
    }


