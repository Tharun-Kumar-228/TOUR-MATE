import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageCircle } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

// LLM API endpoint (proxied through backend to avoid CORS issues)
const LLM_API_URL = `${import.meta.env.VITE_API_URL}/llm/detect-intent`;

export default function TravelChatbot({ planId, location }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! 👋 I\'m your travel assistant. Ask me about nearby highly-rated spots, restaurants, or attractions based on your preferences!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // LLM-based intent detection (proxied through backend)
  const detectIntentWithLLM = async (userMessage) => {
    try {
      console.log('🤖 Sending query to LLM API (via backend)...');

      const response = await fetch(LLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ LLM API error (${response.status}):`, errorData.message || 'Unknown error');
        console.log('📌 Falling back to keyword-based detection.');
        return null;
      }

      const data = await response.json();
      const intent = data.intent?.trim().toLowerCase();
      
      if (intent) {
        console.log(`✅ LLM detected intent: "${intent}"`);
      }
      
      return intent || null;
    } catch (error) {
      console.warn('⚠️ LLM detection failed:', error.message);
      console.log('📌 Using keyword-based detection as fallback.');
      return null;
    }
  };

  const generateBotResponse = async (userMessage) => {
    try {
      setLoading(true);

      // Get nearby places based on user request
      const response = await api.get('/places', {
        params: {
          limit: 50,
          latitude: location?.lat,
          longitude: location?.lon,
        },
      });

      const places = response.data.data.places || [];

      if (places.length === 0) {
        return "I couldn't find any places nearby. Try searching in a different area.";
      }

      const query = userMessage.toLowerCase();
      let filteredPlaces = places;
      let decisionType = 'default';
      let responseTitle = '🌟 **Recommended Places:**';

      // Try LLM-based intent detection first
      const llmIntent = await detectIntentWithLLM(userMessage);
      
      // Check if this is a complex/combined query (e.g., "hotels to eat", "wifi restaurant")
      // If so, skip pre-filtering and let LLM handle it
      const isComplexQuery = (query.includes(' to ') || query.includes(' with ') || query.includes(' and ') || 
                              (query.includes('hotel') && query.includes('eat')) ||
                              (query.includes('hotel') && query.includes('food')) ||
                              (query.includes('restaurant') && query.includes('wifi')) ||
                              (query.includes('restaurant') && query.includes('parking')));
      
      // Decision Making Logic - LLM-based with keyword fallback
      if (isComplexQuery) {
        // For complex queries, use LLM to filter from ALL places
        console.log('🔍 Complex query detected, using LLM for intelligent filtering');
        decisionType = 'llm_filter';
        responseTitle = '🎯 **Personalized Recommendations:**';
        filteredPlaces = places; // Send ALL places to LLM
      }
      else if (llmIntent === 'hotspot' || (!llmIntent && (query.includes('hotspot') || query.includes('hot spot') || query.includes('tourist spot') || query.includes('popular')))) {
        // HOTSPOT: Highly rated tourist attractions
        decisionType = 'hotspot';
        responseTitle = '🔥 **Hotspot - Highly Rated Tourist Attractions:**';
        filteredPlaces = places
          .filter(p => p.averageRating && p.averageRating >= 4.0)
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);
      } 
      else if (llmIntent === 'fun' || (!llmIntent && (query.includes('fun place') || query.includes('fun') || query.includes('game') || query.includes('entertainment') || query.includes('adventure')))) {
        // FUN PLACE: Places with entertainment/game features
        decisionType = 'fun';
        responseTitle = '🎮 **Fun Places - Entertainment & Adventure:**';
        filteredPlaces = places
          .filter(p => {
            const features = (p.features || []).map(f => f.toLowerCase());
            return features.some(f => 
              f.includes('game') || 
              f.includes('entertainment') || 
              f.includes('adventure') || 
              f.includes('sports') ||
              f.includes('activity') ||
              f.includes('amusement')
            );
          })
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);
        
        // If no places with entertainment features found, fallback to highly-rated places
        if (filteredPlaces.length === 0) {
          console.log('⚠️ No entertainment places found, using highly-rated places as fallback');
          filteredPlaces = places
            .filter(p => p.averageRating && p.averageRating >= 4.0)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 5);
          decisionType = 'fun_fallback';
        }
      }
      else if (llmIntent === 'reviews' || (!llmIntent && (query.includes('most review') || query.includes('most popular') || query.includes('trending') || query.includes('talked about')))) {
        // MOST REVIEWS: Places with highest review count
        decisionType = 'reviews';
        responseTitle = '📢 **Most Reviewed Places - Community Favorites:**';
        filteredPlaces = places
          .filter(p => p.ratingsQuantity && p.ratingsQuantity > 0)
          .sort((a, b) => (b.ratingsQuantity || 0) - (a.ratingsQuantity || 0))
          .slice(0, 5);
      }
      else if (llmIntent === 'budget' || (!llmIntent && (query.includes('budget') || query.includes('cheap') || query.includes('affordable') || query.includes('$')))) {
        // BUDGET: Affordable places
        decisionType = 'budget';
        responseTitle = '💰 **Budget-Friendly Places:**';
        filteredPlaces = places
          .filter(p => p.priceRange === '$' || p.priceRange === '$$')
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);
      }
      else if (llmIntent === 'luxury' || (!llmIntent && (query.includes('luxury') || query.includes('premium') || query.includes('high-end') || query.includes('$$$$')))) {
        // LUXURY: Premium places
        decisionType = 'luxury';
        responseTitle = '👑 **Premium & Luxury Places:**';
        filteredPlaces = places
          .filter(p => p.priceRange === '$$$' || p.priceRange === '$$$$')
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);
      }
      else {
        // DEFAULT: Category-based filtering
        decisionType = 'category';
        
        if (query.includes('restaurant') || query.includes('food') || query.includes('eat')) {
          responseTitle = '🍽️ **Restaurants & Food Places:**';
          filteredPlaces = places.filter(p => p.category?.toLowerCase().includes('restaurant'));
        } else if (query.includes('monument') || query.includes('historic') || query.includes('temple')) {
          responseTitle = '🏛️ **Monuments & Historic Sites:**';
          filteredPlaces = places.filter(p => 
            p.category?.toLowerCase().includes('monument') || 
            p.category?.toLowerCase().includes('historic') ||
            p.category?.toLowerCase().includes('temple')
          );
        } else if (query.includes('park') || query.includes('garden') || query.includes('nature')) {
          responseTitle = '🌳 **Parks & Gardens:**';
          filteredPlaces = places.filter(p => 
            p.category?.toLowerCase().includes('park') || 
            p.category?.toLowerCase().includes('garden') ||
            p.category?.toLowerCase().includes('nature')
          );
        } else if (query.includes('hotel') || query.includes('stay') || query.includes('accommodation')) {
          responseTitle = '🏨 **Hotels & Accommodations:**';
          filteredPlaces = places.filter(p => p.category?.toLowerCase().includes('hotel'));
        } else if (query.includes('museum') || query.includes('art') || query.includes('culture')) {
          responseTitle = '🎨 **Museums & Cultural Sites:**';
          filteredPlaces = places.filter(p => 
            p.category?.toLowerCase().includes('museum') || 
            p.category?.toLowerCase().includes('art')
          );
        }

        // If category filtering found places, use them; otherwise use all places
        if (filteredPlaces.length === 0) {
          responseTitle = '🌟 **Recommended Places:**';
          filteredPlaces = places;
        }

        filteredPlaces = filteredPlaces
          .filter(p => p.averageRating && p.averageRating > 3.0)
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);
      }

      if (filteredPlaces.length === 0) {
        return "I couldn't find places matching your criteria. Try asking about 'hotspots', 'fun places', 'most reviews', 'budget', or specific categories.";
      }

      // Try to get LLM filtering and analysis of ALL places
      let llmAnalysis = '';
      let llmFilteredPlaces = filteredPlaces;
      try {
        console.log('📤 Sending ALL places to LLM for intelligent filtering:', {
          message: userMessage,
          totalPlaces: places.length,
          places: places.map(p => ({
            name: p.name,
            category: p.category,
            rating: p.averageRating,
            reviews: p.ratingsQuantity,
            price: p.priceRange,
            features: p.features?.slice(0, 5),
          })),
        });

        const analysisResponse = await fetch(`${import.meta.env.VITE_API_URL}/llm/analyze-places`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            places: places, // Send ALL places for LLM to decide
          }),
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          llmAnalysis = analysisData.analysis;
          llmFilteredPlaces = analysisData.filteredPlaces || filteredPlaces;
          
          console.log(`✅ LLM filtering complete: ${analysisData.matchedCount}/${analysisData.totalCount} places matched`);
          console.log('📝 LLM Reasoning:', llmAnalysis);
          console.log('📊 LLM Method:', analysisData.method);
          
          // Use LLM filtered places if available
          if (analysisData.filteredPlaces && analysisData.filteredPlaces.length > 0) {
            filteredPlaces = analysisData.filteredPlaces.slice(0, 5);
            console.log(`🎯 Using LLM-filtered places: ${filteredPlaces.length} places`);
          }
        } else {
          const errorData = await analysisResponse.json();
          console.warn('⚠️ LLM filtering failed:', errorData.message);
        }
      } catch (analysisError) {
        console.warn('⚠️ Could not get LLM filtering:', analysisError.message);
      }

      // Generate insightful response based on decision type
      let response_text = responseTitle + '\n\n';
      
      // Add LLM analysis if available
      if (llmAnalysis) {
        response_text += `💭 **AI Analysis:** ${llmAnalysis}\n\n`;
      }

      if (decisionType === 'hotspot') {
        const avgRating = (filteredPlaces.reduce((sum, p) => sum + (p.averageRating || 0), 0) / filteredPlaces.length).toFixed(1);
        response_text += `🎯 **Analysis:** Top-rated tourist attractions with average rating of ${avgRating}/5. These are the most popular spots!\n\n`;
      } 
      else if (decisionType === 'fun') {
        response_text += `🎉 **Analysis:** Places with entertainment, games, and adventure activities. Perfect for fun and excitement!\n\n`;
      }
      else if (decisionType === 'fun_fallback') {
        response_text += `🎮 **Analysis:** While we found limited entertainment-specific places, here are some highly-rated places that offer great experiences for fun activities!\n\n`;
      }
      else if (decisionType === 'reviews') {
        const totalReviews = filteredPlaces.reduce((sum, p) => sum + (p.ratingsQuantity || 0), 0);
        response_text += `💬 **Analysis:** Most talked-about places with ${totalReviews} total reviews. Community favorites!\n\n`;
      }
      else if (decisionType === 'budget') {
        response_text += `💵 **Analysis:** Affordable places that won't break the bank. Great value for money!\n\n`;
      }
      else if (decisionType === 'luxury') {
        response_text += `✨ **Analysis:** Premium and luxury experiences. Top-tier comfort and service!\n\n`;
      }
      else if (decisionType === 'category') {
        const avgRating = (filteredPlaces.reduce((sum, p) => sum + (p.averageRating || 0), 0) / filteredPlaces.length).toFixed(1);
        response_text += `📊 **Analysis:** Curated selection with average rating of ${avgRating}/5. These are the best options in this category!\n\n`;
      }
      else if (decisionType === 'llm_filter') {
        // LLM analysis will be added from the API response
        // This is a placeholder that will be replaced
      }

      filteredPlaces.forEach((place, index) => {
        response_text += `${index + 1}. **${place.name}**\n`;
        response_text += `   📍 Category: ${place.category}\n`;
        response_text += `   ⭐ Rating: ${place.averageRating?.toFixed(1)}/5`;
        
        if (place.ratingsQuantity) {
          response_text += ` (${place.ratingsQuantity} reviews)`;
        }
        response_text += '\n';
        
        if (place.address) {
          response_text += `   📌 ${place.address}\n`;
        }

        if (place.priceRange) {
          response_text += `   💰 Price: ${place.priceRange}\n`;
        }

        if (place.features && place.features.length > 0) {
          response_text += `   ✨ Features: ${place.features.slice(0, 3).join(', ')}\n`;
        }

        // Add contextual insights
        if (place.averageRating >= 4.5) {
          response_text += `   🏆 Highly recommended - Excellent reviews!\n`;
        } else if (place.averageRating >= 4.0) {
          response_text += `   👍 Great choice - Well-reviewed\n`;
        }

        response_text += '\n';
      });

      // Add smart suggestions based on intent
      response_text += '\n---\n\n';
      response_text += '💡 **Smart Suggestions:**\n\n';
      
      if (decisionType === 'hotspot') {
        response_text += '🎯 These are the most popular tourist attractions in your area. Perfect for must-see experiences!\n';
        response_text += '💬 Try asking: "fun place" or "budget places" for more options.\n';
      } else if (decisionType === 'fun' || decisionType === 'fun_fallback') {
        response_text += '🎮 Great for entertainment and adventure! Perfect for families and groups.\n';
        response_text += '💬 Try asking: "hotspot" or "most reviews" for other recommendations.\n';
      } else if (decisionType === 'reviews') {
        response_text += '📢 These places are loved by the community! Check out what others say.\n';
        response_text += '💬 Try asking: "hotspot" or "fun place" for different types of places.\n';
      } else if (decisionType === 'budget') {
        response_text += '💰 Great value for money! Enjoy quality experiences without breaking the bank.\n';
        response_text += '💬 Try asking: "luxury" or "hotspot" for premium options.\n';
      } else if (decisionType === 'luxury') {
        response_text += '👑 Premium experiences with top-tier comfort and service!\n';
        response_text += '💬 Try asking: "budget" or "fun place" for other options.\n';
      } else if (decisionType === 'category') {
        response_text += '🎯 These are the best options in this category!\n';
        response_text += '💬 Try asking: "hotspot", "fun place", "most reviews", "budget", or "luxury" for different perspectives.\n';
      } else {
        response_text += '🌟 Here are some great places based on your search!\n';
        response_text += '💬 Try asking: "hotspot", "fun place", "most reviews", "budget", or "luxury".\n';
      }

      return response_text;
    } catch (error) {
      console.error('Error fetching places:', error);
      return 'Sorry, I had trouble analyzing nearby spots. Please try again later.';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Generate bot response
    const botResponse = await generateBotResponse(input);

    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: botResponse,
    };

    setMessages(prev => [...prev, botMessage]);
    setLoading(false);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition z-40"
          title="Open travel assistant"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 max-h-96">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Travel Assistant 🤖</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-600 p-1 rounded transition"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nearby spots..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
