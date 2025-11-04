# MarketPulse API Response Format

## Endpoint
```
GET /search?q=<your-query>
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "data": {
    "summary": [
      "Found 3 major project management platforms that compete with Notion",
      "All offer collaborative workspaces with varying focus areas",
      "Pricing ranges from free tiers to enterprise solutions"
    ],
    "competitors_details": [
      {
        "name": "ClickUp",
        "website_url": "https://clickup.com",
        "key_features": [
          "Task management with List, Board, Calendar, Gantt, and Timeline views",
          "Customizable task statuses and priorities",
          "Time tracking with manual and automatic timers",
          "Goal tracking with progress folders and targets",
          "Automation builder with 50+ automation templates",
          "Docs and wikis with rich text editing and real-time collaboration",
          "Mind maps for brainstorming and planning",
          "Whiteboards for visual collaboration",
          "Custom fields for task metadata",
          "Dependencies and relationships between tasks",
          "Recurring tasks and reminders",
          "Email integration and inbox management",
          "Native time estimates and workload view",
          "Sprint management and agile workflows",
          "Custom dashboards with 50+ widgets",
          "Reporting and analytics",
          "Mobile apps for iOS and Android",
          "1000+ integrations including Slack, Google Drive, GitHub",
          "API access for custom integrations",
          "Permissions and guest access controls"
        ],
        "pricing_model": [
          "Free plan available with unlimited tasks and members",
          "Unlimited: $7/user/month - unlimited storage and integrations",
          "Business: $12/user/month - advanced features and automations",
          "Enterprise: Custom pricing - white labeling and advanced security"
        ],
        "tech_stack": [
          "React (Frontend)",
          "Node.js (Backend)",
          "MongoDB (Database)"
        ],
        "target_market": [
          "Project managers and teams",
          "Agencies and consultancies",
          "Software development teams"
        ],
        "market_positioning": [
          "All-in-one project management platform",
          "Focuses on productivity and task management"
        ]
      },
      {
        "name": "Asana",
        "website_url": "https://asana.com",
        "key_features": [
          "Project and task management with multiple views",
          "List view for simple task tracking",
          "Board view (Kanban-style) for workflow visualization",
          "Timeline view (Gantt charts) for project planning",
          "Calendar view for deadline management",
          "Workload management to balance team capacity",
          "Custom fields for tracking any data point",
          "Task dependencies and milestones",
          "Subtasks and task sections",
          "Project templates for repeatable workflows",
          "Forms to collect standardized information",
          "Portfolios to track multiple projects",
          "Goals and OKR tracking",
          "Automation rules (Premium+)",
          "Advanced search and reporting",
          "Proofing and approvals",
          "Time tracking integrations",
          "Mobile apps for iOS and Android",
          "200+ integrations including Slack, Microsoft Teams, Adobe Creative Cloud",
          "Admin console for user management",
          "Guest access and permissions"
        ],
        "pricing_model": [
          "Basic: Free for up to 15 users with core features",
          "Premium: $10.99/user/month - Timeline, advanced search, and reporting",
          "Business: $24.99/user/month - Portfolios, workload, and advanced integrations",
          "Enterprise: Custom pricing - advanced security and support"
        ],
        "tech_stack": [
          "React (Frontend)",
          "Java (Backend)",
          "Cassandra (Database)"
        ],
        "target_market": [
          "Enterprise teams",
          "Marketing and creative teams",
          "Operations teams"
        ],
        "market_positioning": [
          "Enterprise-grade work management",
          "Focus on team coordination and workflows"
        ]
      },
      {
        "name": "Monday.com",
        "website_url": "https://monday.com",
        "key_features": [
          "Visual project boards with color-coded status columns",
          "Customizable workflows for any use case",
          "Multiple board views: Kanban, Timeline, Calendar, Chart, Map",
          "Automation builder with 200+ templates",
          "Integration center with 40+ apps",
          "Time tracking columns",
          "File sharing and document management",
          "Team collaboration with updates and mentions",
          "Custom dashboards with 20+ widget types",
          "Workload view for resource management",
          "Forms for data collection",
          "Guest access for external collaborators",
          "Mobile apps for iOS and Android",
          "Email integration",
          "Gantt chart view for project planning",
          "Dependencies between items",
          "Recurring tasks and reminders",
          "Advanced search and filters",
          "Activity log and audit trail",
          "Templates for various industries and use cases",
          "API for custom integrations",
          "Permissions and privacy controls"
        ],
        "pricing_model": [
          "Individual: Free for up to 2 users with basic features",
          "Basic: $8/user/month - unlimited boards and 5GB storage",
          "Standard: $10/user/month - Timeline, Calendar views, and integrations",
          "Pro: $16/user/month - Time tracking, automation, and advanced features",
          "Enterprise: Custom pricing - advanced security and support"
        ],
        "target_market": [
          "Small to medium businesses",
          "Marketing teams",
          "Sales teams"
        ],
        "market_positioning": [
          "Visual and intuitive work OS",
          "Highly customizable for different use cases"
        ]
      }
    ]
  },
  "metadata": {
    "query": "How does Notion differentiate from ClickUp?",
    "timestamp": "2025-01-15T10:30:45.123Z",
    "sources_count": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to search and summarize",
  "metadata": {
    "query": "invalid query",
    "timestamp": "2025-01-15T10:30:45.123Z",
    "sources_count": 0
  }
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data` | object | Contains the market analysis (only present on success) |
| `data.summary` | string[] | Array of 2-3 overview points about what was found |
| `data.competitors_details` | object[] | Array of objects with detailed information for each competitor |
| `data.competitors_details[].name` | string | Competitor product/company name (required) |
| `data.competitors_details[].website_url` | string? | Official website URL of the competitor (optional) |
| `data.competitors_details[].key_features` | string[] | **COMPREHENSIVE list of ALL features, capabilities, and functionalities** - This is the most important field with full details (required) |
| `data.competitors_details[].pricing_model` | string[]? | Pricing information specific to this competitor (optional) |
| `data.competitors_details[].tech_stack` | string[]? | Technology stack used by this competitor (optional) |
| `data.competitors_details[].target_market` | string[]? | Target audience for this competitor (optional) |
| `data.competitors_details[].market_positioning` | string[]? | How this competitor positions itself (optional) |
| `metadata` | object | Request metadata |
| `metadata.query` | string | The original query |
| `metadata.timestamp` | string | ISO 8601 timestamp |
| `metadata.sources_count` | number | Number of sources used |
| `error` | string? | Error message (only present on failure) |

## Example Queries

### 1. Feature Comparison
```
GET /search?q=How does Notion differentiate from ClickUp?
```

### 2. Product Analysis
```
GET /search?q=What does Canva offer?
```

### 3. E-Learning Platforms
```
GET /search?q=list products which provide elearnings and has certification program
```

### 4. Startup Intelligence
```
GET /search?q=Tell me about AI startup Anthropic
```

### 5. General Market Research
```
GET /search?q=What are the top design collaboration tools?
```

## Frontend Integration Example

### React/Next.js
```typescript
interface CompetitorDetails {
  name: string;
  website_url?: string;
  pricing_model?: string[];
  key_features?: string[];
  tech_stack?: string[];
  target_market?: string[];
  market_positioning?: string[];
}

interface MarketAnalysis {
  summary: string[];
  competitors_details: CompetitorDetails[];
}

interface SearchResponse {
  success: boolean;
  data?: MarketAnalysis;
  metadata?: {
    query: string;
    timestamp: string;
    sources_count: number;
  };
  error?: string;
}

async function searchMarket(query: string): Promise<SearchResponse> {
  const response = await fetch(
    `http://localhost:3000/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

// Usage
const result = await searchMarket('How does Notion differentiate from ClickUp?');

if (result.success && result.data) {
  console.log('Summary:', result.data.summary);

  // Access individual competitor details
  result.data.competitors_details.forEach(competitor => {
    console.log(`\n${competitor.name}:`);
    console.log('  Website:', competitor.website_url);
    console.log('  Pricing:', competitor.pricing_model);
    console.log('  Features:', competitor.key_features);
    console.log('  Tech Stack:', competitor.tech_stack);
    console.log('  Target Market:', competitor.target_market);
    console.log('  Positioning:', competitor.market_positioning);
  });
} else {
  console.error('Error:', result.error);
}
```

### Vue.js
```javascript
export default {
  data() {
    return {
      query: '',
      result: null,
      loading: false,
      error: null
    }
  },
  methods: {
    async searchMarket() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(
          `http://localhost:3000/search?q=${encodeURIComponent(this.query)}`
        );
        this.result = await response.json();
        
        if (!this.result.success) {
          this.error = this.result.error;
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
```

## Notes

- All responses are in JSON format
- The API uses Tavily search to gather real-time data
- Analysis is powered by Llama 3.1 via Ollama
- Response time varies based on query complexity (typically 5-15 seconds)
- Make sure to set `TAVILY_API_KEY` in your environment variables
- The API validates and structures all responses using Zod schemas

