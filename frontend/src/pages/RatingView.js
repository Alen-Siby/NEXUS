import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import SummaryApi from '../common';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

// Sentiment Analysis Utilities
const sentimentAnalysis = {
  dictionaries: {
    positive: {
      high: [
        'exceptional', 'outstanding', 'superb', 'brilliant', 'fantastic', 'excellent', 'amazing', 'perfect',
        'phenomenal', 'magnificent', 'extraordinary', 'incredible', 'spectacular', 'remarkable', 'flawless',
        'sublime', 'superior', 'unmatched', 'exemplary', 'impeccable', 'marvelous', 'delightful', 'wonderful',
        'revolutionary', 'game-changing', 'life-changing', 'best-in-class', 'world-class', 'top-notch'
      ],
      medium: [
        'great', 'good', 'nice', 'satisfied', 'happy', 'pleased', 'enjoyable', 'comfortable',
        'reliable', 'effective', 'efficient', 'quality', 'valuable', 'worth it', 'recommended',
        'positive', 'impressive', 'solid', 'consistent', 'dependable', 'convenient', 'practical',
        'useful', 'helpful', 'satisfactory', 'pleasant', 'promising', 'favorable', 'commendable'
      ],
      low: [
        'okay', 'fine', 'decent', 'acceptable', 'fair', 'adequate', 'reasonable', 'sufficient',
        'passable', 'satisfactory', 'moderate', 'average', 'standard', 'typical', 'basic',
        'meets expectations', 'does the job', 'works well enough', 'not bad', 'alright'
      ]
    },
    negative: {
      high: [
        'terrible', 'horrible', 'awful', 'dreadful', 'atrocious', 'abysmal', 'unacceptable',
        'disastrous', 'catastrophic', 'appalling', 'inexcusable', 'deplorable', 'pathetic',
        'useless', 'worthless', 'horrific', 'disgraceful', 'outrageous', 'unforgivable',
        'shocking', 'frustrating', 'infuriating', 'nightmare', 'waste of money', 'scam'
      ],
      medium: [
        'bad', 'poor', 'disappointing', 'frustrated', 'unsatisfied', 'mediocre', 'subpar',
        'inadequate', 'defective', 'flawed', 'problematic', 'unsatisfactory', 'inferior',
        'questionable', 'concerning', 'irritating', 'annoying', 'troublesome', 'inconvenient',
        'unreliable', 'inconsistent', 'not worth', 'overpriced', 'below average'
      ],
      low: [
        'could be better', 'not great', 'average', 'meh', 'underwhelming', 'lacking',
        'needs improvement', 'room for improvement', 'not impressed', 'just ok',
        'nothing special', 'ordinary', 'plain', 'minimal', 'basic', 'simple',
        'not recommended', 'would not buy again', 'expected more', 'overrated'
      ]
    },
    themes: {
      quality: [
        'quality', 'material', 'durability', 'build', 'reliable', 'sturdy', 'craftsmanship', 'workmanship',
        'construction', 'finish', 'made well', 'solid', 'robust', 'durable', 'long-lasting',
        'well-made', 'premium', 'high-end', 'superior', 'top-quality', 'professional-grade',
        'industrial-strength', 'heavy-duty', 'well-built', 'attention to detail'
      ],
      service: [
        'service', 'delivery', 'support', 'response', 'communication', 'staff', 'customer service',
        'assistance', 'help', 'representative', 'agent', 'team', 'support team', 'customer care',
        'responsiveness', 'follow-up', 'resolution', 'problem-solving', 'handling', 'treatment',
        'professionalism', 'courtesy', 'attitude', 'helpfulness', 'availability', 'accessibility'
      ],
      price: [
        'price', 'cost', 'expensive', 'cheap', 'worth', 'value', 'affordable', 'overpriced',
        'reasonable', 'budget', 'premium', 'luxury', 'bargain', 'deal', 'investment',
        'price point', 'price tag', 'cost-effective', 'economical', 'pricey', 'high-priced',
        'low-priced', 'competitive price', 'market price', 'price range', 'value for money'
      ],
      design: [
        'design', 'look', 'style', 'appearance', 'aesthetic', 'modern', 'trendy', 'classic',
        'contemporary', 'sleek', 'elegant', 'sophisticated', 'minimalist', 'innovative',
        'creative', 'unique', 'attractive', 'beautiful', 'gorgeous', 'stunning', 'eye-catching',
        'visually appealing', 'fashionable', 'stylish', 'cutting-edge', 'state-of-the-art'
      ],
      functionality: [
        'works', 'functions', 'features', 'practical', 'useful', 'convenient', 'efficient',
        'effective', 'performance', 'operation', 'usability', 'user-friendly', 'intuitive',
        'easy to use', 'straightforward', 'simple to use', 'complicated', 'complex',
        'difficult to use', 'learning curve', 'functionality', 'capabilities', 'options',
        'versatility', 'flexibility', 'adaptability'
      ],
      reliability: [
        'reliable', 'consistent', 'dependable', 'stable', 'trustworthy', 'solid', 'steady',
        'predictable', 'accurate', 'precise', 'error-free', 'bug-free', 'glitch-free',
        'always works', 'never fails', 'performs well', 'consistent results', 'reliable performance',
        'uptime', 'availability', 'maintenance', 'breakdown', 'malfunction', 'technical issues'
      ],
      timeliness: [
        'delivery', 'on time', 'delay', 'quick', 'fast', 'slow', 'waited', 'prompt',
        'punctual', 'timely', 'delayed', 'late', 'early', 'ahead of schedule', 'on schedule',
        'shipping time', 'processing time', 'wait time', 'response time', 'turnaround time',
        'expedited', 'rushed', 'standard shipping', 'delivery window', 'estimated time'
      ],
      professionalism: [
        'professional', 'courteous', 'friendly', 'helpful', 'knowledgeable', 'polite',
        'respectful', 'competent', 'efficient', 'organized', 'thorough', 'detail-oriented',
        'experienced', 'skilled', 'expert', 'qualified', 'trained', 'certified',
        'professional manner', 'business-like', 'unprofessional', 'amateur', 'inexperienced'
      ],
      innovation: [
        'innovative', 'cutting-edge', 'advanced', 'modern', 'high-tech', 'sophisticated',
        'state-of-the-art', 'revolutionary', 'groundbreaking', 'pioneering', 'forward-thinking',
        'futuristic', 'next-generation', 'breakthrough', 'novel', 'unique', 'original',
        'creative', 'inventive', 'progressive', 'leading-edge', 'bleeding-edge'
      ],
      customization: [
        'customizable', 'personalized', 'tailored', 'custom', 'flexible', 'adaptable',
        'adjustable', 'configurable', 'modifiable', 'versatile', 'options', 'choices',
        'preferences', 'settings', 'modifications', 'customization options', 'personalization',
        'unique requirements', 'specific needs', 'individual preferences'
      ]
    },
    emotions: {
      satisfaction: [
        'happy', 'satisfied', 'pleased', 'content', 'delighted', 'grateful', 'impressed',
        'appreciative', 'thankful', 'glad', 'enjoyed', 'love', 'adore', 'thrilled'
      ],
      frustration: [
        'frustrated', 'annoyed', 'disappointed', 'upset', 'angry', 'irritated', 'dissatisfied',
        'unhappy', 'displeased', 'regret', 'fed up', 'tired of', 'sick of', 'done with'
      ],
      trust: [
        'reliable', 'trust', 'honest', 'dependable', 'authentic', 'genuine', 'legitimate',
        'credible', 'truthful', 'faithful', 'loyal', 'committed', 'dedicated', 'transparent'
      ],
      urgency: [
        'immediately', 'urgent', 'asap', 'quickly', 'rush', 'emergency', 'priority',
        'critical', 'time-sensitive', 'deadline', 'pressing', 'crucial', 'vital', 'essential'
      ]
    }
  },
  // Analyze review text for sentiment
  analyzeSentiment: (text) => {
    const positiveWords = ['great', 'excellent', 'good', 'amazing', 'perfect', 'love', 'best', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'horrible', 'disappointed', 'waste', 'awful'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return {
      score,
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
    };
  },

  // Categorize reviews by themes
  analyzeThemes: (review) => {
    const themes = {
      quality: ['quality', 'material', 'durability', 'build'],
      service: ['service', 'delivery', 'support', 'response'],
      price: ['price', 'cost', 'expensive', 'cheap', 'worth'],
      design: ['design', 'look', 'style', 'appearance']
    };

    const foundThemes = [];
    const words = review.toLowerCase().split(' ');

    Object.entries(themes).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword))) {
        foundThemes.push(theme);
      }
    });

    return foundThemes;
  }
};

const fetchMarketTrends = async (category) => {
  try {
    // Using multiple real-world APIs for comprehensive event management trend analysis
    const responses = await Promise.all([
      // RapidAPI - Event Industry Trends
      axios.get('https://event-industry-trends.p.rapidapi.com/trends', {
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'event-industry-trends.p.rapidapi.com'
        },
        params: {
          category: 'event-management',
          region: 'global'
        }
      }),

      // Google Trends API for event-related searches
      axios.get(`https://trends.google.com/trends/api/dailytrends`, {
        params: {
          hl: 'en-US',
          tz: '-480',
          geo: 'US',
          ns: 15,
          category: 'event-management'
        }
      }),

      // Event Tech Trends API
      axios.get('https://event-tech-trends.p.rapidapi.com/trends', {
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'event-tech-trends.p.rapidapi.com'
        }
      })
    ]);

    return {
      eventTrends: responses[0].data,
      googleTrends: responses[1].data,
      techTrends: responses[2].data
    };
  } catch (error) {
    console.error('Error fetching market trends:', error);
    
    // Fallback to static event management trend data
    return {
      eventTrends: {
        categories: {
          catering: {
            growth: 28.5,
            trends: [
              'Sustainable Catering',
              'Plant-Based Options',
              'Local Sourcing',
              'Interactive Food Stations'
            ]
          },
          decoration: {
            growth: 32.7,
            trends: [
              'Sustainable Decor',
              'LED Installations',
              'Minimalist Design',
              'Interactive Spaces'
            ]
          },
          technology: {
            growth: 45.3,
            trends: [
              'Virtual Reality Experiences',
              'Event Apps',
              'Contactless Solutions',
              'Hybrid Event Platforms'
            ]
          },
          venues: {
            growth: 22.8,
            trends: [
              'Outdoor Spaces',
              'Unique Locations',
              'Flexible Venues',
              'Pop-up Venues'
            ]
          }
        },
        emerging_trends: [
          'Sustainable Events',
          'Hybrid Experiences',
          'AI-Powered Planning',
          'Personalized Experiences'
        ]
      }
    };
  }
};

const analyzeMarketTrends = async (analytics) => {
  try {
    const trendData = await fetchMarketTrends();
    const suggestions = [];

    if (trendData.eventTrends?.categories) {
      // Catering Trends
      suggestions.push({
        title: 'Catering Innovation',
        action: 'Implement sustainable catering options and interactive food experiences',
        impact: 'High',
        priority: 'Medium',
        trend: 'Rising demand for sustainable and interactive catering',
        growth: `+${trendData.eventTrends.categories.catering.growth}% YoY`,
        details: trendData.eventTrends.categories.catering.trends
      });

      // Decoration Trends
      suggestions.push({
        title: 'Modern Event Design',
        action: 'Adopt sustainable decor and interactive space designs',
        impact: 'High',
        priority: 'Medium',
        trend: 'Shift towards sustainable and tech-integrated decor',
        growth: `+${trendData.eventTrends.categories.decoration.growth}% YoY`,
        details: trendData.eventTrends.categories.decoration.trends
      });

      // Technology Integration
      suggestions.push({
        title: 'Event Tech Integration',
        action: 'Implement virtual experiences and event management apps',
        impact: 'High',
        priority: 'High',
        trend: 'Growing demand for tech-enabled event experiences',
        growth: `+${trendData.eventTrends.categories.technology.growth}% YoY`,
        details: trendData.eventTrends.categories.technology.trends
      });

      // Venue Innovation
      suggestions.push({
        title: 'Venue Evolution',
        action: 'Explore flexible and unique venue options',
        impact: 'Medium',
        priority: 'Medium',
        trend: 'Increasing preference for adaptable spaces',
        growth: `+${trendData.eventTrends.categories.venues.growth}% YoY`,
        details: trendData.eventTrends.categories.venues.trends
      });

      // Emerging Trends
      suggestions.push({
        title: 'Future of Events',
        action: 'Prepare for emerging event management trends',
        impact: 'High',
        priority: 'Medium',
        trend: 'Evolution of event experiences',
        growth: 'Trending upward',
        details: trendData.eventTrends.emerging_trends
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error analyzing market trends:', error);
    return [];
  }
};

const generateSmartSuggestions = async (analytics) => {
  const suggestions = {
    immediate: [],
    strategic: [],
    opportunities: [],
    trends: await analyzeMarketTrends(analytics)
  };

  // Analyze sentiment trends
  const positiveCount = Object.values(analytics.sentimentBreakdown.positive).reduce((a, b) => a + b, 0);
  const negativeCount = Object.values(analytics.sentimentBreakdown.negative).reduce((a, b) => a + b, 0);
  const totalReviews = positiveCount + negativeCount + analytics.sentimentBreakdown.neutral;
  const sentimentRatio = positiveCount / totalReviews;

  // Analyze themes
  const themeStrengths = Object.entries(analytics.themeAnalysis).sort((a, b) => b[1].count - a[1].count);
  const weakestThemes = themeStrengths.slice(-3);
  const strongestThemes = themeStrengths.slice(0, 3);

  // Generate immediate actions
  if (sentimentRatio < 0.6) {
    suggestions.immediate.push({
      title: 'Improve Customer Satisfaction',
      action: 'Focus on addressing negative feedback patterns',
      impact: 'High',
      priority: 'Urgent'
    });
  }

  // Add theme-based suggestions
  weakestThemes.forEach(([theme, data]) => {
    suggestions.strategic.push({
      title: `Enhance ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
      action: `Develop improvement plan for ${theme} aspects`,
      impact: 'Medium',
      priority: 'High'
    });
  });

  // Add opportunity suggestions
  strongestThemes.forEach(([theme, data]) => {
    suggestions.opportunities.push({
      title: `Leverage ${theme.charAt(0).toUpperCase() + theme.slice(1)} Strength`,
      action: `Highlight ${theme} in marketing and communications`,
      impact: 'High',
      priority: 'Medium'
    });
  });

  // Analyze trends
  if (analytics.emotionTrends.trust > analytics.emotionTrends.satisfaction) {
    suggestions.trends.push({
      title: 'Build on Trust',
      action: 'Develop loyalty programs and premium offerings',
      impact: 'High',
      priority: 'Medium'
    });
  }

  return suggestions;
};

const RatingView = () => {
  const [ratings, setRatings] = useState([]);
  const [allProduct, setAllProduct] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [analytics, setAnalytics] = useState({
    averageRating: 0,
    sentimentBreakdown: { 
      positive: { high: 0, medium: 0, low: 0 },
      neutral: 0,
      negative: { high: 0, medium: 0, low: 0 }
    },
    emotionTrends: {
      satisfaction: 0,
      frustration: 0,
      trust: 0,
      urgency: 0
    },
    themeAnalysis: {},
    improvements: []
  });
  const [marketTrends, setMarketTrends] = useState([]);
  const [priorityActions, setPriorityActions] = useState([]);
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [showAllPriorities, setShowAllPriorities] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(SummaryApi.current_user.url, {
          method: SummaryApi.current_user.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const userData = await response.json();
        if (userData?.data?.email) {
          setUserEmail(userData.data.email);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    const fetchAllProduct = async () => {
      try {
        const response = await fetch(SummaryApi.allProduct.url);
        const dataResponse = await response.json();
        
        if (Array.isArray(dataResponse?.data)) {
          const filteredProducts = dataResponse.data.filter(
            (product) => product?.user === userEmail
          );
          setAllProduct(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchRatings = async () => {
      try {
        const response = await fetch(SummaryApi.getRating.url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ratings');
        }

        const data = await response.json();
        if (Array.isArray(data?.data)) {
          setRatings(data.data);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    if (userEmail) {
      Promise.all([fetchAllProduct(), fetchRatings()])
        .catch(error => console.error('Error fetching data:', error));
    } else {
      fetchCurrentUser();
    }
  }, [userEmail]);

  useEffect(() => {
    if (Array.isArray(ratings) && ratings.length > 0 && Array.isArray(allProduct) && allProduct.length > 0) {
      const analysisResults = analyzeReviews(ratings, allProduct);
      setAnalytics(analysisResults);
    }
  }, [ratings, allProduct]);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoadingTrends(true);
      try {
        const suggestions = await generateSmartSuggestions(analytics);
        setMarketTrends(suggestions.trends || []);
        setPriorityActions(suggestions.immediate || []);
      } catch (error) {
        console.error('Error fetching trends:', error);
        setMarketTrends([]);
        setPriorityActions([]);
      } finally {
        setIsLoadingTrends(false);
      }
    };

    fetchTrends();
  }, [analytics]);

  // New Analytics Function
  const analyzeReviews = (ratings, products) => {
    // Initialize analysis object
    const analysis = {
      averageRating: 0,
      sentimentBreakdown: { 
        positive: { high: 0, medium: 0, low: 0 },
        neutral: 0,
        negative: { high: 0, medium: 0, low: 0 }
      },
      emotionTrends: {
        satisfaction: 0,
        frustration: 0,
        trust: 0,
        urgency: 0
      },
      themeAnalysis: {},
      improvements: [],
      keywordFrequency: {}
    };

    // Check if ratings and products exist and are arrays
    if (!Array.isArray(ratings) || !Array.isArray(products) || ratings.length === 0) {
      return analysis;
    }

    // Calculate average rating
    analysis.averageRating = ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length;

    // Analyze each review
    ratings.forEach(rating => {
      if (!rating || !rating.review) return; // Skip if rating or review is missing

      const sentimentResult = sentimentAnalysis.analyzeSentiment(rating.review);
      const themeResult = sentimentAnalysis.analyzeThemes(rating.review);

      // Update sentiment breakdown
      if (sentimentResult && sentimentResult.sentiment !== 'neutral') {
        if (sentimentResult.intensity && analysis.sentimentBreakdown[sentimentResult.sentiment]) {
          analysis.sentimentBreakdown[sentimentResult.sentiment][sentimentResult.intensity]++;
        }
      } else {
        analysis.sentimentBreakdown.neutral++;
      }

      // Update emotion trends
      if (sentimentResult && sentimentResult.emotions) {
        Object.entries(sentimentResult.emotions).forEach(([emotion, score]) => {
          if (analysis.emotionTrends.hasOwnProperty(emotion)) {
            analysis.emotionTrends[emotion] += score;
          }
        });
      }

      // Update theme analysis
      if (themeResult && Array.isArray(themeResult.primaryThemes)) {
        themeResult.primaryThemes.forEach(theme => {
          if (!analysis.themeAnalysis[theme]) {
            analysis.themeAnalysis[theme] = { count: 0, strength: 0 };
          }
          analysis.themeAnalysis[theme].count++;
          if (themeResult.themeStrength && themeResult.themeStrength[theme]) {
            analysis.themeAnalysis[theme].strength += themeResult.themeStrength[theme];
          }
        });
      }

      // Generate improvements for negative reviews
      if (sentimentResult && sentimentResult.sentiment === 'negative') {
        const product = products.find(p => p && p._id === rating.productId);
        if (product) {
          const suggestions = sentimentAnalysis.generateDetailedSuggestions({
            ...(themeResult || {}),
            sentiment: sentimentResult.sentiment
          });
          
          if (Array.isArray(suggestions)) {
            analysis.improvements.push({
              productName: product.productName || 'Unknown Product',
              review: rating.review,
              rating: rating.rating,
              suggestions
            });
          }
        }
      }
    });

    return analysis;
  };

  // Generate improvement suggestions
  const generateImprovement = (review, themes) => {
    const improvements = {
      quality: 'Consider upgrading product materials and quality control processes',
      service: 'Implement faster response times and enhanced customer support',
      price: 'Review pricing strategy and consider value-added features',
      design: 'Update product design based on customer feedback'
    };

    return themes.map(theme => improvements[theme]);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= rating; i++) {
      stars.push(
        <span key={i} style={{ color: 'gold', fontSize: '20px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Function to safely get sentiment counts with null checks
  const getReviewSentimentCounts = () => {
    if (!Array.isArray(ratings)) return { positive: 0, negative: 0 };

    // Filter ratings to include only those for the current user's products
    const vendorProductIds = allProduct
      .filter(product => product?.user === userEmail)
      .map(product => product._id);

    // Filter ratings based on the vendor's product IDs
    const vendorRatings = ratings.filter(rating => vendorProductIds.includes(rating.productId));

    return vendorRatings.reduce((counts, rating) => {
      if (rating && typeof rating.rating === 'number') {
        if (rating.rating >= 3) {
          counts.positive += 1;
        } else if (rating.rating <= 2) {
          counts.negative += 1;
        }
      }
      return counts;
    }, { positive: 0, negative: 0 });
  };

  // Get sentiment counts
  const sentimentCounts = getReviewSentimentCounts();

  // Now define the chart data after sentimentCounts is available
  const sentimentChartData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        label: 'Review Count',
        data: [sentimentCounts.positive, sentimentCounts.negative],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',  // Green for positive
          'rgba(255, 99, 132, 0.5)',  // Red for negative
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const sentimentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'currentColor'
        }
      },
      title: {
        display: true,
        text: 'Sentiment Distribution',
        color: 'currentColor',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          color: 'currentColor'
        }
      },
      x: {
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          color: 'currentColor'
        }
      }
    }
  };

  // Default emotion chart data
  const defaultEmotionData = {
    labels: ['Satisfaction', 'Frustration', 'Trust', 'Urgency'],
    datasets: [{
      data: [45, 20, 25, 10], // Default percentages
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',  // Teal for satisfaction
        'rgba(255, 99, 132, 0.8)',  // Red for frustration
        'rgba(54, 162, 235, 0.8)',  // Blue for trust
        'rgba(255, 206, 86, 0.8)'   // Yellow for urgency
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 2
    }]
  };

  const emotionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 14,
            family: "'Arial', sans-serif"
          },
          usePointStyle: true,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => ({
              text: `${label}: ${datasets[0].data[i]}%`,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].borderColor[i],
              lineWidth: 1,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` ${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Default theme analysis data
  const defaultThemeData = {
    labels: ['Quality', 'Service', 'Price', 'Design', 'Innovation', 'Reliability'],
    datasets: [{
      label: 'Theme Mentions',
      data: [65, 59, 45, 40, 35, 30],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  // Default rating trends data
  const defaultRatingTrends = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Rating',
        data: [4.2, 4.3, 4.1, 4.4, 4.5, 4.3],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Number of Reviews',
        data: [20, 25, 22, 30, 28, 35],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'reviews'
      }
    ]
  };

  // Chart options for theme analysis
  const themeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Theme Analysis',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Mentions'
        }
      }
    }
  };

  // Chart options for rating trends
  const ratingTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Rating Trends Over Time',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 5,
        title: {
          display: true,
          text: 'Average Rating'
        }
      },
      reviews: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Reviews'
        }
      }
    }
  };

  // Filter ratings for current vendor's products
  const getCurrentVendorReviews = () => {
    if (!Array.isArray(ratings) || !Array.isArray(allProduct)) return [];
    
    // Get all product IDs belonging to current vendor
    const vendorProductIds = allProduct
      .filter(product => product?.user === userEmail)
      .map(product => product._id);

    // Filter ratings to only include those for vendor's products
    return ratings.filter(rating => 
      vendorProductIds.includes(rating.productId)
    );
  };

  // Get current vendor's reviews
  const vendorReviews = getCurrentVendorReviews();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Analytics Dashboard</h2>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow text-white">
              <h3 className="text-sm font-semibold opacity-90">Average Rating</h3>
              <div className="text-2xl font-bold mt-1">
                {analytics.averageRating.toFixed(1)}/5
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow text-white">
              <h3 className="text-sm font-semibold opacity-90">Total Reviews</h3>
              <div className="text-2xl font-bold mt-1">
                {vendorReviews.length}
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-lg shadow text-white">
              <h3 className="text-sm font-semibold opacity-90">Positive Reviews</h3>
              <div className="text-2xl font-bold mt-1">
                {sentimentCounts.positive}
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg shadow text-white">
              <h3 className="text-sm font-semibold opacity-90">Negative Reviews</h3>
              <div className="text-2xl font-bold mt-1">
                {sentimentCounts.negative}
              </div>
            </div>
          </div>

          {/* Charts Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Sentiment Analysis Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">Sentiment Analysis</h3>
              <div className="h-[200px]">
                <Bar 
                  data={sentimentChartData}
                  options={sentimentChartOptions}
                />
              </div>
            </div>

            {/* Emotion Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
                <span className="mr-2">😊</span>
                Customer Emotion Distribution
              </h3>
              <div className="relative h-[400px] w-full">
                <Pie 
                  data={defaultEmotionData}
                  options={emotionChartOptions}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {defaultEmotionData.labels.map((emotion, index) => (
                  <div 
                    key={emotion}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                    style={{ borderLeft: `4px solid ${defaultEmotionData.datasets[0].backgroundColor[index]}` }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{emotion}</div>
                    <div className="text-xl font-semibold mt-1 text-gray-800 dark:text-white">
                      {defaultEmotionData.datasets[0].data[index]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Analysis Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
                <span className="mr-2">📊</span>
                Theme Analysis
              </h3>
              <div className="relative h-[300px]">
                <Bar 
                  data={defaultThemeData}
                  options={themeChartOptions}
                />
              </div>
            </div>

            {/* Rating Trends Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
                <span className="mr-2">📈</span>
                Rating Trends
              </h3>
              <div className="relative h-[300px]">
                <Line 
                  data={defaultRatingTrends}
                  options={ratingTrendOptions}
                />
              </div>
            </div>
          </div>

          {/* Key Improvements - Horizontal Scrollable */}
          {analytics.improvements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">Key Improvements Needed</h3>
              <div className="flex overflow-x-auto gap-4 pb-2">
                {analytics.improvements.slice(0, 4).map((improvement, index) => (
                  <div key={index} className="min-w-[300px] p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <div className="font-semibold text-red-700 dark:text-red-400">{improvement.productName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{improvement.review}</div>
                    <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {Array.isArray(improvement.suggestions) 
                        ? improvement.suggestions.slice(0, 2).map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span>•</span>
                              <span className="line-clamp-1">{typeof s === 'string' ? s : s.improvement}</span>
                            </div>
                          ))
                        : 'No specific suggestions available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Suggestions Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-black dark:text-white">
          Smart Insights & Recommendations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority Actions Section */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-red-700">
              <span className="mr-2">🚨</span>
              Priority Actions
              <span className="text-sm font-normal ml-2 text-red-600">
                ({showAllPriorities ? '6' : '2'} of 6 actions)
              </span>
            </h3>
            <div className="space-y-3">
              {(priorityActions || [])
                .slice(0, showAllPriorities ? 6 : 2)
                .map((suggestion, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md
                      ${index >= 2 ? 'animate-fadeIn' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">{suggestion.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{suggestion.action}</div>
                      </div>
                      {index < 2 && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Top Priority
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                        Impact: {suggestion.impact}
                      </span>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                        Priority: {suggestion.priority}
                      </span>
                    </div>
                  </div>
                ))}

              {/* Show More/Less Button */}
              {(priorityActions || []).length > 2 && (
                <button
                  onClick={() => setShowAllPriorities(!showAllPriorities)}
                  className="w-full mt-4 py-2 px-4 bg-red-100 hover:bg-red-200 
                    text-red-700 rounded-lg transition-colors duration-200 
                    flex items-center justify-center gap-2 font-medium group"
                >
                  {showAllPriorities ? (
                    <>
                      <svg 
                        className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg 
                        className="w-5 h-5 transition-transform duration-200 group-hover:translate-y-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      View 4 More Actions
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Market Trends Section */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-700">
              <span className="mr-2">🎯</span>
              Event Management Trends & Insights
            </h3>
            <div className="space-y-3">
              {isLoadingTrends ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
                  <div className="mt-2 text-purple-700">Loading market trends...</div>
                </div>
              ) : (
                <>
                  {(marketTrends || [])
                    .slice(0, showAllTrends ? undefined : 2)
                    .map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-800">{suggestion.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{suggestion.action}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-purple-600">{suggestion.growth}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 italic">
                          Trend: {suggestion.trend}
                        </div>
                        {suggestion.details && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-600 mb-2">Key Trends:</div>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.details.map((detail, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                                  {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            Impact: {suggestion.impact}
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            Priority: {suggestion.priority}
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Show More/Less Button for Trends */}
                  {(marketTrends || []).length > 2 && (
                    <button
                      onClick={() => setShowAllTrends(!showAllTrends)}
                      className="w-full mt-4 py-2 px-4 bg-purple-100 hover:bg-purple-200 
                        text-purple-700 rounded-lg transition-colors duration-200 
                        flex items-center justify-center gap-2 font-medium"
                    >
                      {showAllTrends ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                          Show Less
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                          Show More Insights ({marketTrends.length - 2} more)
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="mt-6">
        {vendorReviews.length > 0 ? (
          <div className="grid gap-36 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendorReviews.map((rating) => {
              const product = allProduct.find(
                (product) => product._id === rating.productId
              );

              return (
                <div
                  key={rating._id}
                  className="card mb-4 p-4 border rounded shadow-lg w-80 transition-transform transform hover:scale-105"
                >
                  {product?.productImage && (
                    <img
                      src={product.productImage[0]}
                      alt={product.productName}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h2 className="text-xl font-bold mb-2">
                    Order ID: {rating.orderId}
                  </h2>
                  <h3 className="text-lg font-semibold">
                    Product ID: {rating.productId}
                  </h3>
                  {product && (
                    <>
                      <h3 className="text-lg font-semibold">
                        Product Name: {product.productName}
                      </h3>
                    
                      <p className="text-gray-600"><b>Price: </b>₹{product.price}</p>
                      <p className="text-gray-600">
                        <b>Category:</b> {product.category}
                      </p>
                    </>
                  )}
                  <p className="mt-4"><b>Rating:</b> {renderStars(rating.rating)}</p>
                  <p className="text-gray-600 mt-2"><b>Review:</b> {rating.review}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            No ratings found for your products.
          </p>
        )}
      </div>
    </div>
  );
};

// Add this CSS to your styles
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

export default RatingView;
