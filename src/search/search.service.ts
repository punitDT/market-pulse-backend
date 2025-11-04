import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { TavilySearch } from "@langchain/tavily";
import { z } from 'zod';

// Helper function to normalize array fields (handles null, string, or array)
const normalizeToArray = (value: any): string[] | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return undefined;
};

// Helper function for required arrays (returns empty array if null/undefined)
const normalizeToRequiredArray = (value: any): string[] => {
    if (value === null || value === undefined) return [];
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return [];
};

// Define the competitor details schema with preprocessing
const CompetitorDetailsSchema = z.object({
    name: z.string().describe('Competitor product/company name'),
    website_url: z.string().optional().describe('Official website URL of the competitor (e.g., https://example.com)'),
    key_features: z.preprocess(
        normalizeToRequiredArray,
        z.array(z.string())
    ).describe('Comprehensive list of ALL features, capabilities, and functionalities offered by this competitor. Include as many details as available from the sources.'),
    pricing_model: z.preprocess(
        normalizeToArray,
        z.array(z.string()).optional()
    ).describe('Pricing information specific to this competitor'),
    tech_stack: z.preprocess(
        normalizeToArray,
        z.array(z.string()).optional()
    ).describe('Technology stack used by this competitor'),
    target_market: z.preprocess(
        normalizeToArray,
        z.array(z.string()).optional()
    ).describe('Target audience for this competitor'),
    market_positioning: z.preprocess(
        normalizeToArray,
        z.array(z.string()).optional()
    ).describe('How this competitor positions itself'),
});

export type CompetitorDetails = z.infer<typeof CompetitorDetailsSchema>;

// Define the response schema for structured output
const MarketAnalysisSchema = z.object({
    summary: z.array(z.string()).describe('Brief overview in 2-3 bullet points about what was found'),
    competitors_details: z.array(CompetitorDetailsSchema).describe('Detailed information for each competitor individually'),
});

export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;

export interface SearchResponse {
    success: boolean;
    data?: MarketAnalysis;
    metadata?: {
        query: string;
        timestamp: string;
        sources_count: number;
    };
    error?: string;
}

@Injectable()
export class SearchService {

    constructor() {
    }


    async searchAndSummarize(query: string): Promise<SearchResponse> {
        try {
            // Validate input
            if (!query || query.trim().length === 0) {
                return {
                    success: false,
                    error: 'Query cannot be empty'
                };
            }

            // Helper function to check if URL is a blog/news/article (not a product page)
            const isArticleUrl = (url: string): boolean => {
                const articlePatterns = [
                    // Path patterns
                    '/blog/', '/news/', '/article/', '/post/', '/press/', '/newsletter',
                    '/20', // Year patterns like /2023/, /2024/
                    '/watch?v=', // YouTube videos

                    // News/Media domains
                    'medium.com', 'techcrunch.com', 'forbes.com', 'entrepreneur.com',
                    'venturebeat.com', 'theverge.com', 'wired.com', 'cnet.com',
                    'businessinsider.com', 'reuters.com', 'bloomberg.com',
                    'futurism.com', 'yourstory.com', 'technologyreview.com',
                    'observer.com', 'voicebot.ai', 'youtube.com',
                    'socialmediaexaminer.com', 'boardsi.com',
                    'genape.ai', // Tutorial/article site
                ];
                return articlePatterns.some(pattern => url.toLowerCase().includes(pattern));
            };

            // Helper function to extract URLs from content (finds https://... patterns)
            const extractUrlsFromContent = (content: string): string[] => {
                const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                const matches = content.match(urlRegex) || [];
                return matches.filter(url => !isArticleUrl(url));
            };

            // Helper function to score URL quality (higher = better)
            const scoreUrl = (url: string): number => {
                let score = 0;

                // Penalize article URLs heavily
                if (isArticleUrl(url)) score -= 100;

                // Prefer root domains or simple paths
                const pathDepth = (url.match(/\//g) || []).length;
                if (pathDepth <= 3) score += 10; // https://example.com/ = 3 slashes
                if (pathDepth > 5) score -= 5;

                // Prefer common TLDs for products
                if (url.match(/\.(io|com|ai|app|tech)$/)) score += 5;

                // Penalize query parameters
                if (url.includes('?')) score -= 3;

                // Prefer HTTPS
                if (url.startsWith('https://')) score += 2;

                return score;
            };

            // Initialize Tavily web search tool
            const searchTool = new TavilySearch({
                maxResults: 8,
                tavilyApiKey: process.env.TAVILY_API_KEY,
            });

            // System prompt for market analysis (optimized for token efficiency)
            const systemPrompt = `You are MarketPulse AI - a competitor analysis expert.

Extract competitor information from search results that matches the user's query.

PRIORITY: Extract COMPREHENSIVE FEATURE DETAILS for each competitor. Features are the most important data.

RULES:
- Only include competitors that match ALL query criteria
- Extract ALL features, capabilities, and functionalities mentioned in sources
- List features in detail - don't summarize or group them
- For website_url: ONLY use official product/company websites (e.g., synthesia.io, hourone.ai)
- DO NOT use news article URLs (e.g., techcrunch.com, forbes.com, bloomberg.com, futurism.com)
- DO NOT use blog post URLs (e.g., /blog/, /news/, /article/)
- DO NOT use YouTube or social media URLs
- If you can't find an official website URL, leave website_url empty or omit it
- Be factual - don't hallucinate
- Quality over quantity

OUTPUT:
1. summary: 2-3 bullet points about findings
2. competitors_details: Array of competitor objects with:
   - name: Competitor name (REQUIRED)
   - website_url: Official product/company website ONLY (e.g., "https://synthesia.io/") - NO news/blog URLs
   - key_features: COMPREHENSIVE list of ALL features/capabilities (REQUIRED - extract as many as available)
   - pricing_model: Pricing details (e.g., ["£750/year"])
   - tech_stack: Technologies used
   - target_market: Target audience
   - market_positioning: How they position themselves`;

            // Perform DUAL web search strategy
            console.log(`🔍 Processing query: "${query}"`);

            // Search 1: General search for competitor information
            const generalSearchResponse = await searchTool.invoke({ query });
            const generalResults = Array.isArray(generalSearchResponse)
                ? generalSearchResponse
                : (generalSearchResponse?.results || []);

            // Search 2: Targeted search for official websites
            // Extract potential company names from the query
            const websiteQuery = `${query} official website homepage`;
            const websiteSearchResponse = await searchTool.invoke({ query: websiteQuery });
            const websiteResults = Array.isArray(websiteSearchResponse)
                ? websiteSearchResponse
                : (websiteSearchResponse?.results || []);

            // Combine and deduplicate results, prioritizing non-article URLs
            const allResults = [...generalResults, ...websiteResults];
            const seenUrls = new Set<string>();
            const searchResults = allResults.filter((result: any) => {
                const url = result.url || '';
                if (seenUrls.has(url)) return false;
                seenUrls.add(url);
                return true;
            }).sort((a: any, b: any) => {
                // Sort by URL quality score (higher = better)
                const scoreA = scoreUrl(a.url || '');
                const scoreB = scoreUrl(b.url || '');
                return scoreB - scoreA; // Descending order
            });

            console.log(`📊 Found ${searchResults.length} unique search results (${generalResults.length} general + ${websiteResults.length} website-focused)`);

            // Log article vs product URL breakdown
            const articleUrls = searchResults.filter((r: any) => isArticleUrl(r.url || '')).length;
            const productUrls = searchResults.length - articleUrls;
            console.log(`   📰 Article URLs: ${articleUrls}, 🏢 Product URLs: ${productUrls}`);

            if (searchResults.length === 0) {
                console.warn('⚠️ No search results found - this may affect AI analysis quality');
            }

            // Prepare context from search results with explicit URL mapping
            const urlMapping: { [key: string]: string } = {};
            const companyUrls: { [key: string]: string[] } = {}; // Store multiple URLs per company

            const searchContext = searchResults
                .map((result: any, index: number) => {
                    const url = result.url || 'N/A';
                    const title = result.title || 'Untitled';
                    const content = result.content || result.snippet || '';

                    // Extract company name from title (usually first word or before " - ")
                    const companyMatch = title.match(/^([^-:|]+)/);
                    const companyName = companyMatch ? companyMatch[1].trim().toLowerCase() : '';

                    // Store URL mapping for later matching
                    if (url !== 'N/A') {
                        const isArticle = isArticleUrl(url);

                        if (!isArticle) {
                            // This is likely a product/company URL - prioritize it
                            const domain = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];
                            urlMapping[domain.toLowerCase()] = url;

                            // Store by company name (from title)
                            if (companyName) {
                                if (!companyUrls[companyName]) companyUrls[companyName] = [];
                                companyUrls[companyName].push(url);
                            }

                            // Also extract company name from domain (e.g., "hourone" from "hourone.ai")
                            const domainName = domain.toLowerCase();
                            if (!companyUrls[domainName]) companyUrls[domainName] = [];
                            if (!companyUrls[domainName].includes(url)) {
                                companyUrls[domainName].push(url);
                            }

                            // Also try to extract company name from title words
                            const titleWords = title.toLowerCase().split(/[\s\-|:]/);
                            titleWords.forEach((word: string) => {
                                if (word.length > 3 && !urlMapping[word]) {
                                    urlMapping[word] = url;
                                }
                                // Store in companyUrls too
                                if (word.length > 3) {
                                    if (!companyUrls[word]) companyUrls[word] = [];
                                    if (!companyUrls[word].includes(url)) {
                                        companyUrls[word].push(url);
                                    }
                                }
                            });
                        } else {
                            // This is an article - try to extract product URLs from content
                            const extractedUrls = extractUrlsFromContent(content);
                            extractedUrls.forEach(extractedUrl => {
                                const domain = extractedUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];
                                if (!urlMapping[domain.toLowerCase()]) {
                                    urlMapping[domain.toLowerCase()] = extractedUrl;
                                }

                                if (companyName) {
                                    if (!companyUrls[companyName]) companyUrls[companyName] = [];
                                    if (!companyUrls[companyName].includes(extractedUrl)) {
                                        companyUrls[companyName].push(extractedUrl);
                                    }
                                }
                            });
                        }
                    }

                    return `[Source ${index + 1}] ${title}\n${content}\nURL: ${url}`;
                })
                .join('\n\n---\n\n');

            // Sort company URLs by quality score (best first)
            Object.keys(companyUrls).forEach(company => {
                companyUrls[company].sort((a, b) => scoreUrl(b) - scoreUrl(a));
            });

            // Log URL mapping for debugging
            console.log(`🔗 URL Mapping created:`, {
                totalMappings: Object.keys(urlMapping).length,
                companiesFound: Object.keys(companyUrls).length,
                topCompanies: Object.keys(companyUrls).slice(0, 5).map(c => ({
                    company: c,
                    url: companyUrls[c][0],
                    score: scoreUrl(companyUrls[c][0])
                }))
            });

            // Create analysis prompt (optimized for token efficiency)
            const analysisPrompt = `${systemPrompt}

QUERY: "${query}"

SOURCES:
${searchContext}

CRITICAL INSTRUCTIONS FOR WEBSITE URLs:
- ONLY use URLs that appear in the SOURCES above
- Match each competitor name with the URL from its corresponding source
- If you find "Synthesia" in a source, use the EXACT URL from that source
- DO NOT guess or construct URLs - only use URLs explicitly provided in sources
- If no URL is found in sources for a competitor, omit the website_url field

IMPORTANT: Extract ALL features mentioned in sources. Don't limit or summarize features - include every capability, functionality, and feature detail available.

Return JSON with:
{
  "summary": ["2-3 bullet points"],
  "competitors_details": [
    {
      "name": "CompetitorName",
      "website_url": "EXACT URL from sources - DO NOT GUESS",
      "key_features": ["feature1", "feature2", "feature3", "...extract ALL features from sources"],
      "pricing_model": ["pricing info"],
      "tech_stack": ["technologies"],
      "target_market": ["audience"],
      "market_positioning": ["positioning"]
    }
  ]
}

Only include data from sources. Omit optional fields if unavailable. Return valid JSON only.`;

            // Get AI analysis with JSON output
            const model = new ChatOllama({
                model: 'llama3.1',
                baseUrl: 'http://localhost:11434',
                temperature: 0.2,
                format: 'json',
            });

            const aiResponse = await model.invoke(analysisPrompt);

            // Parse and validate response
            let analysisResult: MarketAnalysis;

            try {
                const content = typeof aiResponse.content === 'string'
                    ? aiResponse.content
                    : JSON.stringify(aiResponse.content);

                console.log('🔍 Raw AI response:', content.substring(0, 500)); // Log first 500 chars

                const parsed = JSON.parse(content);
                analysisResult = MarketAnalysisSchema.parse(parsed);

                // Post-process: ALWAYS validate and fix URLs (especially article URLs)
                analysisResult.competitors_details = analysisResult.competitors_details.map(competitor => {
                    const competitorNameLower = competitor.name.toLowerCase();
                    const originalUrl = competitor.website_url;

                    // Check if current URL is an article (needs replacement)
                    const isCurrentUrlArticle = competitor.website_url && isArticleUrl(competitor.website_url);

                    if (isCurrentUrlArticle) {
                        console.log(`⚠️  Replacing article URL for ${competitor.name}: ${competitor.website_url}`);
                    }

                    // ALWAYS try to find the best product URL, prioritizing non-article URLs
                    let bestUrl = competitor.website_url;
                    let bestScore = competitor.website_url ? scoreUrl(competitor.website_url) : -1000;

                    // Method 1: Check company URLs mapping (most reliable)
                    if (companyUrls[competitorNameLower] && companyUrls[competitorNameLower].length > 0) {
                        const candidateUrl = companyUrls[competitorNameLower][0];
                        const candidateScore = scoreUrl(candidateUrl);
                        if (candidateScore > bestScore) {
                            bestUrl = candidateUrl;
                            bestScore = candidateScore;
                            console.log(`🔗 Found better URL for ${competitor.name} from company mapping: ${bestUrl} (score: ${bestScore})`);
                        }
                    }

                    // Method 2: Direct name match in URL mapping
                    const nameWords = competitorNameLower.split(/[\s\-]/);
                    for (const word of nameWords) {
                        if (word.length > 2 && urlMapping[word]) {
                            const candidateUrl = urlMapping[word];
                            const candidateScore = scoreUrl(candidateUrl);
                            if (candidateScore > bestScore) {
                                bestUrl = candidateUrl;
                                bestScore = candidateScore;
                                console.log(`🔗 Found better URL for ${competitor.name} from domain "${word}": ${bestUrl} (score: ${bestScore})`);
                            }
                        }
                    }

                    // Method 3: Search in actual search results (non-article URLs only)
                    const matchingResult = searchResults.find((result: any) => {
                        const title = (result.title || '').toLowerCase();
                        const content = (result.content || result.snippet || '').toLowerCase();
                        const url = result.url || '';

                        return !isArticleUrl(url) && (
                            title.includes(competitorNameLower) ||
                            content.includes(competitorNameLower)
                        );
                    });

                    if (matchingResult?.url) {
                        const candidateUrl = matchingResult.url;
                        const candidateScore = scoreUrl(candidateUrl);
                        if (candidateScore > bestScore) {
                            bestUrl = candidateUrl;
                            bestScore = candidateScore;
                            console.log(`🔗 Found better URL for ${competitor.name} from search results: ${bestUrl} (score: ${bestScore})`);
                        }
                    }

                    // Method 4: Extract from article content if still article URL
                    if (bestScore < 0) { // Still an article URL
                        for (const result of searchResults) {
                            const content = result.content || result.snippet || '';
                            const extractedUrls = extractUrlsFromContent(content);

                            // Find URL that matches competitor name
                            for (const extractedUrl of extractedUrls) {
                                const domain = extractedUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
                                const domainLower = domain.toLowerCase();

                                // Check if domain matches any word in competitor name
                                if (nameWords.some(word => word.length > 2 && domainLower.includes(word))) {
                                    const candidateScore = scoreUrl(extractedUrl);
                                    if (candidateScore > bestScore) {
                                        bestUrl = extractedUrl;
                                        bestScore = candidateScore;
                                        console.log(`🔗 Extracted better URL for ${competitor.name} from article content: ${bestUrl} (score: ${bestScore})`);
                                        break;
                                    }
                                }
                            }

                            if (bestScore > 0) break; // Found a good URL, stop searching
                        }
                    }

                    // Update competitor URL with best found URL
                    if (bestUrl !== originalUrl) {
                        competitor.website_url = bestUrl;
                        if (isCurrentUrlArticle) {
                            console.log(`✅ Replaced article URL with product URL for ${competitor.name}: ${bestUrl}`);
                        }
                    }

                    return competitor;
                });

                // FINAL STEP: For any competitor still with article URL or no URL, do targeted search
                console.log('\n🔍 Performing targeted searches for competitors with missing/article URLs...');

                for (let i = 0; i < analysisResult.competitors_details.length; i++) {
                    const competitor = analysisResult.competitors_details[i];
                    const currentUrl = competitor.website_url;
                    const needsSearch = !currentUrl || isArticleUrl(currentUrl);

                    if (needsSearch) {
                        console.log(`\n🎯 Searching for official website: ${competitor.name}`);

                        try {
                            // Targeted search for this specific competitor's official website
                            const targetedQuery = `${competitor.name} official website homepage`;
                            const targetedSearchResponse = await searchTool.invoke({
                                query: targetedQuery,
                                maxResults: 5
                            });

                            const targetedResults = Array.isArray(targetedSearchResponse)
                                ? targetedSearchResponse
                                : (targetedSearchResponse?.results || []);

                            console.log(`   Found ${targetedResults.length} results for ${competitor.name}`);

                            // Find the best product URL from targeted results
                            let bestTargetedUrl = currentUrl;
                            let bestTargetedScore = currentUrl ? scoreUrl(currentUrl) : -1000;

                            for (const result of targetedResults) {
                                const url = result.url;
                                if (!url) continue;

                                const score = scoreUrl(url);

                                // Log each URL found
                                console.log(`   - ${url} (score: ${score})`);

                                if (score > bestTargetedScore) {
                                    bestTargetedUrl = url;
                                    bestTargetedScore = score;
                                }
                            }

                            // Update if we found a better URL
                            if (bestTargetedUrl !== currentUrl && bestTargetedScore > 0) {
                                competitor.website_url = bestTargetedUrl;
                                console.log(`   ✅ Found official website: ${bestTargetedUrl} (score: ${bestTargetedScore})`);
                            } else if (bestTargetedScore < 0) {
                                console.log(`   ❌ No product URL found, all results are articles`);
                            }

                        } catch (searchError) {
                            console.error(`   ⚠️ Search failed for ${competitor.name}:`, searchError.message);
                        }
                    } else {
                        console.log(`✅ ${competitor.name}: Already has product URL (${currentUrl})`);
                    }
                }

                console.log('\n✅ Targeted search completed\n');

                console.log('✅ Analysis completed successfully');
            } catch (parseError) {
                console.error('⚠️ Failed to parse AI response, using fallback');
                console.error('Parse error details:', parseError instanceof Error ? parseError.message : parseError);

                // Log the full response for debugging
                const content = typeof aiResponse.content === 'string'
                    ? aiResponse.content
                    : JSON.stringify(aiResponse.content);
                console.error('Full AI response that failed to parse:', content);

                analysisResult = {
                    summary: [`Analysis for: ${query}. Search found ${searchResults.length} relevant sources but failed to parse results.`],
                    competitors_details: [],
                };
            }

            // Return structured response
            return {
                success: true,
                data: analysisResult,
                metadata: {
                    query: query,
                    timestamp: new Date().toISOString(),
                    sources_count: searchResults.length,
                }
            };

        } catch (error) {
            console.error('❌ Error in searchAndSummarize:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search and summarize',
                metadata: {
                    query: query,
                    timestamp: new Date().toISOString(),
                    sources_count: 0,
                }
            };
        }
    }


}
