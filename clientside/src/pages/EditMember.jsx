import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [member, setMember] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const relations = ['Self', 'Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Other'];
  const occupations = ['Farmer', 'Teacher', 'Daily Wage', 'Business', 'Government Employee', 'Private Employee', 'Student', 'Housewife', 'Retired', 'Unemployed', 'Other'];
  const educations = ['Illiterate', 'Primary (1-5)', 'Middle (6-8)', 'High School (9-10)', 'Higher Secondary (11-12)', 'Graduate', 'Post Graduate', 'Diploma', 'Other'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${id}`);
      const data = response.data;
      setMember(data);
      setFamilyId(data.familyId);
    } catch (error) {
      toast.error('Failed to load member');
      navigate('/families');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/members/${id}`, member);
      toast.success('Member updated successfully');
      navigate(`/families/${familyId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const menuItems = [
    { path: '/', name: 'Dashboard' },
    { path: '/families', name: 'Families' },
  ];

  if (loading || !member) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-green-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div><h1 className="font-bold text-sm text-white">Village Citizen</h1><p className="text-[9px] text-green-300">Management System</p></div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white text-xl">&times;</button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="block w-full text-left px-4 py-3 mx-2 rounded-lg text-green-100 hover:bg-green-700 text-sm">
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-green-700 text-[9px] text-green-300 text-center">Govt of Tamil Nadu</div>
      </div>

      <div className="lg:ml-64">
        <nav className="bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-10">
          <div className="px-3 py-2 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-800">Edit Member</h1>
          </div>
        </nav>

        <main className="p-4 mt-12 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="text-gray-600">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Edit Member</h1>
              <p className="text-sm text-gray-500">Update member information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={member.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={member.age || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={member.gender || 'Male'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation to Head</label>
                <select
                  name="relationToHead"
                  value={member.relationToHead || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Relation</option>
                  {relations.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={member.mobileNumber || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  maxLength="10"
                />
              </div>
            </div>

            {/* Government IDs Section */}
            <div className="bg-amber-50 p-4 rounded-md mt-6 mb-6 border border-amber-200">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Government IDs (Optional)</h3>
              <p className="text-xs text-amber-700 mb-3">⚠️ Leave empty to avoid duplicate errors</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={member.aadharNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    maxLength="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
                  <input
                    type="text"
                    name="voterId"
                    value={member.voterId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={member.panNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ration Card Number</label>
                  <input
                    type="text"
                    name="rationCardNumber"
                    value={member.rationCardNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <select
                  name="occupation"
                  value={member.occupation || 'Other'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {occupations.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <select
                  name="education"
                  value={member.education || 'Other'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {educations.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={member.bloodGroup || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select</option>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                  <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={member.maritalStatus || 'Single'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {maritalStatuses.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Disabilities</label>
                <input
                  type="text"
                  name="disabilities"
                  value={member.disabilities || 'None'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                <FaSave className="inline mr-2" size={14} /> {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default EditMember;