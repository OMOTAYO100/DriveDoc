import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_URL = "https://raw.githubusercontent.com/adamisntdead/theory-test-questions/master/data.json";
const OUTPUT_FILE = path.join(__dirname, '../testData.json');

// Helper to map categories (Reuse logic from src/utils/categoryMapping.js but simplified for Node)
const getDisplayCategory = (oldCategory, questionText) => {
  const combined = (oldCategory + " " + questionText).toLowerCase();
  
  if (combined.includes("sign")) return "Road and traffic signs";
  if (combined.includes("accident") || combined.includes("emergency") || combined.includes("crash")) return "Incidents, accidents and emergencies";
  if (combined.includes("bus") || combined.includes("truck") || combined.includes("motorcycle") || combined.includes("tram")) return "Other types of vehicle";
  if (combined.includes("control") || combined.includes("handling") || combined.includes("skid")) return "Vehicle handling";
  if (combined.includes("motorway") || combined.includes("lane")) return "Motorway rules";
  if (combined.includes("rule") || combined.includes("law") || combined.includes("priority")) return "Rules of the road";
  if (combined.includes("margin") || combined.includes("distance") || combined.includes("weather") || combined.includes("fog")) return "Safety margins";
  if (combined.includes("maintenance") || combined.includes("safety") || combined.includes("check") || combined.includes("tire")) return "Safety and your vehicle";
  if (combined.includes("pedestrian") || combined.includes("cyclist") || combined.includes("child")) return "Vulnerable road users";
  if (combined.includes("load") || combined.includes("tow") || combined.includes("weight")) return "Vehicle loading";
  if (combined.includes("alert") || combined.includes("tired") || combined.includes("fatigue") || combined.includes("alcohol")) return "Alertness";
  if (combined.includes("attitude") || combined.includes("behavior") || combined.includes("aggressive")) return "Attitude";
  if (combined.includes("document") || combined.includes("licens") || combined.includes("insur")) return "Documents";

  return "Rules of the road"; 
};

// Fetch data
const fetchData = () => {
    return new Promise((resolve, reject) => {
        https.get(DATA_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        });
    });
};

const run = async () => {
    try {
        console.log("Fetching external data...");
        const externalData = await fetchData();
        console.log(`Fetched ${externalData.length} questions.`);

        console.log("Reading existing data...");
        const existingContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
        const existingJson = JSON.parse(existingContent);
        
        let startId = 1000;

        const newQuestions = externalData.map((item, index) => {
            // Map external structure to our structure
            // External: { question, heading, explanation, image, questions: [options], answer, id }
            // Ours: { id, text, options: [{key, text}], answer: "A", explanation, category, difficulty, time_sec, imageUrl }

            const options = item.questions.map((opt, i) => {
                const key = String.fromCharCode(65 + i); // 0->A, 1->B...
                return { key, text: opt };
            });

            // Find correct answer key
            const correctOption = options.find(o => o.text === item.answer);
            const answerKey = correctOption ? correctOption.key : "A"; // Fallback if exact match fails (data quality)

            return {
                id: `IMP${startId + index}`,
                text: item.question,
                options: options,
                answer: answerKey,
                explanation: item.explanation.replace("Explantion: ", ""),
                difficulty: "Intermediate", // Default
                category: getDisplayCategory(item.heading, item.question),
                time_sec: 45,
                imageUrl: item.image // Add image URL
            };
        });

        console.log(`Processed ${newQuestions.length} new questions.`);

        // Merge keeping existing ones
        const combinedQuestions = [...existingJson.questions, ...newQuestions];
        
        // Update meta
        const finalJson = {
            ...existingJson,
            meta: {
                ...existingJson.meta,
                total_questions: combinedQuestions.length
            },
            questions: combinedQuestions
        };

        console.log(`Writing total ${combinedQuestions.length} questions to file...`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalJson, null, 2));
        console.log("Done!");

    } catch (error) {
        console.error("Error:", error);
    }
};

run();
