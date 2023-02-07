const mongoose = require("mongoose");

// Connect to the database
mongoose
  .connect("mongodb://127.0.0.1/hakim")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err.message));

// Get the Speciality model
const Speciality = require("../models/speciality").Speciality;

// The array of diseases and specialties
const diseases = [
  {
    disease: "Fungal infection",
    specialty: "Dermatology",
  },
  {
    disease: "Allergy",
    specialty: "Allergy and Immunology",
  },
  {
    disease: "GERD",
    specialty: "Gastroenterology",
  },
  {
    disease: "Chronic cholestasis",
    specialty: "Gastroenterology",
  },
  {
    disease: "Drug Reaction",
    specialty: "Dermatology",
  },
  {
    disease: "Peptic ulcer disease",
    specialty: "Gastroenterology",
  },
  {
    disease: "AIDS",
    specialty: "Infectious Disease",
  },
  {
    disease: "Diabetes",
    specialty: "Endocrinology",
  },
  {
    disease: "Gastroenteritis",
    specialty: "Gastroenterology",
  },
  {
    disease: "Bronchial Asthma",
    specialty: "Pulmonology",
  },
  {
    disease: "Hypertension",
    specialty: "Cardiology",
  },
  {
    disease: "Migraine",
    specialty: "Neurology",
  },
  {
    disease: "Cervical spondylosis",
    specialty: "Orthopedics",
  },
  {
    disease: "Paralysis (brain hemorrhage)",
    specialty: "Neurosurgery",
  },
  {
    disease: "Jaundice",
    specialty: "Gastroenterology",
  },
  {
    disease: "Malaria",
    specialty: "Infectious Disease",
  },
  {
    disease: "Chicken pox",
    specialty: "Pediatrics",
  },
  {
    disease: "Dengue",
    specialty: "Infectious Disease",
  },
  {
    disease: "Typhoid",
    specialty: "Infectious Disease",
  },
  {
    disease: "Hepatitis A",
    specialty: "Gastroenterology",
  },
  {
    disease: "Hepatitis B",
    specialty: "Gastroenterology",
  },
  {
    disease: "Hepatitis C",
    specialty: "Gastroenterology",
  },
  {
    disease: "Hepatitis D",
    specialty: "Gastroenterology",
  },
  {
    disease: "Hepatitis E",
    specialty: "Gastroenterology",
  },
  {
    disease: "Alcoholic hepatitis",
    specialty: "Gastroenterology",
  },
  {
    disease: "Tuberculosis",
    specialty: "Infectious Disease",
  },
  {
    disease: "Common Cold",
    specialty: "Family Medicine",
  },
  {
    disease: "Pneumonia",
    specialty: "Pulmonology",
  },
  {
    disease: "Dimorphic hemmorhoids (piles)",
    specialty: "Gastroenterology",
  },
  {
    disease: "Heart attack",
    specialty: "Cardiology",
  },
  {
    disease: "Varicose veins",
    specialty: "Vascular surgery",
  },
  {
    disease: "Hypothyroidism",
    specialty: "Endocrinology",
  },
  {
    disease: "Hyperthyroidism",
    specialty: "Endocrinology",
  },
  {
    disease: "Hypoglycemia",
    specialty: "Endocrinology",
  },
  {
    disease: "Osteoarthristis",
    specialty: "Orthopedics",
  },
  {
    disease: "Arthritis",
    specialty: "Rheumatology",
  },
  {
    disease: "Vertigo (Paroymsal Positional Vertigo)",
    specialty: "Otolaryngology",
  },
  {
    disease: "Acne",
    specialty: "Dermatology",
  },
  {
    disease: "Urinary tract infection",
    specialty: "Urology",
  },
  {
    disease: "Psoriasis",
    specialty: "Dermatology",
  },
  {
    disease: "Impetigo",
    specialty: "Dermatology",
  },
];

const specialities = Array.from(
  new Set(diseases.map((disease) => disease.specialty))
);

Speciality.create(specialities.map((name) => ({ name })))
  .then(() => console.log("Specialities added successfully"))
  .catch((error) => console.error(error));
