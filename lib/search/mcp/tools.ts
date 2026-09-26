export const MCP_TOOLS = [
  {
    name: 'search_web',
    description: 'Search the web (plus maps for business queries) through Helix. Ranked results with sources.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 300 },
        mode: { type: 'string', enum: ['everything', 'businesses', 'web', 'social', 'news'] },
        country: { type: 'string', pattern: '^[A-Z]{2}$' },
        language: { type: 'string', enum: ['en', 'ar'] },
        limit: { type: 'integer', minimum: 1, maximum: 40 }
      },
      required: ['query']
    }
  },
  {
    name: 'find_leads',
    description: 'Find businesses or social profiles for a natural-language request and enrich their websites. Returns request_id; results fill in asynchronously.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 300 },
        limit: { type: 'integer', minimum: 1, maximum: 60 },
        use_paid_sources: { type: 'boolean' },
        hunter: { type: 'boolean' }
      },
      required: ['query']
    }
  },
  {
    name: 'enrich_url',
    description: 'Extract company name, description, emails, phones, social links, city and country from a public website. Never guesses.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        hunter: { type: 'boolean' }
      },
      required: ['url']
    }
  },
  {
    name: 'get_watch_results',
    description: 'Latest results of a saved watch, optionally only new ones.',
    inputSchema: {
      type: 'object',
      properties: {
        watch_id: { type: 'string', format: 'uuid' },
        only_new: { type: 'boolean' }
      },
      required: ['watch_id']
    }
  }
]
