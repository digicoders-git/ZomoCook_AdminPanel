import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, SimpleGrid, FormControl, FormLabel,
  Input, Select, Textarea, Button, Badge, Spinner, useToast,
  Divider, InputGroup, InputLeftElement, InputRightElement, IconButton,
  Tag, Wrap, WrapItem, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, Checkbox, useDisclosure,
  Tooltip, Image, Collapse, Switch
} from '@chakra-ui/react';
import {
  Building2, Home, Calendar, UtensilsCrossed, Plus, RotateCcw,
  CheckCircle2, Search, Phone, Mail, MapPin, X, ArrowRight,
  Briefcase, Send, Trash2, Minus, Users, Award, Check, GripVertical,
  Info, Sparkles, Clock, ChevronDown, ChevronUp, Tag as TagIcon,
  Flame, Sparkle, ShieldCheck, HeartHandshake, DollarSign, Receipt,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PageHeader, TableCard, BRAND, ACCENT, inputStyle, selectStyle } from '../components/ui';
import { INDIA_STATES_AND_DISTRICTS, ALL_INDIAN_STATES } from '../utils/indiaData';

const formLabelStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#475569',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  mb: '1.5'
};

const commercialServiceCategories = [
  'Chef / Kitchen Staff',
  'Service & Managing Staff',
  'Cleaning and Other Staff'
];

const commercialStaffCategoriesMap = {
  'Chef / Kitchen Staff': [
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
    'Head Chef/ Master Chef',
    'Commi 1 / Commi 2',
    'Kitchen Helper / Commis 3'
  ],
  'Service & Managing Staff': [
    'Managers',
    'Front Office Staff',
    'Captain / Service Representatives',
    'Bartender',
    'Waiter/ Steward',
    'Host / Hostess'
  ],
  'Cleaning and Other Staff': [
    'Housekeeping Attendant',
    'Cleaning Supervisor',
    'Room Attendant',
    'Public Area Cleaner',
    'Dishwasher / Utility Staff',
    'UT- Boy'
  ]
};

const commercialPropertyCategories = [
  'Restaurant',
  'Hotel',
  'Cafe / Coffee Shop',
  'Resort',
  'Cloud Kitchen',
  'Bar & Pub / Lounge',
  'Bakery & Confectionery',
  'Catering / Banquet',
  'Fast Food / QSR',
  'Dhaba',
  'Food Truck / Stall',
  'Office / Corporate Canteen',
  'Club',
  'Other'
];

const commercialSalaryRanges = [
  '₹8,000 – ₹12,000',
  '₹12,000 – ₹15,000',
  '₹15,000 – ₹20,000',
  '₹20,000 – ₹25,000',
  '₹25,000 – ₹35,000',
  '₹35,000 – ₹50,000',
  '₹50,000 – ₹75,000',
  '₹75,000+',
  'Custom Range'
];

const commercialExpOptions = [
  'Fresher / Entry Level',
  '0 – 1 Year',
  '1 – 2 Years',
  '2 – 5 Years',
  '5 – 8 Years',
  '8+ Years',
  'Custom'
];

const commercialShiftOptions = [
  'Full Time (10-12 hrs)',
  'Full Time (8-9 hrs)',
  'Part Time (4-6 hrs)',
  'Night Shift',
  'Rotational Shift',
  'Split Shift',
  'Custom'
];

const commercialLeaveOptions = [
  '1 day/month',
  '2 days/month',
  '3 days/month',
  '4 days/month',
  '5 days/month',
  '6 days/month',
  'Custom'
];

const commercialJoiningOptions = [
  'Immediate',
  'Within 3 Days',
  'Within 1 Week',
  'Within 15 Days',
  'Within 1 Month',
  'Custom'
];

const commercialFacilitiesOptions = [
  'Food & Accommodation',
  'Only Food Provided',
  'Only Accommodation Provided',
  'No Food / No Accommodation',
  'Food + Travel Allowance',
  'Custom'
];

const salaryRanges = [
  '₹10,000 – ₹15,000/month',
  '₹15,000 – ₹25,000/month',
  '₹25,000 – ₹35,000/month',
  '₹35,000 – ₹50,000/month',
  '₹50,000 – ₹75,000/month',
  '₹75,000+/month',
  'Custom Range'
];

const domesticSalaries = [
  '₹5,000 – ₹8,000/month',
  '₹8,000 – ₹12,000/month',
  '₹12,000 – ₹18,000/month',
  '₹18,000 – ₹25,000/month',
  '₹25,000 – ₹35,000/month',
  'Custom Range'
];

const expOptionsList = [
  'Fresher',
  '6 months – 1 year',
  '1 – 2 years',
  '2 – 3 years',
  '3 – 5 years',
  '5+ years',
  'Custom'
];

const joiningTypeOptions = [
  'Immediate',
  'Within 3 Days',
  'Within 1 Week',
  'Within 15 Days',
  'Within 1 Month',
  'Custom'
];

const leaveOptionsList = [
  '1 day/month',
  '2 days/month',
  '3 days/month',
  '4 days/month',
  '5 days/month',
  '6 days/month',
  '7 days/month',
  '8 days/month'
];

const cookPreferences = [
  'Basic Cook ( Home style Food- Less Experience @14k-18k/Month)',
  'Standard Cook (Multicuisine- Indian, Chinese, South @18k-25k/Month )',
  'Premium Chef ( Multicuisine Professional >@25k/month)'
];

const familyMembersList = [
  '1 – 2 Members',
  '3 – 4 Members',
  '5 – 6 Members',
  '7 – 8 Members',
  '8+ Members'
];

const dailyServiceCategories = [
  'Kitchen Staff',
  'Service Staff',
  'Housekeeping Staff',
  'Management Staff',
  'Utility Staff'
];

const dailyRolesList = [
  { role: 'Chef / Main Cook', rate: 1499, category: 'Kitchen Staff', desc: 'Experienced commercial/party chef' },
  { role: 'Home Cook', rate: 1199, category: 'Kitchen Staff', desc: 'Domestic / daily meal cook' },
  { role: 'Kitchen Helper', rate: 699, category: 'Kitchen Staff', desc: 'Vegetable cutting & kitchen support' },
  { role: 'Waiter / Steward', rate: 899, category: 'Service Staff', desc: 'Food serving & guest hospitality' },
  { role: 'Cleaner / Housekeeping', rate: 599, category: 'Housekeeping Staff', desc: 'Kitchen and dining cleaning' },
  { role: 'Kitchen Manager / Supervisor', rate: 1699, category: 'Management Staff', desc: 'Kitchen & banquet event manager' },
  { role: 'Bartender / Beverage Staff', rate: 1299, category: 'Service Staff', desc: 'Bar & mocktail/cocktail service' }
];

const occasionTypes = [
  'Birthday Party',
  'Anniversary',
  'Wedding',
  'Engagement',
  'Corporate Event',
  'House Party',
  'Festival',
  'Other'
];

const DEFAULT_PARTY_CATEGORIES = [
  'Main Course',
  'Starter',
  'Snacks',
  'Bread',
  'Rice',
  'Dessert',
  'Drinks',
  'Breakfast',
  'Sides'
];

const DEFAULT_MENU_CATALOG = [
  // Starter
  { name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Starter', isNonVeg: false },
  { name: 'Chicken Tikka', cuisine: 'North Indian', category: 'Starter', isNonVeg: true },
  { name: 'Veg Spring Rolls', cuisine: 'Chinese', category: 'Starter', isNonVeg: false },
  { name: 'Chilli Chicken', cuisine: 'Chinese', category: 'Starter', isNonVeg: true },
  { name: 'Dahi Ke Kabab', cuisine: 'North Indian', category: 'Starter', isNonVeg: false },
  { name: 'Veg Seekh Kabab', cuisine: 'North Indian', category: 'Starter', isNonVeg: false },

  // Main Course
  { name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'Main Course', isNonVeg: false },
  { name: 'Butter Chicken', cuisine: 'North Indian', category: 'Main Course', isNonVeg: true },
  { name: 'Dal Makhani', cuisine: 'North Indian', category: 'Main Course', isNonVeg: false },
  { name: 'Shahi Paneer', cuisine: 'North Indian', category: 'Main Course', isNonVeg: false },
  { name: 'Hakka Noodles', cuisine: 'Chinese', category: 'Main Course', isNonVeg: false },
  { name: 'Chicken Fried Rice', cuisine: 'Chinese', category: 'Main Course', isNonVeg: true },
  { name: 'Masala Dosa', cuisine: 'South Indian', category: 'Main Course', isNonVeg: false },
  { name: 'Veg Manchurian Gravy', cuisine: 'Chinese', category: 'Main Course', isNonVeg: false },

  // Bread
  { name: 'Butter Naan', cuisine: 'North Indian', category: 'Bread', isNonVeg: false },
  { name: 'Garlic Naan', cuisine: 'North Indian', category: 'Bread', isNonVeg: false },
  { name: 'Tandoori Roti', cuisine: 'North Indian', category: 'Bread', isNonVeg: false },
  { name: 'Lachha Paratha', cuisine: 'North Indian', category: 'Bread', isNonVeg: false },

  // Rice
  { name: 'Jeera Rice', cuisine: 'North Indian', category: 'Rice', isNonVeg: false },
  { name: 'Veg Biryani', cuisine: 'North Indian', category: 'Rice', isNonVeg: false },
  { name: 'Chicken Dum Biryani', cuisine: 'North Indian', category: 'Rice', isNonVeg: true },

  // Snacks
  { name: 'Samosa', cuisine: 'North Indian', category: 'Snacks', isNonVeg: false },
  { name: 'Veg Manchurian', cuisine: 'Chinese', category: 'Snacks', isNonVeg: false },
  { name: 'French Fries', cuisine: 'Continental', category: 'Snacks', isNonVeg: false },

  // Dessert
  { name: 'Gulab Jamun', cuisine: 'Desserts', category: 'Dessert', isNonVeg: false },
  { name: 'Rasmalai', cuisine: 'Desserts', category: 'Dessert', isNonVeg: false },

  // Drinks
  { name: 'Fresh Lime Soda', cuisine: 'Beverages', category: 'Drinks', isNonVeg: false },
  { name: 'Mango Lassi', cuisine: 'Beverages', category: 'Drinks', isNonVeg: false },

  // Breakfast
  { name: 'Idli Sambhar', cuisine: 'South Indian', category: 'Breakfast', isNonVeg: false },
  { name: 'Poha', cuisine: 'North Indian', category: 'Breakfast', isNonVeg: false },

  // Sides
  { name: 'Boondi Raita', cuisine: 'North Indian', category: 'Sides', isNonVeg: false },
  { name: 'Green Salad', cuisine: 'Continental', category: 'Sides', isNonVeg: false }
];

const availableOffers = [
  { code: 'ZOMO40', discountValue: 40, offerType: 'PERCENTAGE', title: 'Flat 40% OFF' },
  { code: 'NEW50', discountValue: 50, offerType: 'PERCENTAGE', title: '50% OFF on Hiring' },
  { code: 'PARTY20', discountValue: 20, offerType: 'PERCENTAGE', title: '20% OFF on Party Chef' }
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

  // ==========================================
  // 1. COMMERCIAL STATE (Multi-Staff Support)
  // ==========================================
  const [commercialStaffList, setCommercialStaffList] = useState([
    {
      id: '1',
      category: 'Chef / Kitchen Staff',
      role: 'Head Chef/ Master Chef',
      vacancies: '1',
      salary: '₹12,000 – ₹15,000',
      salaryCustom: false,
      salaryCustomVal: '',
      experience: '2 – 5 Years',
      expCustom: false,
      expCustomVal: '',
      shiftType: 'Full Time (10-12 hrs)',
      shiftCustomVal: '',
      allowedLeave: '2 days/month',
      leaveCustomVal: '',
      joiningTimeline: 'Immediate',
      joiningCustomVal: '',
      facilities: 'Food & Accommodation',
      facilitiesCustomVal: '',
      otherPerks: '',
      isUrgent: false
    }
  ]);

  const handleAddCommercialStaff = () => {
    setCommercialStaffList(prev => [
      ...prev,
      {
        id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        category: 'Chef / Kitchen Staff',
        role: 'Commi 1 / Commi 2',
        vacancies: '1',
        salary: '₹12,000 – ₹15,000',
        salaryCustom: false,
        salaryCustomVal: '',
        experience: '1 – 2 Years',
        expCustom: false,
        expCustomVal: '',
        shiftType: 'Full Time (10-12 hrs)',
        shiftCustomVal: '',
        allowedLeave: '2 days/month',
        leaveCustomVal: '',
        joiningTimeline: 'Immediate',
        joiningCustomVal: '',
        facilities: 'Food & Accommodation',
        facilitiesCustomVal: '',
        otherPerks: '',
        isUrgent: false
      }
    ]);
  };

  const handleRemoveCommercialStaff = (id, index) => {
    setCommercialStaffList(prev => {
      if (prev.length <= 1) {
        toast({ title: 'At least 1 staff requirement is required', status: 'info', duration: 2000 });
        return prev;
      }
      return prev.filter((s, idx) => (id !== undefined && s.id !== undefined) ? s.id !== id : idx !== index);
    });
  };

  const handleUpdateCommercialStaff = (id, field, value) => {
    setCommercialStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'category') {
          const roles = commercialStaffCategoriesMap[value] || [];
          updated.role = roles[0] || 'Head Chef/ Master Chef';
        }
        if (field === 'salary') {
          updated.salaryCustom = value === 'Custom Range';
        }
        if (field === 'experience') {
          updated.expCustom = value === 'Custom';
        }
        return updated;
      }
      return s;
    }));
  };

  // ==========================================
  // 2. DOMESTIC STATE
  // ==========================================
  const [dStaffCategory, setDStaffCategory] = useState('Home Cook');
  const [dCookPreference, setDCookPreference] = useState(cookPreferences[0]);
  const [dFamilyMembers, setDFamilyMembers] = useState('1 – 2 Members');
  const [dGenderPreference, setDGenderPreference] = useState('Anyone');
  const [dFoodPreference, setDFoodPreference] = useState('Pure Veg');
  const [dServiceDuration, setDServiceDuration] = useState('10 Hours – ( Morning to Evening)');
  const [dSalary, setDSalary] = useState('₹5,000 – ₹8,000/month');
  const [dSalaryCustom, setDSalaryCustom] = useState(false);
  const [dSalaryCustomVal, setDSalaryCustomVal] = useState('');
  const [dExp, setDExp] = useState('Fresher');
  const [dExpCustomVal, setDExpCustomVal] = useState('');
  const [dJoining, setDJoining] = useState('Immediate');
  const [dJoiningCustomVal, setDJoiningCustomVal] = useState('');
  const [dLeave, setDLeave] = useState('2 days/month');
  const [dFare, setDFare] = useState('No Reimbursement');
  const [dFareCustomVal, setDFareCustomVal] = useState('');

  // ==========================================
  // 3. DAILY STAFF STATE
  // ==========================================
  const [dailyHiringPurpose, setDailyHiringPurpose] = useState('commercial');
  const [dailyStaffList, setDailyStaffList] = useState([
    {
      id: '1',
      serviceCategory: 'Kitchen Staff',
      role: 'Chef / Main Cook',
      ratePerDay: 1499,
      genderPref: 'Any Gender',
      count: 1,
      days: 1,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '08:00 PM'
    }
  ]);
  const [dailyCouponInput, setDailyCouponInput] = useState('');
  const [dailyAppliedCoupon, setDailyAppliedCoupon] = useState(null);
  const [dailyCouponDiscount, setDailyCouponDiscount] = useState(0);

  // ==========================================
  // 4. PARTY CHEF STATE (Multi-Day & Multi-Meal)
  // ==========================================
  const [partyDatesList, setPartyDatesList] = useState([
    {
      id: '1',
      occasion: 'Birthday Party',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      meals: [
        {
          id: '1',
          mealType: 'Dinner',
          guests: 30,
          servingTime: '08:00 PM',
          foodPreference: 'Vegetarian',
          foodPrefFilter: 'All',
          menuChoice: 'now',
          selectedCuisines: ['North Indian'],
          selectedMenu: ['Paneer Butter Masala', 'Dal Makhani', 'Samosa'],
          categoryDishCounts: {
            'Starter': 2,
            'Main Course': 3,
            'Bread': 2,
            'Rice': 1,
            'Dessert': 1,
            'Snacks': 0,
            'Drinks': 0,
            'Breakfast': 0,
            'Sides': 0
          },
          notes: ''
        }
      ]
    }
  ]);

  // Party Add-ons
  const [partyBurnerStove, setPartyBurnerStove] = useState(false);
  const [partyCrockery, setPartyCrockery] = useState(false);
  const [partyWaiterStaff, setPartyWaiterStaff] = useState(false);
  const [partyWaiterCount, setPartyWaiterCount] = useState(1);
  const [partyKitchenCleaner, setPartyKitchenCleaner] = useState(false);

  // Party Promo Code / Coupon
  const [partyCouponInput, setPartyCouponInput] = useState('');
  const [partyAppliedCoupon, setPartyAppliedCoupon] = useState(null);
  const [partyCouponDiscountValue, setPartyCouponDiscountValue] = useState(0);

  // Category Accordion Expanded map for Party Dish list
  const [expandedCategories, setExpandedCategories] = useState({ 'Main Course': true });
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // Event Summary Modal
  const { isOpen: isOpenSummaryModal, onOpen: onOpenSummaryModal, onClose: onCloseSummaryModal } = useDisclosure();

  // Menu Catalog State
  const [menuCatalogItems, setMenuCatalogItems] = useState(DEFAULT_MENU_CATALOG);

  // Common Form Data
  const [formData, setFormData] = useState({
    title: '',
    outletName: '',
    propertyCategory: 'Restaurant',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    address: '',
    venueAddress: '',
    status: 'New',
    leadManager: '',
    notes: ''
  });

  const [jobImage, setJobImage] = useState(null);

  // Dynamic Master Data State (100% Synchronized directly from Master APIs)
  const [masterStates, setMasterStates] = useState({
    jobPositions: [],
    commercialCategories: [],
    staffMap: {},
    propertyCategories: [],
    commercialSalaries: [],
    commercialExperiences: [],
    commercialShifts: [],
    commercialLeaves: [],
    commercialJoining: [],
    commercialFacilities: [],
    commercialBenefits: [],
    domesticStaffCategories: [],
    domesticSalaries: [],
    cookPreferences: [],
    cookingPreferences: [],
    foodPreferences: [],
    genderPreferences: [],
    serviceDurations: [],
    familyMembers: [],
    occasionTypes: [],
    mealTypes: [],
    cuisines: [],
    dailyRoles: [],
    states: [],
    cities: []
  });

  const currentDistricts = (masterStates.cities && masterStates.cities.length > 0)
    ? masterStates.cities
    : (INDIA_STATES_AND_DISTRICTS[formData.state] || []);

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
          const menuRes = await axios.get(`${apiUrl}/menu-items`);
          if (menuRes.data.success && Array.isArray(menuRes.data.menuItems) && menuRes.data.menuItems.length > 0) {
            const apiDishes = menuRes.data.menuItems.map(item => ({
              name: item.name,
              cuisine: item.cuisine || 'North Indian',
              category: item.category || 'Main Course',
              isNonVeg: item.foodType === 'non-veg'
            }));
            setMenuCatalogItems([...DEFAULT_MENU_CATALOG, ...apiDishes]);
          }
        } catch (menuErr) {
          console.log('Using default menu catalog items');
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

        // ==========================================
        // FETCH DYNAMIC MASTER DATA ACROSS ALL 4 FORMS
        // ==========================================
        const fetchMaster = async (category) => {
          try {
            const res = await axios.get(`${apiUrl}/masters/${category}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data && res.data.success && Array.isArray(res.data.masters) && res.data.masters.length > 0) {
              return res.data.masters;
            }
          } catch (e) {
            // fallback silently
          }
          return null;
        };

        const [
          positionsData,
          jobCatData,
          propCatData,
          salaryData,
          expData,
          shiftData,
          leaveData,
          joiningData,
          facilityData,
          benefitData,
          cookPrefData,
          cookingPrefData,
          foodPrefData,
          familyData,
          genderData,
          durationData,
          eventsData,
          mealTypeData,
          cuisinesData,
          statesData,
          plansData
        ] = await Promise.all([
          fetchMaster('job-positions'),
          fetchMaster('job-categories'),
          fetchMaster('property-categories'),
          fetchMaster('salaries'),
          fetchMaster('experiences'),
          fetchMaster('time-ranges'),
          fetchMaster('leaves'),
          fetchMaster('joining-types'),
          fetchMaster('facilities'),
          fetchMaster('benefits'),
          fetchMaster('cook-preferences'),
          fetchMaster('cooking-preferences'),
          fetchMaster('food-preferences'),
          fetchMaster('family-members'),
          fetchMaster('gender-preferences'),
          fetchMaster('service-durations'),
          fetchMaster('events'),
          fetchMaster('meal-types'),
          fetchMaster('cuisines'),
          fetchMaster('states'),
          (async () => {
            try {
              const pRes = await axios.get(`${apiUrl}/plans`);
              if (pRes.data && pRes.data.success && Array.isArray(pRes.data.plans) && pRes.data.plans.length > 0) {
                return pRes.data.plans;
              }
            } catch (pe) {}
            return null;
          })()
        ]);

        setMasterStates(prev => {
          const next = { ...prev };
          if (positionsData && positionsData.length > 0) {
            next.jobPositions = positionsData.map(p => p.name);
            
            // Build dynamic staff map by category from master positions
            const dynamicStaffMap = {};
            positionsData.forEach(pos => {
              const parentName = pos.parentId?.name || 'Kitchen Staff';
              if (!dynamicStaffMap[parentName]) {
                dynamicStaffMap[parentName] = [];
              }
              if (!dynamicStaffMap[parentName].includes(pos.name)) {
                dynamicStaffMap[parentName].push(pos.name);
              }
            });
            next.staffMap = dynamicStaffMap;

            // Domestic staff categories directly from positions
            const domPositions = positionsData
              .filter(p => p.parentId?.name?.toLowerCase().includes('domestic') || p.parentId?.name?.toLowerCase().includes('home') || ['home cook', 'maid', 'driver', 'baby sitter', 'caretaker'].some(k => p.name.toLowerCase().includes(k)))
              .map(p => p.name);
            next.domesticStaffCategories = domPositions.length > 0 ? Array.from(new Set(domPositions)) : positionsData.map(p => p.name);
          }
          if (jobCatData && jobCatData.length > 0) {
            const commercialCats = jobCatData
              .filter(c => !c.name.toLowerCase().includes('party') && !c.name.toLowerCase().includes('daily') && !c.name.toLowerCase().includes('domestic'))
              .map(c => c.name);
            next.commercialCategories = commercialCats.length > 0 ? commercialCats : jobCatData.map(c => c.name);
          }
          if (propCatData && propCatData.length > 0) {
            next.propertyCategories = propCatData.map(p => p.name);
          }
          if (salaryData && salaryData.length > 0) {
            next.commercialSalaries = salaryData.map(s => s.name);
            next.domesticSalaries = salaryData.map(s => s.name);
          }
          if (expData && expData.length > 0) {
            next.commercialExperiences = expData.map(e => e.name);
          }
          if (shiftData && shiftData.length > 0) {
            next.commercialShifts = shiftData.map(s => s.name);
          }
          if (leaveData && leaveData.length > 0) {
            next.commercialLeaves = leaveData.map(l => l.name);
          }
          if (joiningData && joiningData.length > 0) {
            next.commercialJoining = joiningData.map(j => j.name);
          }
          if (facilityData && facilityData.length > 0) {
            next.commercialFacilities = facilityData.map(f => f.name);
          }
          if (benefitData && benefitData.length > 0) {
            next.commercialBenefits = benefitData.map(b => b.name);
          }
          if (cookPrefData && cookPrefData.length > 0) {
            next.cookPreferences = cookPrefData.map(c => c.name);
          }
          if (cookingPrefData && cookingPrefData.length > 0) {
            next.cookingPreferences = cookingPrefData.map(c => c.name);
          }
          if (foodPrefData && foodPrefData.length > 0) {
            next.foodPreferences = foodPrefData.map(f => f.name);
          } else if (cookingPrefData && cookingPrefData.length > 0) {
            next.foodPreferences = cookingPrefData.map(c => c.name);
          }
          if (familyData && familyData.length > 0) {
            next.familyMembers = familyData.map(f => f.name);
          }
          if (genderData && genderData.length > 0) {
            next.genderPreferences = genderData.map(g => g.name);
          }
          if (durationData && durationData.length > 0) {
            next.serviceDurations = durationData.map(d => d.name);
          }
          if (eventsData && eventsData.length > 0) {
            next.occasionTypes = eventsData.map(e => e.name);
          }
          if (mealTypeData && mealTypeData.length > 0) {
            next.mealTypes = mealTypeData.map(m => m.name);
          }
          if (cuisinesData && cuisinesData.length > 0) {
            next.cuisines = cuisinesData.map(c => c.name);
          }
          if (statesData && statesData.length > 0) {
            next.states = statesData;
          }
          if (plansData && plansData.length > 0) {
            const mappedDaily = plansData.map(p => ({
              role: p.title || p.label || p.name || 'Staff',
              rate: p.rate || p.price || 999,
              category: p.category || 'Kitchen Staff',
              desc: p.description || 'Verified staff member'
            }));
            if (mappedDaily.length > 0) next.dailyRoles = mappedDaily;
          }
          return next;
        });

      } catch (error) {
        console.error('Initial fetch failed', error);
      } finally {
        setIsFetchingCustomers(false);
      }
    };
    initFetch();
  }, []);

  // Fetch Cities Dynamically when State Changes
  useEffect(() => {
    if (!formData.state) return;
    const matchedState = masterStates.states.find(s => s.name === formData.state);
    if (matchedState && matchedState._id) {
      axios.get(`${apiUrl}/masters/cities?parentId=${matchedState._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data?.success && Array.isArray(res.data.masters) && res.data.masters.length > 0) {
          setMasterStates(prev => ({ ...prev, cities: res.data.masters.map(c => c.name) }));
        } else {
          setMasterStates(prev => ({ ...prev, cities: INDIA_STATES_AND_DISTRICTS[formData.state] || [] }));
        }
      }).catch(() => {
        setMasterStates(prev => ({ ...prev, cities: INDIA_STATES_AND_DISTRICTS[formData.state] || [] }));
      });
    } else {
      setMasterStates(prev => ({ ...prev, cities: INDIA_STATES_AND_DISTRICTS[formData.state] || [] }));
    }
  }, [formData.state, masterStates.states]);

  // Live Calculations for Daily Staff
  const calculateDailyTotals = () => {
    const staffCost = dailyStaffList.reduce((sum, s) => sum + (s.ratePerDay * s.count * s.days), 0);
    let discount = 0;
    if (dailyAppliedCoupon && dailyCouponDiscount > 0) {
      discount = Math.round(staffCost * (dailyCouponDiscount / 100));
    }
    const taxable = Math.max(0, staffCost - discount);
    const gst = Math.round(taxable * 0.18);
    const total = taxable + gst;
    const advance = Math.round(total * 0.25);
    return { staffCost, discount, taxable, gst, total, advance };
  };

  const dailyTotals = calculateDailyTotals();

  // Live Calculations for Party Chef
  const calculatePartyTotals = () => {
    let totalGuests = 0;
    let totalDishes = 0;
    for (const d of partyDatesList) {
      for (const m of d.meals) {
        totalGuests += parseInt(m.guests, 10) || 0;
        if (m.menuChoice === 'now') {
          totalDishes += m.selectedMenu.length;
        } else {
          totalDishes += Object.values(m.categoryDishCounts || {}).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
        }
      }
    }
    if (totalGuests === 0) totalGuests = 30;

    const baseChefRate = 1999.0 * (partyDatesList.length || 1);
    const guestRateTotal = totalGuests * 55.0;
    const menuItemsTotal = totalDishes * 150.0;

    let addOnsTotal = 0;
    if (partyBurnerStove) addOnsTotal += 350;
    if (partyCrockery) addOnsTotal += 500;
    if (partyKitchenCleaner) addOnsTotal += 400;
    if (partyWaiterStaff) addOnsTotal += (partyWaiterCount * 600);

    const grossSubtotal = baseChefRate + guestRateTotal + menuItemsTotal + addOnsTotal;
    let discountAmount = 0;
    if (partyAppliedCoupon && partyCouponDiscountValue > 0) {
      discountAmount = Math.round(grossSubtotal * (partyCouponDiscountValue / 100));
    }
    const taxable = Math.max(0, grossSubtotal - discountAmount);
    const gst = Math.round(taxable * 0.18);
    const finalAmount = taxable + gst;
    const advanceAmount = Math.round(finalAmount * 0.25);

    return {
      totalGuests,
      totalDishes,
      baseChefRate,
      guestRateTotal,
      menuItemsTotal,
      addOnsTotal,
      grossSubtotal,
      discountAmount,
      taxable,
      gst,
      finalAmount,
      advanceAmount
    };
  };

  const partyTotals = calculatePartyTotals();

  // Customer handler
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

  // Party Date / Meal state mutators
  const handleAddPartyDay = () => {
    const nextDate = new Date(Date.now() + (partyDatesList.length + 1) * 86400000).toISOString().split('T')[0];
    setPartyDatesList(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        occasion: 'Birthday Party',
        date: nextDate,
        meals: [
          {
            id: Date.now().toString() + '_1',
            mealType: 'Dinner',
            guests: 30,
            servingTime: '08:00 PM',
            foodPreference: 'Vegetarian',
            foodPrefFilter: 'All',
            menuChoice: 'now',
            selectedCuisines: ['North Indian'],
            selectedMenu: ['Paneer Butter Masala', 'Dal Makhani', 'Samosa'],
            categoryDishCounts: {
              'Starter': 2,
              'Main Course': 3,
              'Bread': 2,
              'Rice': 1,
              'Dessert': 1,
              'Snacks': 0,
              'Drinks': 0,
              'Breakfast': 0,
              'Sides': 0
            },
            notes: ''
          }
        ]
      }
    ]);
  };

  const handleRemovePartyDay = (dayId, index) => {
    setPartyDatesList(prev => {
      if (prev.length <= 1) {
        toast({ title: 'At least 1 Event Day is required', status: 'info', duration: 2000 });
        return prev;
      }
      return prev.filter((d, idx) => (dayId !== undefined && d.id !== undefined) ? d.id !== dayId : idx !== index);
    });
  };

  const handleAddMealToDay = (dayId) => {
    setPartyDatesList(prev => prev.map(d => {
      if (d.id === dayId) {
        const newMeal = {
          id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          mealType: d.meals.length === 1 ? 'Lunch' : 'Dinner',
          guests: d.meals[0]?.guests || 30,
          servingTime: '01:30 PM',
          foodPreference: 'Vegetarian',
          foodPrefFilter: 'All',
          menuChoice: 'now',
          selectedCuisines: ['North Indian'],
          selectedMenu: ['Paneer Tikka', 'Butter Naan'],
          categoryDishCounts: {
            'Starter': 1,
            'Main Course': 2,
            'Bread': 2,
            'Rice': 1,
            'Dessert': 1,
            'Snacks': 0,
            'Drinks': 0,
            'Breakfast': 0,
            'Sides': 0
          },
          notes: ''
        };
        return { ...d, meals: [...d.meals, newMeal] };
      }
      return d;
    }));
  };

  const handleRemoveMealFromDay = (dayId, mealId, mIdx) => {
    setPartyDatesList(prev => prev.map(d => {
      if (d.id === dayId) {
        if (d.meals.length <= 1) {
          toast({ title: 'At least 1 meal is required per day', status: 'info', duration: 2000 });
          return d;
        }
        return { ...d, meals: d.meals.filter((m, idx) => (mealId !== undefined && m.id !== undefined) ? m.id !== mealId : idx !== mIdx) };
      }
      return d;
    }));
  };

  const handleToggleDishForMeal = (dayId, mealId, dishName) => {
    setPartyDatesList(prev => prev.map(d => {
      if (d.id === dayId) {
        const updatedMeals = d.meals.map(m => {
          if (m.id === mealId) {
            const exists = m.selectedMenu.includes(dishName);
            const nextList = exists
              ? m.selectedMenu.filter(name => name !== dishName)
              : [...m.selectedMenu, dishName];
            return { ...m, selectedMenu: nextList };
          }
          return m;
        });
        return { ...d, meals: updatedMeals };
      }
      return d;
    }));
  };

  const handleUpdateDishCategoryCount = (dayId, mealId, category, delta) => {
    setPartyDatesList(prev => prev.map(d => {
      if (d.id === dayId) {
        const updatedMeals = d.meals.map(m => {
          if (m.id === mealId) {
            const counts = { ...m.categoryDishCounts };
            const current = counts[category] || 0;
            counts[category] = Math.max(0, current + delta);
            return { ...m, categoryDishCounts: counts };
          }
          return m;
        });
        return { ...d, meals: updatedMeals };
      }
      return d;
    }));
  };

  const applyPartyCouponCode = (code) => {
    const trimmed = (code || partyCouponInput).trim().toUpperCase();
    if (!trimmed) return;
    const match = availableOffers.find(o => o.code === trimmed);
    if (match) {
      setPartyAppliedCoupon(trimmed);
      setPartyCouponDiscountValue(match.discountValue);
      setPartyCouponInput(trimmed);
      toast({ title: `Coupon ${trimmed} Applied!`, description: `${match.discountValue}% discount added.`, status: 'success', duration: 2500 });
    } else {
      toast({ title: 'Invalid Coupon Code', status: 'error', duration: 2500 });
    }
  };

  const applyDailyCouponCode = (code) => {
    const trimmed = (code || dailyCouponInput).trim().toUpperCase();
    if (!trimmed) return;
    const match = availableOffers.find(o => o.code === trimmed);
    if (match) {
      setDailyAppliedCoupon(trimmed);
      setDailyCouponDiscount(match.discountValue);
      setDailyCouponInput(trimmed);
      toast({ title: `Coupon ${trimmed} Applied!`, description: `${match.discountValue}% discount added.`, status: 'success', duration: 2500 });
    } else {
      toast({ title: 'Invalid Coupon Code', status: 'error', duration: 2500 });
    }
  };

  // Submit Handler
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
      
      let computedTitle = formData.title.trim();
      if (!computedTitle) {
        if (serviceType === 'hotel') {
          const staffSummary = commercialStaffList.map(s => `${s.role} (${s.vacancies})`).join(', ');
          computedTitle = `${staffSummary} for ${formData.outletName || 'Commercial Outlet'} in ${formData.city}`;
        }
        else if (serviceType === 'home') computedTitle = `Domestic ${dStaffCategory} (${dFoodPreference}) for ${dFamilyMembers}`;
        else if (serviceType === 'daily') computedTitle = `Daily Basis (${dailyStaffList[0]?.role || 'Staff'}) for ${formData.city}`;
        else if (serviceType === 'party') computedTitle = `Chef for Party (${partyTotals.totalGuests} Guests • ${partyDatesList.length} Days)`;
      }

      payload.set('title', computedTitle);
      payload.set('state', formData.state || 'Uttar Pradesh');
      payload.set('city', formData.city || 'Lucknow');
      payload.set('address', formData.address || selectedCustomer.address || '');
      if (formData.venueAddress) payload.set('venueAddress', formData.venueAddress);
      payload.set('status', formData.status || 'New');
      if (formData.leadManager) payload.set('leadManager', formData.leadManager);

      // Category Specific Mapping
      if (serviceType === 'hotel') {
        const firstStaff = commercialStaffList[0] || {};
        const totalVacancies = commercialStaffList.reduce((sum, s) => sum + (parseInt(s.vacancies, 10) || 1), 0);
        
        payload.set('hiringPurpose', 'commercial');
        payload.set('outletName', formData.outletName || '');
        payload.set('propertyCategory', formData.propertyCategory || 'Restaurant');
        payload.set('category', firstStaff.category || 'Chef / Kitchen Staff');
        payload.set('jobPosition', firstStaff.role || 'Head Chef/ Master Chef');
        payload.set('openings', totalVacancies.toString());
        payload.set('packageOrGuestOrVacancy', totalVacancies.toString());
        payload.set('jobType', firstStaff.shiftType === 'Custom' ? firstStaff.shiftCustomVal : (firstStaff.shiftType || 'Full Time (10-12 hrs)'));
        payload.set('salaryRange', firstStaff.salaryCustom ? firstStaff.salaryCustomVal : (firstStaff.salary || '₹12,000 – ₹15,000'));
        payload.set('salary', firstStaff.salaryCustom ? firstStaff.salaryCustomVal : (firstStaff.salary || '₹12,000 – ₹15,000'));
        payload.set('experienceRange', firstStaff.expCustom ? firstStaff.expCustomVal : (firstStaff.experience || '2 – 5 Years'));
        payload.set('experience', firstStaff.expCustom ? firstStaff.expCustomVal : (firstStaff.experience || '2 – 5 Years'));
        payload.set('joiningType', firstStaff.joiningTimeline === 'Custom' ? firstStaff.joiningCustomVal : (firstStaff.joiningTimeline || 'Immediate'));
        payload.set('joiningDate', firstStaff.joiningTimeline === 'Custom' ? firstStaff.joiningCustomVal : (firstStaff.joiningTimeline || 'Immediate'));
        payload.set('allowedLeave', firstStaff.allowedLeave === 'Custom' ? firstStaff.leaveCustomVal : (firstStaff.allowedLeave || '2 days/month'));
        payload.set('leavePerMonth', firstStaff.allowedLeave === 'Custom' ? firstStaff.leaveCustomVal : (firstStaff.allowedLeave || '2 days/month'));
        payload.set('travelCharges', firstStaff.otherPerks || '');
        payload.set('otherFacilities', firstStaff.otherPerks || '');
        payload.set('basicFacility', firstStaff.facilities === 'Custom' ? firstStaff.facilitiesCustomVal : (firstStaff.facilities || 'Food & Accommodation'));
        payload.set('isUrgent', firstStaff.isUrgent ? 'true' : 'false');

        const formattedCommercialList = commercialStaffList.map(s => ({
          serviceCategory: s.category,
          staffCategory: s.role,
          role: s.role,
          noOfStaff: parseInt(s.vacancies, 10) || 1,
          count: parseInt(s.vacancies, 10) || 1,
          vacancies: parseInt(s.vacancies, 10) || 1,
          salaryRange: s.salaryCustom ? s.salaryCustomVal : s.salary,
          salary: s.salaryCustom ? s.salaryCustomVal : s.salary,
          experienceRange: s.expCustom ? s.expCustomVal : s.experience,
          experience: s.expCustom ? s.expCustomVal : s.experience,
          shiftType: s.shiftType === 'Custom' ? s.shiftCustomVal : s.shiftType,
          jobType: s.shiftType === 'Custom' ? s.shiftCustomVal : s.shiftType,
          allowedLeave: s.allowedLeave === 'Custom' ? s.leaveCustomVal : s.allowedLeave,
          joiningType: s.joiningTimeline === 'Custom' ? s.joiningCustomVal : s.joiningTimeline,
          joiningTimeline: s.joiningTimeline === 'Custom' ? s.joiningCustomVal : s.joiningTimeline,
          facilities: s.facilities === 'Custom' ? s.facilitiesCustomVal : s.facilities,
          basicFacility: s.facilities === 'Custom' ? s.facilitiesCustomVal : s.facilities,
          otherPerks: s.otherPerks,
          isUrgent: s.isUrgent
        }));

        payload.set('commercialStaffList', JSON.stringify(formattedCommercialList));
      } else if (serviceType === 'home') {
        payload.set('hiringPurpose', 'domestic');
        payload.set('category', 'domestic');
        payload.set('jobPosition', dStaffCategory);
        payload.set('homeCookLevel', dCookPreference);
        payload.set('familyMembers', dFamilyMembers);
        payload.set('genderPreference', dGenderPreference);
        payload.set('foodPreference', dFoodPreference);
        payload.set('serviceDuration', dServiceDuration);
        payload.set('salaryRange', dSalaryCustom ? dSalaryCustomVal : dSalary);
        payload.set('salary', dSalaryCustom ? dSalaryCustomVal : dSalary);
        payload.set('experienceRange', dExp === 'Custom' ? dExpCustomVal : dExp);
        payload.set('experience', dExp === 'Custom' ? dExpCustomVal : dExp);
        payload.set('joiningType', dJoining === 'Custom' ? dJoiningCustomVal : dJoining);
        payload.set('joiningDate', dJoining === 'Custom' ? dJoiningCustomVal : dJoining);
        payload.set('allowedLeave', dLeave);
        payload.set('leavePerMonth', dLeave);
        payload.set('travelCharges', dFare === 'Custom' ? dFareCustomVal : dFare);
      } else if (serviceType === 'daily') {
        payload.set('dailyHiringPurpose', dailyHiringPurpose);
        payload.set('category', 'daily');
        payload.set('jobPosition', dailyStaffList[0]?.role || 'Chef / Main Cook');
        const totalCount = dailyStaffList.reduce((acc, s) => acc + (parseInt(s.count, 10) || 1), 0);
        payload.set('packageOrGuestOrVacancy', totalCount.toString());
        payload.set('staffRequirements', JSON.stringify(dailyStaffList));
        payload.set('appliedCoupon', dailyAppliedCoupon || '');
        payload.set('pricing', JSON.stringify({
          staffCost: dailyTotals.staffCost,
          discount: dailyTotals.discount,
          taxable: dailyTotals.taxable,
          gst: dailyTotals.gst,
          totalAmount: dailyTotals.total,
          advancePayable: dailyTotals.advance
        }));
      } else if (serviceType === 'party') {
        payload.set('category', 'party');
        payload.set('event', partyDatesList[0]?.occasion || 'Birthday Party');
        payload.set('jobPosition', 'Party Chef');
        payload.set('noOfGuests', partyTotals.totalGuests.toString());
        payload.set('dateOfEvent', partyDatesList[0]?.date || new Date().toISOString());

        const partyReq = {
          city: formData.city,
          venueAddress: formData.venueAddress || formData.address || '',
          datesCount: partyDatesList.length,
          totalGuests: partyTotals.totalGuests,
          totalDishes: partyTotals.totalDishes,
          addOns: {
            burnerStove: partyBurnerStove,
            crockery: partyCrockery,
            kitchenCleaner: partyKitchenCleaner,
            waiterStaff: partyWaiterStaff,
            waiterCount: partyWaiterCount
          },
          appliedCoupon: partyAppliedCoupon,
          eventDates: partyDatesList.map(d => ({
            occasion: d.occasion,
            date: d.date,
            meals: d.meals.map(m => ({
              mealType: m.mealType,
              guests: m.guests,
              servingTime: m.servingTime,
              foodPreference: m.foodPreference,
              menuChoice: m.menuChoice,
              selectedCuisines: m.selectedCuisines,
              selectedMenu: m.menuChoice === 'now' ? m.selectedMenu : [],
              categoryDishCounts: m.menuChoice === 'later' ? m.categoryDishCounts : {},
              notes: m.notes
            }))
          })),
          billingSummary: {
            baseChefFee: partyTotals.baseChefRate,
            guestCharges: partyTotals.guestRateTotal,
            menuItemsCharges: partyTotals.menuItemsTotal,
            addOnsTotal: partyTotals.addOnsTotal,
            discount: partyTotals.discountAmount,
            gst: partyTotals.gst,
            totalAmount: partyTotals.finalAmount,
            advancePayable: partyTotals.advanceAmount
          }
        };

        payload.set('partyRequirement', JSON.stringify(partyReq));
        payload.set('pricing', JSON.stringify(partyReq.billingSummary));
      }

      payload.set('overview', `Requirement for ${computedTitle}. Customer: ${selectedCustomer.name}.`);
      payload.set('responsibilities', `Handle kitchen preparation, hygiene, delicious food service and operations.`);
      payload.set('requirements', `Experienced staff/chef with high hygiene standards and punctuality.`);

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

  const serviceOptions = [
    { id: 'hotel', title: 'Commercial Hiring', desc: 'Hotel, Restaurant, Cafe, etc.', icon: Building2, color: '#2563EB', bg: '#EFF6FF' },
    { id: 'home', title: 'Domestic Home Cook', desc: 'Full-time 10/24 hr, Live-in Cook', icon: Home, color: '#E11D48', bg: '#FFF1F2' },
    { id: 'daily', title: 'Daily Basis Staff', desc: 'Daily / Short Term (ODC)', icon: Calendar, color: '#059669', bg: '#ECFDF5' },
    { id: 'party', title: 'Chef for Party', desc: 'Events & Special Occasion', icon: UtensilsCrossed, color: '#7C3AED', bg: '#F5F3FF' }
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
                    border={isSelected ? `2.5px solid ${opt.color}` : '1.5px solid #e2e8f0'}
                    bg={isSelected ? opt.bg : 'white'}
                    boxShadow={isSelected ? `0 6px 18px ${opt.color}20` : 'none'}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}
                    position="relative"
                  >
                    <Flex justify="space-between" align="flex-start" mb="3">
                      <Flex w="38px" h="38px" borderRadius="lg" bg={isSelected ? 'white' : opt.bg} align="center" justify="center" color={opt.color}>
                        <OptIcon size={20} />
                      </Flex>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={opt.color} />
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

            {/* === 1. COMMERCIAL FORM (MULTI-STAFF SUPPORT) === */}
            {serviceType === 'hotel' && (
              <VStack spacing="5" align="stretch">
                {/* Outlet / Property details */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" p="4" bg="#f1f5f9" borderRadius="xl">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>OUTLET / BUSINESS NAME **</FormLabel>
                    <Input
                      name="outletName"
                      value={formData.outletName}
                      onChange={handleChange}
                      placeholder="e.g. Royal Cafe / Grand Hotel"
                      {...inputStyle}
                      bg="white"
                      h="42px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>PROPERTY CATEGORY **</FormLabel>
                    <Select
                      name="propertyCategory"
                      value={formData.propertyCategory}
                      onChange={handleChange}
                      {...selectStyle}
                      bg="white"
                      h="42px"
                    >
                      {(masterStates.propertyCategories && masterStates.propertyCategories.length > 0
                        ? masterStates.propertyCategories
                        : commercialPropertyCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Staff Requirements List */}
                {commercialStaffList.map((staff, idx) => (
                  <Box
                    key={staff.id}
                    p="5"
                    borderRadius="xl"
                    border="1.5px solid #e2e8f0"
                    bg="#fafcff"
                    boxShadow="sm"
                    position="relative"
                  >
                    <Flex justify="space-between" align="center" mb="4" pb="2.5" borderBottom="1px solid #e2e8f0">
                      <HStack spacing="2.5">
                        <Badge colorScheme="blue" fontSize="11px" px="2.5" py="1" borderRadius="md" fontWeight="800">
                          STAFF REQUIREMENT #{idx + 1}
                        </Badge>
                        <Text fontSize="xs" fontWeight="700" color="#334155">
                          {staff.role} ({staff.vacancies} {parseInt(staff.vacancies, 10) > 1 ? 'Vacancies' : 'Vacancy'})
                        </Text>
                      </HStack>

                      {commercialStaffList.length > 1 && (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<Trash2 size={13} />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveCommercialStaff(staff.id, idx);
                          }}
                        >
                          Remove Staff
                        </Button>
                      )}
                    </Flex>

                    <VStack spacing="4" align="stretch">
                      {/* Row 1: Category, Role, Vacancies */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>STAFF CATEGORY **</FormLabel>
                          <Select
                            value={staff.category}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'category', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {(masterStates.commercialCategories && masterStates.commercialCategories.length > 0
                              ? masterStates.commercialCategories
                              : commercialServiceCategories).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>JOB POSITION / ROLE **</FormLabel>
                          <Select
                            value={staff.role}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'role', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {(() => {
                              const catPositions = masterStates.staffMap && masterStates.staffMap[staff.category];
                              const positionList = (catPositions && catPositions.length > 0)
                                ? catPositions
                                : (masterStates.jobPositions && masterStates.jobPositions.length > 0
                                    ? masterStates.jobPositions
                                    : (commercialStaffCategoriesMap[staff.category] || []));
                              
                              const uniqueRoles = Array.from(new Set([
                                staff.role,
                                ...positionList,
                                ...(masterStates.jobPositions || [])
                              ])).filter(Boolean);

                              return uniqueRoles.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ));
                            })()}
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>NO. OF VACANCIES **</FormLabel>
                          <Input
                            type="number"
                            min={1}
                            value={staff.vacancies}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'vacancies', e.target.value)}
                            placeholder="1"
                            {...inputStyle}
                            bg="white"
                            h="42px"
                          />
                        </FormControl>
                      </SimpleGrid>

                      {/* Row 2: Salary, Experience, Shift */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>SALARY BUDGET **</FormLabel>
                          <Select
                            value={staff.salary}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'salary', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {Array.from(new Set([...(masterStates.commercialSalaries || commercialSalaryRanges), 'Custom Range'])).map(sal => (
                              <option key={sal} value={sal}>{sal}</option>
                            ))}
                          </Select>
                          {staff.salaryCustom && (
                            <Input
                              mt="2"
                              placeholder="Enter custom salary (e.g. ₹40,000/month)"
                              value={staff.salaryCustomVal}
                              onChange={(e) => handleUpdateCommercialStaff(staff.id, 'salaryCustomVal', e.target.value)}
                              {...inputStyle}
                              bg="white"
                              h="38px"
                            />
                          )}
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>EXPERIENCE REQUIRED **</FormLabel>
                          <Select
                            value={staff.experience}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'experience', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {Array.from(new Set([...(masterStates.commercialExperiences || commercialExpOptions), 'Custom'])).map(exp => (
                              <option key={exp} value={exp}>{exp}</option>
                            ))}
                          </Select>
                          {staff.expCustom && (
                            <Input
                              mt="2"
                              placeholder="Enter custom experience"
                              value={staff.expCustomVal}
                              onChange={(e) => handleUpdateCommercialStaff(staff.id, 'expCustomVal', e.target.value)}
                              {...inputStyle}
                              bg="white"
                              h="38px"
                            />
                          )}
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>SHIFT / JOB TYPE **</FormLabel>
                          <Select
                            value={staff.shiftType}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'shiftType', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {Array.from(new Set([...(masterStates.commercialShifts || commercialShiftOptions), 'Custom'])).map(shift => (
                              <option key={shift} value={shift}>{shift}</option>
                            ))}
                          </Select>
                          {staff.shiftType === 'Custom' && (
                            <Input
                              mt="2"
                              placeholder="Enter custom shift type"
                              value={staff.shiftCustomVal}
                              onChange={(e) => handleUpdateCommercialStaff(staff.id, 'shiftCustomVal', e.target.value)}
                              {...inputStyle}
                              bg="white"
                              h="38px"
                            />
                          )}
                        </FormControl>
                      </SimpleGrid>

                      {/* Row 3: Leave, Joining, Facilities */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>ALLOWED LEAVE **</FormLabel>
                          <Select
                            value={staff.allowedLeave}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'allowedLeave', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {Array.from(new Set([...(masterStates.commercialLeaves || commercialLeaveOptions), 'Custom'])).map(l => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </Select>
                          {staff.allowedLeave === 'Custom' && (
                            <Input
                              mt="2"
                              placeholder="Enter custom leave"
                              value={staff.leaveCustomVal}
                              onChange={(e) => handleUpdateCommercialStaff(staff.id, 'leaveCustomVal', e.target.value)}
                              {...inputStyle}
                              bg="white"
                              h="38px"
                            />
                          )}
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>JOINING TIMELINE **</FormLabel>
                          <Select
                            value={staff.joiningTimeline}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'joiningTimeline', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {Array.from(new Set([...(masterStates.commercialJoining || commercialJoiningOptions), 'Custom'])).map(j => (
                              <option key={j} value={j}>{j}</option>
                            ))}
                          </Select>
                          {staff.joiningTimeline === 'Custom' && (
                            <Input
                              mt="2"
                              type="date"
                              value={staff.joiningCustomVal}
                              onChange={(e) => handleUpdateCommercialStaff(staff.id, 'joiningCustomVal', e.target.value)}
                              {...inputStyle}
                              bg="white"
                              h="38px"
                            />
                          )}
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel {...formLabelStyle}>FACILITIES PROVIDED **</FormLabel>
                          <Select
                            value={staff.facilities}
                            onChange={(e) => handleUpdateCommercialStaff(staff.id, 'facilities', e.target.value)}
                            {...selectStyle}
                            bg="white"
                            h="42px"
                          >
                            {Array.from(new Set([...(masterStates.commercialFacilities || commercialFacilitiesOptions), 'Custom'])).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </Select>
                          {staff.facilities === 'Custom' && (
                            <Input
                              mt="2"
                              placeholder="Enter custom facilities note"
                              value={staff.facilitiesCustomVal}
                              onChange={(e) => handleUpdateCommercialStaff(staff.id, 'facilitiesCustomVal', e.target.value)}
                              {...inputStyle}
                              bg="white"
                              h="38px"
                            />
                          )}
                        </FormControl>
                      </SimpleGrid>

                      {/* Row 4: Other Perks / Benefits */}
                      <FormControl>
                        <FormLabel {...formLabelStyle}>OTHER PERKS / BENEFITS</FormLabel>
                        <Input
                          value={staff.otherPerks}
                          onChange={(e) => handleUpdateCommercialStaff(staff.id, 'otherPerks', e.target.value)}
                          placeholder="e.g. Travel Allowance, Tips, PF & ESI, Overtime Pay"
                          {...inputStyle}
                          bg="white"
                          h="42px"
                        />
                      </FormControl>

                      {/* Urgent Requirement Toggle */}
                      <Flex p="3.5" bg="#fff1f2" border="1px solid #fecdd3" borderRadius="xl" align="center" justify="space-between">
                        <HStack spacing="2.5">
                          <AlertCircle size={18} color="#e11d48" />
                          <Box>
                            <Text fontWeight="800" fontSize="xs" color="#9f1239">Urgent Hiring Requirement</Text>
                            <Text fontSize="11px" color="#64748b">Highlights this position with an Urgent badge for faster candidate applications.</Text>
                          </Box>
                        </HStack>
                        <Switch isChecked={staff.isUrgent} onChange={(e) => handleUpdateCommercialStaff(staff.id, 'isUrgent', e.target.checked)} colorScheme="red" />
                      </Flex>
                    </VStack>
                  </Box>
                ))}

                {/* Bottom Right: + Add More Staff Button */}
                <Flex justify="flex-end" pt="1">
                  <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme="blue"
                    bg="#2563eb"
                    _hover={{ bg: '#1d4ed8' }}
                    color="white"
                    size="md"
                    borderRadius="lg"
                    fontWeight="700"
                    boxShadow="sm"
                    px="5"
                    onClick={handleAddCommercialStaff}
                  >
                    + Add More Staff
                  </Button>
                </Flex>
              </VStack>
            )}

            {/* === 2. DOMESTIC HOME COOK FORM (MATCHING APP 100%) === */}
            {serviceType === 'home' && (
              <VStack spacing="5" align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>STAFF CATEGORY *</FormLabel>
                    <Select
                      value={dStaffCategory}
                      onChange={(e) => setDStaffCategory(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {(masterStates.domesticStaffCategories && masterStates.domesticStaffCategories.length > 0
                        ? masterStates.domesticStaffCategories
                        : ['Home Cook', 'Baby Sitter', 'Maid', 'Driver', 'Caretaker']).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>COOK PREFERENCE / LEVEL *</FormLabel>
                    <Select
                      value={dCookPreference}
                      onChange={(e) => setDCookPreference(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {(masterStates.cookPreferences && masterStates.cookPreferences.length > 0
                        ? masterStates.cookPreferences
                        : cookPreferences).map(cp => (
                        <option key={cp} value={cp}>{cp}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>FAMILY MEMBERS *</FormLabel>
                    <Select
                      value={dFamilyMembers}
                      onChange={(e) => setDFamilyMembers(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {(masterStates.familyMembers && masterStates.familyMembers.length > 0
                        ? masterStates.familyMembers
                        : familyMembersList).map(fm => (
                        <option key={fm} value={fm}>{fm}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>GENDER PREFERENCE *</FormLabel>
                    <Select
                      value={dGenderPreference}
                      onChange={(e) => setDGenderPreference(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {(masterStates.genderPreferences && masterStates.genderPreferences.length > 0
                        ? masterStates.genderPreferences
                        : ['Anyone', 'Male', 'Female']).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>FOOD PREFERENCE *</FormLabel>
                    <Select
                      value={dFoodPreference}
                      onChange={(e) => setDFoodPreference(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {(masterStates.foodPreferences && masterStates.foodPreferences.length > 0
                        ? masterStates.foodPreferences
                        : ['Pure Veg', 'Veg + Non Veg', 'Vegetarian (Veg Only)', 'Non-Vegetarian', 'Both (Veg & Non-Veg)', 'Jain Food', 'Eggetarian', 'Vegan']).map(fp => (
                        <option key={fp} value={fp}>{fp}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SERVICE DURATION *</FormLabel>
                    <Select
                      value={dServiceDuration}
                      onChange={(e) => setDServiceDuration(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {(masterStates.serviceDurations && masterStates.serviceDurations.length > 0
                        ? masterStates.serviceDurations
                        : ['10 Hours – ( Morning to Evening)', '24 Hours – Live-in Cook', '12 Hours (Day)', '12 Hours (Night)', 'Part Time (4-6 Hours)']).map(sd => (
                        <option key={sd} value={sd}>{sd}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 4 }} spacing="4">
                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>SALARY RANGE *</FormLabel>
                    <Select
                      value={dSalary}
                      onChange={(e) => {
                        setDSalary(e.target.value);
                        setDSalaryCustom(e.target.value === 'Custom Range');
                      }}
                      {...selectStyle}
                      h="42px"
                    >
                      {Array.from(new Set([...(masterStates.domesticSalaries || domesticSalaries), 'Custom Range'])).map(sal => (
                        <option key={sal} value={sal}>{sal}</option>
                      ))}
                    </Select>
                    {dSalaryCustom && (
                      <Input
                        mt="2"
                        placeholder="Enter custom salary"
                        value={dSalaryCustomVal}
                        onChange={(e) => setDSalaryCustomVal(e.target.value)}
                        {...inputStyle}
                        h="38px"
                      />
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>EXPERIENCE *</FormLabel>
                    <Select
                      value={dExp}
                      onChange={(e) => setDExp(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {Array.from(new Set([...(masterStates.commercialExperiences || expOptionsList), 'Custom'])).map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel {...formLabelStyle}>JOINING DATE *</FormLabel>
                    <Select
                      value={dJoining}
                      onChange={(e) => setDJoining(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {Array.from(new Set([...(masterStates.commercialJoining || joiningTypeOptions), 'Custom'])).map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel {...formLabelStyle}>ALLOWED LEAVES</FormLabel>
                    <Select
                      value={dLeave}
                      onChange={(e) => setDLeave(e.target.value)}
                      {...selectStyle}
                      h="42px"
                    >
                      {Array.from(new Set([...(masterStates.commercialLeaves || leaveOptionsList), 'Custom'])).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            )}

            {/* === 3. DAILY BASIS STAFF (ODC) FORM (MATCHING APP 100%) === */}
            {serviceType === 'daily' && (
              <VStack spacing="5" align="stretch">
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
                          border={isPurSelected ? `2px solid #059669` : '1.5px solid #e2e8f0'}
                          bg={isPurSelected ? '#ecfdf5' : 'white'}
                          transition="all 0.2s"
                        >
                          <HStack spacing="3">
                            <Flex w="36px" h="36px" borderRadius="lg" bg="#d1fae5" color="#059669" align="center" justify="center">
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

                {/* Daily Staff List */}
                <Box p="4" bg="#f8fafc" border="1.5px solid #e2e8f0" borderRadius="xl">
                  <Flex justify="space-between" align="center" mb="3" flexWrap="wrap" gap="2">
                    <Box>
                      <Text fontWeight="800" fontSize="sm" color="#1e293b">
                        Daily Staff Requirements Roster
                      </Text>
                      <Text fontSize="xs" color="#64748b">
                        Select role presets with standard day-rates or customize requirements.
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      leftIcon={<Plus size={14} />}
                      bg="#059669"
                      color="white"
                      _hover={{ bg: '#047857' }}
                      onClick={() => {
                        setDailyStaffList(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            serviceCategory: 'Kitchen Staff',
                            role: 'Chef / Main Cook',
                            ratePerDay: 1499,
                            genderPref: 'Any Gender',
                            count: 1,
                            days: 1,
                            startDate: new Date().toISOString().split('T')[0],
                            startTime: '10:00 AM',
                            endTime: '08:00 PM'
                          }
                        ]);
                      }}
                      fontWeight="700"
                      px="3"
                      h="32px"
                      borderRadius="md"
                    >
                      + Add Staff Role
                    </Button>
                  </Flex>

                  {/* Preset Buttons */}
                  <Wrap spacing="2" mb="4">
                    {(masterStates.dailyRoles && masterStates.dailyRoles.length > 0 ? masterStates.dailyRoles : dailyRolesList).map(preset => (
                      <WrapItem key={preset.role}>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="#cbd5e1"
                          bg="white"
                          fontSize="xs"
                          onClick={() => {
                            setDailyStaffList(prev => [
                              ...prev,
                              {
                                id: Date.now().toString(),
                                serviceCategory: preset.category || 'Kitchen Staff',
                                role: preset.role,
                                ratePerDay: preset.rate,
                                genderPref: 'Any Gender',
                                count: 1,
                                days: 1,
                                startDate: new Date().toISOString().split('T')[0],
                                startTime: '10:00 AM',
                                endTime: '08:00 PM'
                              }
                            ]);
                          }}
                          _hover={{ bg: '#ecfdf5', borderColor: '#059669' }}
                        >
                          + {preset.role} (₹{preset.rate}/day)
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>

                  {/* Staff List Rows */}
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
                        <Box minW="160px" flex="1.5">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Staff Role</FormLabel>
                          <Select
                            size="sm"
                            h="36px"
                            value={item.role}
                            onChange={(e) => {
                              const roles = masterStates.dailyRoles && masterStates.dailyRoles.length > 0 ? masterStates.dailyRoles : dailyRolesList;
                              const match = roles.find(r => r.role === e.target.value);
                              setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, role: e.target.value, ratePerDay: match?.rate || s.ratePerDay } : s));
                            }}
                          >
                            {Array.from(new Set([
                              item.role,
                              ...(masterStates.dailyRoles && masterStates.dailyRoles.length > 0 ? masterStates.dailyRoles.map(r => r.role) : dailyRolesList.map(r => r.role)),
                              ...(masterStates.jobPositions || [])
                            ])).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </Select>
                        </Box>

                        <Box minW="110px" flex="1">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Rate/Day (₹)</FormLabel>
                          <Input
                            size="sm"
                            h="36px"
                            type="number"
                            value={item.ratePerDay}
                            onChange={(e) => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, ratePerDay: parseInt(e.target.value, 10) || 0 } : s))}
                          />
                        </Box>

                        <Box minW="110px" flex="1">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Gender</FormLabel>
                          <Select
                            size="sm"
                            h="36px"
                            value={item.genderPref}
                            onChange={(e) => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, genderPref: e.target.value } : s))}
                          >
                            {(masterStates.genderPreferences && masterStates.genderPreferences.length > 0
                              ? masterStates.genderPreferences
                              : ['Any Gender', 'Male', 'Female']).map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </Select>
                        </Box>

                        <Box w="100px">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Staff Count</FormLabel>
                          <HStack spacing="1">
                            <IconButton
                              size="xs"
                              icon={<Minus size={12} />}
                              onClick={() => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, count: Math.max(1, s.count - 1) } : s))}
                            />
                            <Input
                              size="sm"
                              h="36px"
                              textAlign="center"
                              type="number"
                              min="1"
                              value={item.count}
                              onChange={(e) => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, count: parseInt(e.target.value, 10) || 1 } : s))}
                            />
                            <IconButton
                              size="xs"
                              icon={<Plus size={12} />}
                              onClick={() => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, count: s.count + 1 } : s))}
                            />
                          </HStack>
                        </Box>

                        <Box w="100px">
                          <FormLabel fontSize="11px" fontWeight="700" color="#64748b" mb="1">Days</FormLabel>
                          <HStack spacing="1">
                            <IconButton
                              size="xs"
                              icon={<Minus size={12} />}
                              onClick={() => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, days: Math.max(1, s.days - 1) } : s))}
                            />
                            <Input
                              size="sm"
                              h="36px"
                              textAlign="center"
                              type="number"
                              min="1"
                              value={item.days}
                              onChange={(e) => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, days: parseInt(e.target.value, 10) || 1 } : s))}
                            />
                            <IconButton
                              size="xs"
                              icon={<Plus size={12} />}
                              onClick={() => setDailyStaffList(prev => prev.map(s => s.id === item.id ? { ...s, days: s.days + 1 } : s))}
                            />
                          </HStack>
                        </Box>

                        <IconButton
                          type="button"
                          size="sm"
                          mt="4"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Trash2 size={16} />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDailyStaffList(prev => prev.length > 1 ? prev.filter((s, sIdx) => s.id ? s.id !== item.id : sIdx !== idx) : prev);
                          }}
                          aria-label="Remove staff"
                        />
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                {/* Daily Coupons & Pricing Breakdown */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                  <Box p="4" bg="white" border="1.5px solid #e2e8f0" borderRadius="xl">
                    <Text fontWeight="800" fontSize="xs" color="#1e293b" mb="2" textTransform="uppercase">
                      Apply Promo Code
                    </Text>
                    <HStack spacing="2" mb="2">
                      <Input
                        size="sm"
                        placeholder="Enter Promo Code"
                        value={dailyCouponInput}
                        onChange={(e) => setDailyCouponInput(e.target.value.toUpperCase())}
                        h="36px"
                      />
                      <Button size="sm" colorScheme="green" h="36px" onClick={() => applyDailyCouponCode()}>
                        Apply
                      </Button>
                    </HStack>
                    <Wrap spacing="1.5">
                      {availableOffers.map(o => (
                        <WrapItem key={o.code}>
                          <Button
                            size="xs"
                            variant={dailyAppliedCoupon === o.code ? 'solid' : 'outline'}
                            colorScheme="green"
                            onClick={() => applyDailyCouponCode(o.code)}
                          >
                            {o.code} ({o.discountValue}% OFF)
                          </Button>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  <Box p="4" bg="#ecfdf5" border="1.5px solid #a7f3d0" borderRadius="xl">
                    <Text fontWeight="800" fontSize="xs" color="#065f46" mb="2" textTransform="uppercase">
                      Daily Staff Pricing Summary
                    </Text>
                    <VStack spacing="1.5" align="stretch" fontSize="xs">
                      <Flex justify="space-between"><Text color="#64748b">Staff Roster Total</Text><Text fontWeight="bold">₹{dailyTotals.staffCost}</Text></Flex>
                      {dailyTotals.discount > 0 && <Flex justify="space-between" color="green.700"><Text fontWeight="bold">Discount ({dailyAppliedCoupon})</Text><Text fontWeight="bold">-₹{dailyTotals.discount}</Text></Flex>}
                      <Flex justify="space-between"><Text color="#64748b">GST (18%)</Text><Text fontWeight="bold">₹{dailyTotals.gst}</Text></Flex>
                      <Divider borderColor="#a7f3d0" my="1" />
                      <Flex justify="space-between" fontSize="sm"><Text fontWeight="800">Total Amount</Text><Text fontWeight="800" color="#065f46">₹{dailyTotals.total}</Text></Flex>
                      <Flex justify="space-between" color="#047857" fontWeight="bold"><Text>Advance (25%)</Text><Text>₹{dailyTotals.advance}</Text></Flex>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            )}

            {/* === 4. CHEF FOR PARTY FORM (MATCHING APP 100%) === */}
            {serviceType === 'party' && (
              <VStack spacing="6" align="stretch">
                
                {/* Banner & Full Summary Link */}
                <Box
                  p="4"
                  borderRadius="2xl"
                  bgGradient="linear(to-r, purple.700, purple.900)"
                  color="white"
                  boxShadow="0 8px 20px rgba(124, 58, 237, 0.25)"
                >
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
                    <HStack spacing="3">
                      <Flex w="44px" h="44px" borderRadius="full" bg="whiteAlpha.200" align="center" justify="center">
                        <UtensilsCrossed size={22} color="white" />
                      </Flex>
                      <Box>
                        <Text fontWeight="800" fontSize="md">Chef for Party Booking</Text>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          {partyDatesList.length} Day(s) • {partyTotals.totalGuests} Guests • {partyTotals.totalDishes} Dishes
                        </Text>
                      </Box>
                    </HStack>

                    <Button
                      size="sm"
                      bg="white"
                      color="purple.900"
                      fontWeight="800"
                      borderRadius="lg"
                      _hover={{ bg: 'purple.50' }}
                      rightIcon={<ArrowRight size={14} />}
                      onClick={onOpenSummaryModal}
                    >
                      View Complete Summary
                    </Button>
                  </Flex>
                </Box>

                {/* 2. EVENT DAYS & MEAL SCHEDULE */}
                <Box>
                  <Flex justify="space-between" align="center" mb="3">
                    <Text fontWeight="800" fontSize="sm" color="#1e293b" textTransform="uppercase">
                      2. Event Days &amp; Meal Schedule
                    </Text>
                    <Button
                      size="xs"
                      leftIcon={<Plus size={14} />}
                      colorScheme="purple"
                      variant="outline"
                      onClick={handleAddPartyDay}
                      fontWeight="700"
                    >
                      + Add Event Day
                    </Button>
                  </Flex>

                  {/* Day by Day Container */}
                  <VStack spacing="5" align="stretch">
                    {partyDatesList.map((day, dIdx) => (
                      <Box
                        key={day.id}
                        p="5"
                        bg="white"
                        border="1.5px solid #e2e8f0"
                        borderRadius="2xl"
                        boxShadow="sm"
                      >
                        {/* Day Header */}
                        <Flex justify="space-between" align="center" mb="4" pb="3" borderBottom="1px solid #f1f5f9">
                          <HStack spacing="2.5">
                            <Flex w="28px" h="28px" borderRadius="full" bg="purple.700" color="white" align="center" justify="center" fontWeight="800" fontSize="xs">
                              {dIdx + 1}
                            </Flex>
                            <Text fontWeight="800" fontSize="md" color="#0f172a">
                              Event Day {dIdx + 1}
                            </Text>
                          </HStack>

                          <HStack spacing="2">
                            <Button
                              size="xs"
                              leftIcon={<Plus size={12} />}
                              colorScheme="purple"
                              variant="ghost"
                              onClick={() => handleAddMealToDay(day.id)}
                            >
                              + Add Meal
                            </Button>
                            {partyDatesList.length > 1 && (
                              <IconButton
                                type="button"
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                icon={<Trash2 size={14} />}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemovePartyDay(day.id, idx);
                                }}
                                aria-label="Delete Day"
                              />
                            )}
                          </HStack>
                        </Flex>

                        {/* Occasion & Date */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mb="4">
                          <FormControl isRequired>
                            <FormLabel {...formLabelStyle}>OCCASION *</FormLabel>
                            <Select
                              value={day.occasion}
                              onChange={(e) => setPartyDatesList(prev => prev.map(d => d.id === day.id ? { ...d, occasion: e.target.value } : d))}
                              {...selectStyle}
                              h="40px"
                            >
                              {(masterStates.occasionTypes && masterStates.occasionTypes.length > 0
                                ? masterStates.occasionTypes
                                : occasionTypes).map(occ => (
                                <option key={occ} value={occ}>{occ}</option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel {...formLabelStyle}>EVENT DATE *</FormLabel>
                            <Input
                              type="date"
                              value={day.date}
                              onChange={(e) => setPartyDatesList(prev => prev.map(d => d.id === day.id ? { ...d, date: e.target.value } : d))}
                              {...inputStyle}
                              h="40px"
                            />
                          </FormControl>
                        </SimpleGrid>

                        {/* Meals Inside This Day */}
                        <VStack spacing="4" align="stretch">
                          {day.meals.map((meal, mIdx) => (
                            <Box
                              key={meal.id}
                              p="4"
                              bg="#faf5ff"
                              border="1.5px solid #e9d5ff"
                              borderRadius="xl"
                            >
                              {/* Meal Header */}
                              <Flex justify="space-between" align="center" mb="3">
                                <Box>
                                  <Text fontWeight="800" fontSize="sm" color="purple.900">
                                    Meal {mIdx + 1}: {meal.mealType}
                                  </Text>
                                  <Text fontSize="xs" color="#64748b">
                                    Guest count, serving time and customized menu
                                  </Text>
                                </Box>

                                {day.meals.length > 1 && (
                                  <IconButton
                                    type="button"
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    icon={<Trash2 size={13} />}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveMealFromDay(day.id, meal.id, mIdx);
                                    }}
                                    aria-label="Remove Meal"
                                  />
                                )}
                              </Flex>

                              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="3" mb="4">
                                <FormControl isRequired>
                                  <FormLabel {...formLabelStyle}>MEAL TYPE *</FormLabel>
                                  <Select
                                    value={meal.mealType}
                                    onChange={(e) => {
                                      setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                        ...d,
                                        meals: d.meals.map(m => m.id === meal.id ? { ...m, mealType: e.target.value } : m)
                                      } : d));
                                    }}
                                    {...selectStyle}
                                    bg="white"
                                    h="38px"
                                  >
                                    {(masterStates.mealTypes && masterStates.mealTypes.length > 0
                                      ? masterStates.mealTypes
                                      : ['Breakfast', 'Lunch', 'High Tea / Snacks', 'Dinner', 'Full Day Party']).map(m => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl isRequired>
                                  <FormLabel {...formLabelStyle}>NUMBER OF GUESTS *</FormLabel>
                                  <Input
                                    type="number"
                                    value={meal.guests}
                                    onChange={(e) => {
                                      const g = parseInt(e.target.value, 10) || 1;
                                      setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                        ...d,
                                        meals: d.meals.map(m => m.id === meal.id ? { ...m, guests: g } : m)
                                      } : d));
                                    }}
                                    {...inputStyle}
                                    bg="white"
                                    h="38px"
                                  />
                                </FormControl>

                                <FormControl isRequired>
                                  <FormLabel {...formLabelStyle}>SERVING TIME *</FormLabel>
                                  <Input
                                    value={meal.servingTime}
                                    onChange={(e) => {
                                      setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                        ...d,
                                        meals: d.meals.map(m => m.id === meal.id ? { ...m, servingTime: e.target.value } : m)
                                      } : d));
                                    }}
                                    placeholder="e.g. 08:00 PM"
                                    {...inputStyle}
                                    bg="white"
                                    h="38px"
                                  />
                                </FormControl>
                              </SimpleGrid>

                              {/* Menu Choice Selector: Choose Now vs Later */}
                              <Box mb="4">
                                <FormLabel {...formLabelStyle}>MENU SELECTION PREFERENCE *</FormLabel>
                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="3">
                                  <Box
                                    as="button"
                                    type="button"
                                    p="3"
                                    borderRadius="xl"
                                    textAlign="left"
                                    bg={meal.menuChoice === 'now' ? '#f3e8ff' : 'white'}
                                    border={meal.menuChoice === 'now' ? '2px solid #7c3aed' : '1px solid #cbd5e1'}
                                    onClick={() => {
                                      setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                        ...d,
                                        meals: d.meals.map(m => m.id === meal.id ? { ...m, menuChoice: 'now' } : m)
                                      } : d));
                                    }}
                                  >
                                    <HStack spacing="2.5">
                                      <Box w="16px" h="16px" borderRadius="full" border="2px solid" borderColor={meal.menuChoice === 'now' ? '#7c3aed' : '#94a3b8'} p="2px">
                                        {meal.menuChoice === 'now' && <Box w="100%" h="100%" borderRadius="full" bg="#7c3aed" />}
                                      </Box>
                                      <Box>
                                        <Text fontWeight="800" fontSize="xs" color={meal.menuChoice === 'now' ? 'purple.900' : '#1e293b'}>
                                          I choose menu now
                                        </Text>
                                        <Text fontSize="10px" color="#64748b">Customize cuisines &amp; specific dishes</Text>
                                      </Box>
                                    </HStack>
                                  </Box>

                                  <Box
                                    as="button"
                                    type="button"
                                    p="3"
                                    borderRadius="xl"
                                    textAlign="left"
                                    bg={meal.menuChoice === 'later' ? '#eff6ff' : 'white'}
                                    border={meal.menuChoice === 'later' ? '2px solid #2563eb' : '1px solid #cbd5e1'}
                                    onClick={() => {
                                      setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                        ...d,
                                        meals: d.meals.map(m => m.id === meal.id ? { ...m, menuChoice: 'later' } : m)
                                      } : d));
                                    }}
                                  >
                                    <HStack spacing="2.5">
                                      <Box w="16px" h="16px" borderRadius="full" border="2px solid" borderColor={meal.menuChoice === 'later' ? '#2563eb' : '#94a3b8'} p="2px">
                                        {meal.menuChoice === 'later' && <Box w="100%" h="100%" borderRadius="full" bg="#2563eb" />}
                                      </Box>
                                      <Box>
                                        <Text fontWeight="800" fontSize="xs" color={meal.menuChoice === 'later' ? 'blue.900' : '#1e293b'}>
                                          I choose menu later
                                        </Text>
                                        <Text fontSize="10px" color="#64748b">Decide dish counts now, items later</Text>
                                      </Box>
                                    </HStack>
                                  </Box>
                                </SimpleGrid>
                              </Box>

                                  {/* IF MENU CHOICE IS "NOW": INTERACTIVE DISH SELECTOR */}
                                  {meal.menuChoice === 'now' && (
                                    <Box p="4" bg="white" border="1.5px solid #e9d5ff" borderRadius="xl">
                                      {/* Filter Bar: Food Pref + Select Cuisines + Search */}
                                      <Flex justify="space-between" align="center" mb="3" flexWrap="wrap" gap="2.5">
                                        {/* 1. Food Type Filter: All | Veg | Nonveg */}
                                        <HStack spacing="1" bg="#f1f5f9" p="1" borderRadius="full">
                                          {['All', 'Veg', 'Nonveg'].map((pref) => {
                                            const isActive = meal.foodPrefFilter === pref;
                                            return (
                                              <Button
                                                key={pref}
                                                size="xs"
                                                borderRadius="full"
                                                px="3"
                                                h="28px"
                                                bg={isActive ? '#0052cc' : 'transparent'}
                                                color={isActive ? 'white' : '#475569'}
                                                fontWeight="700"
                                                _hover={{ bg: isActive ? '#0052cc' : '#e2e8f0' }}
                                                onClick={() => {
                                                  setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                                    ...d,
                                                    meals: d.meals.map(m => m.id === meal.id ? { ...m, foodPrefFilter: pref } : m)
                                                  } : d));
                                                }}
                                              >
                                                {pref}
                                              </Button>
                                            );
                                          })}
                                        </HStack>

                                        {/* 2. Select Cuisines Filter Chips (Scrollable / Select Multiple) */}
                                        <Box
                                          flex="1"
                                          minW={{ base: '100%', md: '220px' }}
                                          maxW={{ base: '100%', lg: '580px' }}
                                          overflowX="auto"
                                          py="1"
                                          px="2"
                                          bg="#f8fafc"
                                          borderRadius="xl"
                                          border="1px solid #e2e8f0"
                                          sx={{
                                            WebkitOverflowScrolling: 'touch',
                                            '::-webkit-scrollbar': { height: '4px' },
                                            '::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' }
                                          }}
                                        >
                                          <HStack spacing="1.5" w="max-content">
                                            {['All Cuisines', ...Array.from(new Set([...(masterStates.cuisines || []), ...menuCatalogItems.map(d => d.cuisine).filter(Boolean)]))].map((cuisine) => {
                                              const isAll = cuisine === 'All Cuisines';
                                              const isSelected = isAll
                                                ? (!meal.selectedCuisines || meal.selectedCuisines.length === 0 || meal.selectedCuisines.includes('All') || meal.selectedCuisines.includes('All Cuisines'))
                                                : (meal.selectedCuisines && meal.selectedCuisines.includes(cuisine));

                                              return (
                                                <Button
                                                  key={cuisine}
                                                  size="xs"
                                                  h="26px"
                                                  borderRadius="full"
                                                  px="2.5"
                                                  fontSize="11px"
                                                  fontWeight="700"
                                                  whiteSpace="nowrap"
                                                  flexShrink={0}
                                                  variant={isSelected ? 'solid' : 'outline'}
                                                  bg={isSelected ? (isAll ? '#475569' : '#7c3aed') : 'white'}
                                                  color={isSelected ? 'white' : '#475569'}
                                                  borderColor={isSelected ? (isAll ? '#475569' : '#7c3aed') : '#dde6f5'}
                                                  _hover={{ bg: isSelected ? (isAll ? '#334155' : '#6d28d9') : '#f1f5f9' }}
                                                  onClick={() => {
                                                    setPartyDatesList(prev => prev.map(d => d.id === day.id ? {
                                                      ...d,
                                                      meals: d.meals.map(m => {
                                                        if (m.id !== meal.id) return m;
                                                        if (isAll) {
                                                          return { ...m, selectedCuisines: ['All'] };
                                                        }
                                                        let current = (m.selectedCuisines || []).filter(x => x !== 'All' && x !== 'All Cuisines');
                                                        if (current.includes(cuisine)) {
                                                          const next = current.filter(x => x !== cuisine);
                                                          return { ...m, selectedCuisines: next.length === 0 ? ['All'] : next };
                                                        } else {
                                                          return { ...m, selectedCuisines: [...current, cuisine] };
                                                        }
                                                      })
                                                    } : d));
                                                  }}
                                                >
                                                  {isSelected && !isAll && '✓ '}
                                                  {cuisine}
                                                </Button>
                                              );
                                            })}
                                          </HStack>
                                        </Box>

                                        {/* 3. Dish Search */}
                                        <InputGroup size="xs" w={{ base: '100%', sm: '180px' }} flexShrink={0}>
                                          <InputLeftElement pointerEvents="none">
                                            <Search size={12} color="#94a3b8" />
                                          </InputLeftElement>
                                          <Input
                                            placeholder="Search dishes..."
                                            value={dishSearchQuery}
                                            onChange={(e) => setDishSearchQuery(e.target.value)}
                                            borderRadius="md"
                                            bg="#f8fafc"
                                          />
                                        </InputGroup>
                                      </Flex>

                                      {/* Subtitle Checkmark line, Selected count and Close All */}
                                      <Flex justify="space-between" align="center" mb="3" py="1.5" px="2" bg="#f8fafc" borderRadius="md">
                                        <HStack spacing="1.5" flex="1">
                                          <CheckCircle2 size={13} color="#16a34a" />
                                          <Text fontSize="11px" color="#64748b" noOfLines={1}>
                                            Can be made without onion, garlic
                                          </Text>
                                        </HStack>
                                        <HStack spacing="2">
                                          <Badge colorScheme="blue" fontSize="10.5px" px="2" py="0.5" borderRadius="md">
                                            Selected: {meal.selectedMenu.length}
                                          </Badge>
                                          <Button
                                            size="xs"
                                            h="22px"
                                            fontSize="10px"
                                            variant="outline"
                                            borderColor="#cbd5e1"
                                            onClick={() => {
                                              const allExpanded = Object.keys(expandedCategories).length > 0;
                                              if (allExpanded) setExpandedCategories({});
                                              else {
                                                const map = {};
                                                DEFAULT_PARTY_CATEGORIES.forEach(c => map[c] = true);
                                                setExpandedCategories(map);
                                              }
                                            }}
                                          >
                                            {Object.keys(expandedCategories).length > 0 ? 'Close All ▴' : 'Expand All ▾'}
                                          </Button>
                                        </HStack>
                                      </Flex>

                                      {/* Category Accordion Dropdowns */}
                                      <VStack spacing="3" align="stretch">
                                        {DEFAULT_PARTY_CATEGORIES.map((cat) => {
                                          const isExp = !!expandedCategories[cat];
                                          const catDishes = menuCatalogItems.filter(dish => {
                                            const matchesCat = dish.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(dish.category.toLowerCase());
                                            if (!matchesCat) return false;
                                            if (meal.foodPrefFilter === 'Veg' && dish.isNonVeg) return false;
                                            if (meal.foodPrefFilter === 'Nonveg' && !dish.isNonVeg) return false;

                                            // Cuisine filtering
                                            const hasCuisineFilter = meal.selectedCuisines &&
                                              meal.selectedCuisines.length > 0 &&
                                              !meal.selectedCuisines.includes('All') &&
                                              !meal.selectedCuisines.includes('All Cuisines');

                                            if (hasCuisineFilter) {
                                              const dishCuisine = (dish.cuisine || '').toLowerCase().trim();
                                              const matchesCuisine = meal.selectedCuisines.some(sc => {
                                                const cleanSc = sc.toLowerCase().trim();
                                                return dishCuisine.includes(cleanSc) || cleanSc.includes(dishCuisine);
                                              });
                                              if (!matchesCuisine) return false;
                                            }

                                            if (dishSearchQuery && !dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase())) return false;
                                            return true;
                                          });

                                      const selectedInCat = catDishes.filter(d => meal.selectedMenu.includes(d.name));

                                      return (
                                        <Box key={cat} border="1px solid #e2e8f0" borderRadius="xl" overflow="hidden">
                                          {/* Accordion Header */}
                                          <Flex
                                            p="3"
                                            bg={isExp ? '#f8fafc' : 'white'}
                                            justify="space-between"
                                            align="center"
                                            cursor="pointer"
                                            onClick={() => setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))}
                                            _hover={{ bg: '#f8fafc' }}
                                          >
                                            <HStack spacing="2">
                                              <Text fontWeight="800" fontSize="xs" color="#1e293b">
                                                {cat} <Text as="span" fontSize="10px" color="#94a3b8" fontWeight="normal">(optional)</Text>
                                              </Text>
                                              {selectedInCat.length > 0 && (
                                                <Badge colorScheme="blue" fontSize="10px" borderRadius="full" px="2">
                                                  {selectedInCat.length} selected
                                                </Badge>
                                              )}
                                            </HStack>
                                            <HStack spacing="2">
                                              <Text fontSize="xs" color="#64748b" fontWeight="600">
                                                {selectedInCat.length > 0 ? selectedInCat.map(d => d.name).slice(0, 2).join(', ') + (selectedInCat.length > 2 ? '...' : '') : 'Select from here'}
                                              </Text>
                                              {isExp ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                            </HStack>
                                          </Flex>

                                          {/* Accordion Body */}
                                          <Collapse in={isExp} animateOpacity>
                                            <Box p="3" bg="white" borderTop="1px solid #f1f5f9">
                                              {catDishes.length === 0 ? (
                                                <Text fontSize="xs" color="#94a3b8" textAlign="center" py="2">
                                                  No dishes matching current filter.
                                                </Text>
                                              ) : (
                                                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing="2.5">
                                                  {catDishes.map((dish) => {
                                                    const isChecked = meal.selectedMenu.includes(dish.name);
                                                    return (
                                                      <Flex
                                                        key={dish.name}
                                                        p="2.5"
                                                        borderRadius="lg"
                                                        border={isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0'}
                                                        bg={isChecked ? '#eff6ff' : 'white'}
                                                        align="center"
                                                        justify="space-between"
                                                        cursor="pointer"
                                                        onClick={() => handleToggleDishForMeal(day.id, meal.id, dish.name)}
                                                        _hover={{ shadow: 'xs' }}
                                                      >
                                                        <HStack spacing="2">
                                                          <Box
                                                            w="8px"
                                                            h="8px"
                                                            borderRadius="full"
                                                            bg={dish.isNonVeg ? '#ef4444' : '#22c55e'}
                                                          />
                                                          <Box>
                                                            <Text fontSize="xs" fontWeight="700" color="#1e293b" noOfLines={1}>
                                                              {dish.name}
                                                            </Text>
                                                            <Text fontSize="9.5px" color="#64748b">{dish.cuisine}</Text>
                                                          </Box>
                                                        </HStack>
                                                        <Checkbox isChecked={isChecked} colorScheme="blue" pointerEvents="none" size="sm" />
                                                      </Flex>
                                                    );
                                                  })}
                                                </SimpleGrid>
                                              )}
                                            </Box>
                                          </Collapse>
                                        </Box>
                                      );
                                    })}
                                  </VStack>
                                </Box>
                              )}

                              {/* IF MENU CHOICE IS "LATER": CATEGORY COUNTERS */}
                              {meal.menuChoice === 'later' && (
                                <Box p="4" bg="white" border="1.5px solid #bfdbfe" borderRadius="xl">
                                  <Text fontSize="xs" fontWeight="800" color="#1e293b" mb="3">
                                    Select number of dishes for each category:
                                  </Text>
                                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing="3">
                                    {DEFAULT_PARTY_CATEGORIES.map(cat => {
                                      const count = meal.categoryDishCounts[cat] || 0;
                                      return (
                                        <Box key={cat} p="2.5" border="1px solid #e2e8f0" borderRadius="lg" bg="#f8fafc">
                                          <Text fontSize="xs" fontWeight="700" color="#334155" mb="1.5">{cat}</Text>
                                          <HStack spacing="2" justify="space-between">
                                            <IconButton
                                              size="xs"
                                              icon={<Minus size={12} />}
                                              onClick={() => handleUpdateDishCategoryCount(day.id, meal.id, cat, -1)}
                                            />
                                            <Text fontWeight="800" fontSize="sm" color="purple.900">{count}</Text>
                                            <IconButton
                                              size="xs"
                                              icon={<Plus size={12} />}
                                              onClick={() => handleUpdateDishCategoryCount(day.id, meal.id, cat, 1)}
                                            />
                                          </HStack>
                                        </Box>
                                      );
                                    })}
                                  </SimpleGrid>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* 3. ADD-ON SERVICES */}
                <Box p="5" bg="white" border="1.5px solid #e2e8f0" borderRadius="2xl">
                  <Text fontWeight="800" fontSize="sm" color="#1e293b" mb="3" textTransform="uppercase">
                    3. Optional Party Add-ons
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3">
                    <Flex p="3" border="1px solid #e2e8f0" borderRadius="xl" align="center" justify="space-between">
                      <HStack spacing="2.5">
                        <Flame size={18} color="#ea580c" />
                        <Box>
                          <Text fontWeight="700" fontSize="xs" color="#1e293b">Commercial Burner &amp; Stove</Text>
                          <Text fontSize="10px" color="#64748b">+₹350 flat</Text>
                        </Box>
                      </HStack>
                      <Checkbox isChecked={partyBurnerStove} onChange={(e) => setPartyBurnerStove(e.target.checked)} colorScheme="purple" />
                    </Flex>

                    <Flex p="3" border="1px solid #e2e8f0" borderRadius="xl" align="center" justify="space-between">
                      <HStack spacing="2.5">
                        <UtensilsCrossed size={18} color="#0284c7" />
                        <Box>
                          <Text fontWeight="700" fontSize="xs" color="#1e293b">Crockery &amp; Premium Cutlery</Text>
                          <Text fontSize="10px" color="#64748b">+₹500 flat</Text>
                        </Box>
                      </HStack>
                      <Checkbox isChecked={partyCrockery} onChange={(e) => setPartyCrockery(e.target.checked)} colorScheme="purple" />
                    </Flex>

                    <Flex p="3" border="1px solid #e2e8f0" borderRadius="xl" align="center" justify="space-between">
                      <HStack spacing="2.5">
                        <Sparkle size={18} color="#16a34a" />
                        <Box>
                          <Text fontWeight="700" fontSize="xs" color="#1e293b">Kitchen Cleaner &amp; Helper</Text>
                          <Text fontSize="10px" color="#64748b">+₹400 flat</Text>
                        </Box>
                      </HStack>
                      <Checkbox isChecked={partyKitchenCleaner} onChange={(e) => setPartyKitchenCleaner(e.target.checked)} colorScheme="purple" />
                    </Flex>

                    <Flex p="3" border="1px solid #e2e8f0" borderRadius="xl" align="center" justify="space-between">
                      <HStack spacing="2.5">
                        <Users size={18} color="#9333ea" />
                        <Box>
                          <Text fontWeight="700" fontSize="xs" color="#1e293b">Professional Waiter Staff</Text>
                          <Text fontSize="10px" color="#64748b">₹600 / waiter</Text>
                        </Box>
                      </HStack>
                      <HStack spacing="2">
                        {partyWaiterStaff && (
                          <HStack spacing="1">
                            <IconButton size="xs" icon={<Minus size={10} />} onClick={() => setPartyWaiterCount(Math.max(1, partyWaiterCount - 1))} />
                            <Text fontSize="xs" fontWeight="bold">{partyWaiterCount}</Text>
                            <IconButton size="xs" icon={<Plus size={10} />} onClick={() => setPartyWaiterCount(partyWaiterCount + 1)} />
                          </HStack>
                        )}
                        <Checkbox isChecked={partyWaiterStaff} onChange={(e) => setPartyWaiterStaff(e.target.checked)} colorScheme="purple" />
                      </HStack>
                    </Flex>
                  </SimpleGrid>
                </Box>

                {/* 4. COUPONS / PROMO CODES */}
                <Box p="5" bg="white" border="1.5px solid #e2e8f0" borderRadius="2xl">
                  <Text fontWeight="800" fontSize="sm" color="#1e293b" mb="3" textTransform="uppercase">
                    4. Apply Coupon / Promo Code
                  </Text>
                  <HStack spacing="3" mb="3">
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <TagIcon size={14} color="#94a3b8" />
                      </InputLeftElement>
                      <Input
                        placeholder="Enter Promo Code (e.g. PARTY20, ZOMO40)"
                        value={partyCouponInput}
                        onChange={(e) => setPartyCouponInput(e.target.value.toUpperCase())}
                        borderRadius="lg"
                        bg="#f8fafc"
                        h="40px"
                      />
                    </InputGroup>
                    <Button
                      size="sm"
                      h="40px"
                      px="5"
                      colorScheme="purple"
                      onClick={() => applyPartyCouponCode()}
                    >
                      Apply
                    </Button>
                  </HStack>

                  <Wrap spacing="2">
                    {availableOffers.map(offer => {
                      const isApplied = partyAppliedCoupon === offer.code;
                      return (
                        <WrapItem key={offer.code}>
                          <Button
                            size="xs"
                            variant={isApplied ? 'solid' : 'outline'}
                            colorScheme="purple"
                            onClick={() => applyPartyCouponCode(offer.code)}
                            borderRadius="full"
                            fontSize="xs"
                            px="3"
                          >
                            {offer.code} ({offer.discountValue}% OFF)
                          </Button>
                        </WrapItem>
                      );
                    })}
                  </Wrap>
                </Box>

                {/* 5. PRICING SUMMARY CARD (EXACT REPLICA) */}
                <Box
                  p="5"
                  bg="#faf5ff"
                  border="1.5px solid #d8b4fe"
                  borderRadius="2xl"
                  boxShadow="sm"
                >
                  <Text fontWeight="800" fontSize="sm" color="purple.900" mb="3">
                    Pricing Summary
                  </Text>
                  <VStack spacing="2" align="stretch" fontSize="xs">
                    <Flex justify="space-between">
                      <Text color="#475569">Base Chef Fee ({partyDatesList.length} {partyDatesList.length === 1 ? 'Day' : 'Days'})</Text>
                      <Text fontWeight="bold">₹{partyTotals.baseChefRate.toFixed(0)}</Text>
                    </Flex>

                    <Flex justify="space-between">
                      <Text color="#475569">Guest &amp; Menu Rate ({partyTotals.totalGuests} Guests • {partyTotals.totalDishes} Dishes)</Text>
                      <Text fontWeight="bold">₹{(partyTotals.guestRateTotal + partyTotals.menuItemsTotal).toFixed(0)}</Text>
                    </Flex>

                    {partyTotals.addOnsTotal > 0 && (
                      <Flex justify="space-between">
                        <Text color="#475569">Extra Add-ons Charges</Text>
                        <Text fontWeight="bold">₹{partyTotals.addOnsTotal.toFixed(0)}</Text>
                      </Flex>
                    )}

                    {partyTotals.discountAmount > 0 && (
                      <Flex justify="space-between" color="green.700">
                        <Text fontWeight="bold">Coupon Discount ({partyAppliedCoupon})</Text>
                        <Text fontWeight="bold">-₹{partyTotals.discountAmount.toFixed(0)}</Text>
                      </Flex>
                    )}

                    <Flex justify="space-between">
                      <Text color="#475569">GST (18%)</Text>
                      <Text fontWeight="bold">₹{partyTotals.gst.toFixed(0)}</Text>
                    </Flex>

                    <Divider borderColor="#d8b4fe" my="2" />

                    <Flex justify="space-between" align="center">
                      <Text fontWeight="800" fontSize="sm" color="#0f172a">Total Estimated Amount</Text>
                      <Text fontWeight="800" fontSize="lg" color="purple.900">₹{partyTotals.finalAmount.toFixed(0)}</Text>
                    </Flex>

                    <Flex p="2.5" bg="purple.100" borderRadius="lg" justify="space-between" align="center" mt="2">
                      <Text fontWeight="800" fontSize="xs" color="purple.900">Advance Payable (25%)</Text>
                      <Text fontWeight="800" fontSize="sm" color="purple.900">₹{partyTotals.advanceAmount.toFixed(0)}</Text>
                    </Flex>
                  </VStack>
                </Box>
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
                  {(masterStates.states && masterStates.states.length > 0
                    ? masterStates.states.map(st => st.name)
                    : ALL_INDIAN_STATES).map(st => (
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
                <FormLabel {...formLabelStyle}>FULL ADDRESS / VENUE</FormLabel>
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
                  setCommercialStaffList([
                    {
                      id: '1',
                      category: 'Chef / Kitchen Staff',
                      role: 'Head Chef/ Master Chef',
                      vacancies: '1',
                      salary: '₹12,000 – ₹15,000',
                      salaryCustom: false,
                      salaryCustomVal: '',
                      experience: '2 – 5 Years',
                      expCustom: false,
                      expCustomVal: '',
                      shiftType: 'Full Time (10-12 hrs)',
                      shiftCustomVal: '',
                      allowedLeave: '2 days/month',
                      leaveCustomVal: '',
                      joiningTimeline: 'Immediate',
                      joiningCustomVal: '',
                      facilities: 'Food & Accommodation',
                      facilitiesCustomVal: '',
                      otherPerks: '',
                      isUrgent: false
                    }
                  ]);
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

      {/* FULL EVENT SUMMARY MODAL */}
      <Modal isOpen={isOpenSummaryModal} onClose={onCloseSummaryModal} size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader bgGradient="linear(to-r, purple.700, purple.900)" color="white" py="4">
            <Flex justify="space-between" align="center">
              <HStack spacing="3">
                <Receipt size={22} color="white" />
                <Box>
                  <Text fontSize="md" fontWeight="800">Complete Party Booking Summary</Text>
                  <Text fontSize="xs" color="whiteAlpha.800">Review all days, meals, dish selections and billing breakdown</Text>
                </Box>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" mt="2" />

          <ModalBody p="6">
            <VStack spacing="5" align="stretch">
              {partyDatesList.map((day, idx) => (
                <Box key={day.id} p="4" bg="#faf5ff" border="1px solid #e9d5ff" borderRadius="xl">
                  <Flex justify="space-between" mb="2">
                    <Text fontWeight="800" fontSize="sm" color="purple.900">Day {idx + 1}: {day.occasion}</Text>
                    <Badge colorScheme="purple">{day.date}</Badge>
                  </Flex>
                  {day.meals.map((m, mIdx) => (
                    <Box key={m.id} pl="3" mt="2" borderLeft="2px solid #c084fc">
                      <Text fontWeight="700" fontSize="xs" color="#1e293b">
                        Meal {mIdx + 1}: {m.mealType} ({m.guests} Guests) • {m.servingTime}
                      </Text>
                      <Text fontSize="xs" color="#64748b" mt="0.5">
                        Dishes: {m.menuChoice === 'now' ? (m.selectedMenu.join(', ') || 'None selected') : Object.entries(m.categoryDishCounts).filter(([_, c]) => c > 0).map(([k, c]) => `${k} (${c})`).join(', ')}
                      </Text>
                    </Box>
                  ))}
                </Box>
              ))}

              {/* Billing Table */}
              <Box p="4" bg="#f8fafc" border="1px solid #e2e8f0" borderRadius="xl">
                <Text fontWeight="800" fontSize="xs" color="#1e293b" mb="2" textTransform="uppercase">Billing Estimate</Text>
                <VStack spacing="1.5" align="stretch" fontSize="xs">
                  <Flex justify="space-between"><Text color="#64748b">Base Chef Fee ({partyDatesList.length} Days)</Text><Text fontWeight="bold">₹{partyTotals.baseChefRate}</Text></Flex>
                  <Flex justify="space-between"><Text color="#64748b">Guest &amp; Menu Charges</Text><Text fontWeight="bold">₹{partyTotals.guestRateTotal + partyTotals.menuItemsTotal}</Text></Flex>
                  {partyTotals.addOnsTotal > 0 && <Flex justify="space-between"><Text color="#64748b">Add-ons Total</Text><Text fontWeight="bold">₹{partyTotals.addOnsTotal}</Text></Flex>}
                  {partyTotals.discountAmount > 0 && <Flex justify="space-between" color="green.700"><Text fontWeight="bold">Discount ({partyAppliedCoupon})</Text><Text fontWeight="bold">-₹{partyTotals.discountAmount}</Text></Flex>}
                  <Flex justify="space-between"><Text color="#64748b">GST (18%)</Text><Text fontWeight="bold">₹{partyTotals.gst}</Text></Flex>
                  <Divider my="1" />
                  <Flex justify="space-between" fontSize="sm"><Text fontWeight="800">Total Booking Amount</Text><Text fontWeight="800" color="purple.900">₹{partyTotals.finalAmount}</Text></Flex>
                  <Flex justify="space-between" color="purple.800" fontWeight="bold"><Text>Advance Required (25%)</Text><Text>₹{partyTotals.advanceAmount}</Text></Flex>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter bg="#f8fafc" borderTop="1px solid #e2e8f0" py="3">
            <Button colorScheme="purple" size="sm" onClick={onCloseSummaryModal} borderRadius="lg">
              Close Summary
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AddJob;
