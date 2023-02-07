const Express = require("express");
const router = Express.Router();
const { PythonShell } = require("python-shell");

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
    disease: "Peptic ulcer diseae",
    specialty: "Gastroenterology",
  },
  {
    disease: "AIDS",
    specialty: "Infectious Disease",
  },
  {
    disease: "Diabetes ",
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
    disease: "Hypertension ",
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
    disease: "hepatitis A",
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
    disease: "Dimorphic hemmorhoids(piles)",
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
    disease: "(vertigo) Paroymsal  Positional Vertigo",
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

router.post("/", (req, res) => {
  PythonShell.run(
    "Predictor.py",
    {
      scriptPath:
        "C:/Users/Amanuel/Documents/Senior Project/Final - Integrated/Predictor/",
      args: [req.body.symptoms],
    },
    (err, out) => {
      if (err) {
        res.status(400).send(err.message);
        console.log(err);
      }
      if (out) {
        const spec = diseases.find((dis) => dis.disease === out.toString());
        if (!spec) res.status(400).send("No speciality for the disease found");
        const disease = { name: out.toString(), speciality: spec.specialty };
        res.status(200).send(disease);
      }
    }
  );
});

module.exports = router;
