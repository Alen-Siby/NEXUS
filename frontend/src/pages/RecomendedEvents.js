import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';
import { FiShoppingCart, FiSettings } from 'react-icons/fi';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import Context from '../context';

const RecommendedEvents = () => {
  const location = useLocation();
  const eventDetails = location.state?.eventDetails;
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(eventDetails);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [selectedDishes, setSelectedDishes] = useState({});
  const [currentConfiguration, setCurrentConfiguration] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [categories, setCategories] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [configuredMenus, setConfiguredMenus] = useState({});
  const [ratingStats, setRatingStats] = useState({});

  // Define occasion mappings
  const occasionMappings = {
    'wedding': ['wedding', 'marriage', 'matrimony', 'shaadi', 'vivah', 'nikah', 'engagement', 'reception'],
    'birthday': ['birthday', 'birth day', 'bday', 'anniversary', 'cake cutting', 'birth anniversary'],
    'corporate': ['corporate', 'business', 'company', 'office', 'professional', 'work', 'team building', 'product launch', 'annual meeting'],
    'social': ['social', 'gathering', 'get-together', 'party', 'reunion', 'meet up', 'social event', 'cocktail', 'dinner party'],
    'cultural': ['cultural', 'festival', 'traditional', 'heritage', 'folk', 'ethnic', 'cultural show', 'art exhibition'],
    'personal': ['personal', 'private', 'individual', 'family', 'intimate', 'house warming', 'baby shower', 'naming ceremony'],
    'festival': ['festival', 'celebration', 'festive', 'carnival', 'fair', 'mela', 'diwali', 'christmas', 'eid', 'holi', 'navratri', 'pongal'],
    'conference': ['conference', 'seminar', 'meeting', 'convention', 'symposium', 'workshop', 'training', 'summit'],
    'religious': ['religious', 'spiritual', 'prayer', 'pooja', 'ceremony', 'ritual', 'temple', 'church', 'mosque'],
    'academic': ['academic', 'graduation', 'convocation', 'school', 'college', 'university', 'farewell', 'alumni'],
    'sports': ['sports', 'tournament', 'championship', 'game', 'match', 'athletic', 'competition', 'awards', 'sports day', 'sports meet'],
    'entertainment': ['entertainment', 'concert', 'show', 'performance', 'music', 'dance', 'theater', 'film', 'screening'],
    'charity': ['charity', 'fundraiser', 'donation', 'ngo', 'social cause', 'awareness', 'benefit'],
    'fashion': ['fashion', 'show', 'runway', 'exhibition', 'launch', 'collection', 'lifestyle'],
    'food': ['food', 'culinary', 'cooking', 'tasting', 'food festival', 'chef', 'cuisine'],
    'tech': ['technology', 'tech', 'digital', 'startup', 'hackathon', 'innovation', 'launch'],
    'award': ['award', 'ceremony', 'recognition', 'achievement', 'felicitation', 'honors'],
    'promotional': ['promotional', 'marketing', 'brand', 'launch', 'showcase', 'preview', 'presentation'],
    'seasonal': ['seasonal', 'summer', 'winter', 'spring', 'autumn', 'new year', 'holiday'],
    'milestone': ['milestone', 'achievement', 'success', 'completion', 'inauguration', 'anniversary']
  };

  // Updated event type categories with two more package types
  const eventTypeCategories = {
    marriage: {
      categories: ['auditorium', 'catering', 'decorations', 'photo-video', 'event-management', 'audio-visual-it', 'rent', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        decorations: 0.15,
        'photo-video': 0.15,
        'event-management': 0.10,
        'audio-visual-it': 0.10,
        rent: 0.10,
        bakers: 0.05
      }
    },
    birthday: {
      categories: ['auditorium', 'catering', 'decorations', 'audio-visual-it', 'bakers', 'rent', 'photo-video', 'event-management'],
      weights: {
        auditorium: 0.15,
        catering: 0.15,
        decorations: 0.15,
        'audio-visual-it': 0.10,
        bakers: 0.15,
        rent: 0.10,
        'photo-video': 0.10,
        'event-management': 0.10
      }
    },
    corporate: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'logistics', 'rent', 'photo-video', 'decorations', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        logistics: 0.10,
        rent: 0.10,
        'photo-video': 0.05,
        decorations: 0.05,
        bakers: 0.05
      }
    },
    social: {
      categories: ['auditorium', 'catering', 'decorations', 'photo-video', 'social-media', 'rent', 'audio-visual-it', 'event-management', 'bakers'],
      weights: {
        auditorium: 0.15,
        catering: 0.15,
        decorations: 0.15,
        'photo-video': 0.15,
        'social-media': 0.10,
        rent: 0.10,
        'audio-visual-it': 0.10,
        'event-management': 0.05,
        bakers: 0.05
      }
    },
    cultural: {
      categories: ['auditorium', 'catering', 'decorations', 'audio-visual-it', 'event-management', 'rent', 'photo-video', 'logistics', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        decorations: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.10,
        rent: 0.10,
        'photo-video': 0.05,
        logistics: 0.05,
        bakers: 0.05
      }
    },
    personal: {
      categories: ['auditorium', 'catering', 'decorations', 'photo-video', 'rent', 'audio-visual-it', 'bakers', 'event-management'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        decorations: 0.15,
        'photo-video': 0.15,
        rent: 0.10,
        'audio-visual-it': 0.10,
        bakers: 0.10,
        'event-management': 0.05
      }
    },
    festival: {
      categories: ['auditorium', 'catering', 'decorations', 'audio-visual-it', 'event-management', 'logistics', 'rent', 'photo-video', 'bakers'],
      weights: {
        auditorium: 0.15,
        catering: 0.15,
        decorations: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.10,
        logistics: 0.10,
        rent: 0.10,
        'photo-video': 0.05,
        bakers: 0.05
      }
    },
    conference: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'logistics', 'social-media', 'rent', 'photo-video', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        logistics: 0.10,
        'social-media': 0.10,
        rent: 0.05,
        'photo-video': 0.05,
        bakers: 0.05
      }
    },
    sports: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'rent', 'logistics', 'photo-video', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.20,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        rent: 0.10,
        logistics: 0.10,
        'photo-video': 0.05,
        bakers: 0.05
      }
    },
    religious: {
      categories: ['auditorium', 'catering', 'decorations', 'photo-video', 'event-management', 'audio-visual-it', 'rent', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        decorations: 0.15,
        'photo-video': 0.15,
        'event-management': 0.10,
        'audio-visual-it': 0.10,
        rent: 0.10,
        bakers: 0.05
      }
    },
    academic: {
      categories: ['auditorium', 'catering', 'photo-video', 'audio-visual-it', 'event-management', 'rent', 'bakers'],
      weights: {
        auditorium: 0.25,
        catering: 0.20,
        'photo-video': 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.10,
        rent: 0.10,
        bakers: 0.05
      }
    },
    entertainment: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'photo-video', 'rent', 'decorations', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        'photo-video': 0.15,
        rent: 0.10,
        decorations: 0.05,
        bakers: 0.05
      }
    },
    charity: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'photo-video', 'rent', 'decorations', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.20,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        'photo-video': 0.10,
        rent: 0.10,
        decorations: 0.05,
        bakers: 0.05
      }
    },
    fashion: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'photo-video', 'rent', 'decorations', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        'photo-video': 0.15,
        rent: 0.10,
        decorations: 0.05,
        bakers: 0.05
      }
    },
    food: {
      categories: ['auditorium', 'catering', 'event-management', 'photo-video', 'rent', 'decorations', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.25,
        'event-management': 0.15,
        'photo-video': 0.15,
        rent: 0.10,
        decorations: 0.10,
        bakers: 0.05
      }
    },
    tech: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'photo-video', 'rent', 'social-media', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.20,
        'event-management': 0.15,
        'photo-video': 0.10,
        rent: 0.10,
        'social-media': 0.05,
        bakers: 0.05
      }
    },
    award: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'photo-video', 'rent', 'decorations', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        'photo-video': 0.15,
        rent: 0.10,
        decorations: 0.05,
        bakers: 0.05
      }
    },
    promotional: {
      categories: ['auditorium', 'catering', 'audio-visual-it', 'event-management', 'photo-video', 'rent', 'social-media', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        'audio-visual-it': 0.15,
        'event-management': 0.15,
        'photo-video': 0.15,
        rent: 0.10,
        'social-media': 0.05,
        bakers: 0.05
      }
    },
    seasonal: {
      categories: ['auditorium', 'catering', 'decorations', 'photo-video', 'event-management', 'rent', 'audio-visual-it', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        decorations: 0.15,
        'photo-video': 0.15,
        'event-management': 0.10,
        rent: 0.10,
        'audio-visual-it': 0.10,
        bakers: 0.05
      }
    },
    milestone: {
      categories: ['auditorium', 'catering', 'decorations', 'photo-video', 'event-management', 'rent', 'audio-visual-it', 'bakers'],
      weights: {
        auditorium: 0.20,
        catering: 0.15,
        decorations: 0.15,
        'photo-video': 0.15,
        'event-management': 0.10,
        rent: 0.10,
        'audio-visual-it': 0.10,
        bakers: 0.05
      }
    }
  };

  // Move generatePackages outside useEffect and make it async
  const generatePackages = async () => {
    if (!editedDetails) return;

    try {
      setLoading(true);
      
      // Get the normalized occasion
      const normalizedOccasion = editedDetails.occasion.toLowerCase().trim();
      
      // Find matching event type from occasion mappings
      let matchedEventType = null;
      let highestMatchScore = 0;

      // Log for debugging
      console.log('Searching for event type match for:', normalizedOccasion);

      for (const [eventType, mappedOccasions] of Object.entries(occasionMappings)) {
        // Calculate match score based on word matches
        const occasionWords = normalizedOccasion.split(/\s+/);
        let matchScore = 0;

        mappedOccasions.forEach(mapped => {
          occasionWords.forEach(word => {
            if (mapped.includes(word) || word.includes(mapped)) {
              matchScore++;
            }
          });
        });

        // Log match scores for debugging
        console.log(`Event type ${eventType} match score:`, matchScore);

        if (matchScore > highestMatchScore) {
          highestMatchScore = matchScore;
          matchedEventType = eventType;
        }
      }

      // If no match found, try to find a partial match
      if (!matchedEventType) {
        for (const [eventType, mappedOccasions] of Object.entries(occasionMappings)) {
          if (mappedOccasions.some(mapped => 
            normalizedOccasion.includes(mapped) || 
            mapped.includes(normalizedOccasion)
          )) {
            matchedEventType = eventType;
            break;
          }
        }
      }

      // If still no match, use default event type based on keywords
      if (!matchedEventType) {
        if (normalizedOccasion.includes('party') || normalizedOccasion.includes('celebration')) {
          matchedEventType = 'social';
        } else if (normalizedOccasion.includes('meeting') || normalizedOccasion.includes('conference')) {
          matchedEventType = 'corporate';
        } else {
          matchedEventType = 'social'; // Default fallback
        }
      }

      // Log final event type selection
      console.log('Selected event type:', matchedEventType);
      console.log('Original occasion:', editedDetails.occasion);

      // Ensure we're using the correct event configuration
      if (!eventTypeCategories[matchedEventType]) {
        console.error('No configuration found for event type:', matchedEventType);
        // Fall back to 'social' if the matched type has no configuration
        matchedEventType = 'social';
      }

      // Fetch all products if not already fetched
      if (allProducts.length === 0) {
        const response = await fetch(SummaryApi.allProduct.url);
        const dataResponse = await response.json();
        
        if (!dataResponse?.data) {
          throw new Error('No products data received');
        }

        const products = dataResponse.data;
        setAllProducts(products);

        // Generate packages after products are fetched
        const eventConfig = eventTypeCategories[matchedEventType];
        console.log('Using event config:', eventConfig);
        const generatedPackages = createPackages(products, editedDetails, eventConfig);
        console.log('Generated packages:', generatedPackages);
        setPackages(generatedPackages);
      } else {
        // If products already exist, generate packages with existing products
        const eventConfig = eventTypeCategories[matchedEventType];
        console.log('Using event config:', eventConfig);
        const generatedPackages = createPackages(allProducts, editedDetails, eventConfig);
        console.log('Generated packages:', generatedPackages);
        setPackages(generatedPackages);
      }
    } catch (error) {
      console.error('Error generating packages:', error);
      toast.error("Error generating recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Update handleUpdateDetails to use generatePackages
  const handleUpdateDetails = async () => {
    await generatePackages();
    setIsEditing(false);
  };

  // Initial package generation
  useEffect(() => {
    if (eventDetails) {
      generatePackages();
    }
  }, [eventDetails]);  // Add eventDetails as dependency

  useEffect(() => {
    fetchRatings();
  }, []);

  const createPackages = (products, eventDetails, eventConfig) => {
    const { budget, guests, occasion } = eventDetails;
    const minBudget = budget[0];
    const maxBudget = budget[1];

    // Create more budget ranges to ensure minimum packages
    const budgetRanges = [
      { 
        min: minBudget, 
        max: minBudget + (maxBudget - minBudget) * 0.15, 
        label: 'Budget Friendly'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.15, 
        max: minBudget + (maxBudget - minBudget) * 0.3, 
        label: 'Value Plus'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.3, 
        max: minBudget + (maxBudget - minBudget) * 0.45, 
        label: 'Smart Choice'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.45, 
        max: minBudget + (maxBudget - minBudget) * 0.6, 
        label: 'Premium Choice'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.6, 
        max: minBudget + (maxBudget - minBudget) * 0.75, 
        label: 'Elite'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.75, 
        max: minBudget + (maxBudget - minBudget) * 0.85, 
        label: 'Luxury'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.85, 
        max: minBudget + (maxBudget - minBudget) * 0.92, 
        label: 'Premium Elite'
      },
      { 
        min: minBudget + (maxBudget - minBudget) * 0.92, 
        max: maxBudget, 
        label: 'Platinum'
      }
    ];

    // Keep track of used products
    let usedProducts = new Set();

    // Filter and prepare products
    let productsToUse = products;
    if (products.length > 0) {
      const occasionFilteredProducts = products.filter(product => {
        if (!product.occasions || !Array.isArray(product.occasions)) {
          return true;
        }
        const normalizedOccasion = occasion.toLowerCase().trim();
        return product.occasions.some(productOccasion => 
          productOccasion.toLowerCase().includes(normalizedOccasion)
        );
      });
      productsToUse = occasionFilteredProducts.length > 0 ? occasionFilteredProducts : products;
    }

    // Generate initial packages
    let generatedPackages = budgetRanges.map(budgetRange => 
      createPackageForBudgetRange(productsToUse, budgetRange, eventDetails, eventConfig, usedProducts)
    ).filter(pkg => pkg !== null);

    // If we have less than 6 packages, generate additional variations
    if (generatedPackages.length < 6) {
      const additionalRanges = budgetRanges.map(range => ({
        ...range,
        min: range.min * 0.9,
        max: range.max * 1.1,
        label: `${range.label} Plus`
      }));

      const extraPackages = additionalRanges.map(budgetRange =>
        createPackageForBudgetRange(productsToUse, budgetRange, eventDetails, eventConfig, new Set())
      ).filter(pkg => pkg !== null);

      generatedPackages = [...generatedPackages, ...extraPackages];
    }

    // Ensure we have at least 6 packages by creating variations
    while (generatedPackages.length < 6) {
      const basePackage = generatedPackages[Math.floor(Math.random() * generatedPackages.length)];
      if (basePackage) {
        const variation = {
          ...basePackage,
          name: `${basePackage.name} (Variation ${generatedPackages.length + 1})`,
          price: basePackage.price * (0.9 + Math.random() * 0.2), // ±10% price variation
          matchScore: Math.max(60, basePackage.matchScore * (0.9 + Math.random() * 0.2))
        };
        generatedPackages.push(variation);
      }
    }

    // Limit to maximum 11 packages, prioritizing higher match scores
    if (generatedPackages.length > 11) {
      generatedPackages = generatedPackages
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 11);
    }

    // Sort by price
    return generatedPackages.sort((a, b) => a.price - b.price);
  };

  const createPackageForBudgetRange = (products, budgetRange, eventDetails, eventConfig, usedProducts) => {
    if (!products || !eventConfig || !eventConfig.categories || !eventConfig.weights) {
      console.error('Missing required data:', { products, eventConfig });
      return null;
    }

    // Log the event configuration being used
    console.log('Event config in createPackageForBudgetRange:', eventConfig);

    const { categories, weights } = eventConfig;
    let packageProducts = {};
    let totalCost = 0;

    // Filter products to only include those in the allowed categories for this event type
    const filteredProducts = products.filter(product => 
      categories.includes(product.category)
    );

    console.log('Filtered products by event categories:', 
      filteredProducts.map(p => p.category),
      'Allowed categories:', categories
    );

    // Only use the categories specified in the event config
    categories.forEach(category => {
      if (!Array.isArray(filteredProducts)) {
        console.error('Products is not an array:', filteredProducts);
        return;
      }

      // Filter products by category, budget, and exclude used products
      const availableProducts = filteredProducts.filter(product => 
        product && 
        product.category === category && // Ensure category matches exactly
        product.price && 
        product.price <= (budgetRange.max - totalCost) &&
        !usedProducts.has(product._id)
      );

      console.log(`Available products for ${category}:`, availableProducts.length);

      if (availableProducts && availableProducts.length > 0) {
        const scoredProducts = availableProducts.map(product => ({
          ...product,
          totalPrice: ['catering', 'rent'].includes(category.toLowerCase()) 
            ? (product.price * eventDetails.guests)
            : product.price,
          score: calculateProductScore(product, eventDetails, weights[category], budgetRange)
        })).sort((a, b) => b.score - a.score);

        const selectedProduct = scoredProducts[0];
        if (selectedProduct) {
          packageProducts[category] = [selectedProduct];
          totalCost += selectedProduct.totalPrice;
          usedProducts.add(selectedProduct._id);
        }
      }
    });

    // Only create package if we have enough categories covered
    const requiredCategories = Math.ceil(categories.length * 0.6);
      const coveredCategories = Object.keys(packageProducts).length;
    
    console.log('Package coverage:', {
      required: requiredCategories,
      covered: coveredCategories,
      categories: Object.keys(packageProducts)
    });
      
      if (coveredCategories < requiredCategories) {
          return null;
        }

    return {
      name: `${budgetRange.label} ${eventDetails.eventType} Package`,
      price: totalCost,
      matchScore: Math.round(calculateMatchScore(packageProducts, eventDetails, eventConfig)),
      categories: packageProducts,
      features: generatePackageFeatures(packageProducts, eventDetails),
      image: Object.values(packageProducts)[0]?.[0]?.productImage?.[0] || 'default-package-image.jpg'
    };
  };

  const calculateProductScore = (product, eventDetails, categoryWeight, budgetRange) => {
    let score = 0;
    const { guests } = eventDetails;

    // Base score from category weight
    score += categoryWeight * 10;

    // Capacity score for venues
    if (product.category === 'auditorium' && product.capacity) {
      const capacityDiff = Math.abs(product.capacity - guests);
      const capacityScore = (1 / (1 + capacityDiff)) * 5;
      score += capacityScore;
    }

    // Price efficiency score based on budget range
    if (product.price) {
      const priceRatio = product.price / budgetRange.max;
      const priceScore = (1 - Math.abs(0.5 - priceRatio)) * 3; // Prefer prices in the middle of the range
      score += priceScore;
    }

    // Rating score if available
    if (product.rating) {
      score += product.rating;
    }

    // Premium products get bonus points for premium packages
    if (budgetRange.label === 'Platinum' && product.sponsor) {
      score += 2;
    }

    return score;
  };

  const formatPackageProducts = (packageProducts) => {
    const formatted = {};
    Object.entries(packageProducts).forEach(([category, products]) => {
      formatted[category] = [{
        name: products[0].name,
        quantity: 1
      }];
    });
    return formatted;
  };

  const generatePackageFeatures = (packageProducts, eventDetails) => {
    const features = [
      `Suitable for ${eventDetails.guests} guests`,
      `Complete ${eventDetails.eventType} package`
    ];

    // Add category-specific features
    Object.entries(packageProducts).forEach(([category, products]) => {
      switch (category) {
        case 'auditorium':
          features.push(`${products[0].name} venue with ${products[0].capacity} capacity`);
          break;
        case 'catering':
          features.push(`Professional catering service`);
          break;
        case 'decorations':
          features.push(`Custom theme decoration`);
          break;
        case 'photo-video':
          features.push(`Professional photography & videography`);
          break;
        case 'audio-visual-it':
          features.push(`Complete AV setup`);
          break;
        case 'event-management':
          features.push(`Full event coordination`);
          break;
      }
    });

    return [...new Set(features)].slice(0, 5);
  };

  const calculateMatchScore = (packageProducts, eventDetails, eventConfig) => {
    if (!packageProducts || !eventConfig || !eventConfig.categories || !eventConfig.weights) {
      console.error('Missing data in calculateMatchScore:', { packageProducts, eventConfig });
      return 0;
    }

    const { categories, weights } = eventConfig;
    let score = 0;
    let totalWeight = 0;

    // Calculate weighted score based on category coverage
    categories.forEach(category => {
      // Add null checks for packageProducts[category]
      if (packageProducts[category] && Array.isArray(packageProducts[category]) && packageProducts[category].length > 0) {
        score += weights[category] * 100;
      }
      totalWeight += weights[category];
    });

    // Normalize score
    score = (score / totalWeight);

    // Adjust score based on budget fit
    const totalCost = Object.values(packageProducts).reduce((sum, products) => {
      if (Array.isArray(products)) {
        return sum + products.reduce((productSum, product) => {
          return productSum + (product?.totalPrice || 0);
        }, 0);
      }
      return sum;
    }, 0);

    const budgetFit = 100 - (Math.abs(totalCost - eventDetails.budget[1]) / eventDetails.budget[1] * 100);

    return (score * 0.7 + budgetFit * 0.3);
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
      console.log('Fetched ratings:', data);

      if (Array.isArray(data?.data)) {
        const ratingsMap = {};
        const statsMap = {};

        // Process each product's ratings
        Object.entries(packages).forEach(([_, pkg]) => {
          pkg.categories.forEach(product => {
            const productRatings = data.data.filter(rating => rating.productId === product._id);
            
            // Calculate rating distribution
            const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            productRatings.forEach(rating => {
              stats[Math.floor(rating.rating)]++;
            });
            statsMap[product._id] = stats;

            // Calculate average rating
            const totalRatings = productRatings.length;
            const avgRating = totalRatings > 0 
              ? productRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
              : 0;

            ratingsMap[product._id] = {
              avgRating: avgRating,
              stats: statsMap[product._id]
            };
          });
        });

        console.log('Processed ratings:', ratingsMap);
        setProductRatings(ratingsMap);
        setRatingStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMagnifierPosition({ x, y });
  };

  const handleImageHover = (index) => {
    setActiveImageIndex(index);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(SummaryApi.categoryPro.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      if (data?.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (!eventDetails) {
    return <div className="text-center p-8">No event details available</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Event Details Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Event Details
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {isEditing ? 'Save Changes' : 'Edit Details'}
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Type */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100/50">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
                </svg>
                <h3 className="font-semibold text-gray-700">Event Type</h3>
              </div>
              <div className="flex items-center">
                {isEditing ? (
                  <select
                    value={editedDetails.eventType}
                    onChange={(e) => setEditedDetails({...editedDetails, eventType: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(eventTypeCategories).map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
                    {editedDetails.eventType}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100/50">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
                <h3 className="font-semibold text-gray-700">Occasion</h3>
              </div>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium">
                  {editedDetails.occasion}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100/50">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <h3 className="font-semibold text-gray-700">Budget Range</h3>
              </div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editedDetails.budget[0]}
                    onChange={(e) => setEditedDetails({
                      ...editedDetails,
                      budget: [parseInt(e.target.value), editedDetails.budget[1]]
                    })}
                    className="w-1/2 px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    value={editedDetails.budget[1]}
                    onChange={(e) => setEditedDetails({
                      ...editedDetails,
                      budget: [editedDetails.budget[0], parseInt(e.target.value)]
                    })}
                    className="w-1/2 px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">
                    ₹{editedDetails.budget[0].toLocaleString()}
                  </span>
                  <span className="text-gray-500">to</span>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">
                    ₹{editedDetails.budget[1].toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Guests */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100/50">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <h3 className="font-semibold text-gray-700">Expected Guests</h3>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedDetails.guests}
                  onChange={(e) => setEditedDetails({...editedDetails, guests: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              ) : (
                <span className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-medium">
                  {editedDetails.guests} Guests
                </span>
              )}
            </div>

            {/* Event Date */}
            <div className="md:col-span-2 bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100/50">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <h3 className="font-semibold text-gray-700">Event Date</h3>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={editedDetails.date}
                  onChange={(e) => setEditedDetails({...editedDetails, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
                  {new Date(editedDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons when Editing */}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setEditedDetails(eventDetails);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDetails}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Packages Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Recommended Packages
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : packages.length > 0 ? (
          <div className="flex flex-wrap justify-center -mx-4">
            {[...packages]
        .sort((a, b) => a.price - b.price)
              .map((pkg, index) => (
              <div key={index} 
                className={`px-4 mb-8 ${
                  packages.length === 1 ? 'w-2/3' : 
                  packages.length === 2 ? 'w-1/2' : 
                  'w-1/3'
                }`}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full relative mt-6 border border-gray-100">
                  {/* Match Score Tag */}
                  <div className="absolute -top-5 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-xl z-10 transform hover:scale-105 transition-transform duration-200">
                    {Math.round(pkg.matchScore)}% Match
                  </div>

                  {/* Package Header */}
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-t-2xl text-white">
                    <h3 className="text-2xl font-bold mb-3 text-white/90">{pkg.name}</h3>
                    <div className="mt-3 text-4xl font-bold">
                      ₹{pkg.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-6">
                    {/* Categories and Products */}
                    <div className="space-y-6">
                      {Object.entries(pkg.categories).map(([category, products]) => (
                        <div key={category} className="border-b border-gray-100 pb-6 last:border-0">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center text-lg">
                            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></span>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-6">
                            {products.map((product, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-full overflow-hidden">
                                {/* Product Image */}
                                <div className="relative h-48 rounded-t-xl overflow-hidden">
                                  <div className="relative">
                                    {/* Main Image Container */}
                                    <div 
                                      className="w-full h-[300px] rounded-2xl overflow-hidden bg-gray-50 relative cursor-crosshair"
                                      onMouseEnter={() => setShowMagnifier(true)}
                                      onMouseLeave={() => setShowMagnifier(false)}
                                      onMouseMove={handleMouseMove}
                                    >
                                      <img
                                        src={product.productImage?.[activeImageIndex]}
                                        className="w-full h-full object-contain p-4"
                                        alt={product.productName}
                                      />
                                    </div>

                                    {/* Magnified Preview */}
                                    {showMagnifier && (
                                      <div className="absolute top-0 -right-[320px] w-[300px] h-[300px] border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xl pointer-events-none">
                                        <div
                                          style={{
                                            backgroundImage: `url(${product.productImage?.[activeImageIndex]})`,
                                            backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '250%',
                                            width: '100%',
                                            height: '100%'
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Thumbnail Images */}
                                  <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                                    {product.productImage?.map((imgURL, index) => (
                                      <button
                                        key={index}
                                        onMouseEnter={() => handleImageHover(index)}
                                        className={`flex-none w-[60px] h-[60px] rounded-lg overflow-hidden 
                                          ${activeImageIndex === index 
                                            ? 'ring-2 ring-red-600 ring-offset-2' 
                                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                                          } transition-all duration-200`}
                                      >
                                        <img
                                          src={imgURL}
                                          className="w-full h-full object-contain p-2"
                                          alt={`Thumbnail ${index}`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                      {product.productName}
                                    </h5>
                                    {['catering', 'rent', 'bakers'].includes(category.toLowerCase()) ? (
                                      <div className="flex flex-col items-end">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-1">
                                          ₹{product.price?.toLocaleString() || 'Price varies'} per person
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          Total: ₹{((product.price || 0) * editedDetails.guests).toLocaleString()}
                                          <span className="text-xs ml-1">({editedDetails.guests} guests)</span>
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        ₹{product.price?.toLocaleString() || 'Price varies'}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Brand:</span> {product.brandName}
                                  </p>

                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {product.description}
                                  </p>

                                  <div className="flex gap-2 mt-2">
                                    {product.sponsor && (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                        Featured
                                      </span>
                                    )}
                                    {!product.disabled && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                        Available
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Package Features */}
                      <div className="mt-6 bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-800 mb-4 text-lg">Package Features</h4>
                        <ul className="space-y-3">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="text-gray-600 flex items-center">
                              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-3">
                      <button 
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsCustomizing(true);
                        }}
                        className="w-full border-2 border-blue-500 text-blue-500 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Customize Package
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01"></path>
            </svg>
            <p className="text-xl font-semibold">No packages found matching your criteria</p>
            <p className="text-gray-500 mt-2">Try adjusting your event details or budget range</p>
          </div>
        )}
      </div>

      {/* Customize Package Modal */}
      {isCustomizing && (
        <CustomizePackageModal
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
          packageData={selectedPackage}
          ratings={productRatings}
          eventDetails={eventDetails}
        />
      )}
    </div>
  );
}

const CustomizePackageModal = ({ isOpen, onClose, packageData, ratings, eventDetails }) => {
  const { fetchUserAddToCart } = useContext(Context);
  
  const [selectedDishes, setSelectedDishes] = useState({});
  const [currentConfiguration, setCurrentConfiguration] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeImageIndices, setActiveImageIndices] = useState({});
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [currentProduct, setCurrentProduct] = useState(null);
  const [configuredMenus, setConfiguredMenus] = useState({});
  const [productRatings, setProductRatings] = useState({});
  const [ratingStats, setRatingStats] = useState({});

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMagnifierPosition({ x, y });
  };

  const handleImageHover = (productId, index) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  const handleConfigurationSave = () => {
    const hasEmptySelection = Object.values(selectedDishes).some(dishes => 
      !Array.isArray(dishes) || dishes.length === 0
    );
    
    if (hasEmptySelection) {
      toast.error('Please select at least one dish from each course');
      return;
    }
    
    const updatedConfigs = {
      ...configuredMenus,
      [currentProduct._id]: selectedDishes
    };
    
    // Save to state and localStorage
    setConfiguredMenus(updatedConfigs);
    localStorage.setItem('configuredMenus', JSON.stringify(updatedConfigs));
    
    setIsConfigModalOpen(false);
    toast.success('Menu configuration saved!');
  };

  const handleConfigureClick = (product) => {
    setCurrentProduct(product);
    setIsConfigModalOpen(true);
  };

  // Handle variant selection and update images
  const handleVariantSelect = (productId, variant) => {
    const updatedVariants = {
      ...selectedVariants,
      [productId]: variant
    };

    // Save to state and localStorage
    setSelectedVariants(updatedVariants);
    localStorage.setItem('selectedVariants', JSON.stringify(updatedVariants));

    // Update images if variant has images
    if (variant.images && variant.images.length > 0) {
      setVariantImages(prev => ({
        ...prev,
        [productId]: variant.images
      }));
      setActiveImageIndices(prev => ({
        ...prev,
        [productId]: 0
      }));
    }
  };

  // Get current images for a product
  const getCurrentImages = (product) => {
    if (product.category === 'rent' && variantImages[product._id]) {
      return variantImages[product._id];
    }
    return product.productImage || [];
  };

  // Helper function to calculate total cost
  const calculateTotalCost = (product, category) => {
    if (['catering', 'rent', 'bakers'].includes(category.toLowerCase())) {
      const basePrice = category.toLowerCase() === 'rent' && selectedVariants[product._id] 
        ? selectedVariants[product._id].price 
        : product.price;
      
      return basePrice * eventDetails.guests;
    }
    return product.price;
  };

  // Fetch ratings for all products
  const fetchProductRatings = async () => {
    try {
      const response = await fetch(SummaryApi.getRating.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ratings');

      const data = await response.json();
      if (Array.isArray(data?.data)) {
        const ratingsMap = {};
        const statsMap = {};

        // Process each product's ratings
        Object.entries(packageData.categories).forEach(([_, products]) => {
          products.forEach(product => {
            const productRatings = data.data.filter(rating => rating.productId === product._id);
            
            // Calculate rating distribution
            const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            productRatings.forEach(rating => {
              stats[Math.floor(rating.rating)]++;
            });
            statsMap[product._id] = stats;

            // Calculate average rating
            const totalRatings = productRatings.length;
            const avgRating = totalRatings > 0 
              ? productRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
              : 0;

            ratingsMap[product._id] = {
              avgRating: Math.round(avgRating * 2) / 2,
              totalRatings
            };
          });
        });

        setProductRatings(ratingsMap);
        setRatingStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // Add useEffect to initialize selections from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load saved configurations from localStorage
      const savedConfigs = localStorage.getItem('configuredMenus');
      const savedVariants = localStorage.getItem('selectedVariants');
      
      if (savedConfigs) {
        setConfiguredMenus(JSON.parse(savedConfigs));
      }
      if (savedVariants) {
        setSelectedVariants(JSON.parse(savedVariants));
      }
      
      fetchProductRatings();
    }
  }, [isOpen]);

  // Add cleanup function when modal closes
  useEffect(() => {
    return () => {
      if (!isOpen) {
        // Optionally clear localStorage when modal is closed
        // localStorage.removeItem('configuredMenus');
        // localStorage.removeItem('selectedVariants');
      }
    };
  }, [isOpen]);

  // Helper function to render rating stars
  const renderRatingStars = (productId) => {
    const rating = productRatings[productId];
    if (!rating) return null;

    const fullStars = Math.floor(rating.avgRating);
    const hasHalfStar = rating.avgRating % 1 !== 0;

    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, index) => {
            if (index < fullStars) {
              return <FaStar key={index} className="w-5 h-5" />;
            } else if (index === fullStars && hasHalfStar) {
              return <FaStarHalf key={index} className="w-5 h-5" />;
            } else {
              return <FaStar key={index} className="w-5 h-5 text-gray-300" />;
            }
          })}
        </div>
        <span className="text-sm text-gray-600">
          ({rating.totalRatings} {rating.totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    );
  };

  const handleAddPackageToCart = async () => {
    try {
      for (const [category, products] of Object.entries(packageData.categories)) {
        for (const product of products) {
          try {
            let response;
            
            if (category.toLowerCase() === 'catering') {
              // Check if configuration exists
              const configuration = configuredMenus[product._id];
              if (!configuration) {
                toast.error(`Please configure menu for ${product.productName}`);
                setIsConfigModalOpen(true);
                continue;
              }

              // Log configuration being sent
              console.log('Sending catering configuration:', {
                productId: product._id,
                quantity: eventDetails.guests,
                configuration
              });

              response = await fetch(SummaryApi.addToCartWithConfig.url, {
                method: SummaryApi.addToCartWithConfig.method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  productId: product._id,
                  quantity: eventDetails.guests,
                  configuration
                })
              });
            } else if (category.toLowerCase() === 'rent') {
              // Check if variant is selected
              const selectedVariant = selectedVariants[product._id];
              if (!selectedVariant) {
                toast.error(`Please select variant for ${product.productName}`);
                continue;
              }

              // Log variant being sent
              console.log('Sending rental variant:', {
                productId: product._id,
                quantity: eventDetails.guests,
                variantId: selectedVariant._id,
                variantName: selectedVariant.itemName,
                variantPrice: selectedVariant.price
              });

              response = await fetch(SummaryApi.addToCartWithVariant.url, {
                method: SummaryApi.addToCartWithVariant.method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  productId: product._id,
                  quantity: eventDetails.guests,
                  variantId: selectedVariant._id,
                  variantName: selectedVariant.itemName,
                  variantPrice: selectedVariant.price
                })
              });
            } else if (category.toLowerCase() === 'bakers') {
              response = await fetch(SummaryApi.addToCartProduct.url, {
                method: SummaryApi.addToCartProduct.method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  productId: product._id,
                  quantity: eventDetails.guests
                })
              });
            } else {
              response = await fetch(SummaryApi.addToCartProduct.url, {
                method: SummaryApi.addToCartProduct.method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  productId: product._id,
                  quantity: 1
                })
              });
            }

            const data = await response.json();
            console.log('Backend Response:', data); // Log the response

            if (data.success) {
              toast.success(`Added ${product.productName} to cart`);
              await fetchUserAddToCart();
            } else {
              toast.error(data.message || `Failed to add ${product.productName} to cart`);
            }
          } catch (error) {
            console.error(`Error adding ${product.productName} to cart:`, error);
            toast.error(`Failed to add ${product.productName} to cart: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in add to cart process:', error);
      toast.error('Failed to complete adding items to cart');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customize Package</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Products Grid - Modified to show two categories per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(packageData.categories).map(([category, products]) => (
            <div key={category} className="bg-white rounded-xl p-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>

              <div className="space-y-6">
                {products.map((product, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Left: Image Section */}
                      <div className="flex-1">
                        <div className="relative">
                          {/* Main Image Container */}
                          <div className="w-full h-[300px] rounded-2xl overflow-hidden bg-gray-50">
                            <img
                              src={getCurrentImages(product)[activeImageIndices[product._id] || 0]}
                              className="w-full h-full object-contain p-4"
                              alt={product.productName}
                            />
                          </div>

                          {/* Thumbnail Images */}
                          <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                            {getCurrentImages(product).map((imgURL, index) => (
                              <button
                                key={index}
                                onMouseEnter={() => handleImageHover(product._id, index)}
                                className={`flex-none w-[60px] h-[60px] rounded-lg overflow-hidden 
                                  ${activeImageIndices[product._id] === index 
                                    ? 'ring-2 ring-red-600 ring-offset-2' 
                                    : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                                  } transition-all duration-200`}
                              >
                                <img
                                  src={imgURL}
                                  className="w-full h-full object-contain p-2"
                                  alt={`Thumbnail ${index}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Product Details */}
                      <div className="flex-1">
                        {/* Brand Link with Store Icon */}
                        <Link 
                          to={`/vendor/${product.brandName}`} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full 
                            bg-red-50 hover:bg-red-100 transition-colors duration-200
                            border border-red-100 hover:border-red-200 group w-fit mb-3"
                        >
                          <FaStore className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-red-600 font-medium text-sm group-hover:text-red-700">
                            {product.brandName}
                          </span>
                          <svg className="w-4 h-4 ml-1.5 text-red-500 group-hover:translate-x-0.5 transition-transform" 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        {/* Product Name and Category */}
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {product.productName}
                        </h4>
                        <p className="capitalize text-gray-500 mb-4">{category}</p>

                        {/* Rating Stars */}
                        {renderRatingStars(product._id)}

                        {/* Rental Variants Section */}
                        {category.toLowerCase() === 'rent' && product.rentalVariants && (
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Available Options:</h4>
                            <div className="flex flex-wrap gap-3">
                              {product.rentalVariants.map((variant, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleVariantSelect(product._id, variant)}
                                  className={`
                                    px-4 py-2 rounded-lg border-2 transition-all duration-200
                                    ${selectedVariants[product._id]?._id === variant._id 
                                      ? 'border-red-600 bg-red-50 text-red-600' 
                                      : 'border-gray-300 hover:border-red-600 hover:bg-red-50'
                                    }
                                  `}
                                >
                                  <div className="text-left">
                                    <p className="font-medium">{variant.itemName}</p>
                                    <p className="text-sm text-gray-600">₹{variant.price?.toLocaleString()}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Display */}
                        <div className="mb-4">
                          {category.toLowerCase() === 'rent' ? (
                            selectedVariants[product._id] ? (
                              <div className="space-y-1">
                                <p className="text-2xl font-bold text-red-600">
                                  ₹{selectedVariants[product._id].price?.toLocaleString()} per guest
                                </p>
                                <p className="text-lg text-gray-600">
                                  Total for {eventDetails.guests} guests:{' '}
                                  <span className="font-bold text-red-600">
                                    ₹{calculateTotalCost(product, category).toLocaleString()}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg text-gray-600">Select a variant</p>
                            )
                          ) : ['catering', 'bakers'].includes(category.toLowerCase()) ? (
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-red-600">
                                ₹{product.price?.toLocaleString()} per guest
                              </p>
                              <p className="text-lg text-gray-600">
                                Total for {eventDetails.guests} guests:{' '}
                                <span className="font-bold text-red-600">
                                  ₹{calculateTotalCost(product, category).toLocaleString()}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-red-600">
                              ₹{product.price?.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Configure Menu Button and Configured Items - Only for catering */}
                        {category.toLowerCase() === 'catering' && (
                          <div className="space-y-4">
                            <button
                              onClick={() => handleConfigureClick(product)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FiSettings className="w-4 h-4" />
                              Configure Menu
                            </button>

                            {/* Display Configured Menu Items */}
                            {configuredMenus[product._id] && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-3">Selected Menu Items:</h4>
                                <div className="space-y-3">
                                  {Object.entries(configuredMenus[product._id]).map(([courseType, dishes]) => {
                                    // Define colors based on course type
                                    const colorClasses = {
                                      'Hors d\'oeuvre': "bg-pink-100 text-pink-800 border-pink-200",
                                      'Main Course': "bg-green-100 text-green-800 border-green-200",
                                      'Dessert': "bg-purple-100 text-purple-800 border-purple-200",
                                      'Starter': "bg-orange-100 text-orange-800 border-orange-200",
                                      'Soup': "bg-yellow-100 text-yellow-800 border-yellow-200",
                                      'Salad': "bg-emerald-100 text-emerald-800 border-emerald-200",
                                      'Beverage': "bg-cyan-100 text-cyan-800 border-cyan-200"
                                    }[courseType] || "bg-blue-100 text-blue-800 border-blue-200";

                                    return dishes && dishes.length > 0 ? (
                                      <div key={courseType} className="space-y-2">
                                        <span className="font-medium text-gray-700">
                                          {courseType}:
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                          {dishes.map((dish, index) => (
                                            <span
                                              key={index}
                                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                                                border ${colorClasses} transition-colors`}
                                            >
                                              {dish}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add to Cart Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleAddPackageToCart}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiShoppingCart className="w-5 h-5" />
            Add All Items to Cart
          </button>
        </div>

        {/* Catering Configuration Modal */}
        {isConfigModalOpen && currentProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Configure Menu</h2>
                  <p className="text-gray-600">Configure your catering preferences</p>
                </div>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Catering Content */}
              <div className="mt-6">
                {/* Course Type Header */}
                <div className="text-center mb-8">
                  <span className="bg-blue-100 text-blue-800 text-xl font-semibold px-6 py-2 rounded-full">
                    {currentProduct?.catering?.courseType} Course Meal
                  </span>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentProduct?.catering?.courses?.map((course, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                      {/* Course Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {course.courseName}
                        </h3>
                      </div>

                      {/* Dropdown with Radio Buttons and Scrollbar */}
                      <details className="group">
                        <summary className="flex justify-between items-center p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                          <span className="font-medium text-gray-700">Select {course.courseName}</span>
                          <svg 
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>

                        <div className="mt-2 max-h-48 overflow-y-auto">
                          {course.dishes.map((dish, dishIndex) => (
                            <label key={dishIndex} className="flex items-center p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={selectedDishes[course.courseName]?.includes(dish)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setSelectedDishes(prev => ({
                                    ...prev,
                                    [course.courseName]: isChecked
                                      ? [...(prev[course.courseName] || []), dish]
                                      : (prev[course.courseName] || []).filter(d => d !== dish)
                                  }));
                                }}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700">{dish}</span>
                            </label>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfigurationSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedEvents;