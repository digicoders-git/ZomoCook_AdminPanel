import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, SimpleGrid, FormControl, FormLabel,
  Input, Select, Textarea, Button, Badge, Icon, Spinner, useToast,
  Divider, InputGroup, InputLeftElement, InputRightElement, Image
} from '@chakra-ui/react';
import {
  Building2, Home, Calendar, UtensilsCrossed, Plus, RotateCcw,
  CheckCircle2, Search, User, Phone, Mail, MapPin, X, ArrowRight,
  Briefcase, ShieldCheck, Upload, Sparkles, Send
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PageHeader, TableCard, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import { INDIA_STATES_AND_DISTRICTS, ALL_INDIAN_STATES } from '../utils/indiaData';

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

  // Master Data
  const [masters, setMasters] = useState({
    jobPositions: [],
    propertyCategories: [],
    facilities: [],
    experienceRanges: [],
    salaryRanges: [],
    joiningTypes: [],
    events: [],
    cookingCategories: [],
    foodPreferences: []
  });

  // Main Form Data
  const [formData, setFormData] = useState({
    title: '',
    outletName: '',
    propertyCategory: 'Restaurant',
    jobPosition: 'Head Chef/ Master Chef',
    jobType: 'Full Time',
    packageOrGuestOrVacancy: '1',
    salaryRange: '₹20,000 - ₹30,000',
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

  const fetchMasterData = async (category, key) => {
    try {
      const response = await axios.get(`${apiUrl}/masters/${category}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success && Array.isArray(response.data.masters)) {
        setMasters(prev => ({ ...prev, [key]: response.data.masters }));
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    }
  };

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

        fetchMasterData('job-positions', 'jobPositions');
        fetchMasterData('property-categories', 'propertyCategories');
        fetchMasterData('facilities', 'facilities');
        fetchMasterData('experiences', 'experienceRanges');
        fetchMasterData('salaries', 'salaryRanges');
        fetchMasterData('joining-types', 'joiningTypes');
        fetchMasterData('events', 'events');
        fetchMasterData('cooking-categories', 'cookingCategories');
        fetchMasterData('cooking-preferences', 'foodPreferences');
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
      if (cust.state) setFormData(prev => ({ ...prev, state: cust.state, city: cust.city || prev.city, address: cust.address || cust.contactAddress || prev.address }));
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
      if (found.state) setFormData(prev => ({ ...prev, state: found.state, city: found.city || prev.city, address: found.address || found.contactAddress || prev.address }));
      toast({ title: 'Customer Found', description: `Selected ${found.name}`, status: 'success', duration: 2000 });
    } else {
      toast({
        title: 'Customer Not Found',
        description: 'No registered customer with this phone number. Please select from the dropdown or register a customer first.',
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

  // Helper to construct sensible titles
  const getAutoTitle = () => {
    if (serviceType === 'hotel') {
      return `${formData.jobPosition || 'Chef'} for ${formData.outletName || formData.propertyCategory || 'Commercial Outlet'} in ${formData.city}`;
    } else if (serviceType === 'home') {
      return `${formData.jobType || 'Domestic Cook'} (${formData.foodPreference || 'Veg'}) in ${formData.city}`;
    } else if (serviceType === 'daily') {
      return `Daily Basis ${formData.jobPosition || 'Staff'} for ${formData.event || 'Event'} in ${formData.city}`;
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
        payload.set('jobPosition', formData.jobPosition || 'Chef');
        payload.set('jobType', formData.jobType || 'Full Time');
        payload.set('packageOrGuestOrVacancy', formData.packageOrGuestOrVacancy || '1');
        payload.set('salaryRange', formData.salaryRange || '');
        payload.set('experienceRange', formData.experienceRange || '');
        payload.set('allowedLeave', formData.allowedLeave || '');
        payload.set('joiningType', formData.joiningType || 'Immediate');
        payload.set('basicFacility', formData.basicFacility || '');
        payload.set('otherFacilities', formData.otherFacilities || '');
        payload.set('benefits', formData.benefits || '');
      } else if (serviceType === 'home') {
        payload.set('hiringPurpose', 'domestic');
        payload.set('jobPosition', 'Domestic Cook');
        payload.set('jobType', formData.jobType || '10 Hours');
        payload.set('foodPreference', formData.foodPreference || 'Vegetarian');
        payload.set('cookingCategory', formData.cookingCategory || 'North Indian');
        payload.set('packageOrGuestOrVacancy', formData.packageOrGuestOrVacancy || '3-4 People');
        payload.set('noOfGuests', formData.packageOrGuestOrVacancy || '3-4 People');
        payload.set('salaryRange', formData.salaryRange || '');
        payload.set('allowedLeave', formData.allowedLeave || '');
        payload.set('joiningType', formData.joiningType || 'Immediate');
        payload.set('basicFacility', formData.basicFacility || '');
      } else if (serviceType === 'daily') {
        payload.set('event', formData.event || 'House Party');
        payload.set('jobPosition', formData.jobPosition || 'Head Chef');
        payload.set('packageOrGuestOrVacancy', formData.packageOrGuestOrVacancy || '1');
        payload.set('package', formData.ratePerDay ? `₹${formData.ratePerDay}/day` : '₹1500/day');
        payload.set('dateOfEvent', formData.dateOfEvent || new Date().toISOString());
        payload.set('servingTime', formData.servingTime || 'Dinner');
        payload.set('mealPreference', formData.mealPreference || 'Dinner');
        payload.set('foodPreference', formData.foodPreference || 'Both');
        payload.set('menuDetails', formData.menuDetails || '');

        // Structure staffRequirements array for ODC
        const staffArr = [{
          role: formData.jobPosition || 'Head Chef',
          count: parseInt(formData.packageOrGuestOrVacancy, 10) || 1,
          ratePerDay: parseInt(formData.ratePerDay, 10) || 1500,
          days: 1,
          startDate: formData.dateOfEvent || new Date().toISOString().split('T')[0],
          startTime: formData.servingTime === 'Morning' ? '08:00' : '16:00',
          endTime: formData.servingTime === 'Morning' ? '16:00' : '23:00'
        }];
        payload.set('staffRequirements', JSON.stringify(staffArr));
      } else if (serviceType === 'party') {
        payload.set('event', formData.event || 'House Party');
        payload.set('jobPosition', 'Party Chef');
        payload.set('noOfGuests', formData.noOfGuests || '15');
        payload.set('foodPreference', formData.foodPreference || 'Both');
        payload.set('servingTime', formData.servingTime || 'Dinner');
        payload.set('dateOfEvent', formData.dateOfEvent || new Date().toISOString());
        payload.set('menuDetails', formData.menuDetails || '');

        const partyReq = {
          city: formData.city,
          datesCount: 1,
          vegGuests: parseInt(formData.vegGuests, 10) || 10,
          nonVegGuests: parseInt(formData.nonVegGuests, 10) || 5,
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
              <Flex w="28px" h="28px" borderRadius="full" bg={BRAND} color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
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
                <FormLabel {...labelStyle}>Select Customer *</FormLabel>
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
                <FormLabel {...labelStyle}>Search by Mobile Number *</FormLabel>
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
              <Flex w="28px" h="28px" borderRadius="full" bg={BRAND} color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
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
                    border={isSelected ? `2px solid ${BRAND}` : '1.5px solid #e2e8f0'}
                    bg={isSelected ? '#f8faff' : 'white'}
                    boxShadow={isSelected ? `0 4px 14px ${BRAND}20` : 'none'}
                    transition="all 0.2s"
                    _hover={{ borderColor: BRAND, transform: 'translateY(-2px)' }}
                    position="relative"
                  >
                    <Flex justify="space-between" align="flex-start" mb="3">
                      <Flex w="38px" h="38px" borderRadius="lg" bg={opt.bg} align="center" justify="center" color={opt.color}>
                        <OptIcon size={20} />
                      </Flex>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={BRAND} />
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
              <Flex w="28px" h="28px" borderRadius="full" bg={BRAND} color="white" align="center" justify="center" fontWeight="bold" fontSize="xs">
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

            {/* === COMMERCIAL FORM === */}
            {serviceType === 'hotel' && (
              <VStack spacing="5" align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Outlet / Business Name</FormLabel>
                    <Input
                      name="outletName"
                      value={formData.outletName}
                      onChange={handleChange}
                      placeholder="e.g. Royal Cafe / Grand Hotel"
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Property Category</FormLabel>
                    <Select
                      name="propertyCategory"
                      value={formData.propertyCategory}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Restaurant', 'Hotel', 'Cafe', 'Resort', 'Cloud Kitchen', 'Bar / Pub', 'Banquet Hall', 'Food Truck', 'Catering Outlet', 'Canteen'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Job Position / Role</FormLabel>
                    <Select
                      name="jobPosition"
                      value={formData.jobPosition}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {[
                        'Head Chef/ Master Chef',
                        'Sous Chef',
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
                        'Multicuisine Chef',
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

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>No. of Vacancies</FormLabel>
                    <Input
                      name="packageOrGuestOrVacancy"
                      type="number"
                      min="1"
                      value={formData.packageOrGuestOrVacancy}
                      onChange={handleChange}
                      placeholder="1"
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Salary Budget</FormLabel>
                    <Select
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {[
                        '₹12,000 - ₹15,000',
                        '₹15,000 - ₹20,000',
                        '₹20,000 - ₹25,000',
                        '₹25,000 - ₹35,000',
                        '₹35,000 - ₹50,000',
                        '₹50,000 - ₹75,000',
                        '₹75,000+'
                      ].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Experience Required</FormLabel>
                    <Select
                      name="experienceRange"
                      value={formData.experienceRange}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Fresher', '1-2 Years', '2-5 Years', '5-8 Years', '8+ Years'].map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Shift / Job Type</FormLabel>
                    <Select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Full Time (10-12 hrs)', 'Part Time (4-6 hrs)', 'Night Shift', 'Rotational Shift'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Allowed Leave</FormLabel>
                    <Select
                      name="allowedLeave"
                      value={formData.allowedLeave}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['No Leave', '1 day/month', '2 days/month', '3 days/month', '4 days/month', '1 day/week', 'Custom'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Joining Timeline</FormLabel>
                    <Select
                      name="joiningType"
                      value={formData.joiningType}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Immediate', 'Within 3 Days', 'Within 1 Week', 'Within 15 Days', 'Within 1 Month'].map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Facilities Provided</FormLabel>
                    <Select
                      name="basicFacility"
                      value={formData.basicFacility}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Food & Accommodation', 'Food Only', 'Accommodation Only', 'No Food or Accommodation'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel {...labelStyle}>Other Perks / Benefits</FormLabel>
                    <Input
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleChange}
                      placeholder="e.g. Travel Allowance, Tips, PF & ESI, Overtime Pay"
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            )}

            {/* === DOMESTIC HOME COOK FORM === */}
            {serviceType === 'home' && (
              <VStack spacing="5" align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Shift / Service Duration</FormLabel>
                    <Select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['10 Hours', '12 Hours', '24 Hours Live-In', 'Part-Time (Morning only)', 'Part-Time (Evening only)'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Food Preference</FormLabel>
                    <Select
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {[
                        'Vegetarian (Veg Only)',
                        'Non-Vegetarian',
                        'Both (Veg & Non-Veg)',
                        'Jain Food',
                        'Eggetarian',
                        'Vegan'
                      ].map(fp => <option key={fp} value={fp}>{fp}</option>)}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Primary Cooking Cuisine</FormLabel>
                    <Select
                      name="cookingCategory"
                      value={formData.cookingCategory}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Mughlai', 'Bakery / Sweets', 'Diet / Healthy Food', 'Multicuisine'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>No. of Family Members</FormLabel>
                    <Select
                      name="packageOrGuestOrVacancy"
                      value={formData.packageOrGuestOrVacancy}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['1-2 People', '3-4 People', '5-6 People', '7+ People'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Monthly Salary Budget</FormLabel>
                    <Select
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['₹8,000 - ₹12,000', '₹12,000 - ₹16,000', '₹16,000 - ₹22,000', '₹22,000 - ₹30,000', '₹30,000+'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Allowed Leaves</FormLabel>
                    <Select
                      name="allowedLeave"
                      value={formData.allowedLeave}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['2 days/month', '4 days/month', 'Every Sunday Off', 'No Leave', 'Custom'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Facilities / Food</FormLabel>
                    <Select
                      name="basicFacility"
                      value={formData.basicFacility}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Food Provided', 'Food & Room (for 24 hr Live-in)', 'No Food'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Joining Timeline</FormLabel>
                    <Select
                      name="joiningType"
                      value={formData.joiningType}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Immediate', 'Within 3 Days', 'Within 1 Week'].map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            )}

            {/* === DAILY BASIS STAFF (ODC) FORM === */}
            {serviceType === 'daily' && (
              <VStack spacing="5" align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Event / Function Type</FormLabel>
                    <Select
                      name="event"
                      value={formData.event}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['House Party', 'Wedding Function', 'Catering Service', 'Corporate Event', 'Restaurant Urgent Cover', 'Festival Gathering'].map(ev => (
                        <option key={ev} value={ev}>{ev}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Staff Role Needed</FormLabel>
                    <Select
                      name="jobPosition"
                      value={formData.jobPosition}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {[
                        'Head Chef',
                        'Assistant Cook',
                        'Halwai / Sweets Chef',
                        'Tandoori Chef',
                        'Waiter / Steward',
                        'Bartender',
                        'Kitchen Helper / Cleaner'
                      ].map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Number of Staff</FormLabel>
                    <Input
                      name="packageOrGuestOrVacancy"
                      type="number"
                      min="1"
                      value={formData.packageOrGuestOrVacancy}
                      onChange={handleChange}
                      placeholder="1"
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Date of Event / Shift</FormLabel>
                    <Input
                      type="date"
                      name="dateOfEvent"
                      value={formData.dateOfEvent}
                      onChange={handleChange}
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Shift / Serving Time</FormLabel>
                    <Select
                      name="servingTime"
                      value={formData.servingTime}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Morning Shift (8 AM - 4 PM)', 'Evening Shift (4 PM - 11 PM)', 'Full Day (10 AM - 10 PM)', 'Night Shift'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Rate Per Day (₹/Staff)</FormLabel>
                    <Input
                      name="ratePerDay"
                      type="number"
                      value={formData.ratePerDay}
                      onChange={handleChange}
                      placeholder="1500"
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel {...labelStyle}>Menu / Work Instructions</FormLabel>
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

            {/* === CHEF FOR PARTY FORM === */}
            {serviceType === 'party' && (
              <VStack spacing="5" align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Event Type</FormLabel>
                    <Select
                      name="event"
                      value={formData.event}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['House Party', 'Birthday Party', 'Anniversary Celebration', 'Kitty Party', 'Cocktail Party', 'Corporate Gathering', 'Festive Event'].map(ev => (
                        <option key={ev} value={ev}>{ev}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Total Number of Guests</FormLabel>
                    <Input
                      name="noOfGuests"
                      type="number"
                      value={formData.noOfGuests}
                      onChange={handleChange}
                      placeholder="15"
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Food Preference</FormLabel>
                    <Select
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Both (Veg & Non-Veg)', 'Vegetarian (Veg Only)', 'Non-Vegetarian', 'Jain Food'].map(fp => (
                        <option key={fp} value={fp}>{fp}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Date of Party</FormLabel>
                    <Input
                      type="date"
                      name="dateOfEvent"
                      value={formData.dateOfEvent}
                      onChange={handleChange}
                      {...inputStyle}
                      h="40px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Serving Time / Meal</FormLabel>
                    <Select
                      name="servingTime"
                      value={formData.servingTime}
                      onChange={handleChange}
                      {...selectStyle}
                      h="40px"
                    >
                      {['Dinner', 'Lunch', 'High Tea / Snacks', 'Breakfast', 'Full Day Party'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel {...labelStyle}>Veg / Non-Veg Breakdown</FormLabel>
                    <HStack spacing="2">
                      <Input
                        placeholder="Veg: 10"
                        name="vegGuests"
                        value={formData.vegGuests}
                        onChange={handleChange}
                        {...inputStyle}
                        h="40px"
                      />
                      <Input
                        placeholder="Non-Veg: 5"
                        name="nonVegGuests"
                        value={formData.nonVegGuests}
                        onChange={handleChange}
                        {...inputStyle}
                        h="40px"
                      />
                    </HStack>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel {...labelStyle}>Selected Menu / Special Dishes</FormLabel>
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
            <Text fontSize="sm" fontWeight="700" color="#1e293b" mb="3">
              Location & Job Address
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="4">
              <FormControl isRequired>
                <FormLabel {...labelStyle}>State</FormLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  {...selectStyle}
                  h="40px"
                >
                  {ALL_INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel {...labelStyle}>City / District</FormLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  {...selectStyle}
                  h="40px"
                >
                  {currentDistricts.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Full Address / Landmark</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address / locality"
                  {...inputStyle}
                  h="40px"
                />
              </FormControl>
            </SimpleGrid>

            {/* STATUS & LEAD MANAGER SECTION */}
            <Divider borderColor="#f1f5f9" my="6" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b" mb="3">
              Admin & Assignment
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="4">
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Initial Job Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  {...selectStyle}
                  h="40px"
                >
                  {['New', 'Active', 'Urgent', 'In Progress', 'Hold'].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Assign Lead Manager</FormLabel>
                <Select
                  name="leadManager"
                  value={formData.leadManager}
                  onChange={handleChange}
                  {...selectStyle}
                  h="40px"
                  placeholder="Auto-assign or Select Manager"
                >
                  {managers.map(mgr => (
                    <option key={mgr._id} value={mgr.name}>{mgr.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Banner / Job Image (Optional)</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  p="1"
                  {...inputStyle}
                  h="40px"
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
