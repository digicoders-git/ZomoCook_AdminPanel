import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, SimpleGrid, FormControl, FormLabel,
  Input, Select, Textarea, Button, Badge, Icon, Spinner, useToast,
  Divider, InputGroup, InputLeftElement, InputRightElement, Image, IconButton,
  Tag, Wrap, WrapItem, Checkbox
} from '@chakra-ui/react';
import {
  Building2, Home as HomeIcon, Calendar, UtensilsCrossed, Plus, RotateCcw,
  CheckCircle2, Search, User, Phone, Mail, MapPin, X, ArrowRight, ArrowLeft,
  Briefcase, ShieldCheck, Upload, Sparkles, Send, Trash2, Minus, Users,
  Clock, DollarSign, Award, Check, ChevronRight, FileText
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PageHeader, TableCard, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import { INDIA_STATES_AND_DISTRICTS, ALL_INDIAN_STATES } from '../utils/indiaData';

// Constants matching website modal HotelStaffHiringModal.tsx
export const commercialServiceCategories = [
  'Kitchen Staff',
  'Service Staff',
  'Housekeeping Staff',
  'Management Staff',
  'Utility / Other Staff'
];

export const commercialStaffCategoriesMap = {
  'Kitchen Staff': [
    'Head Chef / Master Chef',
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

export const salaryRanges = [
  '₹10,000 - ₹15,000',
  '₹12,000 - ₹15,000',
  '₹15,000 - ₹20,000',
  '₹20,000 - ₹25,000',
  '₹25,000 - ₹35,000',
  '₹35,000 - ₹50,000',
  '₹50,000 - ₹75,000',
  '₹75,000+'
];

export const cookLevels = [
  { id: 'basic', name: 'Basic Cook', desc: 'Simple home-made food with good experience.', salary: '₹15,000 – ₹18,000/month', badge: '₹15K – ₹18K/mo' },
  { id: 'standard', name: 'Standard Cook', desc: 'Multi-cuisine cooking with highly experienced staff.', salary: '₹20,000 – ₹25,000/month', badge: '₹20K – ₹25K/mo' },
  { id: 'premium', name: 'Premium Chef', desc: 'Expert multi-cuisine private chef with high experience.', salary: '₹30,000+/month', badge: '₹30K+/mo' }
];

export const dailyRolesPresets = [
  { role: 'Waiter', rate: 999 },
  { role: 'Captain / Supervisor', rate: 1499 },
  { role: 'Bartender', rate: 1799 },
  { role: 'Kitchen Helper', rate: 899 },
  { role: 'All-Rounder Cook', rate: 1999 },
  { role: 'Tandoor / Chinese Chef', rate: 2499 },
  { role: 'Head Chef', rate: 3499 }
];

export const occasionTypes = [
  'Birthday Party',
  'Anniversary',
  'Wedding',
  'Engagement',
  'Corporate Event',
  'House Party',
  'Festival',
  'Other'
];

export const cuisineOptions = [
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

  // Stepper State: 1 = Basic Details, 2 = Staff Requirement, 3 = Booking Summary, 4 = Admin & Assignment
  const [step, setStep] = useState(1);

  // Active Service Tab: 'commercial' | 'homecook' | 'daily' | 'party'
  const [activeTab, setActiveTab] = useState('commercial');

  // Customer Selection State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  // Common Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [city, setCity] = useState('Lucknow');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');

  // 1. Commercial State
  const [commercialStaffList, setCommercialStaffList] = useState([
    {
      id: '1',
      serviceCategory: 'Kitchen Staff',
      staffCategory: 'Head Chef / Master Chef',
      salaryRange: '₹25,000 - ₹35,000',
      noOfStaff: 1
    }
  ]);
  const [commercialPropertyCategory, setCommercialPropertyCategory] = useState('Restaurant');
  const [commercialShiftType, setCommercialShiftType] = useState('Full Time (10-12 hrs)');
  const [commercialExperience, setCommercialExperience] = useState('2-5 Years');
  const [commercialAllowedLeave, setCommercialAllowedLeave] = useState('2 days/month');
  const [commercialJoiningTimeline, setCommercialJoiningTimeline] = useState('Immediate');
  const [commercialBasicFacility, setCommercialBasicFacility] = useState('Food & Accommodation');
  const [commercialPerks, setCommercialPerks] = useState('');
  const [commercialFacilities, setCommercialFacilities] = useState({
    food: true,
    accommodation: true,
    pf: false,
    esi: false,
    uniform: false
  });

  // 2. Domestic Home Cook State
  const [homeCookLevel, setHomeCookLevel] = useState('standard');
  const [homeFoodPref, setHomeFoodPref] = useState('Both Veg & Non-Veg');
  const [homeGenderPref, setHomeGenderPref] = useState('Any Gender');
  const [homeDuration, setHomeDuration] = useState('10 Hours');
  const [homeFamilyMembers, setHomeFamilyMembers] = useState('3-4 Members');
  const [homeStartDate, setHomeStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [homeAllowedLeave, setHomeAllowedLeave] = useState('2 days/month');
  const [homeFacilities, setHomeFacilities] = useState('Food Provided');
  const [selectedCuisines, setSelectedCuisines] = useState(['North Indian']);

  // 3. Daily Staff State
  const [dailyHiringPurpose, setDailyHiringPurpose] = useState('commercial'); // 'commercial' | 'domestic'
  const [dailyEventType, setDailyEventType] = useState('House Party');
  const [dailyShiftTiming, setDailyShiftTiming] = useState('Evening Shift (4 PM - 11 PM)');
  const [dailyEventDate, setDailyEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStaffList, setDailyStaffList] = useState([
    {
      id: '1',
      role: 'Head Chef',
      genderPref: 'Any Gender',
      count: 1,
      ratePerDay: 3499,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '23:00',
      days: 1
    }
  ]);
  const [dailyWorkInstructions, setDailyWorkInstructions] = useState('');

  // 4. Chef for Party State
  const [partyOccasion, setPartyOccasion] = useState('Birthday Party');
  const [partyDate, setPartyDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyServingMeal, setPartyServingMeal] = useState('Dinner');
  const [partyTotalGuests, setPartyTotalGuests] = useState(20);
  const [partyVegGuests, setPartyVegGuests] = useState(15);
  const [partyNonVegGuests, setPartyNonVegGuests] = useState(5);
  const [partyFoodPref, setPartyFoodPref] = useState('Both (Veg & Non-Veg)');
  const [partyMenuDetails, setPartyMenuDetails] = useState('');
  const [partySelectedCuisines, setPartySelectedCuisines] = useState(['North Indian', 'Starters & Tandoor']);

  // Admin Assignment & Status
  const [jobTitle, setJobTitle] = useState('');
  const [jobStatus, setJobStatus] = useState('New');
  const [leadManager, setLeadManager] = useState('');
  const [jobImage, setJobImage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Indian Districts
  const currentDistricts = INDIA_STATES_AND_DISTRICTS[state] || [];

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
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setBusinessName('');
      return;
    }
    const cust = customers.find(c => c._id === customerId);
    if (cust) {
      setSelectedCustomer(cust);
      setName(cust.name || '');
      setPhone(cust.phone || cust.contactPhone || '');
      setEmail(cust.email || '');
      if (cust.state) setState(cust.state);
      if (cust.city) setCity(cust.city);
      setAddress(cust.address || cust.contactAddress || '');
      setBusinessName(cust.businessName || cust.outletName || '');
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
      handleCustomerSelect(found._id);
      toast({ title: 'Customer Found', description: `Selected ${found.name}`, status: 'success', duration: 2000 });
    } else {
      toast({
        title: 'Customer Not Found',
        description: 'No registered customer with this phone number. You can select from the dropdown or register a customer first.',
        status: 'warning',
        duration: 3500
      });
    }
    setIsSearchingPhone(false);
  };

  const handleStateChange = (newState) => {
    setState(newState);
    const districts = INDIA_STATES_AND_DISTRICTS[newState] || [];
    if (districts.length > 0) {
      setCity(districts[0]);
    }
  };

  // Helper for Commercial Staff
  const addCommercialStaffRow = () => {
    setCommercialStaffList(prev => [
      ...prev,
      {
        id: String(Date.now()),
        serviceCategory: 'Kitchen Staff',
        staffCategory: 'Head Chef / Master Chef',
        salaryRange: '₹20,000 - ₹25,000',
        noOfStaff: 1
      }
    ]);
  };

  const updateCommercialStaffRow = (id, field, value) => {
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

  const removeCommercialStaffRow = (id) => {
    if (commercialStaffList.length <= 1) {
      toast({ title: 'At least one staff requirement is required', status: 'info', duration: 2000 });
      return;
    }
    setCommercialStaffList(prev => prev.filter(item => item.id !== id));
  };

  // Helper for Daily Staff
  const addDailyStaffRow = (presetRole = 'Waiter', presetRate = 999) => {
    setDailyStaffList(prev => [
      ...prev,
      {
        id: String(Date.now()),
        role: presetRole,
        genderPref: 'Any Gender',
        count: 1,
        ratePerDay: presetRate,
        startDate: dailyEventDate,
        startTime: '16:00',
        endTime: '23:00',
        days: 1
      }
    ]);
  };

  const updateDailyStaffRow = (id, field, value) => {
    setDailyStaffList(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'role') {
          const match = dailyRolesPresets.find(r => r.role === value);
          if (match) updated.ratePerDay = match.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeDailyStaffRow = (id) => {
    if (dailyStaffList.length <= 1) {
      toast({ title: 'At least one staff role is required', status: 'info', duration: 2000 });
      return;
    }
    setDailyStaffList(prev => prev.filter(item => item.id !== id));
  };

  const toggleHomeCuisine = (cuisine) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const togglePartyCuisine = (cuisine) => {
    setPartySelectedCuisines(prev => 
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  // Auto generated job title
  const getAutoTitle = () => {
    if (jobTitle.trim()) return jobTitle.trim();
    if (activeTab === 'commercial') {
      const primaryRole = commercialStaffList[0]?.staffCategory || 'Commercial Staff';
      return `${primaryRole} for ${businessName || commercialPropertyCategory} in ${city}`;
    } else if (activeTab === 'homecook') {
      const levelObj = cookLevels.find(l => l.id === homeCookLevel);
      return `${levelObj?.name || 'Domestic Cook'} (${homeFoodPref}) in ${city}`;
    } else if (activeTab === 'daily') {
      const primaryRole = dailyStaffList[0]?.role || 'Daily Staff';
      return `Daily Basis ${primaryRole} for ${dailyEventType} in ${city}`;
    } else if (activeTab === 'party') {
      return `Party Chef for ${partyOccasion} (${partyTotalGuests} Guests) in ${city}`;
    }
    return `Chef Requirement in ${city}`;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedCustomer) {
        toast({ title: 'Select Customer', description: 'Please select a registered customer to proceed.', status: 'warning', duration: 2500 });
        return;
      }
      if (!name || !phone) {
        toast({ title: 'Required Fields', description: 'Name and Phone number are required.', status: 'warning', duration: 2500 });
        return;
      }
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCustomer) {
      toast({
        title: 'Customer Required',
        description: 'Please select a customer before posting the job record.',
        status: 'error',
        duration: 3500
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = new FormData();
      const jobCategory = activeTab === 'commercial' ? 'hotel' : activeTab === 'homecook' ? 'home' : activeTab === 'daily' ? 'daily' : 'party';
      payload.set('jobCategory', jobCategory);
      payload.set('bookingType', activeTab === 'party' ? 'party' : activeTab === 'daily' ? 'daily' : 'regular');
      payload.set('customer', selectedCustomer._id);
      
      const computedTitle = getAutoTitle();
      payload.set('title', computedTitle);
      payload.set('state', state);
      payload.set('city', city);
      payload.set('address', address);
      payload.set('status', jobStatus);
      if (leadManager) payload.set('leadManager', leadManager);

      // 1. Commercial Hiring
      if (activeTab === 'commercial') {
        payload.set('hiringPurpose', 'commercial');
        payload.set('outletName', businessName || '');
        payload.set('propertyCategory', commercialPropertyCategory);
        payload.set('jobPosition', commercialStaffList[0]?.staffCategory || 'Head Chef / Master Chef');
        payload.set('jobType', commercialShiftType);
        
        const totalVacancies = commercialStaffList.reduce((acc, s) => acc + (parseInt(s.noOfStaff, 10) || 1), 0);
        payload.set('packageOrGuestOrVacancy', totalVacancies.toString());
        payload.set('salaryRange', commercialStaffList[0]?.salaryRange || '₹25,000 - ₹35,000');
        payload.set('experienceRange', commercialExperience);
        payload.set('allowedLeave', commercialAllowedLeave);
        payload.set('joiningType', commercialJoiningTimeline);
        payload.set('basicFacility', commercialBasicFacility);
        payload.set('benefits', commercialPerks);
        payload.set('commercialStaffList', JSON.stringify(commercialStaffList));
      } 
      // 2. Domestic Home Cook
      else if (activeTab === 'homecook') {
        const levelObj = cookLevels.find(l => l.id === homeCookLevel);
        payload.set('hiringPurpose', 'domestic');
        payload.set('homeCookLevel', homeCookLevel);
        payload.set('genderPreference', homeGenderPref);
        payload.set('jobPosition', levelObj?.name || 'Domestic Home Cook');
        payload.set('jobType', homeDuration);
        payload.set('serviceDuration', homeDuration);
        payload.set('foodPreference', homeFoodPref);
        payload.set('cookingCategory', selectedCuisines.join(', ') || 'North Indian');
        payload.set('familyMembers', homeFamilyMembers);
        payload.set('packageOrGuestOrVacancy', homeFamilyMembers);
        payload.set('noOfGuests', homeFamilyMembers);
        payload.set('salaryRange', levelObj?.salary || '₹20,000 – ₹25,000/month');
        payload.set('allowedLeave', homeAllowedLeave);
        payload.set('joiningType', 'Immediate');
        payload.set('basicFacility', homeFacilities);
        payload.set('startDate', homeStartDate);
      } 
      // 3. Daily Basis Staff (ODC)
      else if (activeTab === 'daily') {
        payload.set('dailyHiringPurpose', dailyHiringPurpose);
        payload.set('event', dailyEventType);
        payload.set('jobPosition', dailyStaffList[0]?.role || 'Head Chef');
        
        const totalCount = dailyStaffList.reduce((acc, s) => acc + (parseInt(s.count, 10) || 1), 0);
        payload.set('packageOrGuestOrVacancy', totalCount.toString());
        payload.set('package', `₹${dailyStaffList[0]?.ratePerDay || 999}/day`);
        payload.set('dateOfEvent', dailyEventDate);
        payload.set('servingTime', dailyShiftTiming);
        payload.set('mealPreference', dailyShiftTiming);
        payload.set('foodPreference', 'Both');
        payload.set('menuDetails', dailyWorkInstructions);

        const staffArr = dailyStaffList.map(s => ({
          role: s.role,
          count: parseInt(s.count, 10) || 1,
          ratePerDay: parseInt(s.ratePerDay, 10) || 999,
          genderPref: s.genderPref || 'Any Gender',
          days: parseInt(s.days, 10) || 1,
          startDate: dailyEventDate,
          startTime: s.startTime || '16:00',
          endTime: s.endTime || '23:00'
        }));
        payload.set('staffRequirements', JSON.stringify(staffArr));
      } 
      // 4. Chef for Party
      else if (activeTab === 'party') {
        payload.set('event', partyOccasion);
        payload.set('jobPosition', 'Party Chef');
        payload.set('noOfGuests', partyTotalGuests.toString());
        payload.set('foodPreference', partyFoodPref);
        payload.set('servingTime', partyServingMeal);
        payload.set('dateOfEvent', partyDate);
        payload.set('cookingCategory', partySelectedCuisines.join(', '));
        payload.set('menuDetails', partyMenuDetails);

        const partyReq = {
          city: city,
          datesCount: 1,
          vegGuests: parseInt(partyVegGuests, 10) || 0,
          nonVegGuests: parseInt(partyNonVegGuests, 10) || 0,
          selectedCuisines: partySelectedCuisines,
          menuDetails: partyMenuDetails
        };
        payload.set('partyRequirement', JSON.stringify(partyReq));
      }

      // Notes & Descriptions
      payload.set('overview', adminNotes.trim() || `Job created via Admin Panel for client ${selectedCustomer.name}.`);
      payload.set('responsibilities', `Handle meal preparation, hygiene, service standards, and operational tasks.`);
      payload.set('requirements', `Punctual, professional, hygienic and verified staff.`);

      if (jobImage) payload.append('image', jobImage);

      const response = await axios.post(`${apiUrl}/jobs`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast({
          title: 'Job Record Created Successfully!',
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

  const serviceTabs = [
    { id: 'commercial', label: '🏨 Commercial Hiring', short: 'Commercial' },
    { id: 'homecook', label: '🏠 Domestic Home Cook', short: 'Domestic Cook' },
    { id: 'daily', label: '📅 Daily Basis Staff', short: 'Daily Staff' },
    { id: 'party', label: '👨‍🍳 Chef for Party', short: 'Party Chef' }
  ];

  const stepsList = [
    { num: 1, label: 'Basic Details' },
    { num: 2, label: 'Staff Requirement' },
    { num: 3, label: 'Booking Summary' },
    { num: 4, label: 'Admin & Submit' }
  ];

  return (
    <Box pb="12" maxW="1100px" mx="auto">
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

      {/* MODAL WRAPPER CARD */}
      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid #e2e8f0"
        boxShadow="0 10px 30px rgba(0,0,0,0.06)"
        overflow="hidden"
      >
        {/* MODAL HEADER */}
        <Flex
          px={{ base: 4, md: 7 }}
          py="4"
          borderBottom="1px solid #f1f5f9"
          align="center"
          justify="space-between"
          bg="white"
        >
          <Box>
            <Text fontSize="22px" fontWeight="900" color="#073b8f" letterSpacing="-0.5px">
              Zomo<Text as="span" color="#ed1c24">Cook</Text>
            </Text>
            <Text fontSize="xs" color="#64748b" fontWeight="500">
              Book a professional chef &amp; Staff for your Commercial, Domestic &amp; for special occasion
            </Text>
          </Box>
          <Badge
            colorScheme="blue"
            fontSize="11px"
            px="3"
            py="1"
            borderRadius="full"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            Admin Job Creator
          </Badge>
        </Flex>

        {/* 4 SERVICE TABS */}
        <Box px={{ base: 3, md: 6 }} py="3" bg="#f8fafc" borderBottom="1px solid #f1f5f9">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing="2">
            {serviceTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStep(1);
                  }}
                  py="5"
                  borderRadius="xl"
                  fontWeight="800"
                  fontSize="xs"
                  bg={isActive ? '#0866ed' : 'white'}
                  color={isActive ? 'white' : '#334155'}
                  border={isActive ? '1px solid #0866ed' : '1px solid #e2e8f0'}
                  boxShadow={isActive ? '0 4px 12px rgba(8, 102, 237, 0.25)' : 'none'}
                  _hover={{ bg: isActive ? '#0052cc' : '#f1f5f9' }}
                  transition="all 0.2s"
                >
                  {tab.label}
                </Button>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* STEPPER PROGRESS BAR */}
        <Box px={{ base: 4, md: 8 }} py="4" bg="white" borderBottom="1px solid #f1f5f9">
          <Flex align="center" justify="space-between" maxW="700px" mx="auto" position="relative">
            {stepsList.map((s, idx) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <React.Fragment key={s.num}>
                  <Flex
                    align="center"
                    gap="2"
                    cursor="pointer"
                    onClick={() => {
                      if (isCompleted || s.num <= step) setStep(s.num);
                    }}
                  >
                    <Flex
                      w="32px"
                      h="32px"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      fontWeight="900"
                      fontSize="xs"
                      bg={isCompleted ? '#16a34a' : isCurrent ? '#0866ed' : '#f1f5f9'}
                      color={isCompleted || isCurrent ? 'white' : '#94a3b8'}
                      boxShadow={isCurrent ? '0 0 0 4px rgba(8, 102, 237, 0.15)' : 'none'}
                      transition="all 0.2s"
                    >
                      {isCompleted ? <Check size={16} strokeWidth={3} /> : s.num}
                    </Flex>
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      display={{ base: 'none', sm: 'inline' }}
                      color={isCurrent ? '#0866ed' : isCompleted ? '#16a34a' : '#94a3b8'}
                    >
                      {s.label}
                    </Text>
                  </Flex>
                  {idx < stepsList.length - 1 && (
                    <Box
                      flex="1"
                      h="2px"
                      mx="3"
                      bg={step > idx + 1 ? '#16a34a' : '#e2e8f0'}
                      transition="all 0.3s"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Flex>
        </Box>

        {/* MODAL BODY CONTAINER */}
        <Box p={{ base: 5, md: 8 }}>

          {/* ========================================================== */}
          {/* STEP 1: BASIC DETAILS (CUSTOMER INFO & CONTACT) ========== */}
          {/* ========================================================== */}
          {step === 1 && (
            <VStack spacing="5" align="stretch">
              <Box mb="2">
                <Text fontSize="lg" fontWeight="800" color="#0f172a">
                  Basic Details
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Please enter contact &amp; venue details for this requirement.
                </Text>
              </Box>

              {/* Customer Selector & Quick Search */}
              <Box p="4" bg="#f8fafc" border="1.5px solid #e2e8f0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                  <Box>
                    <FormLabel {...labelStyle}>Select Registered Customer *</FormLabel>
                    <Select
                      size="sm"
                      h="42px"
                      borderRadius="lg"
                      bg="white"
                      value={selectedCustomer?._id || ''}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      placeholder={isFetchingCustomers ? "Loading customers..." : "Search & Select registered customer..."}
                    >
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.phone || c.contactPhone || 'No Phone'}) - {c.city || 'N/A'}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <FormLabel {...labelStyle}>Or Search by Mobile Number</FormLabel>
                    <InputGroup size="sm">
                      <InputLeftElement h="42px" pointerEvents="none">
                        <Phone size={16} color="#94a3b8" />
                      </InputLeftElement>
                      <Input
                        h="42px"
                        borderRadius="lg"
                        bg="white"
                        placeholder="Enter 10-digit mobile number..."
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
              </Box>

              {/* Basic Details Input Form */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Full Name *</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>

                <FormControl isRequired>
                  <Flex justify="space-between" align="center" mb="1">
                    <FormLabel {...labelStyle} mb="0">Mobile Number *</FormLabel>
                    <Badge colorScheme="green" fontSize="10px" borderRadius="full" px="2">
                      Verified
                    </Badge>
                  </Flex>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel {...labelStyle}>City *</FormLabel>
                  <Select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    {...selectStyle}
                    h="42px"
                  >
                    {currentDistricts.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Commercial Business Name / Event Address */}
              {activeTab === 'commercial' && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Business Name *</FormLabel>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Restaurant / Hotel / Cafe / Cloud Kitchen"
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel {...labelStyle}>
                  {activeTab === 'commercial' ? 'Business Address *' : activeTab === 'homecook' ? 'Home Address *' : 'Event / Venue Address *'}
                </FormLabel>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete address / locality / landmark"
                  {...inputStyle}
                  h="42px"
                />
              </FormControl>

              <Flex justify="flex-end" pt="4">
                <Button
                  rightIcon={<ArrowRight size={16} />}
                  bg="#0866ed"
                  color="white"
                  borderRadius="xl"
                  px="8"
                  h="44px"
                  fontWeight="800"
                  _hover={{ bg: '#0052cc' }}
                  onClick={handleNext}
                >
                  Continue →
                </Button>
              </Flex>
            </VStack>
          )}

          {/* ========================================================== */}
          {/* STEP 2: STAFF REQUIREMENT (SERVICE-SPECIFIC) ============== */}
          {/* ========================================================== */}
          {step === 2 && (
            <VStack spacing="5" align="stretch">
              
              {/* === 1. COMMERCIAL HIRING === */}
              {activeTab === 'commercial' && (
                <VStack spacing="5" align="stretch">
                  <Box mb="1">
                    <Text fontSize="lg" fontWeight="800" color="#0f172a">
                      Commercial Staff Requirement
                    </Text>
                    <Text fontSize="xs" color="#64748b">
                      Specify staff categories, roles, vacancy counts and offered salary ranges.
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Property Category *</FormLabel>
                      <Select
                        value={commercialPropertyCategory}
                        onChange={(e) => setCommercialPropertyCategory(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Restaurant', 'Hotel', 'Cafe', 'Resort', 'Cloud Kitchen', 'Bar / Pub', 'Banquet Hall', 'Food Truck', 'Catering Outlet', 'Canteen'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Shift / Job Type *</FormLabel>
                      <Select
                        value={commercialShiftType}
                        onChange={(e) => setCommercialShiftType(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Full Time (10-12 hrs)', 'Part Time (4-6 hrs)', 'Night Shift', 'Rotational Shift'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Experience Required *</FormLabel>
                      <Select
                        value={commercialExperience}
                        onChange={(e) => setCommercialExperience(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Fresher', '1-2 Years', '2-5 Years', '5-8 Years', '8+ Years'].map(exp => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  {/* Multi-Staff Position Selector Card */}
                  <Box p="4" bg="#f8fafc" border="1.5px solid #e2e8f0" borderRadius="xl">
                    <Flex justify="space-between" align="center" mb="3">
                      <Box>
                        <Text fontWeight="800" fontSize="sm" color="#1e293b">
                          Staff Roles &amp; Numbers
                        </Text>
                        <Text fontSize="xs" color="#64748b">
                          Add multiple roles or adjust counts with the +/- steppers.
                        </Text>
                      </Box>
                      <Button
                        size="xs"
                        leftIcon={<Plus size={14} />}
                        bg="#0866ed"
                        color="white"
                        _hover={{ bg: '#0052cc' }}
                        onClick={addCommercialStaffRow}
                      >
                        Add Another Role
                      </Button>
                    </Flex>

                    <VStack spacing="3" align="stretch">
                      {commercialStaffList.map((item) => (
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
                          <Box minW="160px" flex="1">
                            <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Service Category</FormLabel>
                            <Select
                              size="sm"
                              h="36px"
                              borderRadius="md"
                              value={item.serviceCategory}
                              onChange={(e) => updateCommercialStaffRow(item.id, 'serviceCategory', e.target.value)}
                            >
                              {commercialServiceCategories.map(sc => (
                                <option key={sc} value={sc}>{sc}</option>
                              ))}
                            </Select>
                          </Box>

                          <Box minW="180px" flex="1.5">
                            <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Specific Staff Role</FormLabel>
                            <Select
                              size="sm"
                              h="36px"
                              borderRadius="md"
                              value={item.staffCategory}
                              onChange={(e) => updateCommercialStaffRow(item.id, 'staffCategory', e.target.value)}
                            >
                              {(commercialStaffCategoriesMap[item.serviceCategory] || []).map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </Select>
                          </Box>

                          <Box minW="140px" flex="1">
                            <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Salary Range</FormLabel>
                            <Select
                              size="sm"
                              h="36px"
                              borderRadius="md"
                              value={item.salaryRange}
                              onChange={(e) => updateCommercialStaffRow(item.id, 'salaryRange', e.target.value)}
                            >
                              {salaryRanges.map(sr => (
                                <option key={sr} value={sr}>{sr}</option>
                              ))}
                            </Select>
                          </Box>

                          <Box w="120px">
                            <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Staff Count</FormLabel>
                            <HStack spacing="1">
                              <IconButton
                                size="xs"
                                icon={<Minus size={12} />}
                                onClick={() => updateCommercialStaffRow(item.id, 'noOfStaff', Math.max(1, item.noOfStaff - 1))}
                              />
                              <Input
                                size="sm"
                                h="36px"
                                textAlign="center"
                                type="number"
                                min="1"
                                value={item.noOfStaff}
                                onChange={(e) => updateCommercialStaffRow(item.id, 'noOfStaff', parseInt(e.target.value, 10) || 1)}
                              />
                              <IconButton
                                size="xs"
                                icon={<Plus size={12} />}
                                onClick={() => updateCommercialStaffRow(item.id, 'noOfStaff', item.noOfStaff + 1)}
                              />
                            </HStack>
                          </Box>

                          <IconButton
                            size="sm"
                            mt="4"
                            variant="ghost"
                            colorScheme="red"
                            icon={<Trash2 size={16} />}
                            onClick={() => removeCommercialStaffRow(item.id)}
                            aria-label="Remove role"
                          />
                        </Flex>
                      ))}
                    </VStack>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Allowed Leave *</FormLabel>
                      <Select
                        value={commercialAllowedLeave}
                        onChange={(e) => setCommercialAllowedLeave(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['No Leave', '1 day/month', '2 days/month', '3 days/month', '4 days/month', '1 day/week', 'Custom'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Joining Timeline *</FormLabel>
                      <Select
                        value={commercialJoiningTimeline}
                        onChange={(e) => setCommercialJoiningTimeline(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Immediate', 'Within 3 Days', 'Within 1 Week', 'Within 15 Days', 'Within 1 Month'].map(j => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Facilities Provided *</FormLabel>
                      <Select
                        value={commercialBasicFacility}
                        onChange={(e) => setCommercialBasicFacility(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Food & Accommodation', 'Food Only', 'Accommodation Only', 'No Food or Accommodation'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              )}

              {/* === 2. DOMESTIC HOME COOK === */}
              {activeTab === 'homecook' && (
                <VStack spacing="5" align="stretch">
                  <Box mb="1">
                    <Text fontSize="lg" fontWeight="800" color="#0f172a">
                      Domestic Home Cook Requirement
                    </Text>
                    <Text fontSize="xs" color="#64748b">
                      Select cook level tier, timing duration, family size, and cuisine preferences.
                    </Text>
                  </Box>

                  {/* Cook Level Selection Cards */}
                  <Box>
                    <FormLabel {...labelStyle} mb="2">Select Cook Level / Experience *</FormLabel>
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
                            border={isLvlSelected ? '2px solid #0866ed' : '1.5px solid #e2e8f0'}
                            bg={isLvlSelected ? '#f8faff' : 'white'}
                            boxShadow={isLvlSelected ? '0 4px 12px rgba(8, 102, 237, 0.2)' : 'none'}
                            transition="all 0.2s"
                          >
                            <Flex justify="space-between" align="center" mb="2">
                              <Text fontWeight="800" fontSize="sm" color="#0f172a">{lvl.name}</Text>
                              <Badge colorScheme="blue" borderRadius="full" px="2" fontSize="10px">{lvl.badge}</Badge>
                            </Flex>
                            <Text fontSize="xs" color="#64748b" mb="3">{lvl.desc}</Text>
                            <HStack spacing="1" fontSize="xs" fontWeight="700" color="#0866ed">
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
                      <FormLabel {...labelStyle}>Shift / Service Duration *</FormLabel>
                      <Select
                        value={homeDuration}
                        onChange={(e) => setHomeDuration(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['10 Hours', '24 Hours (Live-in)', 'Part-Time (Morning only)', 'Part-Time (Evening only)'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Food Preference *</FormLabel>
                      <Select
                        value={homeFoodPref}
                        onChange={(e) => setHomeFoodPref(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain Food', 'Both Veg & Non-Veg'].map(fp => (
                          <option key={fp} value={fp}>{fp}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Cook Gender Preference *</FormLabel>
                      <Select
                        value={homeGenderPref}
                        onChange={(e) => setHomeGenderPref(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Any Gender', 'Male Cook', 'Female Cook'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>No. of Family Members *</FormLabel>
                      <Select
                        value={homeFamilyMembers}
                        onChange={(e) => setHomeFamilyMembers(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['1-2 Members', '3-4 Members', '5-6 Members', '7+ Members'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Allowed Leaves *</FormLabel>
                      <Select
                        value={homeAllowedLeave}
                        onChange={(e) => setHomeAllowedLeave(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['2 days/month', '4 days/month', 'Every Sunday Off', 'No Leave', 'Custom'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Expected Start Date *</FormLabel>
                      <Input
                        type="date"
                        value={homeStartDate}
                        onChange={(e) => setHomeStartDate(e.target.value)}
                        {...inputStyle}
                        h="42px"
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* Cuisine Selector */}
                  <Box>
                    <FormLabel {...labelStyle} mb="2">Cuisines / Specialties Desired</FormLabel>
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
                              onClick={() => toggleHomeCuisine(cuisine)}
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

              {/* === 3. DAILY BASIS STAFF (ODC) === */}
              {activeTab === 'daily' && (
                <VStack spacing="5" align="stretch">
                  <Box mb="1">
                    <Text fontSize="lg" fontWeight="800" color="#0f172a">
                      Daily Basis Staff (ODC) Requirement
                    </Text>
                    <Text fontSize="xs" color="#64748b">
                      Configure short-term event staff with fixed daily rates.
                    </Text>
                  </Box>

                  {/* Purpose Selector */}
                  <Box>
                    <FormLabel {...labelStyle} mb="2">Hiring Purpose *</FormLabel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                      {[
                        { id: 'commercial', title: 'Commercial Hiring', desc: 'Hotels, Banquets, Restaurants & Catering Events', icon: Building2 },
                        { id: 'domestic', title: 'Domestic & Private Events', desc: 'Home Parties, Family Gatherings & House Functions', icon: HomeIcon }
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
                            border={isPurSelected ? '2px solid #0866ed' : '1.5px solid #e2e8f0'}
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
                      <FormLabel {...labelStyle}>Event / Function Type *</FormLabel>
                      <Select
                        value={dailyEventType}
                        onChange={(e) => setDailyEventType(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {occasionTypes.map(ev => (
                          <option key={ev} value={ev}>{ev}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Date of Event / Shift *</FormLabel>
                      <Input
                        type="date"
                        value={dailyEventDate}
                        onChange={(e) => setDailyEventDate(e.target.value)}
                        {...inputStyle}
                        h="42px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Shift / Serving Timing *</FormLabel>
                      <Select
                        value={dailyShiftTiming}
                        onChange={(e) => setDailyShiftTiming(e.target.value)}
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
                        bg="#0866ed"
                        color="white"
                        _hover={{ bg: '#0052cc' }}
                        onClick={() => addDailyStaffRow('Waiter', 999)}
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
                            onClick={() => addDailyStaffRow(preset.role, preset.rate)}
                            _hover={{ bg: '#f1f5f9', borderColor: '#0866ed' }}
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
                              onChange={(e) => updateDailyStaffRow(item.id, 'role', e.target.value)}
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
                              onChange={(e) => updateDailyStaffRow(item.id, 'ratePerDay', parseInt(e.target.value, 10) || 0)}
                            />
                          </Box>

                          <Box minW="120px" flex="1">
                            <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Gender</FormLabel>
                            <Select
                              size="sm"
                              h="36px"
                              value={item.genderPref || 'Any Gender'}
                              onChange={(e) => updateDailyStaffRow(item.id, 'genderPref', e.target.value)}
                            >
                              {['Any Gender', 'Male', 'Female'].map(g => (
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
                                onClick={() => updateDailyStaffRow(item.id, 'count', Math.max(1, item.count - 1))}
                              />
                              <Input
                                size="sm"
                                h="36px"
                                textAlign="center"
                                type="number"
                                min="1"
                                value={item.count}
                                onChange={(e) => updateDailyStaffRow(item.id, 'count', parseInt(e.target.value, 10) || 1)}
                              />
                              <IconButton
                                size="xs"
                                icon={<Plus size={12} />}
                                onClick={() => updateDailyStaffRow(item.id, 'count', item.count + 1)}
                              />
                            </HStack>
                          </Box>

                          <IconButton
                            size="sm"
                            mt="4"
                            variant="ghost"
                            colorScheme="red"
                            icon={<Trash2 size={16} />}
                            onClick={() => removeDailyStaffRow(item.id)}
                            aria-label="Remove daily staff"
                          />
                        </Flex>
                      ))}
                    </VStack>

                    {/* Total Budget Counter */}
                    <Flex justify="flex-end" align="center" mt="3" pt="2" borderTop="1px dashed #cbd5e1" gap="3">
                      <Text fontSize="xs" color="#64748b">Estimated Daily Staff Cost:</Text>
                      <Badge colorScheme="green" fontSize="sm" px="3" py="1" borderRadius="md">
                        ₹{dailyStaffList.reduce((acc, s) => acc + (s.ratePerDay * s.count), 0).toLocaleString()} / Day
                      </Badge>
                    </Flex>
                  </Box>

                  <FormControl>
                    <FormLabel {...labelStyle}>Menu / Work Instructions</FormLabel>
                    <Textarea
                      value={dailyWorkInstructions}
                      onChange={(e) => setDailyWorkInstructions(e.target.value)}
                      placeholder="Enter dishes to prepare or duties..."
                      {...inputStyle}
                      minH="70px"
                    />
                  </FormControl>
                </VStack>
              )}

              {/* === 4. CHEF FOR PARTY === */}
              {activeTab === 'party' && (
                <VStack spacing="5" align="stretch">
                  <Box mb="1">
                    <Text fontSize="lg" fontWeight="800" color="#0f172a">
                      Chef for Party Requirement
                    </Text>
                    <Text fontSize="xs" color="#64748b">
                      Plan party chef booking with guest counts, meals, and menu preferences.
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Occasion / Event Type *</FormLabel>
                      <Select
                        value={partyOccasion}
                        onChange={(e) => setPartyOccasion(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {occasionTypes.map(ev => (
                          <option key={ev} value={ev}>{ev}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Date of Party *</FormLabel>
                      <Input
                        type="date"
                        value={partyDate}
                        onChange={(e) => setPartyDate(e.target.value)}
                        {...inputStyle}
                        h="42px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Serving Meal / Time *</FormLabel>
                      <Select
                        value={partyServingMeal}
                        onChange={(e) => setPartyServingMeal(e.target.value)}
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
                      <FormLabel {...labelStyle}>Total Number of Guests *</FormLabel>
                      <Input
                        type="number"
                        value={partyTotalGuests}
                        onChange={(e) => setPartyTotalGuests(parseInt(e.target.value, 10) || 0)}
                        placeholder="20"
                        {...inputStyle}
                        h="42px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Food Preference *</FormLabel>
                      <Select
                        value={partyFoodPref}
                        onChange={(e) => setPartyFoodPref(e.target.value)}
                        {...selectStyle}
                        h="42px"
                      >
                        {['Both (Veg & Non-Veg)', 'Vegetarian (Veg Only)', 'Non-Vegetarian', 'Jain Food'].map(fp => (
                          <option key={fp} value={fp}>{fp}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel {...labelStyle}>Veg / Non-Veg Breakdown</FormLabel>
                      <HStack spacing="2">
                        <Input
                          placeholder="Veg: 15"
                          value={partyVegGuests}
                          onChange={(e) => setPartyVegGuests(e.target.value)}
                          {...inputStyle}
                          h="42px"
                        />
                        <Input
                          placeholder="Non-Veg: 5"
                          value={partyNonVegGuests}
                          onChange={(e) => setPartyNonVegGuests(e.target.value)}
                          {...inputStyle}
                          h="42px"
                        />
                      </HStack>
                    </FormControl>
                  </SimpleGrid>

                  {/* Cuisine Selector */}
                  <Box>
                    <FormLabel {...labelStyle} mb="2">Cuisines for Party Menu</FormLabel>
                    <Wrap spacing="2">
                      {cuisineOptions.map(cuisine => {
                        const isCuisineSelected = partySelectedCuisines.includes(cuisine);
                        return (
                          <WrapItem key={cuisine}>
                            <Tag
                              size="md"
                              borderRadius="full"
                              variant={isCuisineSelected ? 'solid' : 'outline'}
                              colorScheme="orange"
                              cursor="pointer"
                              onClick={() => togglePartyCuisine(cuisine)}
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
                    <FormLabel {...labelStyle}>Selected Menu / Special Dishes</FormLabel>
                    <Textarea
                      value={partyMenuDetails}
                      onChange={(e) => setPartyMenuDetails(e.target.value)}
                      placeholder="e.g. Paneer Tikka, Butter Chicken, Dal Makhani, Garlic Naan, Gulab Jamun"
                      {...inputStyle}
                      minH="80px"
                    />
                  </FormControl>
                </VStack>
              )}

              {/* STEP NAVIGATION */}
              <Flex justify="space-between" pt="4" borderTop="1px solid #f1f5f9">
                <Button
                  leftIcon={<ArrowLeft size={16} />}
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#64748b"
                  borderRadius="xl"
                  px="6"
                  h="44px"
                  fontWeight="700"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  rightIcon={<ArrowRight size={16} />}
                  bg="#0866ed"
                  color="white"
                  borderRadius="xl"
                  px="8"
                  h="44px"
                  fontWeight="800"
                  _hover={{ bg: '#0052cc' }}
                  onClick={handleNext}
                >
                  Continue →
                </Button>
              </Flex>
            </VStack>
          )}

          {/* ========================================================== */}
          {/* STEP 3: BOOKING SUMMARY (VERIFY & PREVIEW) ================ */}
          {/* ========================================================== */}
          {step === 3 && (
            <VStack spacing="5" align="stretch">
              <Box mb="1">
                <Text fontSize="lg" fontWeight="800" color="#0f172a">
                  Booking Summary
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Review the complete hiring requirement parameters before saving.
                </Text>
              </Box>

              {/* Summary Card */}
              <Box p="5" bg="#f8fafc" border="1.5px solid #e2e8f0" borderRadius="2xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                  
                  {/* Left Column: Customer & Venue */}
                  <Box p="4" bg="white" borderRadius="xl" border="1px solid #e2e8f0">
                    <HStack spacing="2" mb="3">
                      <User size={16} color="#0866ed" />
                      <Text fontWeight="800" fontSize="sm" color="#0f172a">Customer &amp; Location</Text>
                    </HStack>
                    <VStack align="stretch" spacing="2" fontSize="xs" color="#475569">
                      <Flex justify="space-between"><Text fontWeight="600">Client Name:</Text><Text fontWeight="700" color="#0f172a">{name}</Text></Flex>
                      <Flex justify="space-between"><Text fontWeight="600">Phone:</Text><Text fontWeight="700" color="#0f172a">{phone}</Text></Flex>
                      {email && <Flex justify="space-between"><Text fontWeight="600">Email:</Text><Text>{email}</Text></Flex>}
                      <Flex justify="space-between"><Text fontWeight="600">City / State:</Text><Text>{city}, {state}</Text></Flex>
                      <Flex justify="space-between"><Text fontWeight="600">Address:</Text><Text textAlign="right" maxW="200px">{address}</Text></Flex>
                    </VStack>
                  </Box>

                  {/* Right Column: Service Requirement */}
                  <Box p="4" bg="white" borderRadius="xl" border="1px solid #e2e8f0">
                    <HStack spacing="2" mb="3">
                      <Briefcase size={16} color="#0866ed" />
                      <Text fontWeight="800" fontSize="sm" color="#0f172a">Service Details</Text>
                    </HStack>
                    <VStack align="stretch" spacing="2" fontSize="xs" color="#475569">
                      <Flex justify="space-between">
                        <Text fontWeight="600">Service Category:</Text>
                        <Badge colorScheme="blue" borderRadius="full" px="2">
                          {serviceTabs.find(t => t.id === activeTab)?.short}
                        </Badge>
                      </Flex>

                      {activeTab === 'commercial' && (
                        <>
                          <Flex justify="space-between"><Text fontWeight="600">Establishment:</Text><Text fontWeight="700">{businessName || commercialPropertyCategory}</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Shift Type:</Text><Text>{commercialShiftType}</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Total Staff Required:</Text><Text fontWeight="700">{commercialStaffList.reduce((acc, s) => acc + s.noOfStaff, 0)} Staff</Text></Flex>
                        </>
                      )}

                      {activeTab === 'homecook' && (
                        <>
                          <Flex justify="space-between"><Text fontWeight="600">Cook Level:</Text><Text fontWeight="700">{cookLevels.find(l => l.id === homeCookLevel)?.name}</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Duration &amp; Food:</Text><Text>{homeDuration} ({homeFoodPref})</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Family Members:</Text><Text>{homeFamilyMembers}</Text></Flex>
                        </>
                      )}

                      {activeTab === 'daily' && (
                        <>
                          <Flex justify="space-between"><Text fontWeight="600">Event &amp; Date:</Text><Text fontWeight="700">{dailyEventType} ({dailyEventDate})</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Shift Timing:</Text><Text>{dailyShiftTiming}</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Staff Count:</Text><Text fontWeight="700">{dailyStaffList.reduce((acc, s) => acc + s.count, 0)} Staff</Text></Flex>
                        </>
                      )}

                      {activeTab === 'party' && (
                        <>
                          <Flex justify="space-between"><Text fontWeight="600">Occasion &amp; Date:</Text><Text fontWeight="700">{partyOccasion} ({partyDate})</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Total Guests:</Text><Text fontWeight="700">{partyTotalGuests} Guests</Text></Flex>
                          <Flex justify="space-between"><Text fontWeight="600">Meal / Time:</Text><Text>{partyServingMeal}</Text></Flex>
                        </>
                      )}
                    </VStack>
                  </Box>

                </SimpleGrid>

                {/* Staff Roster Details Table */}
                {activeTab === 'commercial' && (
                  <Box mt="4" p="4" bg="white" borderRadius="xl" border="1px solid #e2e8f0">
                    <Text fontWeight="800" fontSize="xs" color="#0f172a" mb="2">Detailed Staff Positions</Text>
                    <VStack align="stretch" spacing="1.5">
                      {commercialStaffList.map((item, idx) => (
                        <Flex key={idx} justify="space-between" fontSize="xs" color="#334155" py="1" borderBottom="1px dashed #f1f5f9">
                          <Text fontWeight="700">{item.staffCategory} <Text as="span" color="#64748b" fontWeight="normal">({item.serviceCategory})</Text></Text>
                          <HStack spacing="3">
                            <Badge colorScheme="purple">{item.salaryRange}</Badge>
                            <Badge colorScheme="blue">{item.noOfStaff} Vacanc{item.noOfStaff > 1 ? 'ies' : 'y'}</Badge>
                          </HStack>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}

                {activeTab === 'daily' && (
                  <Box mt="4" p="4" bg="white" borderRadius="xl" border="1px solid #e2e8f0">
                    <Text fontWeight="800" fontSize="xs" color="#0f172a" mb="2">Daily Staff Roster &amp; Cost</Text>
                    <VStack align="stretch" spacing="1.5">
                      {dailyStaffList.map((item, idx) => (
                        <Flex key={idx} justify="space-between" fontSize="xs" color="#334155" py="1" borderBottom="1px dashed #f1f5f9">
                          <Text fontWeight="700">{item.role} <Text as="span" color="#64748b" fontWeight="normal">({item.genderPref})</Text></Text>
                          <HStack spacing="3">
                            <Badge colorScheme="green">₹{item.ratePerDay}/day</Badge>
                            <Badge colorScheme="blue">{item.count} Staff</Badge>
                          </HStack>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>

              {/* STEP NAVIGATION */}
              <Flex justify="space-between" pt="4" borderTop="1px solid #f1f5f9">
                <Button
                  leftIcon={<ArrowLeft size={16} />}
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#64748b"
                  borderRadius="xl"
                  px="6"
                  h="44px"
                  fontWeight="700"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  rightIcon={<ArrowRight size={16} />}
                  bg="#0866ed"
                  color="white"
                  borderRadius="xl"
                  px="8"
                  h="44px"
                  fontWeight="800"
                  _hover={{ bg: '#0052cc' }}
                  onClick={handleNext}
                >
                  Proceed to Final Step →
                </Button>
              </Flex>
            </VStack>
          )}

          {/* ========================================================== */}
          {/* STEP 4: ADMIN CONTROLS & SUBMISSION ======================= */}
          {/* ========================================================== */}
          {step === 4 && (
            <VStack spacing="5" align="stretch">
              <Box mb="1">
                <Text fontSize="lg" fontWeight="800" color="#0f172a">
                  Admin &amp; Assignment
                </Text>
                <Text fontSize="xs" color="#64748b">
                  Assign Lead Manager, set job status, and post this job requirement.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Initial Job Status *</FormLabel>
                  <Select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    {...selectStyle}
                    h="42px"
                  >
                    {['New', 'Active', 'Urgent', 'In Progress', 'Hold'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Assign Lead Manager</FormLabel>
                  <Select
                    value={leadManager}
                    onChange={(e) => setLeadManager(e.target.value)}
                    {...selectStyle}
                    h="42px"
                    placeholder="Select Lead Manager..."
                  >
                    {managers.map(mgr => (
                      <option key={mgr._id} value={mgr.name}>{mgr.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Custom Job Title (Optional)</FormLabel>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={getAutoTitle()}
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl>
                  <FormLabel {...labelStyle}>Banner / Job Image (Optional)</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && setJobImage(e.target.files[0])}
                    p="1"
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Internal Admin Notes</FormLabel>
                  <Input
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter any internal notes or client remarks..."
                    {...inputStyle}
                    h="42px"
                  />
                </FormControl>
              </SimpleGrid>

              {/* FINAL ACTION BUTTONS */}
              <Flex justify="space-between" pt="6" borderTop="1px solid #f1f5f9">
                <Button
                  leftIcon={<ArrowLeft size={16} />}
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#64748b"
                  borderRadius="xl"
                  px="6"
                  h="44px"
                  fontWeight="700"
                  onClick={handleBack}
                >
                  Back
                </Button>

                <Button
                  type="button"
                  isLoading={isLoading}
                  loadingText="Posting Job..."
                  bg="#0866ed"
                  color="white"
                  borderRadius="xl"
                  px="9"
                  h="46px"
                  fontWeight="800"
                  fontSize="sm"
                  leftIcon={<Send size={16} />}
                  _hover={{ bg: '#0052cc' }}
                  boxShadow="0 4px 14px rgba(8, 102, 237, 0.3)"
                  onClick={handleSubmit}
                >
                  Create &amp; Post Job Record
                </Button>
              </Flex>
            </VStack>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default AddJob;
