import { useState, useEffect } from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, Button, Radio, RadioGroup, Stack, Divider, Text, Flex, Icon, Spinner } from '@chakra-ui/react';
import { Send, RotateCcw, Plus, Save } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [customers, setCustomers] = useState([]);

  // Master Data States
  const [masters, setMasters] = useState({
    jobPositions: [],
    jobTypes: [],
    states: [],
    cities: [],
    propertyCategories: [],
    foodPreferences: [],
    cookingCategories: [],
    facilities: [],
    experienceRanges: [],
    salaryRanges: [],
    joiningTypes: [],
    events: []
  });

  const [jobCategory, setJobCategory] = useState('hotel');
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    overview: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    propertyCategory: '',
    state: '',
    city: '',
    event: '',
    foodPreference: '',
    mealPreference: '',
    servingTime: '',
    basicFacility: '',
    otherFacilities: '',
    cookingCategory: '',
    menuDetails: '',
    status: 'New',
    jobType: '',
    jobPosition: '',
    packageOrGuestOrVacancy: '',
    package: '',
    noOfGuests: '',
    allowedLeave: '',
    salaryRange: '',
    experienceRange: '',
    joiningType: '',
    dateOfEvent: '',
  });
  const [jobImage, setJobImage] = useState(null);

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
        // Fetch Customers
        const custRes = await axios.get(`${apiUrl}/customers`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (custRes.data.success) setCustomers(custRes.data.customers);

        // Fetch all necessary masters
        await Promise.all([
          fetchMasterData('job-positions', 'jobPositions'),
          fetchMasterData('job-types', 'jobTypes'),
          fetchMasterData('states', 'states'),
          fetchMasterData('property-categories', 'propertyCategories'),
          fetchMasterData('cooking-preferences', 'foodPreferences'),
          fetchMasterData('cooking-categories', 'cookingCategories'),
          fetchMasterData('facilities', 'facilities'),
          fetchMasterData('experience-ranges', 'experienceRanges'),
          fetchMasterData('salary-ranges', 'salaryRanges'),
          fetchMasterData('events', 'events')
        ]);

        // Fetch Job
        const jobRes = await axios.get(`${apiUrl}/jobs/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (jobRes.data.success) {
          const job = jobRes.data.job;
          setJobCategory(job.jobCategory);
          const formattedData = { ...job };
          if (job.customer && typeof job.customer === 'object') formattedData.customer = job.customer._id;
          if (job.dateOfEvent) formattedData.dateOfEvent = new Date(job.dateOfEvent).toISOString().split('T')[0];
          setFormData(formattedData);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load details.', status: 'error' });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch cities when state changes or after initial job load
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
            if (response.data.success) {
              setMasters(prev => ({ ...prev, cities: response.data.masters }));
            }
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      };
      fetchCities();
    }
  }, [formData.state, masters.states]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setJobImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      data.set('jobCategory', jobCategory);
      const commonFields = ['title', 'customer', 'overview', 'responsibilities', 'requirements', 'status', 'jobType', 'jobPosition'];
      let categorySpecificFields = [];
      if (jobCategory === 'hotel') {
        categorySpecificFields = ['propertyCategory', 'state', 'city', 'basicFacility', 'otherFacilities', 'packageOrGuestOrVacancy', 'allowedLeave', 'salaryRange', 'experienceRange', 'joiningType', 'benefits'];
      } else if (jobCategory === 'home') {
        categorySpecificFields = ['propertyCategory', 'state', 'city', 'foodPreference', 'basicFacility', 'otherFacilities', 'cookingCategory', 'packageOrGuestOrVacancy', 'allowedLeave', 'salaryRange', 'experienceRange', 'joiningType', 'benefits'];
      } else if (jobCategory === 'daily') {
        categorySpecificFields = ['state', 'city', 'event', 'foodPreference', 'mealPreference', 'servingTime', 'menuDetails', 'package', 'noOfGuests', 'dateOfEvent', 'benefits'];
      }
      const allFieldsToSend = [...commonFields, ...categorySpecificFields];
      allFieldsToSend.forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) data.set(key, formData[key]);
      });
      if (jobImage) data.set('image', jobImage);

      const response = await axios.put(`${apiUrl}/jobs/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        toast({ title: 'Updated', description: 'Job record updated successfully.', status: 'success', duration: 3000, position: 'top-right' });
        navigate('/jobs/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update job.', status: 'error', duration: 4000, position: 'top-right' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} thickness="4px" /></Flex>;

  return (
    <Box pb="10">
      <PageHeader title="Edit Job Record" breadcrumb="Edit Job Record"
        actions={[<Button key="back" as={Link} to="/jobs/list" size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} fontSize="xs" px="4">Back to List</Button>]}
      />

      <form onSubmit={handleSubmit}>
        <FormCard headerTitle={`Edit Job: ${formData.title}`}>
          <Box mb="6" p="4" bg="#f8faff" borderRadius="lg" border="1px solid #e8edf5">
            <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="3">Job Category</Text>
            <RadioGroup onChange={setJobCategory} value={jobCategory}>
              <Stack direction="row" spacing="6">
                {[['hotel', 'Hotel Job'], ['home', 'Home Cook Job'], ['daily', 'Daily Pay Job']].map(([val, label]) => (
                  <Radio key={val} value={val} sx={{ '.chakra-radio__control[data-checked]': { bg: BRAND, borderColor: BRAND } }}>
                    <Text fontSize="sm" color="#475569" fontWeight="500">{label}</Text>
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="5" mb="6">
            <FormControl isRequired><FormLabel {...labelStyle}>Job Overview</FormLabel><Textarea name="overview" value={formData.overview || ''} onChange={handleChange} placeholder="Type job overview here..." {...inputStyle} minH="130px" /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Key Responsibilities</FormLabel><Textarea name="responsibilities" value={formData.responsibilities || ''} onChange={handleChange} placeholder="Type key responsibilities here..." {...inputStyle} minH="130px" /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Requirements</FormLabel><Textarea name="requirements" value={formData.requirements || ''} onChange={handleChange} placeholder="Type requirements here..." {...inputStyle} minH="130px" /></FormControl>
            {jobCategory !== 'daily' && <FormControl><FormLabel {...labelStyle}>Benefits</FormLabel><Textarea name="benefits" value={formData.benefits || ''} onChange={handleChange} placeholder="Type benefits here..." {...inputStyle} minH="130px" /></FormControl>}
          </SimpleGrid>

          <Divider borderColor="#f1f5f9" mb="6" />

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="5">
            <FormControl isRequired><FormLabel {...labelStyle}>Job Title</FormLabel><Input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Enter Job Title" {...inputStyle} /></FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Customer/Client Name</FormLabel>
              <Select name="customer" value={formData.customer || ''} onChange={handleChange} {...selectStyle} placeholder="Select Customer/Client">
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </FormControl>

            {(jobCategory !== 'daily') && (
              <FormControl><FormLabel {...labelStyle}>Property Category</FormLabel><Select name="propertyCategory" value={formData.propertyCategory || ''} onChange={handleChange} {...selectStyle} placeholder="Select Property Category">
                {masters.propertyCategories.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
              </Select></FormControl>
            )}

            <FormControl isRequired><FormLabel {...labelStyle}>State</FormLabel><Select name="state" value={formData.state || ''} onChange={handleChange} {...selectStyle} placeholder="Select State">
                {masters.states.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>

            <FormControl isRequired><FormLabel {...labelStyle}>City</FormLabel><Select name="city" value={formData.city || ''} onChange={handleChange} {...selectStyle} placeholder="Select City" isDisabled={!formData.state}>
                {masters.cities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>

            {jobCategory === 'daily' && (
              <FormControl isRequired><FormLabel {...labelStyle}>Event</FormLabel><Select name="event" value={formData.event || ''} onChange={handleChange} {...selectStyle} placeholder="Select Event">
                {masters.events.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
              </Select></FormControl>
            )}

            {jobCategory === 'home' && <FormControl isRequired><FormLabel {...labelStyle}>Food Preference</FormLabel><Select name="foodPreference" value={formData.foodPreference || ''} onChange={handleChange} {...selectStyle} placeholder="Select Food Preference">
                {masters.foodPreferences.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>}

            {jobCategory === 'daily' && <FormControl><FormLabel {...labelStyle}>Meal Preference</FormLabel><Input name="mealPreference" value={formData.mealPreference || ''} onChange={handleChange} placeholder="Meal Preference" {...inputStyle} /></FormControl>}
            {jobCategory === 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>Food Preference</FormLabel><Select name="foodPreference" value={formData.foodPreference || ''} onChange={handleChange} {...selectStyle} placeholder="Select Food Preference">
                {masters.foodPreferences.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>}
            
            {jobCategory === 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>Serving Time</FormLabel><Select name="servingTime" value={formData.servingTime || ''} onChange={handleChange} {...selectStyle} placeholder="Select Serving Time"><option value="Morning">Morning</option><option value="Evening">Evening</option><option value="Night">Night</option></Select></FormControl>}
            {jobCategory !== 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>Basic Facility</FormLabel><Select name="basicFacility" value={formData.basicFacility || ''} onChange={handleChange} {...selectStyle} placeholder="Select Basic Facility">
                {masters.facilities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>}
            {jobCategory !== 'daily' && <FormControl><FormLabel {...labelStyle}>Other Facilities</FormLabel><Select name="otherFacilities" value={formData.otherFacilities || ''} onChange={handleChange} {...selectStyle} placeholder="Select Other Facilities">
                {masters.facilities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>}
            {jobCategory === 'home' && <FormControl isRequired><FormLabel {...labelStyle}>Cooking Category</FormLabel><Select name="cookingCategory" value={formData.cookingCategory || ''} onChange={handleChange} {...selectStyle} placeholder="Select Cooking Category">
                {masters.cookingCategories.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
            </Select></FormControl>}
          </SimpleGrid>

          {jobCategory === 'daily' && (
            <FormControl mb="5"><FormLabel {...labelStyle}>Menu Details</FormLabel><Textarea name="menuDetails" value={formData.menuDetails || ''} onChange={handleChange} placeholder="Enter Menu Details" {...inputStyle} minH="90px" /></FormControl>
          )}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="6">
            {jobCategory === 'daily' && <FormControl><FormLabel {...labelStyle}>You Will Get (Benefits)</FormLabel><Input name="benefits" value={formData.benefits || ''} onChange={handleChange} placeholder="Enter Benefits" {...inputStyle} /></FormControl>}
            <FormControl><FormLabel {...labelStyle}>Update Image</FormLabel><Input type="file" onChange={handleFileChange} p="1" {...inputStyle} /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select name="status" value={formData.status || ''} onChange={handleChange} {...selectStyle}>
              <option value="Urgent">Urgent</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
            </Select></FormControl>
          </SimpleGrid>

          <Box p="5" borderRadius="xl" border="1px solid #e8edf5" bg="#f8faff" mb="6">
            <HStack spacing="3" mb="5"><Box w="3px" h="16px" bg={BRAND} borderRadius="full" /><Text fontSize="sm" fontWeight="700" color="#1e293b">Job Parameters</Text></HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5">
              <FormControl isRequired><FormLabel {...labelStyle}>Job Type</FormLabel><Select name="jobType" value={formData.jobType || ''} onChange={handleChange} {...selectStyle} placeholder="Select Job Type">
                {masters.jobTypes.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
              </Select></FormControl>
              <FormControl isRequired><FormLabel {...labelStyle}>Job Position</FormLabel><Select name="jobPosition" value={formData.jobPosition || ''} onChange={handleChange} {...selectStyle} placeholder="Select Job Position">
                {masters.jobPositions.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
              </Select></FormControl>
              {jobCategory !== 'daily' ? (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>{jobCategory === 'home' ? 'No. of Guest' : 'No. of Vacancy'}</FormLabel>
                  <Input name="packageOrGuestOrVacancy" value={formData.packageOrGuestOrVacancy || ''} onChange={handleChange} placeholder={jobCategory === 'home' ? 'Enter No. of Guest' : 'Enter No. of Vacancy'} {...inputStyle} />
                </FormControl>
              ) : (
                <>
                  <FormControl isRequired><FormLabel {...labelStyle}>Package</FormLabel><Input name="package" value={formData.package || ''} onChange={handleChange} placeholder="Enter Package" {...inputStyle} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>No. of Guest</FormLabel><Input name="noOfGuests" value={formData.noOfGuests || ''} onChange={handleChange} placeholder="Enter No Of Guest" {...inputStyle} /></FormControl>
                </>
              )}
              {jobCategory !== 'daily' && <FormControl><FormLabel {...labelStyle}>Allowed Leave</FormLabel><Input name="allowedLeave" value={formData.allowedLeave || ''} onChange={handleChange} placeholder="Allowed Leave" {...inputStyle} /></FormControl>}
              {jobCategory !== 'daily' ? (
                <>
                  <FormControl isRequired><FormLabel {...labelStyle}>Salary Range</FormLabel><Select name="salaryRange" value={formData.salaryRange || ''} onChange={handleChange} {...selectStyle} placeholder="Select Salary Range">
                    {masters.salaryRanges.map(m => <option key={m._id} value={`${m.salaryFrom} - ${m.salaryTo}`}>{m.salaryFrom} - {m.salaryTo}</option>)}
                  </Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Experience Range</FormLabel><Select name="experienceRange" value={formData.experienceRange || ''} onChange={handleChange} {...selectStyle} placeholder="Select Experience Range">
                    {masters.experienceRanges.map(m => <option key={m._id} value={`${m.experienceFrom} - ${m.experienceTo} Years`}>{m.experienceFrom} - {m.experienceTo} Years</option>)}
                  </Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Joining Type</FormLabel><Select name="joiningType" value={formData.joiningType || ''} onChange={handleChange} {...selectStyle} placeholder="Select Joining Type"><option value="Immediate">Immediate</option><option value="15 Days">15 Days</option><option value="1 Month">1 Month</option></Select></FormControl>
                </>
              ) : (
                <FormControl isRequired><FormLabel {...labelStyle}>Date of Event</FormLabel><Input name="dateOfEvent" value={formData.dateOfEvent || ''} onChange={handleChange} type="date" {...inputStyle} /></FormControl>
              )}
            </SimpleGrid>
          </Box>

          <HStack justify="flex-end" spacing="3">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/jobs/list')}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Save size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update Job</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default EditJob;
