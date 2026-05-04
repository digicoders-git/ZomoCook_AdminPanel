import { useState, useEffect } from 'react';
import { 
  Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, 
  Button, Tabs, TabList, Tab, TabPanels, TabPanel, Text, VStack, 
  IconButton, useToast
} from '@chakra-ui/react';
import { Trash2, Save, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader, PageFooter, BRAND, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const AddCandidate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    socialMedia: []
  });

  // Temporary states
  const [tempSkill, setTempSkill] = useState({ category: '', skills: '' });
  const [tempExp, setTempExp] = useState({ position: '', from: '', to: '', jobProfile: '', shortDetail: '' });
  const [tempEdu, setTempEdu] = useState({ title: '', from: '', to: '', shortDetail: '' });
  const [tempHighlight, setTempHighlight] = useState('');
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
    fetchMasterData('states', 'states');
    fetchMasterData('job-positions', 'jobPositions');
    fetchMasterData('job-types', 'jobTypes');
    fetchMasterData('skill-categories', 'skillCategories');
    fetchMasterData('cooking-preferences', 'cookingPreferences');
    fetchMasterData('salary-ranges', 'salaryRanges');
    fetchMasterData('experience-ranges', 'experienceRanges');
  }, []);

  useEffect(() => {
    if (formData.state) {
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
    if (name === 'gallery') setFiles(prev => ({ ...prev, gallery: Array.from(e.target.files) }));
    else if (e.target.files && e.target.files[0]) setFiles(prev => ({ ...prev, [name]: e.target.files[0] }));
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
      const skipFields = ['languages', 'jobPreference', 'cookingSkills', 'workExperience', 'education', 'careerHighlights', 'socialMedia', 'jobCategory', 'jobType', 'experienceValue', 'experienceUnit', 'currentSalary', 'expectedSalary', 'preferredCities', 'jobPositions', 'cookingPreference'];
      Object.keys(formData).forEach(key => {
        if (!skipFields.includes(key) && formData[key]) data.append(key, formData[key]);
      });

      data.append('languages', JSON.stringify(formData.languages));
      data.append('jobPreference', JSON.stringify({
        jobCategory: formData.jobCategory, jobType: formData.jobType,
        experience: { value: formData.experienceValue || 0, unit: formData.experienceUnit },
        currentSalary: formData.currentSalary, expectedSalary: formData.expectedSalary,
        preferredCities: formData.preferredCities, jobPositions: formData.jobPositions
      }));
      data.append('cookingSkills', JSON.stringify({ preference: formData.cookingPreference, skills: formData.cookingSkills }));
      data.append('workExperience', JSON.stringify({ lastCompany: formData.lastCompany, experiences: formData.experiences }));
      data.append('education', JSON.stringify(formData.education));
      data.append('careerHighlights', JSON.stringify(formData.careerHighlights));
      data.append('socialMedia', JSON.stringify(formData.socialMedia));

      Object.keys(files).forEach(key => {
        if (key === 'gallery') files.gallery.forEach(f => data.append('gallery', f));
        else if (files[key]) data.append(key, files[key]);
      });

      const response = await axios.post(`${apiUrl}/candidates`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        toast({ title: 'Success', description: 'Candidate created.', status: 'success' });
        navigate('/candidates/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Creation failed', status: 'error' });
    } finally { setIsLoading(false); }
  };

  const tabs = ['Basic Profile', 'Job Preference', 'Cooking Skills', 'Work Experience', 'Career Highlights', 'Documents Upload', 'Social Media', 'Photo Gallery'];

  return (
    <Box pb="10">
      <PageHeader title="Add Candidate Record" actions={[<Button key="back" as={Link} to="/candidates/list" size="sm" bg={BRAND} color="white" borderRadius="lg" fontSize="xs" px="4">Back to List</Button>]} />

      <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
        <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" p="5">
          <TabList display="flex" flexWrap="wrap" gap="2" mb="6" pb="4" borderBottom="1px solid #f1f5f9">
            {tabs.map((tab, index) => (
              <Tab key={tab} fontSize="xs" fontWeight="600" px="4" py="2" borderRadius="lg" color={activeTab === index ? 'white' : '#475569'} bg={activeTab === index ? BRAND : 'transparent'} _hover={{ bg: activeTab === index ? '#003d91' : '#f0f5ff' }}>{tab}</Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="5">
                <FormControl isRequired><FormLabel {...labelStyle}>Name</FormLabel><Input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Phone</FormLabel><Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>DOB</FormLabel><Input name="dob" value={formData.dob} onChange={handleChange} type="date" {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Gender</FormLabel><Select name="gender" value={formData.gender} onChange={handleChange} {...selectStyle} placeholder="Select"><option value="male">Male</option><option value="female">Female</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>State</FormLabel><Select name="state" value={formData.state} onChange={handleChange} {...selectStyle} placeholder="Select State">
                  {masters.states.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>City</FormLabel><Select name="city" value={formData.city} onChange={handleChange} {...selectStyle} placeholder="Select City" isDisabled={!formData.state}>
                  {masters.cities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
              </SimpleGrid>
              <FormControl mb="5" isRequired><FormLabel {...labelStyle}>Full Address</FormLabel><Textarea name="address" value={formData.address} onChange={handleChange} {...inputStyle} /></FormControl>
              <FormControl mb="5"><FormLabel {...labelStyle}>Languages Known</FormLabel><Input placeholder="e.g. Hindi, English" onChange={(e) => handleMultiSelect('languages', e.target.value.split(','))} {...inputStyle} /></FormControl>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="6">
                <FormControl><FormLabel {...labelStyle}>Profile Image</FormLabel><Input type="file" onChange={(e) => handleFileChange('image', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>KYC Status</FormLabel><Select name="kycStatus" value={formData.kycStatus} onChange={handleChange} {...selectStyle}><option value="pending">Pending</option><option value="approved">Approved</option></Select></FormControl>
              </SimpleGrid>
              <HStack justify="flex-end"><Button onClick={() => setActiveTab(1)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="5">
                <FormControl><FormLabel {...labelStyle}>Job Category</FormLabel><Select placeholder="Select Category" onChange={(e) => handleMultiSelect('jobCategory', e.target.value)} {...selectStyle}>
                  <option value="hotel">Hotel Job</option><option value="home">Home Cook Job</option><option value="daily">Daily Pay Job</option>
                </Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>Job Type</FormLabel><Select placeholder="Select Type" onChange={(e) => handleMultiSelect('jobType', e.target.value)} {...selectStyle}>
                  {masters.jobTypes.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>Position</FormLabel><Select placeholder="Select Position" onChange={(e) => handleMultiSelect('jobPositions', e.target.value)} {...selectStyle}>
                  {masters.jobPositions.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </Select></FormControl>
                <HStack spacing="2" align="flex-end">
                   <FormControl><FormLabel {...labelStyle}>Experience</FormLabel><Select name="experienceValue" onChange={handleChange} {...selectStyle} placeholder="Select Experience">
                     {masters.experienceRanges.map(m => <option key={m._id} value={`${m.experienceFrom}-${m.experienceTo}`}>{m.experienceFrom}-{m.experienceTo} Years</option>)}
                   </Select></FormControl>
                </HStack>
                <FormControl><FormLabel {...labelStyle}>Expected Salary</FormLabel><Select name="expectedSalary" onChange={handleChange} {...selectStyle} placeholder="Select Salary">
                  {masters.salaryRanges.map(m => <option key={m._id} value={`${m.salaryFrom}-${m.salaryTo}`}>{m.salaryFrom}-{m.salaryTo}</option>)}
                </Select></FormControl>
              </SimpleGrid>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(0)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(2)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <FormControl mb="5"><FormLabel {...labelStyle}>Cooking Preference</FormLabel><Select name="cookingPreference" value={formData.cookingPreference} onChange={handleChange} {...selectStyle} placeholder="Select Preference">
                {masters.cookingPreferences.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
              </Select></FormControl>
              <Box border="1px solid #e8edf5" borderRadius="xl" p="5" mb="6" bg="#f8faff">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mb="4">
                  <Select value={tempSkill.category} onChange={(e) => setTempSkill({...tempSkill, category: e.target.value})} {...selectStyle} placeholder="Category">
                    {masters.skillCategories.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                  </Select>
                  <Input value={tempSkill.skills} onChange={(e) => setTempSkill({...tempSkill, skills: e.target.value})} placeholder="Specific Skills" {...inputStyle} />
                </SimpleGrid>
                <Button size="sm" bg="#10b981" color="white" onClick={() => { if(tempSkill.category && tempSkill.skills) { setFormData(prev => ({...prev, cookingSkills: [...prev.cookingSkills, tempSkill]})); setTempSkill({category:'', skills:''}); } }}>Add Skill</Button>
                <VStack align="stretch" mt="4" spacing="2">
                  {formData.cookingSkills.map((s, i) => (<HStack key={i} justify="space-between" bg="white" p="3" border="1px solid #e2e8f0"><Text fontSize="xs">{s.category}: {s.skills}</Text><IconButton size="xs" colorScheme="red" icon={<Trash2 size={14} />} onClick={() => setFormData(prev => ({...prev, cookingSkills: prev.cookingSkills.filter((_, idx) => idx !== i)}))} /></HStack>))}
                </VStack>
              </Box>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(1)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(3)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <Box mb="8"><Text fontSize="sm" fontWeight="800" mb="4">Last Company Details</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                  <FormControl><FormLabel {...labelStyle}>Company Name</FormLabel><Input name="name" value={formData.lastCompany.name} onChange={handleLastCompanyChange} placeholder="Company Name" {...inputStyle} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Role</FormLabel><Input name="role" value={formData.lastCompany.role} onChange={handleLastCompanyChange} placeholder="Job Role" {...inputStyle} /></FormControl>
                </SimpleGrid>
              </Box>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(2)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(4)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <FormControl mb="4"><FormLabel {...labelStyle}>About Me</FormLabel><Textarea name="aboutMe" value={formData.careerHighlights.aboutMe} onChange={handleHighlightChange} placeholder="Write something about the candidate..." {...inputStyle} minH="120px" /></FormControl>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(3)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(5)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="8">
                <FormControl><FormLabel {...labelStyle}>ID Type</FormLabel><Select name="idProofType" value={formData.idProofType} onChange={handleChange} {...selectStyle}><option value="Aadhar">Aadhar Card</option><option value="PAN">PAN Card</option><option value="Voter ID">Voter ID</option><option value="Passport">Passport</option></Select></FormControl>
                <FormControl><FormLabel {...labelStyle}>ID Proof (Upload)</FormLabel><Input type="file" onChange={(e) => handleFileChange('idProof', e)} p="1" {...inputStyle} /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Resume/CV</FormLabel><Input type="file" onChange={(e) => handleFileChange('cv', e)} p="1" {...inputStyle} /></FormControl>
              </SimpleGrid>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(4)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(6)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <HStack mb="4">
                <Select value={tempSocial.platform} onChange={(e) => setTempSocial({...tempSocial, platform: e.target.value})} {...selectStyle} placeholder="Platform"><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="LinkedIn">LinkedIn</option><option value="Twitter">Twitter</option></Select>
                <Input value={tempSocial.url} onChange={(e) => setTempSocial({...tempSocial, url: e.target.value})} placeholder="URL" {...inputStyle} />
                <Button size="sm" bg={BRAND} color="white" onClick={() => { if(tempSocial.platform && tempSocial.url) { setFormData(prev => ({...prev, socialMedia: [...prev.socialMedia, tempSocial]})); setTempSocial({platform:'', url:''}); } }}>Add</Button>
              </HStack>
              <VStack align="stretch" spacing="2" mb="6">
                {formData.socialMedia.map((s, i) => (<HStack key={i} justify="space-between" bg="#f8faff" p="3" borderRadius="md"><Text fontSize="xs" fontWeight="600">{s.platform}: {s.url}</Text><IconButton size="xs" colorScheme="red" icon={<X size={14} />} onClick={() => setFormData(prev => ({...prev, socialMedia: prev.socialMedia.filter((_, idx) => idx !== i)}))} /></HStack>))}
              </VStack>
              <HStack justify="space-between"><Button onClick={() => setActiveTab(5)} variant="outline" size="sm" px="6">Previous</Button><Button onClick={() => setActiveTab(7)} bg={BRAND} color="white" size="sm" px="6">Next</Button></HStack>
            </TabPanel>

            <TabPanel p="0">
              <FormControl mb="8"><FormLabel {...labelStyle}>Gallery Images (Food/Work samples)</FormLabel><Input type="file" multiple onChange={(e) => handleFileChange('gallery', e)} p="1" {...inputStyle} /></FormControl>
              <HStack justify="space-between">
                <Button onClick={() => setActiveTab(6)} variant="outline" size="sm" px="6">Previous</Button>
                <Button isLoading={isLoading} onClick={handleSubmit} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="8" borderRadius="lg" _hover={{ bg: '#003d91' }}>Submit Candidate</Button>
              </HStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <PageFooter />
    </Box>
  );
};

export default AddCandidate;
