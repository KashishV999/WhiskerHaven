# WhiskersHaven [![Live Demo](https://img.shields.io/badge/%F0%9F%94%97-Live_Demo-2ea44f?style=flat)](https://whisker-way.vercel.app/)

> **Live Site:** [WhiskersHaven](https://whisker-way.vercel.app/)  
> *A full-stack platform connecting cat lovers with shelters*

## Table of Contents  
- [Description](#description)
- [Technology Stack](#technology-stack)  
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)
- [Feature Screenshot](#feature-screenshot)
- [Live Demo](#live-demo)
- [Upcoming Features](#upcoming-features)
##  🐾 Description  

**WhiskersHaven** is a full-stack web application built to simplify and enhance the cat adoption experience. It bridges the gap between animal shelters and potential adopters through a secure, interactive platform  with secure authentication, real-time interactions, and an admin dashboard.

 ## Technology Stack  

- **Backend**: Node.js, Express.js, Passport.js (local & OAuth), JWT, Bcrypt.js, Joi, Multer, Mongoose
- **Frontend**: EJS, Tailwind CSS
- **Database**: MongoDB Atlas (Cloud-hosted)
- **APIs & Integration**:
    - Stripe (payments)
    - Nodemailer (email sending),
    - Chart.js (data visualization)
    - Google Maps JavaScript API (location services)
    - Cloudinary (image hosting)
- **Deployment**: Vercel

## Features  
  #### User Authentication and Security  
  - User authentication with **Passport.js** and **JWT**
  - Social Login via **Google OAuth** and **Facebook**.
  - **Role-Based Access Control (RBAC)** for Admin and User roles with separate UIs
  - Security: Bcrypt hashing, form validation(client-side), Joi(server-side)
    
  #### Core Functionalities
  - Search, Filter, paginate to navigate
  - **Reddit-style nested comments** with recursive MongoDB schema for threaded discussions
  - View detailed cat profiles and shelter information with **Google Maps** location integration
  - User-centric features: Mark favorites and manage adoption applications
  - Full Adoption Workflow
    
  #### Admin Dashboard
  - RBAC-secured dashboard for admins only
  - Admin controls for managing users, shelters, and applications
  - **Chart.js** for dynamic adoption analytics

  #### Integrations
  - **Stripe Checkout** for seamless donation processing
  - **Nodemailer** integration to send contact form messages directly to the organization
  - **Google Maps** API to visually pinpoint shelter locations
  - **Chart.js** for clear, real-time data visualization on the admin dashboard
  - **Cloudinary + Multer** for optimized image uploading and cloud hosting

## Architecture
 ### The ER diagram below outlines the core data model of WhiskersHaven
<div align="center">
  <img src="./assets/ERD_Diagram.png" alt="WhiskersHaven ERD" width="800" style="border: 1px solid #ddd; border-radius: 8px;"/>
</div>

## Installation

### Clone the Repository
```bash
git clone git@github.com:KashishV999/WhiskerWay.git
cd WhiskerWay
```

### Install the dependencies
```bash
npm install
```
### Setup the environment Variables
```bash
# MongoDB Atlas
MONGODB_CONN_STRING=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Whisker-Way?retryWrites=true&w=majority
SECRET_KEY=your_mongo_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=http://localhost:3000/api/auth/google/callback  # For local dev

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback  # For local dev

# Google Maps API
GOOGLE_MAPS_API=your_google_maps_api_key

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_PRIVATE_KEY=your_stripe_private_key

# Email
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```
### Start the Application
```
npm start
```
or

```
nodemon app.js
```
### Open your browser and visit
```
http://localhost:3000
```


## Usage
### 🔐 Explore the App

- Click **“Sign In”** on the top right to open the login modal.
- Use **Google/Facebook login**, or try the demo buttons (Quick Access Demo):
  - **Sign in as User** 
  - **Sign in as Admin**

> ✨ Demo buttons auto-fill credentials and take you directly to the respective dashboards.


## Folder Structure  

```
WhiskerWay/

├── app.js                         # Entry point of the application
├── config/                        # Configuration files
│   ├── Auth.js                    # JWT authentication configuration
│   ├── database.js                # MongoDB connection setup
│   ├── cloudinary.js              # Cloudinary configuration
│   ├── passportGoogle.js          # Google OAuth configuration
│   ├── passportJwt.js             # JWT authentication configuration
│   ├── passportFacebook.js        # Facebook OAuth configuration
│   └── emailService.js            # Email service configuration
├── data/                          # Seed data
│   ├── catData.js                
│   └── shelterData.js            
├── models/                        # Mongoose models
│   ├── cat.js                   
│   ├── shelter.js                
│   ├── application.js             
│   ├── user.js                   
│   └── comments.js               
├── public/                        # Static assets
│   ├── css/                      
│   ├── js/                       
│   └── images/                   
├── routes/                        # Application routes
│   ├── catsRoute.js               # Routes for cats
│   ├── shelterRoute.js            # Routes for shelters
│   ├── nestedRoutes.js            # Routes for nested 
│   ├── adminRoutes.js             # Admin dashboard routes
│   ├── authRoutes.js              # Authentication routes
│   ├── userRoutes.js              # User profile routes
│   ├── contactRoutes.js           # Contact form routes
│   ├── commentRoutes.js           # Comment system routes
│   └── paymentRoutes.js           # Payment processing routes 
├── seeds/                         # Database seeding scripts
│   ├── seedCats.js               
│   └── seedShelters.js          
├── views/                         # EJS templates
│   ├── layouts/                   # Layout templates
│   ├── partials/                  # Reusable partials
│   ├── cats/                      # Cat views
│   ├── shelters/                  # Shelter views
│   ├── adoption/                  # Adoption process views
│   ├── adminDashboard/            # Admin dashboard views
│   └── error.ejs                  # Error page template
├── schemaSecurity.js              # Joi validation schemas
```
## Feature Screenshot

### Role-Based Access Control (RBAC)
| ![User Dashboard](./assets/User.png) | ![Admin Dashboard](./assets/Admin_dashboard.png) |
|:--:|:--:|
| *User View* | *Admin Dashboard with Real-Time Analytics* |

### Social Login and Reddit-Style Nested Comments
| ![Social Login](./assets/login.png) | ![Reddit-Style Comments](./assets/reddit.png)<br>[Try It Out](https://whisker-way.vercel.app/shelters/682bb915e21083b8b4b4a872#comments-section) |
|:--:|:--:|
| *User Social Login (Google & Facebook OAuth)* | *Recursive Reddit-Style Nested Comments* |

### Google Maps Integration and Stripe Donation Checkout
| ![Maps Integration](./assets/maps.png) | ![Stripe Donation](./assets/stripe.png) |
|:--:|:--:|
| *Google Maps - Shelter Location* | *Stripe - Donation Checkout* |


## **Live Demo**  
> 💡 Explore more features like detailed cat/shelter pages, search filters, application management, and contact email integrations live on the site, admin functionalities.

[![Explore WhiskersHaven](https://img.shields.io/badge/🚀_Explore_WhiskersHaven-Live_Demo-FF6B6B?style=for-the-badge&logo=vercel&logoColor=white)](https://whisker-way.vercel.app)

## Upcoming Features
### 🔮 Stay Tuned for Upcoming Features

Exciting updates coming soon:  
AI integration, smarter interactions, LLM-powered features, extended pet shop, and more enhancements!


