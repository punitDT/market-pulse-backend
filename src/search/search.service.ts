import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class SearchService {

    private model: ChatOllama;
    private tavily: TavilySearchResults;

    constructor() {

        // Initialize the LLM model
        this.model = new ChatOllama({
            model: 'llama3.1',
            baseUrl: 'http://localhost:11434',
            temperature: 0.7,
        });

        // Initialize the search tool
        this.tavily = new TavilySearchResults({ maxResults: 5 });
    }


    async searchAndSummarize(query: string) {
        try {

            // Initialize the LLM model
            const models = new ChatOllama(
                {
                    model: 'llama3.1',
                    baseUrl: 'http://localhost:11434',
                    temperature: 0.7,
                }
            );

            // Initialize Tavily web search tool
            const searchTool = new TavilySearchResults({ maxResults: 5 });

            // Build prompt with placeholders
            const prompt = ChatPromptTemplate.fromMessages([
                ['system', 'You are a helpful assistant with web search.'],
                ['human', '{input}'],
                ['placeholder', '{agent_scratchpad}'],
            ]);

            // Create the agent executor
            const agent = createToolCallingAgent({
                llm: models,
                tools: [searchTool],
                prompt,
            });

            // Execute the agent
            const executor = new AgentExecutor({ agent, tools: [searchTool] });

            const result = await executor.invoke({ input: query });

            return result.output;

        } catch (error) {
            console.error(error);
            throw new Error('Failed to search and summarize');
        }
    }


}
