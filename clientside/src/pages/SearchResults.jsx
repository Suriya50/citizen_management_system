import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaHome, FaUser, FaSearch, FaPhone, FaIdCard, FaUserCircle } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      console.log('🔍 Searching for:', query);
      
      // Search families by head name or family ID
      const familiesRes = await api.get('/families', {
        params: { search: query, limit: 50 }
      });
      
      // Search members by name, mobile, citizenId
      const membersRes = await api.get('/members/search', {
        params: { q: query }
      }).catch(() => ({ data: [] }));
      
      console.log('📊 Families found:', familiesRes.data.families?.length || 0);
      console.log('📊 Members found:', membersRes.data?.length || 0);
      console.log('Members details:', membersRes.data);
      
      setFamilies(familiesRes.data.families || []);
      setMembers(membersRes.data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFamilyClick = (familyId) => {
    navigate(`/families/${familyId}`);
  };

  const handleMemberClick = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const highlightText = (text) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-300 rounded px-0.5 text-black">{part}</mark> : part
    );
  };

  const familiesCount = families.length;
  const membersCount = members.length;
  const totalCount = familiesCount + membersCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="ml-2 text-gray-500">Searching...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="lg:ml-64 pt-14">
        <main className="p-4 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Search Results</h1>
              <p className="text-sm text-gray-500">
                Found {totalCount} result(s) for "<span className="font-semibold text-green-700">{query}</span>"
              </p>
            </div>
          </div>

          {/* Search Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <FaSearch className="text-blue-500" />
              <span>Showing results for: <strong>"{query}"</strong></span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              🏠 {familiesCount} families found | 👤 {membersCount} members found
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-4 border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'all'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('families')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'families'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Families ({familiesCount})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'members'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Members ({membersCount})
            </button>
          </div>

          {/* No Results */}
          {totalCount === 0 && (
            <div className="bg-white rounded-lg shadow p-10 text-center">
              <div className="text-6xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-2">Try searching by name, mobile number, or family ID</p>
            </div>
          )}

          {/* Results */}
          {totalCount > 0 && (
            <div className="space-y-4">
              {/* Family Results */}
              {activeTab !== 'members' && families.map((family) => (
                <div
                  key={family._id}
                  onClick={() => handleFamilyClick(family._id)}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition border-l-4 border-green-500"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaHome className="text-green-600" />
                        <p className="text-lg font-bold text-gray-800">
                          {highlightText(family.headOfFamily)}
                        </p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Family</span>
                      </div>
                      <p className="text-sm text-gray-500">ID: {highlightText(family.familyId)}</p>
                      <p className="text-sm text-gray-600 mt-1">📍 {family.address?.street || 'N/A'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      family.economicStatus === 'BPL' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {family.economicStatus}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-gray-500">👥 {family.totalMembers || 0} members</p>
                    <button className="text-green-600 text-sm flex items-center gap-1 hover:underline">
                      View Family Details →
                    </button>
                  </div>
                </div>
              ))}

              {/* Member Results - INDIVIDUAL MEMBERS */}
              {activeTab !== 'families' && members.map((member) => {
                // Get family info for display
                const familyInfo = member.familyId || {};
                const familyName = familyInfo.headOfFamily || 'Unknown Family';
                const familyIdDisplay = familyInfo.familyId || 'N/A';
                
                return (
                  <div
                    key={member._id}
                    onClick={() => handleMemberClick(member._id)}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition border-l-4 border-purple-500"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <FaUserCircle className="text-purple-600 text-2xl" />
                        </div>
                      </div>

                      {/* Member Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-lg font-bold text-gray-800">
                            {highlightText(member.name)}
                          </p>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Member</span>
                          {member.name?.toLowerCase().includes(query.toLowerCase()) && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FaSearch size={8} /> Direct Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {member.age} years | {member.gender} | {member.relationToHead}
                        </p>

                        {/* Mobile Number */}
                        {member.mobileNumber && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                            <FaPhone size={12} className="text-gray-400" />
                            <span>{member.mobileNumber}</span>
                          </div>
                        )}

                        {/* Family Info */}
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <FaHome size={10} className="text-gray-400" />
                          <span>Family: {highlightText(familyName)}</span>
                          <span className="text-gray-300">|</span>
                          <span>ID: {highlightText(familyIdDisplay)}</span>
                        </div>
                      </div>
                      
                      {/* Arrow Indicator */}
                      <div className="text-gray-400 self-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Tip for better search */}
          {totalCount > 0 && (
            <div className="mt-6 p-3 bg-gray-100 rounded-md text-center text-sm text-gray-600">
              💡 <strong>Tip:</strong> Click on any member card to view complete details including Aadhar, Voter ID, and more!
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;