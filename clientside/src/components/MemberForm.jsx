import { FaUser, FaCalendar, FaVenusMars, FaIdCard, FaMobile, FaBriefcase, FaGraduationCap, FaTint, FaCamera } from 'react-icons/fa';
import { useState } from 'react';

const MemberForm = ({ member, setMember, familyHeadName }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const relations = ['Self', 'Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMember({ ...member, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label><div className="relative"><FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="text" name="name" value={member.name} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="Full name" required /></div></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Age *</label><div className="relative"><FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="number" name="age" value={member.age} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="Age" min="0" max="120" required /></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Gender</label><div className="relative"><FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><select name="gender" value={member.gender} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md"><option>Male</option><option>Female</option><option>Other</option></select></div></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Relation to Head</label><select name="relationToHead" value={member.relationToHead} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border rounded-md"><option value="">Select</option>{relations.map(r => <option key={r}>{r}</option>)}</select></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Aadhar Number</label><div className="relative"><FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="text" name="aadharNumber" value={member.aadharNumber} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="12 digits" maxLength="12" /></div></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number</label><div className="relative"><FaMobile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="tel" name="mobileNumber" value={member.mobileNumber} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="10 digits" maxLength="10" /></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Occupation</label><div className="relative"><FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="text" name="occupation" value={member.occupation} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="Farmer, Teacher" /></div></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Education</label><div className="relative"><FaGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="text" name="education" value={member.education} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="5th Standard" /></div></div>
      </div>

      <div><label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label><div className="relative"><FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><select name="bloodGroup" value={member.bloodGroup} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md"><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div></div>

      <div><label className="block text-xs font-medium text-gray-700 mb-1">Photo</label><div className="flex items-center gap-3"><label className="cursor-pointer bg-gray-100 px-3 py-1.5 rounded-md text-xs flex items-center gap-1"><FaCamera /> Upload<input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" /></label>{previewImage && <img src={previewImage} alt="Preview" className="w-8 h-8 rounded-full object-cover" />}</div></div>
    </div>
  );
};

export default MemberForm;