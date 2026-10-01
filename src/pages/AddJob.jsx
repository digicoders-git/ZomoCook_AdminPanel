import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, SimpleGrid, FormControl, FormLabel,
  Input, Select, Textarea, Button, Badge, Spinner, useToast,
  Divider, InputGroup, InputLeftElement, InputRightElement, IconButton,
  Tag, Wrap, WrapItem
} from '@chakra-ui/react';
import {
  Building2, Home, Calendar, UtensilsCrossed, Plus, RotateCcw,
  CheckCircle2, Search, Phone, Mail, MapPin, X, ArrowRight,
  Briefcase, Send, Trash2, Minus, Users, Award, Check
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PageHeader, TableCard, BRAND, ACCENT, inputStyle, selectStyle } from '../components/ui';
import { INDIA_STATES_AND_DISTRICTS, ALL_INDIAN_STATES } from '../utils/indiaData';

// Custom label style matching user screenshot
const formLabelStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#475569',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  mb: '1.5'
};

const commercialServiceCategories = [
  'Kitchen Staff',
  'Service Staff',
  'Housekeeping Staff',
  'Management Staff',
  'Utility / Other Staff'
];

const commercialStaffCategoriesMap = {
  'Kitchen Staff': [
    'Head Chef/ Master Chef',
    'Executive Chef',
    'Sous Chef',
    'North Indian Chef',
    'South Indian Chef',
    'Chinese Chef',
    'Tandoor Chef',
    'Continental Chef',
    'Italian / Mexican Chef',
    'Mughlai Chef',
    'Bakery & Pastry Chef',
    'All-Rounder Cook',
    'Fast Food Cook',
    'Commi 1 / Commi 2',
    'Kitchen Helper / Commis 3'
  ],
  'Service Staff': [
    'Captain / Supervisor',
    'Waiter / Steward',
    'Bartender / Barista',
    'Food Runner / Busser',
    'Host / Hostess'
  ],
  'Housekeeping Staff': [
    'Housekeeping Staff',
    'Room Boy / Attendant',
    'Cleaning Staff',
    'Laundry Staff'
  ],
  'Management Staff': [
    'Restaurant Manager',
    'General Manager',
    'Assistant Manager',
    'Floor Supervisor',
    'Cashier / Billing Staff'
  ],
  'Utility / Other Staff': [
    'Dishwasher / Utility Staff',
    'Kitchen Cleaner',
    'Store Helper / Loader',
    'Security Guard'
  ]
};

const salaryRanges = [
  '₹10,000 - ₹15,000',
  '₹12,000 - ₹15,000',
  '₹15,000 - ₹20,000',
  '₹20,000 - ₹25,000',
  '₹25,000 - ₹35,000',
  '₹35,000 - ₹50,000',
  '₹50,000 - ₹75,000',
  '₹75,000+'
];

const cookLevels = [
  { id: 'basic', name: 'Basic Cook', desc: 'Simple home-made food with good experience.', salary: '₹15,000 – ₹18,000/month', badge: '₹15K – ₹18K/mo' },
  { id: 'standard', name: 'Standard Cook', desc: 'Multi-cuisine cooking with highly experienced staff.', salary: '₹20,000 – ₹25,000/month', badge: '₹20K – ₹25K/mo' },
  { id: 'premium', name: 'Premium Chef', desc: 'Expert multi-cuisine private chef with high experience.', salary: '₹30,000+/month', badge: '₹30K+/mo' }
];

const dailyRolesPresets = [
  { role: 'Waiter', rate: 999 },
  { role: 'Captain / Supervisor', rate: 1499 },
  { role: 'Bartender', rate: 1799 },
  { role: 'Kitchen Helper', rate: 899 },
  { role: 'All-Rounder Cook', rate: 1999 },
  { role: 'Tandoor / Chinese Chef', rate: 2499 },
  { role: 'Head Chef', rate: 3499 }
];

const occasionTypes = [
  'House Party',
  'Birthday Party',
  'Anniversary Celebration',
  'Wedding / Reception',
  'Engagement',
  'Cocktail Party',
  'Corporate Gathering',
  'Kitty Party',
  'Festive Gathering',
  'Other'
];

const cuisineOptions = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Continental',
  'Italian',
  'Mughlai',
  'Starters & Tandoor',
  'Desserts & Sweets',
  'Street Food / Chaat',
  'Healthy & Diet'
];

const AddJob = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('adminToken');

  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(true);
  const [managers, setManagers] = useState([]);

  // Customer Selection State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  // Service Type: 'hotel' (Commercial), 'home' (Domestic), 'daily' (Daily Basis), 'party' (Chef for Party)
  const [serviceType, setServiceType] = useState('hotel');

  // Commercial Specific
  const [commercialServiceCategory, setCommercialServiceCategory] = useState('Kitchen Staff');
  const [commercialStaffList, setCommercialStaffList] = useState([
    {
      id: '1',
      serviceCategory: 'Kitchen Staff',
      staffCategory: 'Head Chef/ Master Chef',
      salaryRange: '₹20,000 - ₹25,000',
      noOfStaff: 1
    }
  ]);

  // Domestic Home Cook Specific
  const [homeCookLevel, setHomeCookLevel] = useState('standard');
  const [genderPreference, setGenderPreference] = useState('Any');
  const [selectedCuisines, setSelectedCuisines] = useState(['North Indian']);

  // Daily Basis Staff Specific
  const [dailyHiringPurpose, setDailyHiringPurpose] = useState('commercial'); // 'commercial' | 'domestic'
  const [dailyStaffList, setDailyStaffList] = useState([
    {
      id: '1',
      role: 'Head Chef',
      count: 1,
      ratePerDay: 3499,
      genderPref: 'Any',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '23:00',
      days: 1
    }
  ]);

  // Main Form Data
  const [formData, setFormData] = useState({
    title: '',
    outletName: '',
    propertyCategory: 'Restaurant',
    jobPosition: 'Head Chef/ Master Chef',
    jobType: 'Full Time (10-12 hrs)',
    packageOrGuestOrVacancy: '1',
    salaryRange: '₹12,000 - ₹15,000',
    experienceRange: '2-5 Years',
    allowedLeave: '2 days/month',
    joiningType: 'Immediate',
    basicFacility: 'Food & Accommodation',
    otherFacilities: '',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    address: '',
    
    // Domestic specific
    foodPreference: 'Vegetarian (Veg Only)',
    cookingCategory: 'North Indian',
    serviceDuration: '10 Hours',
    familyMembers: '3-4 Members',
    startDate: '',
    
    // Daily & Party specific
    event: 'House Party',
    dateOfEvent: '',
    servingTime: 'Dinner',
    mealPreference: 'Dinner',
    noOfGuests: '15',
    vegGuests: '10',
    nonVegGuests: '5',
    ratePerDay: '1500',
    menuDetails: '',
    
    // Admin & General
    overview: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    status: 'New',
    leadManager: ''
  });

  const [jobImage, setJobImage] = useState(null);

  // Available cities based on selected state
  const currentDistricts = INDIA_STATES_AND_DISTRICTS[formData.state] || [];

  useEffect(() => {
    const initFetch = async () => {
      setIsFetchingCustomers(true);
      try {
        const custRes = await axios.get(`${apiUrl}/customers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (custRes.data.success) {
          setCustomers(custRes.data.customers || []);
        }

        try {
          const mgrRes = await axios.get(`${apiUrl}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (mgrRes.data.success) {
            setManagers(mgrRes.data.users || []);
          }
        } catch (err) {
          console.error('Error fetching managers:', err);
        }
      } catch (error) {
        console.error('Initial fetch failed', error);
      } finally {
        setIsFetchingCustomers(false);
      }
    };
    initFetch();
  }, []);

  const handleCustomerSelect = (customerId) => {
    if (!customerId) {
      setSelectedCustomer(null);
      return;
    }
    const cust = customers.find(c => c._id === customerId);
    if (cust) {
      setSelectedCustomer(cust);
      setFormData(prev => ({
        ...prev,
        state: cust.state || prev.state,
        city: cust.city || prev.city,
        address: cust.address || cust.contactAddress || prev.address,
        outletName: cust.businessName || cust.outletName || prev.outletName
      }));
    }
  };

  const handlePhoneSearch = () => {
    if (!searchPhone.trim()) return;
    setIsSearchingPhone(true);
    const cleaned = searchPhone.trim().replace(/\D/g, '');
    const found = customers.find(c => {
      const p = (c.phone || c.contactPhone || '').replace(/\D/g, '');
      return p.includes(cleaned) || cleaned.includes(p);
    });

    if (found) {
      setSelectedCustomer(found);
      setFormData(prev => ({
        ...prev,
        state: found.state || prev.state,
        city: found.city || prev.city,
        address: found.address || found.contactAddress || prev.address,
        outletName: found.businessName || found.outletName || prev.outletName
      }));
      toast({ title: 'Customer Found', description: `Selected ${found.name}`, status: 'success', duration: 2000 });
    } else {
      toast({
        title: 'Customer Not Found',
        description: 'No registered customer with this phone number. Please select from dropdown or register a customer first.',
        status: 'warning',
        duration: 3500
      });
    }
    setIsSearchingPhone(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'state') {
        const districts = INDIA_STATES_AND_DISTRICTS[value] || [];
        if (districts.length > 0) {
          updated.city = districts[0];
        }
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setJobImage(e.target.files[0]);
    }
  };

  // Helper for Commercial Staff List
  const handleAddCommercialStaff = () => {
    const newStaff = {
      id: Date.now().toString(),
      serviceCategory: commercialServiceCategory,
      staffCategory: (commercialStaffCategoriesMap[commercialServiceCategory] || [])[0] || 'Staff Role',
      salaryRange: '₹15,000 - ₹20,000',
      noOfStaff: 1
    };
    setCommercialStaffList([...commercialStaffList, newStaff]);
  };

  const handleUpdateCommercialStaff = (id, field, value) => {
    setCommercialStaffList(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'serviceCategory') {
          updated.staffCategory = (commercialStaffCategoriesMap[value] || [])[0] || 'Staff Role';
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveCommercialStaff = (id) => {
    if (commercialStaffList.length === 1) {
      toast({ title: 'At least one staff requirement is required', status: 'info', duration: 2000 });
      return;
    }
    setCommercialStaffList(prev => prev.filter(item => item.id !== id));
  };

  // Helper for Daily Staff List
  const handleAddDailyStaff = (presetRole = 'Waiter', presetRate = 999) => {
    const newStaff = {
      id: Date.now().toString(),
      role: presetRole,
      count: 1,
      ratePerDay: presetRate,
      genderPref: 'Any',
      startDate: formData.dateOfEvent || new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '23:00',
      days: 1
    };
    setDailyStaffList([...dailyStaffList, newStaff]);
  };

  const handleUpdateDailyStaff = (id, field, value) => {
    setDailyStaffList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveDailyStaff = (id) => {
    if (dailyStaffList.length === 1) {
      toast({ title: 'At least one daily staff is required', status: 'info', duration: 2000 });
      return;
    }
    setDailyStaffList(prev => prev.filter(item => item.id !== id));
  };

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  // Helper to construct sensible titles
  const getAutoTitle = () => {
    if (serviceType === 'hotel') {
      return `${formData.jobPosition || 'Chef'} for ${formData.outletName || formData.propertyCategory || 'Commercial Outlet'} in ${formData.city}`;
    } else if (serviceType === 'home') {
      const levelObj = cookLevels.find(l => l.id === homeCookLevel);
      return `${levelObj?.name || 'Domestic Cook'} (${formData.foodPreference}) in ${formData.city}`;
    } else if (serviceType === 'daily') {
      const primaryRole = dailyStaffList[0]?.role || formData.jobPosition || 'Staff';
      return `Daily Basis ${primaryRole} for ${formData.event || 'Event'} in ${formData.city}`;
    } else if (serviceType === 'party') {
      return `Party Chef for ${formData.event || 'Party'} (${formData.noOfGuests || '15'} Guests) in ${formData.city}`;
    }
    return `Chef Requirement in ${formData.city}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast({
        title: 'Customer Required',
        description: 'Please select or search a customer before creating a job record.',
        status: 'error',
        duration: 3500,
        position: 'top-right'
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = new FormData();
      const jobCategory = serviceType; // 'hotel', 'home', 'daily', 'party'
      payload.set('jobCategory', jobCategory);
      payload.set('bookingType', serviceType === 'party' ? 'party' : serviceType === 'daily' ? 'daily' : 'regular');
      payload.set('customer', selectedCustomer._id);
      
      const computedTitle = formData.title.trim() || getAutoTitle();
      payload.set('title', computedTitle);
      payload.set('state', formData.state || 'Uttar Pradesh');
      payload.set('city', formData.city || 'Lucknow');
      payload.set('address', formData.address || selectedCustomer.address || '');
      payload.set('status', formData.status || 'New');
      if (formData.leadManager) payload.set('leadManager', formData.leadManager);

      // Category Specific Mapping
      if (serviceType === 'hotel') {
        payload.set('hiringPurpose', 'commercial');
        payload.set('outletName', formData.outletName || '');
        payload.set('propertyCategory', formData.propertyCategory || 'Restaurant');
        payload.set('jobPosition', formData.jobPosition || 'Head Chef/ Master Chef');
        payload.set('jobType', formData.jobType || 'Full Time (10-12 hrs)');
        payload.set('packageOrGuestOrVacancy', formData.packageOrGuestOrVacancy || '1');
        payload.set('salaryRange', formData.salaryRange || '₹12,000 - ₹15,000');
        payload.set('experienceRange', formData.experienceRange || '2-5 Years');
        payload.set('allowedLeave', formData.allowedLeave || '2 days/month');
        payload.set('joiningType', formData.joiningType || 'Immediate');
        payload.set('basicFacility', formData.basicFacility || 'Food & Accommodation');
        payload.set('otherFacilities', formData.otherFacilities || '');
        payload.set('benefits', formData.benefits || '');
        payload.set('commercialStaffList', JSON.stringify(commercialStaffList));
      } else if (serviceType === 'home') {
        const levelObj = cookLevels.find(l => l.id === homeCookLevel);
        payload.set('hiringPurpose', 'domestic');
        payload.set('homeCookLevel', homeCookLevel);
        payload.set('genderPreference', genderPreference);
        payload.set('jobPosition', levelObj?.name || 'Domestic Home Cook');
        payload.set('jobType', formData.serviceDuration || '10 Hours');
        payload.set('serviceDuration', formData.serviceDuration || '10 Hours');
        payload.set('foodPreference', formData.foodPreference || 'Vegetarian');
        payload.set('cookingCategory', selectedCuisines.join(', ') || formData.cookingCategory || 'North Indian');
        payload.set('familyMembers', formData.familyMembers || '3-4 Members');
        payload.set('packageOrGuestOrVacancy', formData.familyMembers || '3-4 Members');
        payload.set('noOfGuests', formData.familyMembers || '3-4 Members');
        payload.set('salaryRange', levelObj?.salary || formData.salaryRange || '₹20,000 – ₹25,000/month');
        payload.set('allowedLeave', formData.allowedLeave || '2 days/month');
        payload.set('joiningType', formData.joiningType || 'Immediate');
        payload.set('basicFacility', formData.basicFacility || 'Food Provided');
        payload.set('startDate', formData.startDate || '');
      } else if (serviceType === 'daily') {
        payload.set('dailyHiringPurpose', dailyHiringPurpose);
        payload.set('event', formData.event || 'House Party');
        payload.set('jobPosition', dailyStaffList[0]?.role || formData.jobPosition || 'Head Chef');
        
        const totalCount = dailyStaffList.reduce((acc, s) => acc + (parseInt(s.count, 10) || 1), 0);
        payload.set('packageOrGuestOrVacancy', totalCount.toString());
        payload.set('package', `₹${dailyStaffList[0]?.ratePerDay || 1500}/day`);
        payload.set('dateOfEvent', formData.dateOfEvent || new Date().toISOString());
        payload.set('servingTime', formData.servingTime || 'Dinner');
        payload.set('mealPreference', formData.mealPreference || 'Dinner');
        payload.set('foodPreference', formData.foodPreference || 'Both');
        payload.set('menuDetails', formData.menuDetails || '');

        const staffArr = dailyStaffList.map(s => ({
          role: s.role,
          count: parseInt(s.count, 10) || 1,
          ratePerDay: parseInt(s.ratePerDay, 10) || 1500,
          genderPref: s.genderPref || 'Any',
          days: parseInt(s.days, 10) || 1,
          startDate: formData.dateOfEvent || s.startDate || new Date().toISOString().split('T')[0],
          startTime: s.startTime || '16:00',
          endTime: s.endTime || '23:00'
        }));
        payload.set('staffRequirements', JSON.stringify(staffArr));
      } else if (serviceType === 'party') {
        payload.set('event', formData.event || 'House Party');
        payload.set('jobPosition', 'Party Chef');
        payload.set('noOfGuests', formData.noOfGuests || '15');
        payload.set('foodPreference', formData.foodPreference || 'Both');
        payload.set('servingTime', formData.servingTime || 'Dinner');
        payload.set('dateOfEvent', formData.dateOfEvent || new Date().toISOString());
        payload.set('cookingCategory', selectedCuisines.join(', '));
        payload.set('menuDetails', formData.menuDetails || '');

        const partyReq = {
          city: formData.city,
          datesCount: 1,
          vegGuests: parseInt(formData.vegGuests, 10) || 10,
          nonVegGuests: parseInt(formData.nonVegGuests, 10) || 5,
          selectedCuisines: selectedCuisines,
          menuDetails: formData.menuDetails
        };
        payload.set('partyRequirement', JSON.stringify(partyReq));
      }

      // Auto descriptions
      payload.set('overview', formData.overview.trim() || `Requirement for ${computedTitle}. Client: ${selectedCustomer.name}.`);
      payload.set('responsibilities', formData.responsibilities.trim() || `Handle cooking, meal preparation, hygiene and kitchen operations.`);
      payload.set('requirements', formData.requirements.trim() || `Experienced cook, punctual, professional and hygienic.`);

      if (jobImage) payload.append('image', jobImage);

      const response = await axios.post(`${apiUrl}/jobs`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast({
          title: 'Job Record Created!',
          description: `Job Code: ${response.data.job?.jobCode || 'Success'} has been posted.`,
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
        navigate('/jobs/list');
      }
    } catch (error) {
      toast({
        title: 'Error Creating Job',
        description: error.response?.data?.message || error.message || 'Failed to create job record.',
        status: 'error',
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const serviceOptions = [
    {
      id: 'hotel',
      title: 'Commercial Hiring',
      desc: 'Hotel, Restaurant, Cafe, etc.',
      icon: Building2,
      color: '#2563EB',
      bg: '#EFF6FF'
    },
    {
      id: 'home',
      title: 'Domestic Home Cook',
      desc: 'Full-time 10/24 hr, Part-time',
      icon: Home,
      color: '#E11D48',
      bg: '#FFF1F2'
    },
    {
      id: 'daily',
      title: 'Daily Basis Staff',
      desc: 'Daily / Short Term (ODC)',
      icon: Calendar,
      color: '#059669',
      bg: '#ECFDF5'
    },
    {
      id: 'party',
      title: 'Chef for Party',
      desc: 'Events & Special Occasion',
      icon: UtensilsCrossed,
      color: '#D97706',
      bg: '#FFFBEB'
    }
  ];

  return (
    <Box pb="12">
      <PageHeader
        title="Add Job Record"
        breadcrumb="Job Management > Add Job Record"
        actions={[
          <Button
            key="back"
            as={Link}
            to="/jobs/list"
            size="sm"
            bg={BRAND}
            color="white"
            borderRadius="lg"
            _hover={{ bg: '#003d91' }}
            fontSize="xs"
            px="4"
          >
            Back to List
          </Button>
        ]}
      />

      <form onSubmit={handleSubmit}>
        <VStack spacing="5" align="stretch">
          
          {/* STEP 1: SELECT CUSTOMER */}
          <TableCard p="6">
            <HStack spacing="3" mb="4">
              <Flex w="28px" h="28px" borderRadius="full" bg="#1e293b" color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
                1
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800" color="#0f172a">
                  Select Customer <Text as="span" color="red.500">*</Text>
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Choose an existing customer or search by mobile number to proceed.
                </Text>
              </Box>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5" mb="4">
              <Box>
                <FormLabel {...formLabelStyle}>Select Customer *</FormLabel>
                <Select
                  size="sm"
                  h="42px"
                  borderRadius="lg"
                  bg="#f8faff"
                  border="1.5px solid #dde6f5"
                  value={selectedCustomer?._id || ''}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  placeholder={isFetchingCustomers ? "Loading customers..." : "Search and select customer by name..."}
                >
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone || c.contactPhone || 'No Phone'}) - {c.city || 'N/A'}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <FormLabel {...formLabelStyle}>Search by Mobile Number *</FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement h="42px" pointerEvents="none">
                    <Phone size={16} color="#94a3b8" />
                  </InputLeftElement>
                  <Input
                    h="42px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    placeholder="Enter mobile number..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePhoneSearch(); } }}
                  />
                  <InputRightElement h="42px" w="4.5rem">
                    <Button
                      h="32px"
                      size="xs"
                      colorScheme="blue"
                      bg={BRAND}
                      borderRadius="md"
                      onClick={handlePhoneSearch}
                      isLoading={isSearchingPhone}
                    >
                      <Search size={14} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </SimpleGrid>

            {/* Selected Customer Card Preview */}
            {selectedCustomer && (
              <Flex
                p="4"
                bg="#f0fdf4"
                border="1.5px solid #bbf7d0"
                borderRadius="xl"
                align="center"
                justify="space-between"
                flexWrap="wrap"
                gap="4"
              >
                <HStack spacing="4">
                  <Flex
                    w="44px"
                    h="44px"
                    borderRadius="full"
                    bg="#22c55e"
                    color="white"
                    align="center"
                    justify="center"
                    fontWeight="800"
                    fontSize="sm"
                  >
                    {selectedCustomer.name?.substring(0, 2).toUpperCase() || 'CU'}
                  </Flex>
                  <Box>
                    <HStack spacing="2">
                      <Text fontWeight="800" fontSize="sm" color="#166534">
                        {selectedCustomer.name}
                      </Text>
                      <Badge colorScheme="green" fontSize="10px" borderRadius="full" px="2">Verified Customer</Badge>
                    </HStack>
                    <HStack spacing="4" mt="1" flexWrap="wrap" fontSize="xs" color="#334155">
                      <HStack spacing="1"><Phone size={12} color="#16a34a" /><Text>{selectedCustomer.phone || selectedCustomer.contactPhone || 'N/A'}</Text></HStack>
                      {selectedCustomer.email && <HStack spacing="1"><Mail size={12} color="#16a34a" /><Text>{selectedCustomer.email}</Text></HStack>}
                      {(selectedCustomer.city || selectedCustomer.state) && (
                        <HStack spacing="1"><MapPin size={12} color="#16a34a" /><Text>{selectedCustomer.city ? `${selectedCustomer.city}, ` : ''}{selectedCustomer.state || ''}</Text></HStack>
                      )}
                    </HStack>
                  </Box>
                </HStack>

                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<X size={13} />}
                  borderRadius="lg"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Remove
                </Button>
              </Flex>
            )}
          </TableCard>

          {/* STEP 2: SELECT SERVICE TYPE */}
          <TableCard p="6">
            <HStack spacing="3" mb="4">
              <Flex w="28px" h="28px" borderRadius="full" bg="#1e293b" color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
                2
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800" color="#0f172a">
                  Select Service Type <Text as="span" color="red.500">*</Text>
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Choose the type of service for this job requirement.
                </Text>
              </Box>
            </HStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="4">
              {serviceOptions.map((opt) => {
                const isSelected = serviceType === opt.id;
                const OptIcon = opt.icon;
                return (
                  <Box
                    key={opt.id}
                    as="button"
                    type="button"
                    onClick={() => setServiceType(opt.id)}
                    textAlign="left"
                    p="4"
                    borderRadius="xl"
                    border={isSelected ? `2px solid #1e293b` : '1.5px solid #e2e8f0'}
                    bg={isSelected ? '#f8faff' : 'white'}
                    boxShadow={isSelected ? `0 4px 14px rgba(0,0,0,0.06)` : 'none'}
                    transition="all 0.2s"
                    _hover={{ borderColor: '#1e293b', transform: 'translateY(-2px)' }}
                    position="relative"
                  >
                    <Flex justify="space-between" align="flex-start" mb="3">
                      <Flex w="38px" h="38px" borderRadius="lg" bg={opt.bg} align="center" justify="center" color={opt.color}>
                        <OptIcon size={20} />
                      </Flex>
                      {isSelected ? (
                        <CheckCircle2 size={20} color="#1e293b" />
                      ) : (
                        <Box w="18px" h="18px" borderRadius="full" border="2px solid #cbd5e1" />
                      )}
                    </Flex>
                    <Text fontWeight="800" fontSize="sm" color="#0f172a" mb="0.5">
                      {opt.title}
                    </Text>
                    <Text fontSize="11px" color="#64748b">
                      {opt.desc}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </TableCard>

          {/* STEP 3: REQUIREMENT DETAILS (DYNAMIC BY SERVICE TYPE) */}
          <TableCard p="6">
            <HStack spacing="3" mb="6">
              <Flex w="28px" h="28px" borderRadius="full" bg="#1e293b" color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
                3
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800" color="#0f172a">
                  Job Requirement Details
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Fill in the specific parameters for {serviceOptions.find(o => o.id === serviceType)?.title}.
                </Text>
              </Box>
            </HStack>

            {/* === 1. COMMERCIAL FORM (MATCHING USER SCREENSHOT EXACTLY) === */}
            {serviceType === 'hotel' && (
              <VStack spacing="5" align="stretch">
                
                {/* Row 1 */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>OUTLET / BUSINESS NAME *</FormLabel>
                    <Input
                      name="outletName"
                      value={formData.outletName}
                      onChange={handleChange}
                      placeholder="e.g. Royal Cafe / Grand Hotel"
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>PROPERTY CATEGORY *</FormLabel>
                    <Select
                      name="propertyCategory"
                      value={formData.propertyCategory}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Restaurant', 'Hotel', 'Cafe', 'Resort', 'Cloud Kitchen', 'Bar / Pub', 'Banquet Hall', 'Food Truck', 'Catering Outlet', 'Canteen'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>JOB POSITION / ROLE *</FormLabel>
                    <Select
                      name="jobPosition"
                      value={formData.jobPosition}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {[
                        'Head Chef/ Master Chef',
                        'Sous Chef',
                        'Executive Chef',
                        'North Indian Chef',
                        'South Indian Chef',
                        'Chinese Chef',
                        'Tandoor Chef',
                        'Continental Chef',
                        'Italian / Mexican Chef',
                        'Mughlai Chef',
                        'Bakery Chef',
                        'Sweets & Deserts Chef',
                        'Chat Experts Chef',
                        'All-Rounder Cook',
                        'Fast Food Cook',
                        'Commi 1 / Commi 2',
                        'Kitchen Helper / Commis 3',
                        'Dishwasher / Utility Staff',
                        'Captain / Service Supervisor',
                        'Waiter / Steward',
                        'Bartender',
                        'Manager',
                        'Housekeeping / Cleaning Staff'
                      ].map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Row 2 */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>NO. OF VACANCIES *</FormLabel>
                    <Input
                      name="packageOrGuestOrVacancy"
                      type="number"
                      min="1"
                      value={formData.packageOrGuestOrVacancy}
                      onChange={handleChange}
                      placeholder="1"
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SALARY BUDGET *</FormLabel>
                    <Select
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {salaryRanges.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>EXPERIENCE REQUIRED *</FormLabel>
                    <Select
                      name="experienceRange"
                      value={formData.experienceRange}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Fresher', '1-2 Years', '2-5 Years', '5-8 Years', '8+ Years'].map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Row 3 */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SHIFT / JOB TYPE *</FormLabel>
                    <Select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Full Time (10-12 hrs)', 'Part Time (4-6 hrs)', 'Night Shift', 'Rotational Shift'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>ALLOWED LEAVE *</FormLabel>
                    <Select
                      name="allowedLeave"
                      value={formData.allowedLeave}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['No Leave', '1 day/month', '2 days/month', '3 days/month', '4 days/month', '1 day/week', 'Custom'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>JOINING TIMELINE *</FormLabel>
                    <Select
                      name="joiningType"
                      value={formData.joiningType}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Immediate', 'Within 3 Days', 'Within 1 Week', 'Within 15 Days', 'Within 1 Month'].map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Row 4 */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>FACILITIES PROVIDED *</FormLabel>
                    <Select
                      name="basicFacility"
                      value={formData.basicFacility}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Food & Accommodation', 'Food Only', 'Accommodation Only', 'No Food or Accommodation'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel {...formLabelStyle}>OTHER PERKS / BENEFITS</FormLabel>
                    <Input
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleChange}
                      placeholder="e.g. Travel Allowance, Tips, PF & ESI, Overtime Pay"
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            )}

            {/* === 2. DOMESTIC HOME COOK FORM === */}
            {serviceType === 'home' && (
              <VStack spacing="5" align="stretch">
                
                {/* Cook Tier Selection Cards */}
                <Box>
                  <FormLabel {...formLabelStyle} mb="2">SELECT COOK LEVEL / EXPERIENCE *</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                    {cookLevels.map(lvl => {
                      const isLvlSelected = homeCookLevel === lvl.id;
                      return (
                        <Box
                          key={lvl.id}
                          as="button"
                          type="button"
                          onClick={() => setHomeCookLevel(lvl.id)}
                          textAlign="left"
                          p="4"
                          borderRadius="xl"
                          border={isLvlSelected ? `2px solid ${BRAND}` : '1.5px solid #e2e8f0'}
                          bg={isLvlSelected ? '#f8faff' : 'white'}
                          boxShadow={isLvlSelected ? `0 4px 12px ${BRAND}20` : 'none'}
                          transition="all 0.2s"
                        >
                          <Flex justify="space-between" align="center" mb="2">
                            <Text fontWeight="800" fontSize="sm" color="#0f172a">{lvl.name}</Text>
                            <Badge colorScheme="blue" borderRadius="full" px="2" fontSize="10px">{lvl.badge}</Badge>
                          </Flex>
                          <Text fontSize="xs" color="#64748b" mb="3">{lvl.desc}</Text>
                          <HStack spacing="1" fontSize="xs" fontWeight="700" color={BRAND}>
                            <Award size={14} />
                            <Text>{lvl.salary}</Text>
                          </HStack>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SHIFT / SERVICE DURATION *</FormLabel>
                    <Select
                      name="serviceDuration"
                      value={formData.serviceDuration}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['10 Hours', '24 Hours (Live-in)', 'Part-Time (Morning only)', 'Part-Time (Evening only)'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>FOOD PREFERENCE *</FormLabel>
                    <Select
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Vegetarian (Veg Only)', 'Non-Vegetarian', 'Both (Veg & Non-Veg)', 'Jain Food', 'Vegan'].map(fp => (
                        <option key={fp} value={fp}>{fp}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>COOK GENDER PREFERENCE *</FormLabel>
                    <Select
                      value={genderPreference}
                      onChange={(e) => setGenderPreference(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Any', 'Male Cook Only', 'Female Cook Only'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>NO. OF FAMILY MEMBERS *</FormLabel>
                    <Select
                      name="familyMembers"
                      value={formData.familyMembers}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['1-2 Members', '3-4 Members', '5-6 Members', '7+ Members'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>ALLOWED LEAVES *</FormLabel>
                    <Select
                      name="allowedLeave"
                      value={formData.allowedLeave}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['2 days/month', '4 days/month', 'Every Sunday Off', 'No Leave', 'Custom'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>EXPECTED START DATE *</FormLabel>
                    <Input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Cuisine Tags */}
                <Box>
                  <FormLabel {...formLabelStyle} mb="2">CUISINES / SPECIALTIES DESIRED</FormLabel>
                  <Wrap spacing="2">
                    {cuisineOptions.map(cuisine => {
                      const isCuisineSelected = selectedCuisines.includes(cuisine);
                      return (
                        <WrapItem key={cuisine}>
                          <Tag
                            size="md"
                            borderRadius="full"
                            variant={isCuisineSelected ? 'solid' : 'outline'}
                            colorScheme="blue"
                            cursor="pointer"
                            onClick={() => toggleCuisine(cuisine)}
                            px="3"
                            py="1.5"
                          >
                            {isCuisineSelected && <Check size={12} style={{ marginRight: 4 }} />}
                            {cuisine}
                          </Tag>
                        </WrapItem>
                      );
                    })}
                  </Wrap>
                </Box>
              </VStack>
            )}

            {/* === 3. DAILY BASIS STAFF (ODC) FORM === */}
            {serviceType === 'daily' && (
              <VStack spacing="5" align="stretch">
                
                {/* Purpose Selector */}
                <Box>
                  <FormLabel {...formLabelStyle} mb="2">HIRING PURPOSE *</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                    {[
                      { id: 'commercial', title: 'Commercial Hiring', desc: 'Hotels, Banquets, Restaurants & Catering Events', icon: Building2 },
                      { id: 'domestic', title: 'Domestic & Private Events', desc: 'Home Parties, Family Gatherings & House Functions', icon: Home }
                    ].map(pur => {
                      const isPurSelected = dailyHiringPurpose === pur.id;
                      const PurIcon = pur.icon;
                      return (
                        <Box
                          key={pur.id}
                          as="button"
                          type="button"
                          onClick={() => setDailyHiringPurpose(pur.id)}
                          textAlign="left"
                          p="4"
                          borderRadius="xl"
                          border={isPurSelected ? `2px solid ${BRAND}` : '1.5px solid #e2e8f0'}
                          bg={isPurSelected ? '#f8faff' : 'white'}
                          transition="all 0.2s"
                        >
                          <HStack spacing="3">
                            <Flex w="36px" h="36px" borderRadius="lg" bg="#ecfdf5" color="#059669" align="center" justify="center">
                              <PurIcon size={18} />
                            </Flex>
                            <Box>
                              <Text fontWeight="800" fontSize="sm" color="#0f172a">{pur.title}</Text>
                              <Text fontSize="xs" color="#64748b">{pur.desc}</Text>
                            </Box>
                          </HStack>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>EVENT / FUNCTION TYPE *</FormLabel>
                    <Select
                      name="event"
                      value={formData.event}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {occasionTypes.map(ev => (
                        <option key={ev} value={ev}>{ev}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>DATE OF EVENT / SHIFT *</FormLabel>
                    <Input
                      type="date"
                      name="dateOfEvent"
                      value={formData.dateOfEvent}
                      onChange={handleChange}
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SHIFT / SERVING TIMING *</FormLabel>
                    <Select
                      name="servingTime"
                      value={formData.servingTime}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Morning Shift (8 AM - 4 PM)', 'Evening Shift (4 PM - 11 PM)', 'Full Day (10 AM - 10 PM)', 'Night Shift'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Daily Staff Roster & Presets */}
                <Box p="4" bg="#f8fafc" border="1.5px solid #e2e8f0" borderRadius="xl">
                  <Flex justify="space-between" align="center" mb="3" flexWrap="wrap" gap="2">
                    <Box>
                      <Text fontWeight="800" fontSize="sm" color="#1e293b">
                        Staff Required (ODC Roster)
                      </Text>
                      <Text fontSize="xs" color="#64748b">
                        Add staff with fixed day-rates or choose quick presets below.
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      leftIcon={<Plus size={14} />}
                      bg={BRAND}
                      color="white"
                      _hover={{ bg: '#003d91' }}
                      onClick={() => handleAddDailyStaff('Waiter', 999)}
                    >
                      Add Custom Role
                    </Button>
                  </Flex>

                  {/* Preset Badges */}
                  <Wrap spacing="2" mb="4">
                    {dailyRolesPresets.map(preset => (
                      <WrapItem key={preset.role}>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="#cbd5e1"
                          bg="white"
                          fontSize="xs"
                          onClick={() => handleAddDailyStaff(preset.role, preset.rate)}
                          _hover={{ bg: '#f1f5f9', borderColor: BRAND }}
                        >
                          + {preset.role} (₹{preset.rate}/day)
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>

                  {/* Daily Staff List Rows */}
                  <VStack spacing="3" align="stretch">
                    {dailyStaffList.map((item) => (
                      <Flex
                        key={item.id}
                        p="3"
                        bg="white"
                        border="1px solid #e2e8f0"
                        borderRadius="lg"
                        gap="3"
                        align="center"
                        flexWrap="wrap"
                      >
                        <Box minW="180px" flex="1.5">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Staff Role</FormLabel>
                          <Input
                            size="sm"
                            h="36px"
                            value={item.role}
                            onChange={(e) => handleUpdateDailyStaff(item.id, 'role', e.target.value)}
                            placeholder="e.g. Head Chef, Waiter"
                          />
                        </Box>

                        <Box minW="130px" flex="1">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Rate/Day (₹)</FormLabel>
                          <Input
                            size="sm"
                            h="36px"
                            type="number"
                            value={item.ratePerDay}
                            onChange={(e) => handleUpdateDailyStaff(item.id, 'ratePerDay', parseInt(e.target.value, 10) || 0)}
                          />
                        </Box>

                        <Box minW="120px" flex="1">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Gender</FormLabel>
                          <Select
                            size="sm"
                            h="36px"
                            value={item.genderPref || 'Any'}
                            onChange={(e) => handleUpdateDailyStaff(item.id, 'genderPref', e.target.value)}
                          >
                            {['Any', 'Male', 'Female'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </Select>
                        </Box>

                        <Box w="120px">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Staff Count</FormLabel>
                          <HStack spacing="1">
                            <IconButton
                              size="xs"
                              icon={<Minus size={12} />}
                              onClick={() => handleUpdateDailyStaff(item.id, 'count', Math.max(1, item.count - 1))}
                            />
                            <Input
                              size="sm"
                              h="36px"
                              textAlign="center"
                              type="number"
                              min="1"
                              value={item.count}
                              onChange={(e) => handleUpdateDailyStaff(item.id, 'count', parseInt(e.target.value, 10) || 1)}
                            />
                            <IconButton
                              size="xs"
                              icon={<Plus size={12} />}
                              onClick={() => handleUpdateDailyStaff(item.id, 'count', item.count + 1)}
                            />
                          </HStack>
                        </Box>

                        <IconButton
                          size="sm"
                          mt="4"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Trash2 size={16} />}
                          onClick={() => handleRemoveDailyStaff(item.id)}
                          aria-label="Remove daily staff"
                        />
                      </Flex>
                    ))}
                  </VStack>

                  {/* Budget Counter */}
                  <Flex justify="flex-end" align="center" mt="3" pt="2" borderTop="1px dashed #cbd5e1" gap="3">
                    <Text fontSize="xs" color="#64748b">Estimated Daily Staff Cost:</Text>
                    <Badge colorScheme="green" fontSize="sm" px="3" py="1" borderRadius="md">
                      ₹{dailyStaffList.reduce((acc, s) => acc + (s.ratePerDay * s.count), 0).toLocaleString()} / Day
                    </Badge>
                  </Flex>
                </Box>

                <FormControl>
                  <FormLabel {...formLabelStyle}>MENU / WORK INSTRUCTIONS</FormLabel>
                  <Textarea
                    name="menuDetails"
                    value={formData.menuDetails}
                    onChange={handleChange}
                    placeholder="Enter dishes to prepare or duties..."
                    {...inputStyle}
                    minH="70px"
                  />
                </FormControl>
              </VStack>
            )}

            {/* === 4. CHEF FOR PARTY FORM === */}
            {serviceType === 'party' && (
              <VStack spacing="5" align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>EVENT / OCCASION TYPE *</FormLabel>
                    <Select
                      name="event"
                      value={formData.event}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {occasionTypes.map(ev => (
                        <option key={ev} value={ev}>{ev}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>DATE OF PARTY *</FormLabel>
                    <Input
                      type="date"
                      name="dateOfEvent"
                      value={formData.dateOfEvent}
                      onChange={handleChange}
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SERVING MEAL / TIME *</FormLabel>
                    <Select
                      name="servingTime"
                      value={formData.servingTime}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Dinner', 'Lunch', 'High Tea / Snacks', 'Breakfast', 'Full Day Party'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>TOTAL NUMBER OF GUESTS *</FormLabel>
                    <Input
                      name="noOfGuests"
                      type="number"
                      value={formData.noOfGuests}
                      onChange={handleChange}
                      placeholder="15"
                      {...inputStyle}
                      h="42px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>FOOD PREFERENCE *</FormLabel>
                    <Select
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleChange}
                      {...selectStyle}
                      h="42px"
                    >
                      {['Both (Veg & Non-Veg)', 'Vegetarian (Veg Only)', 'Non-Vegetarian', 'Jain Food'].map(fp => (
                        <option key={fp} value={fp}>{fp}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel {...formLabelStyle}>VEG / NON-VEG BREAKDOWN</FormLabel>
                    <HStack spacing="2">
                      <Input
                        placeholder="Veg: 10"
                        name="vegGuests"
                        value={formData.vegGuests}
                        onChange={handleChange}
                        {...inputStyle}
                        h="42px"
                      />
                      <Input
                        placeholder="Non-Veg: 5"
                        name="nonVegGuests"
                        value={formData.nonVegGuests}
                        onChange={handleChange}
                        {...inputStyle}
                        h="42px"
                      />
                    </HStack>
                  </FormControl>
                </SimpleGrid>

                {/* Cuisine Tags Selector */}
                <Box>
                  <FormLabel {...formLabelStyle} mb="2">CUISINES FOR PARTY MENU</FormLabel>
                  <Wrap spacing="2">
                    {cuisineOptions.map(cuisine => {
                      const isCuisineSelected = selectedCuisines.includes(cuisine);
                      return (
                        <WrapItem key={cuisine}>
                          <Tag
                            size="md"
                            borderRadius="full"
                            variant={isCuisineSelected ? 'solid' : 'outline'}
                            colorScheme="orange"
                            cursor="pointer"
                            onClick={() => toggleCuisine(cuisine)}
                            px="3"
                            py="1.5"
                          >
                            {isCuisineSelected && <Check size={12} style={{ marginRight: 4 }} />}
                            {cuisine}
                          </Tag>
                        </WrapItem>
                      );
                    })}
                  </Wrap>
                </Box>

                <FormControl>
                  <FormLabel {...formLabelStyle}>SELECTED MENU / SPECIAL DISHES</FormLabel>
                  <Textarea
                    name="menuDetails"
                    value={formData.menuDetails}
                    onChange={handleChange}
                    placeholder="e.g. Paneer Butter Masala, Dal Makhani, Chicken Biryani, Butter Naan, Gulab Jamun"
                    {...inputStyle}
                    minH="80px"
                  />
                </FormControl>
              </VStack>
            )}

            <Divider borderColor="#f1f5f9" my="6" />

            {/* LOCATION & ADDRESS SECTION */}
            <HStack spacing="3" mb="4">
              <Flex w="28px" h="28px" borderRadius="full" bg="#1e293b" color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
                4
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800" color="#0f172a">
                  Location &amp; Job Address
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Specify work location state, city and complete address.
                </Text>
              </Box>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="4">
              <FormControl isRequired>
                <FormLabel {...formLabelStyle}>STATE *</FormLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  {...selectStyle}
                  h="42px"
                >
                  {ALL_INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel {...formLabelStyle}>CITY / DISTRICT *</FormLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  {...selectStyle}
                  h="42px"
                >
                  {currentDistricts.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyle}>FULL ADDRESS / LANDMARK</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address / locality"
                  {...inputStyle}
                  h="42px"
                />
              </FormControl>
            </SimpleGrid>

            {/* STATUS & LEAD MANAGER SECTION */}
            <Divider borderColor="#f1f5f9" my="6" />
            <HStack spacing="3" mb="4">
              <Flex w="28px" h="28px" borderRadius="full" bg="#1e293b" color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
                5
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="800" color="#0f172a">
                  Admin &amp; Assignment
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Assign Lead Manager and initial status.
                </Text>
              </Box>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="4">
              <FormControl isRequired>
                <FormLabel {...formLabelStyle}>INITIAL JOB STATUS *</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  {...selectStyle}
                  h="42px"
                >
                  {['New', 'Active', 'Urgent', 'In Progress', 'Hold'].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyle}>ASSIGN LEAD MANAGER</FormLabel>
                <Select
                  name="leadManager"
                  value={formData.leadManager}
                  onChange={handleChange}
                  {...selectStyle}
                  h="42px"
                  placeholder="Auto-assign or Select Manager"
                >
                  {managers.map(mgr => (
                    <option key={mgr._id} value={mgr.name}>{mgr.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...formLabelStyle}>BANNER / JOB IMAGE (OPTIONAL)</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  p="1"
                  {...inputStyle}
                  h="42px"
                />
              </FormControl>
            </SimpleGrid>

            {/* ACTION BUTTONS */}
            <Flex justify="flex-end" gap="3" mt="6" pt="4" borderTop="1px solid #f1f5f9">
              <Button
                variant="outline"
                borderColor="#dde6f5"
                color="#64748b"
                borderRadius="lg"
                size="md"
                leftIcon={<RotateCcw size={16} />}
                onClick={() => {
                  setSelectedCustomer(null);
                  setSearchPhone('');
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                loadingText="Creating Job..."
                bg={BRAND}
                color="white"
                borderRadius="lg"
                size="md"
                px="8"
                leftIcon={<Send size={16} />}
                _hover={{ bg: '#003d91' }}
                boxShadow={`0 4px 14px ${BRAND}40`}
              >
                Create Job Record
              </Button>
            </Flex>
          </TableCard>

        </VStack>
      </form>
    </Box>
  );
};

export default AddJob;
