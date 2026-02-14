export async function searchWeb(query: string) {
  type TavilyResult = {
    title: string;
    url: string;
    content: string;
  };

  type TavilyResponse = {
    answer: string;
    results: TavilyResult[];
  };

  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    console.error("Missing TAVILY_API_KEY");
    return null;
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        include_answer: true,
        max_results: 3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data = (await response.json()) as TavilyResponse;
    const results = data.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }));

    return {
      answer: data.answer,
      results: results,
    };
  } catch (error) {
    console.error("Search failed:", error);
    return null;
  }
}
