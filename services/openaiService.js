// This module handles OpenAI API interactions for cat adoption search and related queries.
// It includes functions for generating embeddings, parsing natural language queries,
// building search pipelines, and generating AI responses for various user intents.

const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CatSchema = require("../models/cat");

// Generate embedding for text (description + story)
async function generateCatEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // More cost-effective
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function parseQuery(naturalLanguageQuery) {
  const prompt = `
You are a smart assistant that extracts structured search parameters from natural language queries about cats for adoption.

You must:
- Infer values from **synonyms** (e.g., "elderly" → "old", "juvenile" → "kitten", etc.)
- Normalize all values to match the schema format and types below
- Only return a **valid JSON object**, with no extra text

Only include a field if it's explicitly mentioned or **strongly implied** by the user.

### Output Fields:
{
 
  "age": {"min": number, "max": number} or number,
  "color": "color mentioned", 
  "gender": "Male" or "Female",
  "weight": {"min": number, "max": number},
  "activity_level": "Low" or "Moderate" or "High",
  "coat_length": "Short" or "Medium" or "Long", 
  "good_with_children": true/false,
  "good_with_cats": true/false,
  "good_with_dogs": true/false,
  "special_needs": true/false,
  "microchipped": true/false,
  "spayed_neutered": true/false,
  "vaccinated": true/false,
  "house_trained": true/false,
  "semantic_terms": "descriptive keywords or behavioral traits or breed names"
}

### Important Rules:
- NEVER default any boolean field to false unless the query **explicitly** says so (e.g., "not good with dogs").
- Do not include fields with null or undefined values.
- Do not return synonyms as-is. Instead, **map them properly** according to the following:

### AGE Mapping Logic:
- “kitten”, “baby”, “tiny”, “juvenile” → "age": { "max": 1 }
- “young”, “playful”, “small” → "age": { "max": 3 }
- “adult”, “mature”, “grown” → "age": { "min": 4, "max": 10 }
- “senior”, “elderly”, “old”, “aging” → "age": { "min": 10 }

### COAT LENGTH Mapping:
Normalize descriptive terms like:
- "short fur", "short-haired" : "coat_length": "Short"
- “medium coat”, “semi-long” → "coat_length": "Medium"
- “long-haired”, “fluffy”, “luxurious coat” → "coat_length": "Long"

### Output Format:
Only return a **valid, compact JSON object**. Do not include explanations or comments.

---
Example Queries and Responses:

1. Query: “I want a calm, elderly female cat”
→
{
  "age": { "min": 8 },
  "gender": "Female",
  "semantic_terms": "calm"
}

2. Query: “Looking for a playful kitten good with kids and dogs”
→
{
  "age": { "max": 1 },
  "good_with_children": true,
  "good_with_dogs": true,
  "semantic_terms": "playful"
}


3. Query: “Looking for a independent cat”
→
{
  "semantic_terms": "independent"
}


Query: "${naturalLanguageQuery}"
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing query:", error);
    return { semantic_terms: naturalLanguageQuery };
  }
}

async function buildAtlasSearchPipeline(
  parsedParams,
  queryEmbedding = null,
  limit = 20
) {
  console.log("Building search pipeline...");
  console.log("Input parameters:", {
    parsedParams,
    hasEmbedding: !!queryEmbedding,
    limit,
  });

  const pipeline = [];
  const filterConditions = buildMongoFilters(parsedParams);

  // Always filter for available pets
  filterConditions.push({ status: "Available" });

  // =============================================================================
  // STEP 1: VECTOR SEARCH (if embedding provided)
  // =============================================================================
  if (queryEmbedding) {
    console.log("-----------------------------------------------");
    console.log("\nUsing VECTOR SEARCH as primary strategy");
    console.log("-----------------------------------------------");

    pipeline.push({
      $vectorSearch: {
        index: "cat_embedding_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 200,
        limit: 100,
      },
    });
    console.log("- Added $vectorSearch stage");

    // Add vector score
    pipeline.push({
      $addFields: {
        vectorScore: { $meta: "vectorSearchScore" },
      },
    });
    console.log("- Added vectorScore field");

    // Apply all filters after vector search
    if (filterConditions.length > 0) {
      pipeline.push({ $match: { $and: filterConditions } });
      console.log("- Added post-vector search filters:", filterConditions);
    }

    // Sort by vector score
    pipeline.push({ $sort: { vectorScore: -1 } });
    console.log("- Added sort by vectorScore");
  }
  // =============================================================================
  // STEP 2: REGULAR MONGO FILTERS (no vector search)
  // =============================================================================
  else {
    console.log("-----------------------------------------------");
    console.log("\nUsing REGULAR MONGO FILTERS");
    console.log("-----------------------------------------------");

    if (filterConditions.length > 0) {
      pipeline.push({ $match: { $and: filterConditions } });
      console.log("- Added initial filters:", filterConditions);
    }

    // Default sort (by _id or any other field you prefer)
    pipeline.push({ $sort: { _id: -1 } });
    console.log("- Added default sort");
  }

  // =============================================================================
  // FINAL STAGES
  // =============================================================================
  pipeline.push({ $limit: limit });
  //console.log(`\nAdded $limit stage (${limit} documents)`);

  //console.log('\nFinal pipeline:', JSON.stringify(pipeline, null, 2));
  return pipeline;
}

// Helper function to build standard MongoDB filters
function buildMongoFilters(parsedParams) {
  const filters = [];

  // Exact match filters
  const exactMatchFields = ["gender", "activity_level", "coat_length"];
  exactMatchFields.forEach((field) => {
    if (parsedParams[field]) {
      filters.push({ [field]: parsedParams[field] });
    }
  });

  // Boolean filters
  const booleanFields = [
    "good_with_children",
    "good_with_cats",
    "good_with_dogs",
    "special_needs",
    "spayed_neutered",
    "vaccinated",
    "house_trained",
  ];
  booleanFields.forEach((field) => {
    if (parsedParams[field] !== undefined) {
      filters.push({ [field]: parsedParams[field] });
    }
  });

  // Range filters
  if (parsedParams.age) {
    const ageFilter = {};
    if (typeof parsedParams.age === "number") {
      ageFilter.$lte = parsedParams.age;
    } else {
      if (parsedParams.age.min !== undefined)
        ageFilter.$gte = parsedParams.age.min;
      if (parsedParams.age.max !== undefined)
        ageFilter.$lte = parsedParams.age.max;
    }
    if (Object.keys(ageFilter).length > 0) {
      filters.push({ age: ageFilter });
    }
  }

  if (parsedParams.weight) {
    const weightFilter = {};
    if (parsedParams.weight.min !== undefined)
      weightFilter.$gte = parsedParams.weight.min;
    if (parsedParams.weight.max !== undefined)
      weightFilter.$lte = parsedParams.weight.max;
    if (Object.keys(weightFilter).length > 0) {
      filters.push({ weight: weightFilter });
    }
  }

  return filters;
}

// Progressive search using Atlas Search and Vector Search
async function progressiveSearch(
  CatModel,
  naturalLanguageQuery,
  limit = 20,
  language = "en"
) {
  try {
    console.log("Parsing query:", naturalLanguageQuery);
    const parsedParams = await parseQuery(naturalLanguageQuery);
    console.log("Parsed parameters:", parsedParams);

    let queryEmbedding = null;

    // Generate embedding if we have semantic terms
    if (parsedParams.semantic_terms) {
      console.log("Generating embedding for:", parsedParams.semantic_terms);
      queryEmbedding = await generateCatEmbedding(parsedParams.semantic_terms);
    }

    // Build Atlas aggregation pipeline
    pipeline = await buildAtlasSearchPipeline(
      parsedParams,
      queryEmbedding,
      limit
    );
    //console.log('Atlas pipeline:', JSON.stringify(pipeline, null, 2));

    // Execute search
    cats = await CatModel.aggregate(pipeline);
    const populatedCats = await CatModel.populate(cats, {
      path: "shelter",
      select: "name location phone email",
    });
    console.log(`Found ${cats.length} cats`);

    // === Fallback if no cats found
    if (cats.length === 0 && queryEmbedding) {
      console.log("\n-----------------------------------------------");
      console.log(
        "No results found with filters — Fallback to SEMANTIC VECTOR SEARCH ONLY"
      );
      console.log("-----------------------------------------------");

      // Rebuild pipeline without filters
      pipeline = [
        {
          $vectorSearch: {
            index: "cat_embedding_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 200,
            limit: 100,
          },
        },
        {
          $addFields: {
            vectorScore: { $meta: "vectorSearchScore" },
          },
        },
        {
          $sort: { vectorScore: -1 },
        },
        {
          $limit: limit,
        },
      ];

      cats = await CatModel.aggregate(pipeline);
      console.log(`Fallback vector search found ${cats.length} cats`);
    }

    // console.log("------------------------------RESULTSSSSSSS---------------------------------");
    // console.log(cats)
    // console.log("---------------------------------------------------------------");

    //generateSearchExplanation({ originalQuery, parsedParams, cats })
    const explanation = await generateSearchExplanation({
      originalQuery: naturalLanguageQuery,
      parsedParams,
      cats,
      language,
    });

    console.log(
      "------------------------------Explantaion---------------------------------"
    );
    console.log("Generated explanation:", explanation);
    console.log(
      "---------------------------------------------------------------"
    );

    return {
      query: naturalLanguageQuery,
      parsedParams,
      totalFound: cats.length,
      results: cats,
      explanation,
      pipeline: pipeline, // For debugging
      explanation,
    };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

function generateFallbackMessage(catCount) {
  const messages = [
    `${catCount} wonderful companions are waiting at Whisker Haven!`,
    `We've got ${catCount} potential matches eager to meet you!`,
    `${catCount} adorable cats are ready for their forever homes!`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Fallback search for when Atlas indexes are not available
async function fallbackSearch(CatModel, naturalLanguageQuery, limit = 20) {
  console.log(
    "---------------------------------------------------------------"
  );
  console.log("Fallback serach - ATLAS ERROR HAPPENED");
  console.log(
    "---------------------------------------------------------------"
  );
  try {
    const parsedParams = await parseQuery(naturalLanguageQuery);

    // Build basic MongoDB filter
    const filter = { status: "Available" };

    //if (parsedParams.breed) filter.breed = new RegExp(parsedParams.breed, 'i');
    if (parsedParams.color) filter.color = new RegExp(parsedParams.color, "i");
    if (parsedParams.gender) filter.gender = parsedParams.gender;
    if (parsedParams.activity_level)
      filter.activity_level = parsedParams.activity_level;

    // Add other filters...
    const booleanFields = [
      "good_with_children",
      "good_with_cats",
      "good_with_dogs",
      "special_needs",
      "spayed_neutered",
      "vaccinated",
      "house_trained",
      "microchipped",
    ];

    booleanFields.forEach((field) => {
      if (parsedParams[field] !== undefined) {
        filter[field] = parsedParams[field];
      }
    });

    if (parsedParams.age) {
      if (typeof parsedParams.age === "number") {
        filter.age = parsedParams.age;
      } else {
        filter.age = {};
        if (parsedParams.age.min !== undefined)
          filter.age.$gte = parsedParams.age.min;
        if (parsedParams.age.max !== undefined)
          filter.age.$lte = parsedParams.age.max;
      }
    }

    const cats = await CatModel.find(filter).limit(limit);

    return {
      query: naturalLanguageQuery,
      parsedParams,
      totalFound: cats.length,
      results: cats,
      searchType: "fallback",
    };
  } catch (error) {
    console.error("Fallback search error:", error);
    throw error;
  }
}

function buildSearchPrompt({ originalQuery, cats, language = "en" }) {
  const catProfiles = cats.map(({ __v, embedding, ...cat }) => ({
    ...cat,
    profile_link: `https://whisker-way.vercel.app/cats/${cat._id}`,
  }));

  const userPrompt = `
USER'S SEARCH: "${originalQuery}"

CAT PROFILES:
${JSON.stringify(catProfiles, null, 2)}

GENERATE:
ISO CODE LANGUAGE: ${language}
STRICTLY Response in ${language} language, with the following structure:
1. Opening line reflecting search query
2. Numbered list with 3 cats max [BOLD NAME, AGE, BREED]
3. For each:
  - keep paragraphs short (max 2 sentences)
   - Name/age/breed header
   - why they match(properly)
   - Health status (vaccinated/neutered)
   - Unique detail only if given somewhere or story highlight
   
4. Closing invitation
`;

  const systemMessage = `
  
  You are Whisker Haven's adoption matchmaker. Create warm, personalized cat introductions that:

1. OPEN with enthusiasm about the matches
We've got wonderful cats waiting to meet you!** 😊
"Hi there! We're thrilled to present..."
- Can include emojis if appropriate
2. FOR EACH CAT (use numbered list):
- Name/age/breed header (e.g., "1. Milo, 3-year-old Male Exotic Shorthair")
- Personality story: "A sun-worshipper who..."
- Matching traits: "Tell why it matches the user's search"
- Special detail: "Fun fact:..." only if given — do not make up fake info

3. CLOSE with invitation:
"These sweethearts are waiting for you! Check them out on our Website"

RULES:
- Never use bullets/hyphens
- Never mention missing results
- Keep paragraphs short (max 2 sentences)
- Include: vaccination/neuter status
- Shelter contact: Toronto, 123-456-7890
- Tone: Like a friend recommending pets
`;

  return {
    system: systemMessage,
    user: userPrompt,
  };
}

async function generateAIResponse({ system, user }) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 450,
    });

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error("AI response error:", error.message);
    return null;
  }
}

async function generateSearchExplanation({
  originalQuery,
  cats,
  language = "en",
}) {
  //   if (!cats?.length) {
  //     return "**We've got wonderful cats waiting to meet you!** 😊";
  //   }

  const promptParts = buildSearchPrompt({
    originalQuery,
    cats,
    responseFormat: "markdown", // Tell AI to use Markdown,
    language, // Pass the language for localized responses
  });

  try {
    const explanation = await generateAIResponse({
      ...promptParts,
      format: "markdown", // Ensure your AI helper knows to use Markdown
    });

    return explanation || generateFallbackMessage(cats.length);
  } catch (error) {
    console.error("Explanation error:", error);
    return generateFallbackMessage(cats.length);
  }
}

//classify intent of the query

async function classifyUserIntent(query) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Classify the user message as one of: [cat_search, adoption_question, donation, cat_wellnessInfo,  off_topic]. Strictly return only one of these categories based on the user's intent.
          Examples:
          - "I want to adopt a cat" → "adoption_question"
          - "Tell me about the adoption process" → "adoption_question"
          - "How can I donate?" → "donation"
          - "What is the weather like today?" → "off_topic"
          - "I want to see available cats for adoption" → "cat_search"
          - "Can you help me find a cat?" → "cat_search"
          - "What are the steps to adopt a cat?" → "adoption_question"
          - "I want to donate money to the shelter" → "donation"
          - "What is the best cat food?" → "off_topic"
          - "How can I help the shelter?" → "off_topic"
          - "I want to adopt a cat from your shelter" → "adoption_question"
          - "Can you tell me about the cats available for adoption?" → "cat_search"
          - "I want to support the shelter financially" → "donation"
          - "What is your favorite cat breed?" → "off_topic"
         `,
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  return response.choices[0].message.content.trim(); // will be "cat_search", "adoption_question", or "donation" or "off_topic"
}

async function generateAdoptionResponse(query, language = "en") {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `
        ISO CODE LANGUAGE: ${language}
         -STRICTLY Reply in ${language} language 
        Generate a friendly message encouraging adoptions from the shelter. Tell 6 steps of the adoption process.
        -Keep it short concise and pointwise
          - Can include emojis 
        -Bullet point and Bold the keywords
            1. Browse & Discover: Browse our available pets online or visit our shelter to meet them in person.
            2. Apply: Fill out our comprehensive adoption application form.
            3. Interview: Meet with our adoption counselors for a friendly interview.
            4. Meet & Greet: Spend quality time with your potential new family member.
            5. Finalize: Complete paperwork and pay the adoption fee.
            6. Welcome Home!: Take your new family member home and start your journey together.
            
`,
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

//Donation
async function generateDonationResponse(query, language = "en") {
  console.log("--------------------------------");
  console.log(`Language set to: ${language}`);
  console.log("--------------------------------");
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",

    messages: [
      {
        role: "system",
        content: `
        ISO CODE LANGUAGE: ${language}
         -Reply in ${language} language 
        Generate a friendly message encouraging donations to the shelter. Tell  steps of the donation process.
        -  -Keep it short concise and pointwise AND INCLUDE THE STEPS
          - Can include emojis if appropriate
        - Bullet point and Bold the keywords
            1. Visit our donation page 
            2. Choose your donation amount.
            3. Fill out your payment information.
            4. Review your donation details.
            5. Submit your donation.
          
            End with a thank you message for supporting the shelter and its mission.
            `,
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

async function handleCatWellnessInfoQuery(query, language = "en") {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `
        ISO CODE LANGUAGE: ${language}
        -STRICTLY Reply in ${language} language 
          You are an expert cat care assistant. Answer questions about cat wellness, including health, nutrition, grooming, vaccinations, and emotional well-being in a clear, friendly, and responsible way. If the question is unrelated to cat care, politely inform the user.
        `,
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

//off topic questions handle
async function handleOffTopicQuery(query, language = "en") {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.8, // Extra playful tone
    max_tokens: 120,
    messages: [
      {
        role: "system",
        content: `
        ISO CODE LANGUAGE: ${language}
         -STRICTLY Reply in ${language} language 
        Your name is Whisker Bot , You are Whisker Haven Shelter's purr-sonal assistant! 🐾 Your job:
1. Redirect off-topic questions with humor and warmth 😊  
2. Use cat puns and emojis (but don’t overdo it!)  
3. Suggest asking about recommendations for cats, adoption, or the donation process playfully  
4. Keep responses short (2-3 sentences max)  

`,
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

module.exports = {
  generateCatEmbedding,
  progressiveSearch,
  fallbackSearch,
  classifyUserIntent,
  generateAdoptionResponse,
  generateDonationResponse,
  handleOffTopicQuery,
  handleCatWellnessInfoQuery,
};
