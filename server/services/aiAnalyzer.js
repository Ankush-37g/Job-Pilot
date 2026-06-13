import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeJobFit = async (jdText, resumeText) => {
  try {
    if (!jdText || !resumeText) {
      throw new Error("Job description and resume text are required");
    }

    const prompt = `You are a recruitment analyst. Compare the resume to the job description and provide a detailed analysis.

IMPORTANT: Return ONLY valid JSON with no additional text or markdown formatting.

Job Description:
${jdText.substring(0, 3000)}

Resume:
${resumeText.substring(0, 3000)}

Return this exact JSON structure:
{
  "company": "company name extracted from JD",
  "role": "job title",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "matchScore": 75,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "improvementTips": ["tip1", "tip2", "tip3"]
}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawContent = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    const cleanContent = rawContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse JSON
    const analysisResult = JSON.parse(cleanContent);

    // Validate required fields
    if (!analysisResult.matchScore || !Array.isArray(analysisResult.matchedSkills)) {
      throw new Error("Invalid response format from AI");
    }

    return analysisResult;
  } catch (error) {
    console.error("AI Analyzer error:", error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

export default { analyzeJobFit };
