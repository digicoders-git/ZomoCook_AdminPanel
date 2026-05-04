import { useState, useEffect } from 'react';
import { 
  Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, 
  Button, Tabs, TabList, Tab, TabPanels, TabPanel, Icon, Text, VStack, 
  Spinner, Flex, IconButton, Divider, Grid, GridItem, Image
} from '@chakra-ui/react';
import { Send, UserPlus, Upload, Save, Plus, Trash2, X, Briefcase, GraduationCap, Building2, UserCircle, Award, CheckCircle, FileUp, Share2, ImageIcon, RotateCcw } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const EditCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', altPhone: '', dob: '', gender: '', maritalStatus: '', state: '', city: '', address: '',
    languages: [], kycStatus: 'pending', profileStatus: 'active',
    jobCategory: [], jobType: [], experienceValue: '', experienceUnit: 'years', currentSalary: '', expectedSalary: '', preferredCities: [], jobPositions: [],
    cookingPreference: '', cookingSkills: [],
    lastCompany: { name: '', workplaceType: '', role: '', duration: '', experienceType: '', reasonForLeaving: '' },
    experiences: [], education: [],
    careerHighlights: { aboutMe: '', highlights: [], whyChooseMe: [] },
    idProofType: 'Aadhar',
    socialMedia: [],
    photoGallery: [],
    applications: []
  });

  // Master Data
  const [masters, setMasters] = useState({
    states: [],
    cities: [],
    jobCategories: [],
    jobTypes: [],
    jobPositions: [],
    skillCategories: [],
    skills: [],
    cookingPreferences: [],
    experienceRanges: [],
    salaryRanges: []
  });

  // Temporary states for dynamic lists
  const [tempSkill, setTempSkill] = useState({ category: '', skills: '' });
  const [tempExp, setTempExp] = useState({ position: '', from: '', to: '', jobProfile: '', shortDetail: '' });
  const [tempEdu, setTempEdu] = useState({ title: '', from: '', to: '', shortDetail: '' });
  const [tempHighlight, setTempHighlight] = useState('');
  const [tempReason, setTempReason] = useState('');
  const [tempSocial, setTempSocial] = useState({ platform: '', url: '' });

  // File states
  const [files, setFiles] = useState({
    image: null, cv: null, idProof: null, addressProof: null, policeVerification: null, academicCertificate: null, experienceCertificate: null, gallery: []
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('adminToken');

  const fetchMasterData = async (category, key) => {
    try {
      const response = await axios.get(`${apiUrl}/masters/${category}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setMasters(prev => ({ ...prev, [key]: response.data.masters }));
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`${apiUrl}/candidates/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        
        // Fetch Masters
        await Promise.all([
          fetchMasterData('states', 'states'),
          fetchMasterData('job-positions', 'jobPositions'),
          fetchMasterData('job-types', 'jobTypes'),
          fetchMasterData('skill-categories', 'skillCategories'),
          fetchMasterData('cooking-preferences', 'cookingPreferences'),
          fetchMasterData('salary-ranges', 'salaryRanges'),
          fetchMasterData('experience-ranges', 'experienceRanges')
        ]);

        if (response.data.success) {
          const c = response.data.candidate;
          setFormData({
            ...c,
            dob: c.dob ? new Date(c.dob).toISOString().split('T')[0] : '',
            languages: c.languages?.join(', ') || '',
            jobCategory: c.jobPreference?.jobCategory || [],
            jobType: c.jobPreference?.jobType || [],
            experienceValue: c.jobPreference?.experience?.value || '',
            experienceUnit: c.jobPreference?.experience?.unit || 'years',
            currentSalary: c.jobPreference?.currentSalary || '',
            expectedSalary: c.jobPreference?.expectedSalary || '',
            preferredCities: c.jobPreference?.preferredCities || [],
            jobPositions: c.jobPreference?.jobPositions || [],
            cookingPreference: c.cookingSkills?.preference || '',
            cookingSkills: c.cookingSkills?.skills || [],
            lastCompany: c.workExperience?.lastCompany || { name: '', workplaceType: '', role: '', duration: '', experienceType: '', reasonForLeaving: '' },
            experiences: c.workExperience?.experiences || [],
            education: c.education || [],
            careerHighlights: c.careerHighlights || { aboutMe: '', highlights: [], whyChooseMe: [] },
            idProofType: c.documents?.idProofType || 'Aadhar',
            socialMedia: c.socialMedia || [],
            photoGallery: c.photoGallery || [],
            applications: c.applications || []
          });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load candidate details.', status: 'error' });
      } finally { setIsFetching(false); }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (formData.state && masters.states.length > 0) {
      const fetchCities = async () => {
        try {
          const stateObj = masters.states.find(s => s.name === formData.state);
          if (stateObj) {
            const response = await axios.get(`${apiUrl}/masters/cities`, {
              params: { parentId: stateObj._id },
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) setMasters(prev => ({ ...prev, cities: response.data.masters }));
          }
        } catch (error) { console.error(error); }
      };
      fetchCities();
    }
  }, [formData.state, masters.states]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLastCompanyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, lastCompany: { ...prev.lastCompany, [name]: value } }));
  };

  const handleHighlightChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, careerHighlights: { ...prev.careerHighlights, [name]: value } }));
  };

  const handleFileChange = (name, e) => {
    if (name === 'gallery') {
      setFiles(prev => ({ ...prev, gallery: Array.from(e.target.files) }));
    } else if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [name]: e.target.files[0] }));
    }
  };

  // Add/Remove Helpers
  const addToList = (listKey, item, setter) => {
    if (!item) return;
    setFormData(prev => ({ ...prev, [listKey]: [...prev[listKey], item] }));
    setter('');
  };

  const addToCareerList = (field, item, setter) => {
    if (!item) return;
    setFormData(prev => ({
      ...prev,
      careerHighlights: { ...prev.careerHighlights, [field]: [...prev.careerHighlights[field], item] }
    }));
    setter('');
  };

  const removeFromList = (listKey, index) => {
    setFormData(prev => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }));
  };

  const removeFromCareerList = (field, index) => {
    setFormData(prev => ({
      ...prev,
      careerHighlights: { ...prev.careerHighlights, [field]: prev.careerHighlights[field].filter((_, i) => i !== index) }
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: Array.isArray(value) ? value : [value]
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();

      // Basic Fields
      const skipFields = [
        'languages', 'jobPreference', 'cookingSkills', 'workExperience', 
        'education', 'careerHighlights', 'socialMedia', 'photoGallery', 
        'applications', '_id', '__v', 'createdAt', 'updatedAt',
        'jobCategory', 'jobType', 'experienceValue', 'experienceUnit', 'currentSalary', 'expectedSalary', 'preferredCities', 'jobPositions', 'cookingPreference'
      ];
      Object.keys(formData).forEach(key => {
        if (!skipFields.includes(key)) {
          if (formData[key] !== undefined && formData[key] !== null) data.set(key, formData[key]);
        }
      });

      // Complex Fields
      data.set('languages', JSON.stringify(typeof formData.languages === 'string' ? formData.languages.split(',').map(s => s.trim()) : formData.languages));
      data.set('jobPreference', JSON.stringify({
        jobCategory: formData.jobCategory,
        jobType: formData.jobType,
        experience: { value: formData.experienceValue || 0, unit: formData.experienceUnit },
        currentSalary: formData.currentSalary, expectedSalary: formData.expectedSalary,
        preferredCities: formData.preferredCities,
        jobPositions: formData.jobPositions
      }));
      data.set('cookingSkills', JSON.stringify({ preference: formData.cookingPreference, skills: formData.cookingSkills }));
      data.set('workExperience', JSON.stringify({ lastCompany: formData.lastCompany, experiences: formData.experiences }));
      data.set('education', JSON.stringify(formData.education));
      data.set('careerHighlights', JSON.stringify(formData.careerHighlights));
      data.set('socialMedia', JSON.stringify(formData.socialMedia));
      data.set('photoGallery', JSON.stringify(formData.photoGallery));

      // Append Files
      Object.keys(files).forEach(key => {
        if (key === 'gallery') {
          files.gallery.forEach(f => data.append('gallery', f));
        } else if (files[key]) {
          data.set(key, files[key]);
        }
      });

      const response = await axios.put(`${apiUrl}/candidates/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast({ title: 'Updated', description: 'Candidate profile updated successfully.', status: 'success', duration: 3000, position: 'top-right' });
        navigate('/candidates/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Update failed', status: 'error' });
    } finally { setIsLoading(false); }
  };

  const tabs = ['Basic Profile', 'Job Preference', 'Cooking Skills', 'Work Experience', 'Career Highlights', 'Documents Upload', 'Social Media', 'Photo Gallery'];
  
  if (isFetching) return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} /></Flex>;

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <Box pb="10">
      <PageHeader title="Edit Candidate Profile" actions={[<Button key="back" as={Link} to="/candidates/list" size="sm" bg={BRAND} color="white" borderRadius="lg" fontSize="xs" px="4">Back to List</Button>]} />

      <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
        <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" p="5">
          <TabList display="flex" flexWrap="wrap" gap="2" mb="6" pb="4" borderBottom="1px solid #f1f5f9">
            {tabs.map((tab, index) => (
              <Tab key={tab} fontSize="xs" fontWeight="600" px="4" py="2" borderRadius="lg" color={activeTab === index ? 'white' : '#475569'} bg={activeTab === index ? BRAND : 'transparent'} _hover={{ bg: activeTab === index ? '#003d91' : '#f0f5ff' }}>{tab}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* 0. Basic Profile */}
            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="5">
                <FormControl isRequired><FormLabel {...labelStyle}>Name</FormLabel><Input name="name" value={formData.name} onChange={handleChange} {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Email ID</FormLabel><Input name="email" value={formData.email} onChange={handleChange} {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Phone Number</FormLabel><Input name="phone" value={formData.phone} onChange={handleChange} {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Alternate Phone No</FormLabel><Input name="altPhone" value={formData.altPhone} onChange={handleChange} {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Date of Birth</FormLabel><Input name="dob" value={formData.dob} onChange={handleChange} type="date" {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Gender</FormLabel><Select name="gender" value={formData.gender} onChange={handleChange} {...selectStyle} placeholder="Select Gender"><option value="male">Male</option><option value="female">Female</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Marital Status</FormLabel><Select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} {...selectStyle}><option value="single">Single</option><option value="married">Married</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>State</FormLabel><Select name="state" value={formData.state} onChange={handleChange} {...selectStyle} placeholder="Select State">
                  {masters.states.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>City</FormLabel><Select name="city" value={formData.city} onChange={handleChange} {...selectStyle} placeholder="Select City" isDisabled={!formData.state}>
                  {masters.cities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
              </SimpleGrid>
              <FormControl mb="5" isRequired><FormLabel {...labelStyle}>Full Address</FormLabel><Textarea name="address" value={formData.address} onChange={handleChange} {...inputStyle} minH="90px" /></FormControl>
              <FormControl mb="5" isRequired><FormLabel {...labelStyle}>Languages (Comma separated)</FormLabel><Input name="languages" value={formData.languages} onChange={handleChange} {...inputStyle} /></FormControl>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="6">
                <FormControl><FormLabel {...labelStyle}>Profile Image</FormLabel><Input type="file" onChange={(e) => handleFileChange('image', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>KYC Status</FormLabel><Select name="kycStatus" value={formData.kycStatus} onChange={handleChange} {...selectStyle}><option value="pending">Pending</option><option value="approved">Approved</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Profile Status</FormLabel><Select name="profileStatus" value={formData.profileStatus} onChange={handleChange} {...selectStyle}><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </SimpleGrid>
              <HStack justify="flex-end"><Button onClick={() => setActiveTab(1)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 1. Job Preference */}
            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="6" spacingY="5" mb="5">
                <FormControl><FormLabel {...labelStyle}>Job Category</FormLabel><Select placeholder="Select Category" value={formData.jobCategory[0]} onChange={(e) => handleMultiSelect('jobCategory', e.target.value)} {...selectStyle}>
                  <option value="hotel">Hotel Job</option><option value="home">Home Cook Job</option><option value="daily">Daily Pay Job</option>
                </Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>Job Type</FormLabel><Select placeholder="Select Type" value={formData.jobType[0]} onChange={(e) => handleMultiSelect('jobType', e.target.value)} {...selectStyle}>
                  {masters.jobTypes.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
                <HStack spacing="2" align="flex-end">
                   <FormControl><FormLabel {...labelStyle}>Experience</FormLabel><Select name="experienceValue" value={formData.experienceValue} onChange={handleChange} {...selectStyle} placeholder="Select Experience">
                     {masters.experienceRanges.map(m => <option key={m._id} value={`${m.experienceFrom}-${m.experienceTo}`}>{m.experienceFrom}-{m.experienceTo} Years</option>)}
                   </Select></FormControl>
                </HStack>
                <FormControl><FormLabel {...labelStyle}>Expected Salary</FormLabel><Select name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} {...selectStyle} placeholder="Select Salary">
                  {masters.salaryRanges.map(m => <option key={m._id} value={`${m.salaryFrom}-${m.salaryTo}`}>{m.salaryFrom}-{m.salaryTo}</option>)}
                </Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>Preferred Cities</FormLabel><Select placeholder="Select City" value={formData.preferredCities[0]} onChange={(e) => handleMultiSelect('preferredCities', e.target.value)} {...selectStyle}>
                  {masters.cities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>Job Positions</FormLabel><Select placeholder="Select Position" value={formData.jobPositions[0]} onChange={(e) => handleMultiSelect('jobPositions', e.target.value)} {...selectStyle}>
                  {masters.jobPositions.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
              </SimpleGrid>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(0)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(2)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 2. Cooking Skills */}
            <TabPanel p="0">
              <FormControl mb="5"><FormLabel {...labelStyle}>Cooking Preference</FormLabel><Select name="cookingPreference" value={formData.cookingPreference} onChange={handleChange} {...selectStyle} placeholder="Select Preference">
                {masters.cookingPreferences.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
              </Select></FormControl>
              <Box border="1px solid #e8edf5" borderRadius="xl" p="5" mb="6" bg="#f8faff">
                <Text fontSize="sm" fontWeight="700" mb="4">Add Skills</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mb="4">
                  <FormControl><FormLabel {...labelStyle}>Category</FormLabel><Select value={tempSkill.category} onChange={(e) => setTempSkill({...tempSkill, category: e.target.value})} {...selectStyle} placeholder="Select Category">
                    {masters.skillCategories.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                  </Select></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Skills</FormLabel><Input value={tempSkill.skills} onChange={(e) => setTempSkill({...tempSkill, skills: e.target.value})} {...inputStyle} /></FormControl>
                </SimpleGrid>
                <Button leftIcon={<Plus size={16} />} size="sm" bg="#10b981" color="white" onClick={() => { if(tempSkill.category && tempSkill.skills) { setFormData(prev => ({...prev, cookingSkills: [...prev.cookingSkills, tempSkill]})); setTempSkill({category:'', skills:''}); } }}>Add Skill</Button>
                <VStack align="stretch" mt="4" spacing="2">
                  {formData.cookingSkills.map((s, i) => (
                    <HStack key={i} justify="space-between" bg="white" p="3" borderRadius="lg" border="1px solid #e2e8f0">
                      <VStack align="start" spacing="0"><Text fontSize="xs" fontWeight="700">{s.category}</Text><Text fontSize="xs">{s.skills}</Text></VStack>
                      <IconButton size="xs" colorScheme="red" icon={<Trash2 size={14} />} onClick={() => removeFromList('cookingSkills', i)} />
                    </HStack>
                  ))}
                </VStack>
              </Box>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(1)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(3)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 3. Work Experience */}
            <TabPanel p="0">
              <Box mb="8">
                <Text fontSize="sm" fontWeight="800" mb="4">Last / Previous Company</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5" mb="5">
                  <FormControl><FormLabel {...labelStyle}>Company Name</FormLabel><Input name="name" value={formData.lastCompany.name} onChange={handleLastCompanyChange} {...inputStyle} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Workplace Type</FormLabel><Select name="workplaceType" value={formData.lastCompany.workplaceType} onChange={handleLastCompanyChange} {...selectStyle} placeholder="Select"><option value="Hotel">Hotel</option><option value="Restaurant">Restaurant</option><option value="Home">Home</option></Select></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Role</FormLabel><Input name="role" value={formData.lastCompany.role} onChange={handleLastCompanyChange} {...inputStyle} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Duration</FormLabel><Input name="duration" value={formData.lastCompany.duration} onChange={handleLastCompanyChange} {...inputStyle} /></FormControl>
                </SimpleGrid>
                <FormControl><FormLabel {...labelStyle}>Reason for Leaving</FormLabel><Textarea name="reasonForLeaving" value={formData.lastCompany.reasonForLeaving} onChange={handleLastCompanyChange} {...inputStyle} /></FormControl>
              </Box>
              <Box mb="8">
                <Text fontSize="sm" fontWeight="800" mb="4">Work Experience History</Text>
                <Box border="1px solid #e8edf5" borderRadius="xl" p="5" mb="5" bg="#f8faff">
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="4">
                    <FormControl><Input value={tempExp.position} onChange={(e) => setTempExp({...tempExp, position: e.target.value})} placeholder="Position" {...inputStyle} /></FormControl>
                    <FormControl><Input value={tempExp.from} onChange={(e) => setTempExp({...tempExp, from: e.target.value})} placeholder="From" {...inputStyle} /></FormControl>
                    <FormControl><Input value={tempExp.to} onChange={(e) => setTempExp({...tempExp, to: e.target.value})} placeholder="To" {...inputStyle} /></FormControl>
                  </SimpleGrid>
                  <Button leftIcon={<Plus size={16} />} size="sm" bg="#10b981" color="white" onClick={() => addToList('experiences', tempExp, setTempExp)}>Add Experience</Button>
                  <VStack align="stretch" mt="4" spacing="2">
                    {formData.experiences.map((exp, i) => (
                      <HStack key={i} justify="space-between" bg="white" p="3" borderRadius="lg" border="1px solid #e2e8f0"><Text fontSize="xs">{exp.position} ({exp.from}-{exp.to})</Text><IconButton size="xs" colorScheme="red" icon={<Trash2 size={14} />} onClick={() => removeFromList('experiences', i)} /></HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(2)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(4)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 4. Career Highlights */}
            <TabPanel p="0">
              <Box mb="6"><Text fontSize="sm" fontWeight="800" mb="2">About Me</Text><Textarea name="aboutMe" value={formData.careerHighlights.aboutMe} onChange={handleHighlightChange} {...inputStyle} /></Box>
              <Box mb="6">
                <Text fontSize="sm" fontWeight="800" mb="2">Highlights</Text>
                <HStack mb="4"><Input value={tempHighlight} onChange={(e) => setTempHighlight(e.target.value)} placeholder="Highlight" {...inputStyle} /><Button size="sm" bg="#10b981" color="white" onClick={() => addToCareerList('highlights', tempHighlight, setTempHighlight)}>Add</Button></HStack>
                {formData.careerHighlights.highlights.map((h, i) => (<HStack key={i} bg="#f8faff" p="2" borderRadius="md" justify="space-between" mb="2"><Text fontSize="xs">{h}</Text><IconButton size="xs" colorScheme="red" icon={<Trash2 size={12} />} onClick={() => removeFromCareerList('highlights', i)} /></HStack>))}
              </Box>
              <Box mb="8">
                <Text fontSize="sm" fontWeight="800" mb="2">Why Choose Me</Text>
                <HStack mb="4"><Input value={tempReason} onChange={(e) => setTempReason(e.target.value)} placeholder="Reason" {...inputStyle} /><Button size="sm" bg="#10b981" color="white" onClick={() => addToCareerList('whyChooseMe', tempReason, setTempReason)}>Add</Button></HStack>
                {formData.careerHighlights.whyChooseMe.map((r, i) => (<HStack key={i} bg="#f8faff" p="2" borderRadius="md" justify="space-between" mb="2"><Text fontSize="xs">{r}</Text><IconButton size="xs" colorScheme="red" icon={<Trash2 size={12} />} onClick={() => removeFromCareerList('whyChooseMe', i)} /></HStack>))}
              </Box>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(3)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(5)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 5. Documents Upload */}
            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="8">
                <FormControl><FormLabel {...labelStyle}>ID Type</FormLabel><Select value={formData.idProofType} onChange={(e) => setFormData({...formData, idProofType: e.target.value})} {...selectStyle} placeholder="Select"><option value="Aadhar">Aadhar</option><option value="PAN">PAN</option></Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>ID Proof</FormLabel><Input type="file" onChange={(e) => handleFileChange('idProof', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Address Proof</FormLabel><Input type="file" onChange={(e) => handleFileChange('addressProof', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Resume</FormLabel><Input type="file" onChange={(e) => handleFileChange('cv', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Academic</FormLabel><Input type="file" onChange={(e) => handleFileChange('academicCertificate', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Experience Cert</FormLabel><Input type="file" onChange={(e) => handleFileChange('experienceCertificate', e)} p="1" {...inputStyle} /></FormControl>
              </SimpleGrid>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(4)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(6)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 6. Social Media */}
            <TabPanel p="0">
              <Box border="1px solid #e8edf5" borderRadius="xl" p="5" mb="6" bg="#f8faff">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5" mb="4">
                  <Select value={tempSocial.platform} onChange={(e) => setTempSocial({...tempSocial, platform: e.target.value})} {...selectStyle} placeholder="Platform"><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="LinkedIn">LinkedIn</option><option value="Twitter">Twitter</option></Select>
                  <Input value={tempSocial.url} onChange={(e) => setTempSocial({...tempSocial, url: e.target.value})} placeholder="URL" {...inputStyle} />
                </SimpleGrid>
                <Button size="sm" bg="#10b981" color="white" onClick={() => { if(tempSocial.platform && tempSocial.url) { setFormData(prev => ({...prev, socialMedia: [...prev.socialMedia, tempSocial]})); setTempSocial({platform:'', url:''}); } }}>Add Link</Button>
                <VStack align="stretch" mt="4" spacing="2">
                  {formData.socialMedia.map((s, i) => (<HStack key={i} justify="space-between" bg="white" p="3" borderRadius="lg" border="1px solid #e2e8f0"><Text fontSize="xs">{s.platform}: {s.url}</Text><IconButton size="xs" colorScheme="red" icon={<Trash2 size={14} />} onClick={() => removeFromList('socialMedia', i)} /></HStack>))}
                </VStack>
              </Box>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(5)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(7)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            {/* 7. Photo Gallery */}
            <TabPanel p="0">
              <FormControl mb="6"><FormLabel {...labelStyle}>Upload Gallery Photos</FormLabel><Input type="file" multiple onChange={(e) => handleFileChange('gallery', e)} p="1" {...inputStyle} /></FormControl>
              {formData.photoGallery.length > 0 && (
                <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing="4" mb="8">
                  {formData.photoGallery.map((url, i) => (
                    <Box key={i} position="relative" borderRadius="lg" overflow="hidden" h="100px" border="1px solid #e2e8f0">
                      <Image src={`${apiBase}/${url}`} alt="gallery" objectFit="cover" w="100%" h="100%" />
                      <IconButton size="xs" colorScheme="red" position="absolute" top="1" right="1" icon={<Trash2 size={12} />} onClick={() => setFormData(prev => ({...prev, photoGallery: prev.photoGallery.filter(u => u !== url)}))} />
                    </Box>
                  ))}
                </SimpleGrid>
              )}
              <HStack justify="space-between">
                <Button onClick={() => setActiveTab(6)} variant="outline" size="sm" px="6">Previous</Button>
                <Button isLoading={isLoading} onClick={handleSubmit} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="8" borderRadius="lg" _hover={{ bg: '#003d91' }}>Update Profile</Button>
              </HStack>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>
      <PageFooter />
    </Box>
  );
};

export default EditCandidate;
