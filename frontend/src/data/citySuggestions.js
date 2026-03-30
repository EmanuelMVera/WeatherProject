export const citySuggestions = [];

export function getFilteredCitySuggestions(input, maxResults = 6) {
  if (!input || !input.trim()) return [];
  const normalized = input.toLowerCase().trim();
  return citySuggestions
    .filter((city) => city.toLowerCase().includes(normalized))
    .slice(0, maxResults);
}
