import axios from 'axios';

const API_KEY = import.meta.env.VITE_NEWS_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// High-quality mock articles with categories
const MOCK_NEWS = {
  general: [
    {
      title: "Global Summit Agrees on Landmark Climate Policies",
      description: "Leaders from over 100 nations have finalized a historic agreement committing to reduce carbon emissions by 45% over the next decade.",
      urlToImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T10:00:00Z",
      source: { name: "World News Network" },
      author: "Sarah Jenkins"
    },
    {
      title: "Mars Rover Discovers Sign of Ancient Subterranean Lake",
      description: "A robotic rover has analyzed rock core formations suggesting a vast liquid lake existed deep below the Martian surface billions of years ago.",
      urlToImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T08:15:00Z",
      source: { name: "Astro Science Quarterly" },
      author: "Dr. Alan Mercer"
    }
  ],
  technology: [
    {
      title: "Breakthrough in Room-Temperature Superconductors Announced",
      description: "A research lab has successfully synthesized a carbonaceous sulfur hydride material that exhibits superconductivity at ambient temperatures.",
      urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T09:30:00Z",
      source: { name: "Tech Frontiers" },
      author: "Marcus Vance"
    },
    {
      title: "Major Operating System Integrates Local Quantum Processing Modules",
      description: "A technology giant announced details of its upcoming system release, featuring standard interfaces for local quantum computing hardware units.",
      urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T07:45:00Z",
      source: { name: "Quantum Computing Review" },
      author: "Elena Rostova"
    }
  ],
  business: [
    {
      title: "Federal Reserve Adjusts Benchmarks to Combat Deflationary Pressures",
      description: "The Federal Reserve adjusted its benchmark interest rates by a quarter point today in response to emerging pricing corrections.",
      urlToImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T11:00:00Z",
      source: { name: "Wall Street Analyst" },
      author: "Robert Chen"
    },
    {
      title: "Global Supply Chains Stabilize to Prep for Holiday Rush",
      description: "Logistics systems report a return to pre-crisis container costs and shipping durations, promising lower consumer costs this winter.",
      urlToImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T06:12:00Z",
      source: { name: "Logistics Today" },
      author: "Linus Odegard"
    }
  ],
  science: [
    {
      title: "Deep-Sea Expedition Uncovers 30 Previously Undiscovered Species",
      description: "Marine biophysicists traveling in the Mariana Trench returned with high-resolution captures of bizarre lifeforms thriving near volcanic vents.",
      urlToImage: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T10:45:00Z",
      source: { name: "Marine Ecosystems Journal" },
      author: "Captain Sylvia Earle"
    },
    {
      title: "CRISPR Therapy Successfully Halts Hereditary Vision Loss",
      description: "Clinical trials showed 98% efficiency in genetic modifications correcting degenerative optical issues in test subjects.",
      urlToImage: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T05:30:00Z",
      source: { name: "Medical Lancet" },
      author: "Dr. Keith West"
    }
  ],
  sports: [
    {
      title: "Championship Finals: Underdog Secures Dramatic Stoppage Time Victory",
      description: "A stunning header in the 94th minute ended a decade-long trophy drought for the league's lowest-budget roster.",
      urlToImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T11:20:00Z",
      source: { name: "Sports Central" },
      author: "Tom Brady"
    },
    {
      title: "Olympic Committee Unveils Sustainable City Hosts For 2036 Games",
      description: "Host cities will rely 100% on recycled infrastructures and solar parks to accommodate athletes and international crowds.",
      urlToImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2026-05-27T08:00:00Z",
      source: { name: "World Games Herald" },
      author: "Marta Vieira"
    }
  ]
};

// Generates fallback articles when searching
const generateMockSearchResults = (query) => {
  const q = query.toLowerCase();
  const allArticles = Object.values(MOCK_NEWS).flat();
  
  const filtered = allArticles.filter(
    (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
  );

  if (filtered.length > 0) return filtered;

  // If none found, generate two dynamic results matching search query
  return [
    {
      title: `Latest Updates on ${query.charAt(0).toUpperCase() + query.slice(1)}`,
      description: `In-depth investigation reveals significant local impacts, investment changes, and community preparations regarding ${query} developments.`,
      urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "Global News Wire" },
      author: "Alex Rivers"
    },
    {
      title: `The Science and Future Behind ${query.charAt(0).toUpperCase() + query.slice(1)} Innovation`,
      description: `Experts deliberate the long-term outlook, technology scaling, and regulatory challenges associated with ${query} research systems.`,
      urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "International Science Digest" },
      author: "Dr. Sam Stone"
    }
  ];
};

export const fetchNewsArticles = async (category = 'general', query = '') => {
  if (!API_KEY) {
    // Return mock news after brief network delay simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        if (query) {
          resolve(generateMockSearchResults(query));
        } else {
          resolve(MOCK_NEWS[category] || MOCK_NEWS.general);
        }
      }, 500);
    });
  }

  try {
    let url = `${BASE_URL}/top-headlines`;
    const params = { apiKey: API_KEY, country: 'us' };

    if (query) {
      url = `${BASE_URL}/everything`;
      params.q = query;
      delete params.country;
    } else if (category && category !== 'general') {
      params.category = category;
    }

    const { data } = await axios.get(url, { params });
    // Filter out removed or broken articles
    return data.articles.filter((a) => a.title && a.title !== '[Removed]');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch news headlines.');
  }
};
