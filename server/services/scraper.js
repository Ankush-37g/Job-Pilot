import axios from "axios";
import cheerio from "cheerio";

export const scrapeJD = async (url) => {
  try {
    if (!url || typeof url !== "string") {
      throw new Error("Valid URL required");
    }

    // Validate URL format
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("URL must start with http:// or https://");
    }

    // Fetch page with timeout
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 second timeout
      maxRedirects: 5,
    });

    // Load HTML with Cheerio
    const $ = cheerio.load(data);

    // Remove script and style tags
    $("script, style, nav, header, footer, button, .ad, .ads, .advertisement")
      .remove();

    // Extract text from main content areas
    let text = $("main, article, [role='main']").text();

    // If no main content found, get all body text
    if (!text.trim()) {
      text = $("body").text();
    }

    // Clean and normalize text
    const cleanText = text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\n+/g, "\n") // Replace multiple newlines
      .trim()
      .substring(0, 4000); // Limit to 4000 chars

    if (!cleanText || cleanText.length < 100) {
      throw new Error("Could not extract sufficient job description text from URL");
    }

    return cleanText;
  } catch (error) {
    console.error("Scraper error:", error.message);

    // Return user-friendly error message
    if (error.code === "ECONNREFUSED") {
      throw new Error("Could not connect to URL. Please check the link.");
    } else if (error.code === "ENOTFOUND") {
      throw new Error("URL domain not found. Please verify the link.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. Website blocked scraping. Please paste job description manually.");
    } else if (error.response?.status === 404) {
      throw new Error("Page not found (404). Please verify the link.");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Website took too long to respond. Please paste job description manually.");
    } else {
      throw new Error(
        `Failed to scrape URL: ${error.message}. Please paste the job description manually instead.`
      );
    }
  }
};

export default { scrapeJD };
