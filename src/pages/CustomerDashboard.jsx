import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Icon, Spinner, useToast, Grid, Badge, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel, Button, IconButton, Divider, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Textarea, Switch, FormControl, FormLabel, SimpleGrid, Select
} from '@chakra-ui/react';
import { Briefcase, Users, CreditCard, Award, Calendar, CheckCircle, Clock, MapPin, Building, ArrowLeft, Phone, Mail, MoreVertical, LayoutDashboard, Ban, Trash2, Plus, Copy, Check, Sparkles, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import PageContentLoader from '../components/PageContentLoader';

const BRAND = '#2D2B75';
const ACCENT = '#ED1C24';

const StatCard = ({ icon, label, value, colorScheme = 'blue', subLabel }) => {
  const colorMap = {
    blue: { bg: '#eff6ff', color: '#3b82f6' },
    green: { bg: '#ecfdf5', color: '#10b981' },
    purple: { bg: '#f3e8ff', color: '#a855f7' },
    cyan: { bg: '#cffafe', color: '#06b6d4' },
    orange: { bg: '#fff7ed', color: '#f97316' },
    yellow: { bg: '#fef3c7', color: '#d97706' },
    red: { bg: '#fef2f2', color: '#ef4444' },
  };
  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Box bg="white" p="4" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm" display="flex" alignItems="center" gap="4">
      <Flex bg={colors.bg} p="3" borderRadius="lg">
        <Icon as={icon} size={20} color={colors.color} />
      </Flex>
      <Box>
        <Text fontSize="xs" fontWeight="700" color="#64748b">{label}</Text>
        <Text fontSize="xl" fontWeight="900" color="#0f172a">{value}</Text>
        {subLabel && <Text fontSize="xs" color="#94a3b8" mt="1">{subLabel}</Text>}
      </Box>
    </Box>
  );
};

const CustomerDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState('');

  const handleCopy = (text, label) => {
    if (!text || text === 'N/A') {
      toast({ title: 'No detail to copy', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 2000);
    toast({ title: `${label} copied to clipboard!`, status: 'success', duration: 2000, isClosable: true });
  };

  const handleCopyAllDetails = () => {
    if (!data?.customer) return;
    const { customer } = data;
    const clientSince = formatDate(customer.createdAt);
    const textToCopy = `Client Name: ${customer.name || 'N/A'}\nCategory: ${customer.propertyCategory || 'N/A'}\nPhone: ${customer.contactPhone || 'N/A'}\nEmail: ${customer.email || 'N/A'}\nAddress: ${customer.contactAddress || 'N/A'}\nClient Since: ${clientSince}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(''), 2000);
    toast({ title: 'All client details copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
  };

  // Notes Modal state
  const { isOpen: isNoteOpen, onOpen: onNoteOpen, onClose: onNoteClose } = useDisclosure();
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Custom Plan Modal state
  const { isOpen: isPlanModalOpen, onOpen: onPlanModalOpen, onClose: onPlanModalClose } = useDisclosure();

  // Activate Plan Modal state
  const { isOpen: isActivateModalOpen, onOpen: onActivateModalOpen, onClose: onActivateModalClose } = useDisclosure();
  const [allPlans, setAllPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [activateForm, setActivateForm] = useState({
    planId: '',
    totalAmount: '',
    amountPaid: '',
    dueAmount: 0,
    paymentMethod: 'cash',
    paymentReference: '',
    paymentNote: '',
    startDate: new Date().toISOString().split('T')[0],
    customJobPostLimit: '',
    customHiringLimit: '',
    customReplacementLimit: '',
    overridePrevious: false
  });
  const [isActivating, setIsActivating] = useState(false);
  const [selectedPlanPreview, setSelectedPlanPreview] = useState(null);

  // Edit/Collect Payment Modal state
  const { isOpen: isEditSubOpen, onOpen: onEditSubOpen, onClose: onEditSubClose } = useDisclosure();
  const [selectedSubForEdit, setSelectedSubForEdit] = useState(null);
  const [editSubForm, setEditSubForm] = useState({
    newPaymentAmount: '',
    paymentMethod: 'cash',
    paymentReference: '',
    paymentNote: '',
    totalAmount: '',
    dueAmount: '',
    endDate: '',
    status: 'Active',
    customJobPostLimit: '',
    customHiringLimit: '',
    customReplacementLimit: ''
  });
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    durationDays: '30',
    jobPostLimit: '3',
    hiringLimit: '5',
    replacementLimit: '2',
    features: 'Dedicated Relationship Manager\nFree Cook Replacements\nPriority Cook Matching',
    customNotes: '',
    expiresInHours: '',
    expiresAt: '',
    isPublished: true
  });
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [togglingPlanId, setTogglingPlanId] = useState(null);

  useEffect(() => {
    if (location.state?.activeTab !== undefined) {
      setTabIndex(location.state.activeTab);
    }
    if (location.state?.openCustomPlanModal) {
      onPlanModalOpen();
    }
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/customers/${id}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.dashboard);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: "Error loading dashboard",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate('/customers/list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/customers/${id}/notes`, 
        { content: newNote },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: "Note added successfully", status: "success", duration: 2000 });
        setNewNote('');
        onNoteClose();
        fetchDashboardData(); // Refresh data to show new note
      }
    } catch (error) {
      toast({ title: "Error adding note", status: "error", duration: 3000 });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCreateCustomPlan = async (e) => {
    e?.preventDefault();
    if (!planForm.name || !planForm.price || !planForm.durationDays) {
      toast({
        title: 'Validation Error',
        description: 'Please provide Package Name, Price, and Duration in days',
        status: 'warning',
        duration: 3000
      });
      return;
    }
    setIsSubmittingPlan(true);
    try {
      const token = localStorage.getItem('adminToken');
      const featureList = planForm.features
        ? planForm.features.split('\n').map(f => f.trim()).filter(Boolean)
        : [];
      const payload = {
        name: planForm.name,
        price: Number(planForm.price),
        durationDays: Number(planForm.durationDays),
        jobPostLimit: Number(planForm.jobPostLimit || 0),
        hiringLimit: Number(planForm.hiringLimit || 0),
        replacementLimit: Number(planForm.replacementLimit || 0),
        features: featureList,
        customNotes: planForm.customNotes,
        expiresInHours: planForm.expiresInHours || undefined,
        expiresAt: planForm.expiresAt || undefined,
        isPublished: planForm.isPublished
      };

      const res = await axios.post(`${API_BASE_URL}/plans/customer/${id}`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        toast({
          title: 'Custom Package Created!',
          description: planForm.isPublished
            ? 'Package has been created and published on the App for this customer!'
            : 'Package created in draft mode.',
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
        onPlanModalClose();
        setPlanForm({
          name: '',
          price: '',
          durationDays: '30',
          jobPostLimit: '3',
          hiringLimit: '5',
          replacementLimit: '2',
          features: 'Dedicated Relationship Manager\nFree Cook Replacements\nPriority Cook Matching',
          customNotes: '',
          expiresInHours: '',
          expiresAt: '',
          isPublished: true
        });
        fetchDashboardData();
        setTabIndex(1); // Switch to Packages & Subscriptions tab
      }
    } catch (err) {
      toast({
        title: 'Failed to create custom package',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleTogglePublish = async (planId) => {
    setTogglingPlanId(planId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.patch(`${API_BASE_URL}/plans/${planId}/publish`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        const isNowPublished = res.data.data.isPublished;
        toast({
          title: isNowPublished ? 'Published on App!' : 'Unpublished from App',
          description: isNowPublished
            ? 'Only this customer will now see this custom package in their app.'
            : 'Package is hidden from customer app.',
          status: isNowPublished ? 'success' : 'info',
          duration: 3000,
          position: 'top-right'
        });
        fetchDashboardData();
      }
    } catch (err) {
      toast({
        title: 'Error updating publish status',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setTogglingPlanId(null);
    }
  };

  const fetchAllPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Load standard plans + customer's custom plans together
      const [stdRes, customRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/plans`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/plans/customer/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const stdPlans = stdRes.status === 'fulfilled' ? (stdRes.value.data?.plans || stdRes.value.data?.data || []) : [];
      const custPlans = customRes.status === 'fulfilled' ? (customRes.value.data?.plans || customRes.value.data?.data || []) : [];
      setAllPlans([...stdPlans, ...custPlans]);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleOpenActivateModal = () => {
    fetchAllPlans();
    setActivateForm({
      planId: '',
      totalAmount: '',
      amountPaid: '',
      dueAmount: 0,
      paymentMethod: 'cash',
      paymentReference: '',
      paymentNote: '',
      startDate: new Date().toISOString().split('T')[0],
      customJobPostLimit: '',
      customHiringLimit: '',
      customReplacementLimit: '',
      overridePrevious: false
    });
    setSelectedPlanPreview(null);
    onActivateModalOpen();
  };

  const handlePlanSelect = (planId) => {
    const plan = allPlans.find(p => p._id === planId);
    setSelectedPlanPreview(plan || null);
    const price = plan ? plan.price : 0;
    setActivateForm(prev => ({
      ...prev,
      planId,
      totalAmount: plan ? String(price) : '',
      amountPaid: plan ? String(price) : '',
      dueAmount: 0,
      customJobPostLimit: plan ? String(plan.jobPostLimit || '') : '',
      customHiringLimit: plan ? String(plan.hiringLimit || '') : '',
      customReplacementLimit: plan ? String(plan.replacementLimit || '') : ''
    }));
  };

  const handleActivatePlan = async () => {
    if (!activateForm.planId) {
      toast({ title: 'Plan select karo', status: 'warning', duration: 2000 }); return;
    }
    if (activateForm.amountPaid === '' || activateForm.amountPaid === null) {
      toast({ title: 'Amount enter karo (0 bhi chal sakta hai)', status: 'warning', duration: 2000 }); return;
    }
    setIsActivating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_BASE_URL}/admin/activate-plan`,
        {
          customerId: id,
          planId: activateForm.planId,
          totalAmount: activateForm.totalAmount ? Number(activateForm.totalAmount) : undefined,
          amountPaid: Number(activateForm.amountPaid),
          paymentMethod: activateForm.paymentMethod,
          paymentReference: activateForm.paymentReference,
          paymentNote: activateForm.paymentNote,
          startDate: activateForm.startDate,
          customJobPostLimit: activateForm.customJobPostLimit ? Number(activateForm.customJobPostLimit) : undefined,
          customHiringLimit: activateForm.customHiringLimit ? Number(activateForm.customHiringLimit) : undefined,
          customReplacementLimit: activateForm.customReplacementLimit ? Number(activateForm.customReplacementLimit) : undefined,
          overridePrevious: activateForm.overridePrevious
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast({
          title: '✅ Plan Activated!',
          description: res.data.message,
          status: 'success',
          duration: 4000,
          position: 'top-right',
          isClosable: true
        });
        onActivateModalClose();
        fetchDashboardData();
        setTabIndex(1);
      }
    } catch (err) {
      toast({
        title: 'Activation failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleOpenEditModal = (sub) => {
    setSelectedSubForEdit(sub);
    const planTotal = sub.totalAmount ?? sub.plan?.price ?? sub.amountPaid ?? 0;
    const paid = sub.amountPaid ?? 0;
    const due = sub.dueAmount ?? Math.max(0, planTotal - paid);
    
    setEditSubForm({
      newPaymentAmount: '',
      paymentMethod: 'cash',
      paymentReference: '',
      paymentNote: '',
      totalAmount: String(planTotal),
      dueAmount: String(due),
      endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '',
      status: sub.status || 'Active',
      customJobPostLimit: sub.customJobPostLimit !== undefined ? String(sub.customJobPostLimit) : String(sub.plan?.jobPostLimit || ''),
      customHiringLimit: sub.customHiringLimit !== undefined ? String(sub.customHiringLimit) : String(sub.plan?.hiringLimit || ''),
      customReplacementLimit: sub.customReplacementLimit !== undefined ? String(sub.customReplacementLimit) : String(sub.plan?.replacementLimit || '')
    });
    onEditSubOpen();
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubForEdit) return;
    setIsUpdatingSub(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        totalAmount: editSubForm.totalAmount ? Number(editSubForm.totalAmount) : undefined,
        dueAmount: editSubForm.dueAmount !== '' ? Number(editSubForm.dueAmount) : undefined,
        endDate: editSubForm.endDate || undefined,
        status: editSubForm.status,
        customJobPostLimit: editSubForm.customJobPostLimit ? Number(editSubForm.customJobPostLimit) : undefined,
        customHiringLimit: editSubForm.customHiringLimit ? Number(editSubForm.customHiringLimit) : undefined,
        customReplacementLimit: editSubForm.customReplacementLimit ? Number(editSubForm.customReplacementLimit) : undefined
      };

      if (editSubForm.newPaymentAmount && Number(editSubForm.newPaymentAmount) > 0) {
        payload.newPaymentAmount = Number(editSubForm.newPaymentAmount);
        payload.paymentMethod = editSubForm.paymentMethod;
        payload.paymentReference = editSubForm.paymentReference;
        payload.paymentNote = editSubForm.paymentNote;
      }

      const res = await axios.put(
        `${API_BASE_URL}/admin/subscriptions/${selectedSubForEdit._id}/update`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast({
          title: '✅ Package Updated!',
          description: res.data.message || 'Subscription details updated successfully',
          status: 'success',
          duration: 3500,
          position: 'top-right'
        });
        onEditSubClose();
        fetchDashboardData();
      }
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3500,
        position: 'top-right'
      });
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || !data) {
    return <PageContentLoader />;
  }

  const { customer, stats, jobs, applications, transactions, bookings, activeSubscriptions, recentActivity } = data;

  const hiredCandidates = applications.filter(app => app.status === 'Hired');
  const demoScheduled = applications.filter(app => app.status === 'Demo Scheduled');

  return (
    <Box pb="10">
      <Flex justify="space-between" align="center" mb="6" wrap="wrap" gap="3">
        <Box>
          <Text fontSize="xs" color="#64748b" fontWeight="600" mb="1">
            Home &gt; Client Management &gt; Client Dashboard
          </Text>
          <HStack>
            <Text fontSize="2xl" fontWeight="800" color="#0f172a">Client Dashboard</Text>
            <Badge colorScheme={customer.accountStatus === 'active' ? 'green' : 'red'} variant="subtle" borderRadius="md" px="2">{customer.accountStatus === 'active' ? 'Active' : 'Blocked'}</Badge>
          </HStack>
        </Box>
        <HStack spacing="3">
          <Button
            leftIcon={<Zap size={16} />}
            bg="linear-gradient(135deg, #f59e0b, #ef4444)"
            color="white"
            _hover={{ opacity: 0.9 }}
            size="sm"
            borderRadius="lg"
            fontWeight="700"
            onClick={handleOpenActivateModal}
            boxShadow="0 2px 8px rgba(245, 158, 11, 0.35)"
          >
            Activate Plan
          </Button>
          <Button 
            leftIcon={<Sparkles size={16} />} 
            bg="#7c3aed" 
            color="white" 
            _hover={{ bg: '#6d28d9' }} 
            size="sm" 
            borderRadius="lg"
            fontWeight="700"
            onClick={onPlanModalOpen}
            boxShadow="0 2px 8px rgba(124, 58, 237, 0.25)"
          >
            + Create Custom Package
          </Button>
          <Button leftIcon={<ArrowLeft size={16} />} variant="outline" size="sm" onClick={() => navigate('/customers/list')} borderRadius="lg" bg="white">
            Back to Client List
          </Button>
        </HStack>
      </Flex>

      {/* Top Section: Profile & Stats */}
      <Grid templateColumns={{ base: '1fr', lg: '350px 1fr' }} gap="6" mb="6">
        
        {/* Profile Card */}
        <Box bg="white" p="6" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm" display="flex" flexDirection="column" justify="space-between">
          <Box>
            <HStack spacing="4" mb="5">
              <Flex w="64px" h="64px" bg="#eff6ff" borderRadius="2xl" justify="center" align="center" border="1.5px solid #bfdbfe" flexShrink={0}>
                <Building size={30} color={BRAND} />
              </Flex>
              <Box>
                <HStack spacing="2">
                  <Text fontSize="xl" fontWeight="800" color="#0f172a">{customer.name}</Text>
                  <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px="2" py="0.5" borderRadius="full">VERIFIED</Badge>
                </HStack>
                <Text fontSize="xs" color="#64748b" fontWeight="600" textTransform="capitalize" mt="0.5">Category: {customer.propertyCategory || 'N/A'}</Text>
              </Box>
            </HStack>
            
            <VStack align="stretch" spacing="1.5" mb="5" divider={<Divider borderColor="#f1f5f9" />}>
              <Flex align="center" justify="space-between" py="1.5">
                <HStack spacing="3" color="#475569" flex="1" minW={0}>
                  <Phone size={17} color="#64748b" />
                  <Text fontSize="xs" fontWeight="700" color="#64748b" w="55px">Phone</Text>
                  <Text fontSize="sm" fontWeight="700" color="#0f172a" isTruncated>{customer.contactPhone || 'N/A'}</Text>
                </HStack>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#2563eb"
                  _hover={{ bg: '#eff6ff', borderColor: '#93c5fd' }}
                  leftIcon={copiedKey === 'Phone' ? <Check size={13} /> : <Copy size={13} />}
                  onClick={() => handleCopy(customer.contactPhone, 'Phone')}
                  borderRadius="lg"
                  px="2.5"
                  fontWeight="600"
                >
                  {copiedKey === 'Phone' ? 'Copied' : 'Copy'}
                </Button>
              </Flex>

              <Flex align="center" justify="space-between" py="1.5">
                <HStack spacing="3" color="#475569" flex="1" minW={0}>
                  <Mail size={17} color="#64748b" />
                  <Text fontSize="xs" fontWeight="700" color="#64748b" w="55px">Email</Text>
                  <Text fontSize="sm" fontWeight="700" color="#0f172a" isTruncated>{customer.email || 'N/A'}</Text>
                </HStack>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#2563eb"
                  _hover={{ bg: '#eff6ff', borderColor: '#93c5fd' }}
                  leftIcon={copiedKey === 'Email' ? <Check size={13} /> : <Copy size={13} />}
                  onClick={() => handleCopy(customer.email, 'Email')}
                  borderRadius="lg"
                  px="2.5"
                  fontWeight="600"
                >
                  {copiedKey === 'Email' ? 'Copied' : 'Copy'}
                </Button>
              </Flex>

              <Flex align="center" justify="space-between" py="1.5">
                <HStack spacing="3" color="#475569" flex="1" minW={0}>
                  <MapPin size={17} color="#64748b" />
                  <Text fontSize="xs" fontWeight="700" color="#64748b" w="55px">Address</Text>
                  <Text fontSize="sm" fontWeight="700" color="#0f172a" isTruncated>{customer.contactAddress || 'N/A'}</Text>
                </HStack>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#2563eb"
                  _hover={{ bg: '#eff6ff', borderColor: '#93c5fd' }}
                  leftIcon={copiedKey === 'Address' ? <Check size={13} /> : <Copy size={13} />}
                  onClick={() => handleCopy(customer.contactAddress, 'Address')}
                  borderRadius="lg"
                  px="2.5"
                  fontWeight="600"
                >
                  {copiedKey === 'Address' ? 'Copied' : 'Copy'}
                </Button>
              </Flex>

              <Flex align="center" justify="space-between" py="1.5">
                <HStack spacing="3" color="#475569" flex="1" minW={0}>
                  <Clock size={17} color="#64748b" />
                  <Text fontSize="xs" fontWeight="700" color="#64748b" w="75px">Client Since</Text>
                  <Text fontSize="sm" fontWeight="700" color="#0f172a" isTruncated>{formatDate(customer.createdAt)}</Text>
                </HStack>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#cbd5e1"
                  color="#2563eb"
                  _hover={{ bg: '#eff6ff', borderColor: '#93c5fd' }}
                  leftIcon={copiedKey === 'Client Since' ? <Check size={13} /> : <Copy size={13} />}
                  onClick={() => handleCopy(formatDate(customer.createdAt), 'Client Since')}
                  borderRadius="lg"
                  px="2.5"
                  fontWeight="600"
                >
                  {copiedKey === 'Client Since' ? 'Copied' : 'Copy'}
                </Button>
              </Flex>
            </VStack>
          </Box>

          <Button
            w="100%"
            colorScheme="blue"
            bg="#0284c7"
            _hover={{ bg: '#0369a1' }}
            leftIcon={copiedKey === 'all' ? <Check size={18} /> : <Copy size={18} />}
            onClick={handleCopyAllDetails}
            borderRadius="xl"
            size="md"
            py="5"
            fontWeight="700"
            boxShadow="sm"
          >
            {copiedKey === 'all' ? 'All Details Copied!' : 'Copy All Details'}
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap="4" alignContent="start">
          <StatCard icon={Briefcase} label="Total Jobs Posted" value={stats.totalJobs} colorScheme="blue" />
          <StatCard icon={Users} label="Hired Candidates" value={hiredCandidates.length} colorScheme="green" />
          <StatCard icon={Calendar} label="Demo Scheduled" value={demoScheduled.length} colorScheme="purple" />
          <StatCard icon={LayoutDashboard} label="Total Bookings" value={stats.totalBookings} colorScheme="cyan" />
          <StatCard icon={CreditCard} label="Total Transactions" value={`₹${stats.totalSpent.toLocaleString('en-IN')}`} colorScheme="orange" />
          <StatCard icon={Award} label="Active Package" 
            value={activeSubscriptions?.length > 0 ? (activeSubscriptions[0].plan?.name || 'Active') : 'No Active Plan'} 
            subLabel={activeSubscriptions?.length > 0 ? `Valid till: ${formatDate(activeSubscriptions[0].endDate)}` : 'Click to create custom package'}
            colorScheme={activeSubscriptions?.length > 0 ? 'green' : 'purple'} />
        </Grid>
      </Grid>

      {/* Main Tabs */}
      <Box bg="white" borderRadius="2xl" border="1px solid #e2e8f0" overflow="hidden" mb="6" boxShadow="sm">
        <Tabs colorScheme="blue" index={tabIndex} onChange={(index) => setTabIndex(index)}>
          <TabList px="2" pt="2" borderBottom="1px solid #e2e8f0" overflowX="auto">
            {['Overview', 'Packages & Subscriptions', 'Jobs Posted', 'Hired Candidates', 'Demo Scheduled', 'Transactions', 'Bookings', 'Blocked History', 'Activity Log'].map((tab, idx) => (
              <Tab key={idx} fontSize="sm" fontWeight="600" color="#64748b" _selected={{ color: BRAND, borderBottom: `2px solid ${BRAND}` }} whiteSpace="nowrap" pb="4">
                {tab}
              </Tab>
            ))}
          </TabList>

          <TabPanels bg="#f8fafc" minH="400px" p="6">
            
            {/* Overview Tab */}
            <TabPanel p="0">
              <Grid templateColumns={{ base: '1fr', xl: '1fr 1.2fr 1fr' }} gap="6">
                
                {/* Client Overview Details */}
                <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Text fontSize="md" fontWeight="800" color="#0f172a" mb="4">Client Overview</Text>
                  <VStack align="stretch" spacing="4">
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Client ID</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">CLT-{customer._id.toString().slice(-6).toUpperCase()}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Contact Person</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.contactName || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Email</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.email || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Phone</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.contactPhone || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Category</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700" textTransform="capitalize">{customer.propertyCategory || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Address</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.contactAddress || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Account Status</Text>
                      <Badge colorScheme={customer.accountStatus === 'active' ? 'green' : 'red'} w="fit-content" borderRadius="md">{customer.accountStatus}</Badge>
                    </Grid>
                  </VStack>
                </Box>

                {/* Recent Activity */}
                <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Text fontSize="md" fontWeight="800" color="#0f172a" mb="4">Recent Activity</Text>
                  {recentActivity.length === 0 ? (
                    <Text fontSize="sm" color="#94a3b8">No recent activity found.</Text>
                  ) : (
                    <VStack align="stretch" spacing="4" position="relative" pl="2">
                      <Box position="absolute" left="15px" top="10px" bottom="10px" w="2px" bg="#e2e8f0" zIndex="0" />
                      {recentActivity.slice(0, 5).map((activity, idx) => (
                        <Flex key={idx} position="relative" zIndex="1" gap="4">
                          <Box w="10px" h="10px" borderRadius="full" bg={BRAND} mt="1.5" outline="4px solid white" />
                          <Box>
                            <Text fontSize="sm" fontWeight="700" color="#1e293b">
                              {activity.type === 'job_posted' && `New job posted - ${activity.details.title}`}
                              {activity.type === 'candidate_hired' && `Candidate ${activity.details.candidate?.name || ''} hired`}
                              {activity.type === 'demo_scheduled' && `Demo scheduled with ${activity.details.candidate?.name || ''}`}
                              {activity.type === 'payment_received' && `Payment received ₹${activity.details.amount}`}
                              {activity.type === 'package_renewed' && `Package active - ${activity.details.plan?.name}`}
                            </Text>
                            <Text fontSize="xs" color="#64748b" mt="0.5">{formatDateTime(activity.date)}</Text>
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Client Notes */}
                <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Flex justify="space-between" align="center" mb="4">
                    <Text fontSize="md" fontWeight="800" color="#0f172a">Client Notes</Text>
                    <Button size="xs" variant="outline" onClick={onNoteOpen}>Add Note</Button>
                  </Flex>
                  <VStack align="stretch" spacing="3">
                    {(!customer.notes || customer.notes.length === 0) ? (
                      <Text fontSize="sm" color="#94a3b8">No notes added yet.</Text>
                    ) : (
                      customer.notes.slice().reverse().map((note, idx) => (
                        <Box key={idx} p="3" bg={idx % 2 === 0 ? '#fffbeb' : '#ecfdf5'} borderRadius="md" border="1px solid" borderColor={idx % 2 === 0 ? '#fde68a' : '#a7f3d0'}>
                          <Text fontSize="sm" color="#1e293b" mb="2">{note.content}</Text>
                          <Text fontSize="xs" color="#64748b">Added by {note.addedBy} on {formatDateTime(note.createdAt)}</Text>
                        </Box>
                      ))
                    )}
                  </VStack>
                </Box>

              </Grid>
            </TabPanel>

            {/* Packages & Subscriptions Tab */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                
                {/* Active Subscriptions Section */}
                <Box bg="white" p="6" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm">
                  <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4" mb="4">
                    <Box>
                      <HStack spacing="2">
                        <Text fontSize="lg" fontWeight="800" color="#0f172a">Active Packages & Subscriptions</Text>
                        {activeSubscriptions?.length > 0 ? (
                          <Badge colorScheme="green" variant="solid" px="2.5" py="0.5" borderRadius="full">
                            {activeSubscriptions.filter(s => s.status === 'Active').length} ACTIVE
                          </Badge>
                        ) : (
                          <Badge colorScheme="red" variant="subtle" px="2.5" py="0.5" borderRadius="full">NO ACTIVE PACKAGE</Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="#64748b" mt="1">
                        Subscription packages, partial/due payments, hiring limits & validity for this customer.
                      </Text>
                    </Box>
                    <HStack spacing="2">
                      <Button
                        leftIcon={<Zap size={15} />}
                        bg="linear-gradient(135deg, #f59e0b, #ef4444)"
                        color="white"
                        _hover={{ opacity: 0.9 }}
                        size="sm"
                        borderRadius="lg"
                        onClick={handleOpenActivateModal}
                      >
                        ⚡ Assign / Activate Plan
                      </Button>
                      <Button
                        leftIcon={<Sparkles size={15} />}
                        bg="#7c3aed"
                        color="white"
                        _hover={{ bg: '#6d28d9' }}
                        size="sm"
                        borderRadius="lg"
                        onClick={onPlanModalOpen}
                      >
                        + Create Custom Package
                      </Button>
                    </HStack>
                  </Flex>

                  {activeSubscriptions?.length > 0 ? (
                    <VStack align="stretch" spacing="4">
                      {activeSubscriptions.map((sub, idx) => {
                        const totalVal = sub.totalAmount ?? sub.plan?.price ?? sub.amountPaid ?? 0;
                        const paidVal = sub.amountPaid ?? 0;
                        const dueVal = sub.dueAmount ?? Math.max(0, totalVal - paidVal);
                        const isPartiallyPaid = dueVal > 0;
                        const isSubActive = sub.status === 'Active' && new Date(sub.endDate) > new Date();

                        return (
                          <Box 
                            key={sub._id || idx} 
                            p="5" 
                            bg={isPartiallyPaid ? '#fffbeb' : '#f8fafc'} 
                            borderRadius="xl" 
                            border="1px solid" 
                            borderColor={isPartiallyPaid ? '#fde68a' : '#e2e8f0'}
                          >
                            <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} wrap="wrap" gap="3" mb="3">
                              <HStack spacing="2.5">
                                <Badge colorScheme={isSubActive ? 'green' : 'gray'} px="2.5" py="0.5" borderRadius="full">
                                  {isSubActive ? '● ACTIVE' : sub.status?.toUpperCase() || 'EXPIRED'}
                                </Badge>
                                <Text fontSize="md" fontWeight="800" color="#0f172a">{sub.plan?.name || 'Package'}</Text>
                                {sub.plan?.isCustom && <Badge colorScheme="purple" fontSize="2xs">CUSTOM</Badge>}
                                {isPartiallyPaid ? (
                                  <Badge colorScheme="orange" variant="solid" fontSize="2xs" px="2" py="0.5" borderRadius="full">
                                    PARTIALLY PAID
                                  </Badge>
                                ) : (
                                  <Badge colorScheme="green" variant="subtle" fontSize="2xs" px="2" py="0.5" borderRadius="full">
                                    FULLY PAID
                                  </Badge>
                                )}
                              </HStack>

                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                bg="white"
                                borderColor="#93c5fd"
                                color="#2563eb"
                                _hover={{ bg: '#eff6ff' }}
                                leftIcon={<Edit3 size={13} />}
                                onClick={() => handleOpenEditModal(sub)}
                                borderRadius="lg"
                                px="3"
                                py="3"
                                fontWeight="700"
                              >
                                Edit / Collect Remaining (₹{dueVal.toLocaleString('en-IN')})
                              </Button>
                            </Flex>

                            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="4" pt="2" borderTop="1px dashed" borderColor={isPartiallyPaid ? '#fde68a' : '#e2e8f0'}>
                              <Box>
                                <Text fontSize="2xs" color="#64748b" fontWeight="700" textTransform="uppercase">Payment Summary</Text>
                                <HStack mt="1" spacing="2">
                                  <Text fontSize="sm" fontWeight="800" color="#0f172a">Total: ₹{totalVal.toLocaleString('en-IN')}</Text>
                                </HStack>
                                <HStack spacing="2" mt="0.5">
                                  <Text fontSize="xs" fontWeight="700" color="#16a34a">Paid: ₹{paidVal.toLocaleString('en-IN')}</Text>
                                  {dueVal > 0 && (
                                    <Text fontSize="xs" fontWeight="800" color="#dc2626">Due: ₹{dueVal.toLocaleString('en-IN')}</Text>
                                  )}
                                </HStack>
                              </Box>

                              <Box>
                                <Text fontSize="2xs" color="#64748b" fontWeight="700" textTransform="uppercase">Validity</Text>
                                <Text fontSize="sm" fontWeight="700" color="#0f172a" mt="1">
                                  {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                                </Text>
                                <Text fontSize="2xs" color="#64748b">
                                  {new Date(sub.endDate) > new Date() ? `${Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 3600 * 24))} days left` : 'Expired'}
                                </Text>
                              </Box>

                              <Box>
                                <Text fontSize="2xs" color="#64748b" fontWeight="700" textTransform="uppercase">Hiring & Job Limits</Text>
                                <Text fontSize="xs" fontWeight="700" color="#1e293b" mt="1">
                                  Hires: <b>{sub.customHiringLimit !== undefined ? sub.customHiringLimit : (sub.plan?.hiringLimit ?? '∞')}</b> • Posts: <b>{sub.customJobPostLimit !== undefined ? sub.customJobPostLimit : (sub.plan?.jobPostLimit ?? '∞')}</b>
                                </Text>
                                <Text fontSize="2xs" color="#64748b">
                                  Replacements: <b>{sub.customReplacementLimit !== undefined ? sub.customReplacementLimit : (sub.plan?.replacementLimit ?? 0)}</b>
                                </Text>
                              </Box>

                              <Box>
                                <Text fontSize="2xs" color="#64748b" fontWeight="700" textTransform="uppercase">Activated Details</Text>
                                <Text fontSize="xs" fontWeight="600" color="#334155" mt="1">
                                  By: {sub.activatedBy?.name || 'Admin / Manager'}
                                </Text>
                                <Text fontSize="2xs" color="#64748b">
                                  Method: <Badge fontSize="9px" colorScheme="purple">{sub.paymentMethod?.toUpperCase() || 'CASH'}</Badge>
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </Box>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Box p="6" textAlign="center" bg="#f8fafc" borderRadius="xl" border="1px dashed #cbd5e1">
                      <Text fontSize="sm" fontWeight="700" color="#475569" mb="1">This customer has not purchased any package yet.</Text>
                      <Text fontSize="xs" color="#64748b" mb="3">Directly assign a plan (with partial or full payment), or create a custom package for this customer.</Text>
                      <HStack justify="center" spacing="3">
                        <Button size="sm" bg="linear-gradient(135deg, #f59e0b, #ef4444)" color="white" _hover={{ opacity: 0.9 }} onClick={handleOpenActivateModal} leftIcon={<Zap size={14} />}>
                          Activate / Assign Plan Directly
                        </Button>
                        <Button size="sm" bg={BRAND} color="white" _hover={{ bg: '#1e1c52' }} onClick={onPlanModalOpen} leftIcon={<Sparkles size={14} />}>
                          Create Custom Package
                        </Button>
                      </HStack>
                    </Box>
                  )}
                </Box>

                {/* Custom Packages Created for Customer */}
                <Box bg="white" p="6" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm">
                  <Flex justify="space-between" align="center" mb="4" wrap="wrap" gap="2">
                    <Box>
                      <Text fontSize="lg" fontWeight="800" color="#0f172a">Custom Packages for this Customer</Text>
                      <Text fontSize="xs" color="#64748b" mt="0.5">
                        These packages are targeted exclusively to this customer. Clicking "Publish on App" allows them to purchase it from their app.
                      </Text>
                    </Box>
                    <Badge colorScheme="purple" px="2.5" py="1" borderRadius="full" fontSize="xs">
                      {data.customPlans?.length || 0} Custom {data.customPlans?.length === 1 ? 'Package' : 'Packages'}
                    </Badge>
                  </Flex>

                  {(!data.customPlans || data.customPlans.length === 0) ? (
                    <Box p="8" textAlign="center" bg="#faf5ff" borderRadius="xl" border="1px dashed #d8b4fe">
                      <Text fontSize="sm" fontWeight="700" color="#7c3aed" mb="1">No custom packages created yet.</Text>
                      <Text fontSize="xs" color="#64748b" mb="3">Design a special offer with custom pricing, hiring limit, and cook replacement count.</Text>
                      <Button size="sm" bg="#7c3aed" color="white" _hover={{ bg: '#6d28d9' }} onClick={onPlanModalOpen} leftIcon={<Plus size={14} />}>
                        Create Custom Package Now
                      </Button>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead bg="#f8fafc">
                          <Tr>
                            <Th py="3.5" color="#64748b">Package Name</Th>
                            <Th py="3.5" color="#64748b">Price</Th>
                            <Th py="3.5" color="#64748b">Validity</Th>
                            <Th py="3.5" color="#64748b">Limits (Posts / Hires / Replacements)</Th>
                            <Th py="3.5" color="#64748b">Features</Th>
                            <Th py="3.5" color="#64748b">App Status</Th>
                            <Th py="3.5" color="#64748b" textAlign="center">Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {data.customPlans.map((plan) => (
                            <Tr key={plan._id}>
                              <Td py="3.5">
                                <VStack align="start" spacing="0.5">
                                  <Text fontSize="sm" fontWeight="700" color="#0f172a">{plan.name}</Text>
                                  {plan.customNotes && (
                                    <Text fontSize="xs" color="#64748b" fontStyle="italic">"{plan.customNotes}"</Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td py="3.5">
                                <Text fontSize="sm" fontWeight="800" color="#16a34a">₹{plan.price.toLocaleString('en-IN')}</Text>
                              </Td>
                              <Td py="3.5">
                                <Text fontSize="sm" fontWeight="600" color="#475569">{plan.durationDays} Days</Text>
                              </Td>
                              <Td py="3.5">
                                <VStack align="start" spacing="0.5">
                                  <Text fontSize="xs" color="#1e293b" fontWeight="600">
                                    Posts: <b>{plan.jobPostLimit}</b> • Hires: <b>{plan.hiringLimit}</b>
                                  </Text>
                                  <Text fontSize="xs" color="#64748b">
                                    Replacements: <b>{plan.replacementLimit || 0}</b>
                                  </Text>
                                </VStack>
                              </Td>
                              <Td py="3.5" maxW="200px">
                                <VStack align="start" spacing="0.5">
                                  {(plan.features || []).slice(0, 2).map((f, i) => (
                                    <Text key={i} fontSize="xs" color="#475569" isTruncated maxW="180px">• {f}</Text>
                                  ))}
                                  {(plan.features || []).length > 2 && (
                                    <Text fontSize="2xs" color="#94a3b8">+{plan.features.length - 2} more</Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td py="3.5">
                                <VStack align="start" spacing="1">
                                  {plan.isPublished ? (
                                    <Badge colorScheme="green" px="2.5" py="0.5" borderRadius="full" fontSize="xs">
                                      ● Live on App
                                    </Badge>
                                  ) : (
                                    <Badge colorScheme="gray" px="2.5" py="0.5" borderRadius="full" fontSize="xs">
                                      ○ Draft (Hidden)
                                    </Badge>
                                  )}
                                  {plan.expiresAt ? (
                                    <HStack spacing="1">
                                      <Clock size={11} color={new Date(plan.expiresAt) > new Date() ? '#ea580c' : '#dc2626'} />
                                      <Text fontSize="10px" fontWeight="700" color={new Date(plan.expiresAt) > new Date() ? '#ea580c' : '#dc2626'}>
                                        {new Date(plan.expiresAt) > new Date()
                                          ? `Expires: ${new Date(plan.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                                          : 'Timer Expired (Auto-Hidden)'}
                                      </Text>
                                    </HStack>
                                  ) : (
                                    <Text fontSize="10px" color="#94a3b8" fontWeight="600">No Timer (Permanent)</Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td py="3.5" textAlign="center">
                                <Button
                                  size="xs"
                                  colorScheme={plan.isPublished ? "red" : "purple"}
                                  variant={plan.isPublished ? "outline" : "solid"}
                                  bg={plan.isPublished ? "transparent" : "#7c3aed"}
                                  color={plan.isPublished ? "#dc2626" : "white"}
                                  _hover={plan.isPublished ? { bg: '#fef2f2' } : { bg: '#6d28d9' }}
                                  isLoading={togglingPlanId === plan._id}
                                  onClick={() => handleTogglePublish(plan._id)}
                                  leftIcon={plan.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                                  borderRadius="lg"
                                >
                                  {plan.isPublished ? 'Unpublish' : 'Publish on App'}
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Box>

              </VStack>
            </TabPanel>

            {/* Jobs Posted Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Job ID</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Category</Th>
                      <Th py="4" color="#64748b">Posted On</Th>
                      <Th py="4" color="#64748b">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {jobs.length === 0 ? (
                      <Tr><Td colSpan={5} textAlign="center" py="6" color="#94a3b8">No jobs posted yet.</Td></Tr>
                    ) : jobs.map(job => (
                      <Tr key={job._id}>
                        <Td py="3" fontSize="sm" fontWeight="600" color="#475569">{job.jobCode || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{job.title}</Td>
                        <Td py="3" fontSize="sm" color="#64748b" textTransform="capitalize">{job.jobCategory}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(job.createdAt)}</Td>
                        <Td py="3">
                          <Badge colorScheme={job.status === 'Active' ? 'green' : 'orange'} borderRadius="full" px="2">{job.status}</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Hired Candidates Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Candidate Name</Th>
                      <Th py="4" color="#64748b">Phone</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Hired On</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {hiredCandidates.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py="6" color="#94a3b8">No hired candidates.</Td></Tr>
                    ) : hiredCandidates.map(app => (
                      <Tr key={app._id}>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{app.candidate?.name || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.candidate?.phone || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.job?.title || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(app.updatedAt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Demo Scheduled Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Candidate Name</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Demo Date</Th>
                      <Th py="4" color="#64748b">Demo Time</Th>
                      <Th py="4" color="#64748b">Meeting Link</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {demoScheduled.length === 0 ? (
                      <Tr><Td colSpan={5} textAlign="center" py="6" color="#94a3b8">No demos scheduled.</Td></Tr>
                    ) : demoScheduled.map(app => (
                      <Tr key={app._id}>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{app.candidate?.name || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.job?.title || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(app.demoDate)}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.demoTime || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="blue.500">
                          {app.meetingLink ? <a href={app.meetingLink} target="_blank" rel="noreferrer">Join Meet</a> : 'N/A'}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Transactions Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Date</Th>
                      <Th py="4" color="#64748b">Type</Th>
                      <Th py="4" color="#64748b">Amount</Th>
                      <Th py="4" color="#64748b">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py="6" color="#94a3b8">No transaction history.</Td></Tr>
                    ) : transactions.map(txn => (
                      <Tr key={txn._id}>
                        <Td py="3" fontSize="sm" fontWeight="600" color="#475569">{formatDate(txn.createdAt)}</Td>
                        <Td py="3" fontSize="sm" color="#1e293b" textTransform="capitalize">{txn.type.replace(/_/g, ' ')}</Td>
                        <Td py="3" fontSize="sm" fontWeight="800" color="#16a34a">₹{txn.amount.toLocaleString('en-IN')}</Td>
                        <Td py="3">
                          <Badge colorScheme={txn.status === 'success' ? 'green' : 'red'} borderRadius="full" px="2">{txn.status}</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Bookings Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Booked Cook</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Booking Status</Th>
                      <Th py="4" color="#64748b">Booked On</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookings.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py="6" color="#94a3b8">No bookings found.</Td></Tr>
                    ) : bookings.map(b => (
                      <Tr key={b._id}>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{b.cook?.name || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{b.job?.title || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">
                          <Badge colorScheme={b.status === 'confirmed' ? 'green' : 'orange'} borderRadius="full" px="2">{b.status}</Badge>
                        </Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(b.createdAt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Blocked History Tab */}
            <TabPanel p="0">
              <Flex justify="center" align="center" h="200px" bg="white" borderRadius="xl" border="1px solid #e2e8f0">
                <Text color="#94a3b8" fontWeight="600">No blocked history found.</Text>
              </Flex>
            </TabPanel>

            {/* Activity Log Tab */}
            <TabPanel p="0">
              <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                {recentActivity.length === 0 ? (
                  <Text fontSize="sm" color="#94a3b8">No activity log found.</Text>
                ) : (
                  <VStack align="stretch" spacing="4" position="relative" pl="2">
                    <Box position="absolute" left="15px" top="10px" bottom="10px" w="2px" bg="#e2e8f0" zIndex="0" />
                    {recentActivity.map((activity, idx) => (
                      <Flex key={idx} position="relative" zIndex="1" gap="4">
                        <Box w="10px" h="10px" borderRadius="full" bg={BRAND} mt="1.5" outline="4px solid white" />
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color="#1e293b">
                            {activity.type === 'job_posted' && `New job posted - ${activity.details.title}`}
                            {activity.type === 'candidate_hired' && `Candidate ${activity.details.candidate?.name || ''} hired`}
                            {activity.type === 'demo_scheduled' && `Demo scheduled with ${activity.details.candidate?.name || ''}`}
                            {activity.type === 'payment_received' && `Payment received ₹${activity.details.amount}`}
                            {activity.type === 'package_renewed' && `Package active - ${activity.details.plan?.name}`}
                          </Text>
                          <Text fontSize="xs" color="#64748b" mt="0.5">{formatDateTime(activity.date)}</Text>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Box>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>

      {/* Add Note Modal */}
      <Modal isOpen={isNoteOpen} onClose={onNoteClose} isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Add Client Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea 
              placeholder="Type your note here..." 
              value={newNote} 
              onChange={(e) => setNewNote(e.target.value)}
              rows={5}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNoteClose}>Cancel</Button>
            <Button colorScheme="blue" bg={BRAND} onClick={handleAddNote} isLoading={isSubmittingNote}>Save Note</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Custom Package Modal */}
      <Modal isOpen={isPlanModalOpen} onClose={onPlanModalClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader bg="#f8fafc" borderBottom="1px solid #e2e8f0" py="4">
            <HStack spacing="2">
              <Sparkles size={20} color="#7c3aed" />
              <Text fontSize="lg" fontWeight="800" color="#0f172a">Create Custom Package for {customer.name}</Text>
            </HStack>
            <Text fontSize="xs" color="#64748b" fontWeight="normal" mt="1">
              This package will be assigned exclusively to {customer.name} ({customer.contactPhone}).
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="5">
            <VStack spacing="4" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#334155">Package Name</FormLabel>
                <Input
                  placeholder="e.g. Special Chef Hiring Package"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  borderRadius="lg"
                  size="sm"
                  h="40px"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700" color="#334155">Price (₹)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 2999"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    borderRadius="lg"
                    size="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700" color="#334155">Duration / Validity (Days)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 30"
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
                    borderRadius="lg"
                    size="sm"
                    h="40px"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700" color="#334155">Job Post Limit</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    value={planForm.jobPostLimit}
                    onChange={(e) => setPlanForm({ ...planForm, jobPostLimit: e.target.value })}
                    borderRadius="lg"
                    size="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700" color="#334155">Hiring Limit</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    value={planForm.hiringLimit}
                    onChange={(e) => setPlanForm({ ...planForm, hiringLimit: e.target.value })}
                    borderRadius="lg"
                    size="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700" color="#334155">Replacement Limit</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 2"
                    value={planForm.replacementLimit}
                    onChange={(e) => setPlanForm({ ...planForm, replacementLimit: e.target.value })}
                    borderRadius="lg"
                    size="sm"
                    h="40px"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" color="#334155">Included Features (one per line)</FormLabel>
                <Textarea
                  rows={3}
                  placeholder="Dedicated Relationship Manager&#10;Free Cook Replacements&#10;Priority Cook Allocation"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  borderRadius="lg"
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" color="#334155">Special Note for Customer (Optional)</FormLabel>
                <Input
                  placeholder="e.g. Exclusive discounted offer created specially for your kitchen requirements"
                  value={planForm.customNotes}
                  onChange={(e) => setPlanForm({ ...planForm, customNotes: e.target.value })}
                  borderRadius="lg"
                  size="sm"
                  h="40px"
                />
              </FormControl>

              <Box p="3.5" bg="#fff7ed" borderRadius="xl" border="1px solid #fed7aa">
                <FormControl>
                  <Flex align="center" justify="space-between" mb="1.5">
                    <HStack spacing="1.5">
                      <Clock size={16} color="#c2410c" />
                      <FormLabel fontSize="xs" fontWeight="700" color="#9a3412" mb="0">
                        Offer Validity / Countdown Timer (Optional - Not Mandatory)
                      </FormLabel>
                    </HStack>
                    {planForm.expiresInHours && (
                      <Badge colorScheme="orange" fontSize="2xs">
                        {planForm.expiresInHours}h Countdown
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="2xs" color="#9a3412" mb="2.5">
                    Agar time set karenge toh customer ke app par live countdown chalega aur time khatam hote hi offer automatic gayab ho jayega. Khali chhodne par permanent dikhega.
                  </Text>
                  
                  <Flex gap="1.5" wrap="wrap" mb="2.5">
                    {[
                      { label: '6h', value: '6' },
                      { label: '12h', value: '12' },
                      { label: '24h (1 Day)', value: '24' },
                      { label: '48h (2 Days)', value: '48' },
                      { label: '72h (3 Days)', value: '72' },
                    ].map(preset => (
                      <Button
                        key={preset.value}
                        size="xs"
                        variant={planForm.expiresInHours === preset.value ? 'solid' : 'outline'}
                        colorScheme="orange"
                        onClick={() => setPlanForm({ ...planForm, expiresInHours: preset.value, expiresAt: '' })}
                        borderRadius="md"
                        fontSize="xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                    {(planForm.expiresInHours || planForm.expiresAt) && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={() => setPlanForm({ ...planForm, expiresInHours: '', expiresAt: '' })}
                      >
                        Clear Timer
                      </Button>
                    )}
                  </Flex>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="2">
                    <Box>
                      <Text fontSize="2xs" fontWeight="700" color="#7c2d12" mb="1">Or Custom Hours:</Text>
                      <Input
                        type="number"
                        placeholder="e.g. 36 (Hours)"
                        value={planForm.expiresInHours}
                        onChange={(e) => setPlanForm({ ...planForm, expiresInHours: e.target.value, expiresAt: '' })}
                        borderRadius="md"
                        size="xs"
                        h="32px"
                        bg="white"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="2xs" fontWeight="700" color="#7c2d12" mb="1">Or Specific End Date & Time:</Text>
                      <Input
                        type="datetime-local"
                        value={planForm.expiresAt}
                        onChange={(e) => setPlanForm({ ...planForm, expiresAt: e.target.value, expiresInHours: '' })}
                        borderRadius="md"
                        size="xs"
                        h="32px"
                        bg="white"
                      />
                    </Box>
                  </SimpleGrid>
                </FormControl>
              </Box>

              <Box p="3" bg="#f5f3ff" borderRadius="xl" border="1px solid #ddd6fe">
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color="#5b21b6">Publish on App Immediately</Text>
                    <Text fontSize="xs" color="#6d28d9">
                      When enabled, ONLY this customer will see this package on their mobile app and can purchase it directly.
                    </Text>
                  </Box>
                  <Switch
                    isChecked={planForm.isPublished}
                    onChange={(e) => setPlanForm({ ...planForm, isPublished: e.target.checked })}
                    colorScheme="purple"
                    size="lg"
                  />
                </Flex>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter bg="#f8fafc" borderTop="1px solid #e2e8f0" py="3">
            <Button variant="ghost" mr={3} onClick={onPlanModalClose} size="sm">Cancel</Button>
            <Button
              bg="#7c3aed"
              color="white"
              _hover={{ bg: '#6d28d9' }}
              onClick={handleCreateCustomPlan}
              isLoading={isSubmittingPlan}
              leftIcon={<Sparkles size={16} />}
              size="sm"
              borderRadius="lg"
              px="5"
            >
              {planForm.isPublished ? 'Create & Publish on App' : 'Save as Draft'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Activate Plan Directly Modal ────────────────────────────── */}
      <Modal isOpen={isActivateModalOpen} onClose={onActivateModalClose} size="2xl" isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="0 25px 60px rgba(0,0,0,0.18)">

          {/* Header */}
          <ModalHeader py="0" px="0">
            <Box
              bgGradient="linear(135deg, #fef3c7 0%, #fde68a 50%, #fca5a5 100%)"
              px="6" py="5"
              position="relative"
            >
              <HStack spacing="4">
                <Flex
                  bg="white"
                  p="3"
                  borderRadius="xl"
                  boxShadow="0 4px 12px rgba(245,158,11,0.3)"
                  align="center"
                  justify="center"
                >
                  <Zap size={22} color="#f59e0b" />
                </Flex>
                <Box>
                  <Text fontSize="xl" fontWeight="900" color="#78350f" letterSpacing="-0.3px">
                    Activate Plan for Customer
                  </Text>
                  <HStack spacing="2" mt="0.5">
                    <Badge colorScheme="green" fontSize="2xs" borderRadius="full" px="2">
                      ✓ App pe turant reflect hoga
                    </Badge>
                    <Badge colorScheme="orange" fontSize="2xs" borderRadius="full" px="2">
                      Offline Payment
                    </Badge>
                  </HStack>
                </Box>
              </HStack>
            </Box>
          </ModalHeader>
          <ModalCloseButton top="4" right="4" zIndex="10" />

          <ModalBody py="5" px="6">
            <VStack spacing="5" align="stretch">

              {/* ── STEP 1: Plan Cards ─────────────────────────────────── */}
              <Box>
                <HStack mb="3" justify="space-between">
                  <Text fontSize="sm" fontWeight="800" color="#1e293b">
                    Step 1 — Plan Select Karo
                  </Text>
                  {activateForm.planId && (
                    <Badge colorScheme="green" fontSize="xs" borderRadius="full" px="2.5" py="0.5">
                      ✓ Selected
                    </Badge>
                  )}
                </HStack>

                {isLoadingPlans ? (
                  <Flex align="center" justify="center" py="8" gap="3">
                    <Spinner size="md" color="#f59e0b" thickness="3px" />
                    <Text fontSize="sm" color="#6b7280" fontWeight="600">Plans load ho rahe hain...</Text>
                  </Flex>
                ) : allPlans.length === 0 ? (
                  <Box p="6" textAlign="center" bg="#f8fafc" borderRadius="xl" border="1px dashed #cbd5e1">
                    <Text fontSize="sm" color="#64748b">Koi plan nahi mila. Pehle plans create karo.</Text>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                    {allPlans.map(plan => {
                      const isSelected = activateForm.planId === plan._id;
                      return (
                        <Box
                          key={plan._id}
                          onClick={() => handlePlanSelect(plan._id)}
                          cursor="pointer"
                          borderRadius="xl"
                          border={isSelected ? '2px solid #f59e0b' : '1.5px solid #e2e8f0'}
                          bg={isSelected ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'white'}
                          p="4"
                          position="relative"
                          transition="all 0.15s ease"
                          _hover={{
                            border: '2px solid #f59e0b',
                            boxShadow: '0 4px 16px rgba(245,158,11,0.15)',
                            transform: 'translateY(-1px)'
                          }}
                          boxShadow={isSelected ? '0 4px 20px rgba(245,158,11,0.2)' : 'sm'}
                        >
                          {/* Selected check badge */}
                          {isSelected && (
                            <Flex
                              position="absolute"
                              top="-10px"
                              right="-10px"
                              bg="#f59e0b"
                              borderRadius="full"
                              w="22px"
                              h="22px"
                              align="center"
                              justify="center"
                              boxShadow="0 2px 6px rgba(245,158,11,0.4)"
                            >
                              <Check size={13} color="white" strokeWidth={3} />
                            </Flex>
                          )}

                          {/* Plan type badge */}
                          <HStack justify="space-between" mb="2">
                            <Badge
                              colorScheme={plan.isCustom ? 'purple' : 'blue'}
                              fontSize="2xs"
                              borderRadius="full"
                              px="2"
                              textTransform="uppercase"
                            >
                              {plan.isCustom ? '🎯 Custom' : '📦 Standard'}
                            </Badge>
                            <Text fontSize="lg" fontWeight="900" color={isSelected ? '#92400e' : '#0f172a'}>
                              ₹{plan.price?.toLocaleString('en-IN')}
                            </Text>
                          </HStack>

                          {/* Plan name */}
                          <Text fontSize="sm" fontWeight="800" color={isSelected ? '#78350f' : '#1e293b'} mb="3" noOfLines={1}>
                            {plan.name}
                          </Text>

                          {/* Plan stats row */}
                          <SimpleGrid columns={4} gap="1">
                            {[
                              { icon: '📅', label: 'Days', value: plan.durationDays },
                              { icon: '📋', label: 'Posts', value: plan.jobPostLimit ?? '∞' },
                              { icon: '👤', label: 'Hires', value: plan.hiringLimit ?? '∞' },
                              { icon: '🔄', label: 'Replc.', value: plan.replacementLimit ?? 0 },
                            ].map(stat => (
                              <Box
                                key={stat.label}
                                bg={isSelected ? 'rgba(245,158,11,0.1)' : '#f8fafc'}
                                borderRadius="lg"
                                p="2"
                                textAlign="center"
                              >
                                <Text fontSize="2xs" mb="0.5">{stat.icon}</Text>
                                <Text fontSize="xs" fontWeight="800" color={isSelected ? '#92400e' : '#0f172a'} lineHeight="1">
                                  {stat.value}
                                </Text>
                                <Text fontSize="2xs" color="#94a3b8" lineHeight="1.2">{stat.label}</Text>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                )}
              </Box>

              {/* ── STEP 2: Payment Details ─────────────────────────────── */}
              <Box
                bg="#f8fafc"
                borderRadius="xl"
                border="1px solid #e2e8f0"
                p="4"
              >
                <Text fontSize="sm" fontWeight="800" color="#1e293b" mb="4">
                  Step 2 — Pricing & Partial Payment Breakdown
                </Text>

                <VStack spacing="3" align="stretch">
                  {/* Total Price + Amount Paid + Due Amount */}
                  <HStack spacing="3" align="start">
                    <FormControl isRequired flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Total Package Price (₹)</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 30000"
                        value={activateForm.totalAmount}
                        onChange={e => {
                          const tot = e.target.value;
                          const paid = activateForm.amountPaid || '0';
                          const due = Math.max(0, Number(tot || 0) - Number(paid || 0));
                          setActivateForm(prev => ({ ...prev, totalAmount: tot, dueAmount: due }));
                        }}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        fontWeight="700"
                        _focus={{ borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                      />
                    </FormControl>

                    <FormControl isRequired flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Initial Amount Paid (₹)</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 15000"
                        value={activateForm.amountPaid}
                        onChange={e => {
                          const paid = e.target.value;
                          const tot = activateForm.totalAmount || (selectedPlanPreview?.price ? String(selectedPlanPreview.price) : '0');
                          const due = Math.max(0, Number(tot || 0) - Number(paid || 0));
                          setActivateForm(prev => ({ ...prev, amountPaid: paid, dueAmount: due }));
                        }}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        fontWeight="700"
                        color="#16a34a"
                        _focus={{ borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#dc2626" mb="1">Remaining Balance (₹)</FormLabel>
                      <Box
                        bg="#fef2f2"
                        border="1px solid #fecaca"
                        borderRadius="lg"
                        px="3"
                        py="2"
                        fontWeight="800"
                        fontSize="sm"
                        color="#b91c1c"
                      >
                        ₹{(Math.max(0, Number(activateForm.totalAmount || 0) - Number(activateForm.amountPaid || 0))).toLocaleString('en-IN')}
                      </Box>
                    </FormControl>
                  </HStack>

                  {/* Payment Method + Start Date */}
                  <HStack spacing="3" align="start">
                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Payment Method</FormLabel>
                      <Select
                        value={activateForm.paymentMethod}
                        onChange={e => setActivateForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        _focus={{ borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                      >
                        <option value="cash">💵 Cash</option>
                        <option value="upi">📱 UPI</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                        <option value="cheque">📄 Cheque</option>
                        <option value="complimentary">🎁 Complimentary (Free)</option>
                        <option value="other">📝 Other</option>
                      </Select>
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Start Date</FormLabel>
                      <Input
                        type="date"
                        value={activateForm.startDate}
                        onChange={e => setActivateForm(prev => ({ ...prev, startDate: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        _focus={{ borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                      />
                    </FormControl>
                  </HStack>

                  {/* Reference + Note */}
                  <HStack spacing="3" align="start">
                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">
                        Payment Reference <Text as="span" fontWeight="400" color="#9ca3af">(UPI ID, Txn #, etc.)</Text>
                      </FormLabel>
                      <Input
                        placeholder={
                          activateForm.paymentMethod === 'upi' ? 'UPI Transaction ID' :
                          activateForm.paymentMethod === 'cheque' ? 'Cheque Number' :
                          activateForm.paymentMethod === 'bank_transfer' ? 'NEFT/IMPS Reference ID' :
                          'Reference ID'
                        }
                        value={activateForm.paymentReference}
                        onChange={e => setActivateForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        _focus={{ borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">
                        Internal Note <Text as="span" fontWeight="400" color="#9ca3af">(e.g. 50% advance received)</Text>
                      </FormLabel>
                      <Input
                        placeholder='e.g. "₹15k received via UPI, remaining ₹15k due in 10 days"'
                        value={activateForm.paymentNote}
                        onChange={e => setActivateForm(prev => ({ ...prev, paymentNote: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        _focus={{ borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' }}
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </Box>

              {/* Info banners */}
              <HStack spacing="3">
                <Box flex="1" p="3" bg="#f0fdf4" borderRadius="xl" border="1px solid #bbf7d0">
                  <HStack spacing="2">
                    <CheckCircle size={14} color="#16a34a" />
                    <Text fontSize="xs" color="#15803d" fontWeight="700">App pe live dikhega</Text>
                  </HStack>
                  <Text fontSize="2xs" color="#166534" mt="1">
                    Customer ke Flutter app me active package aur Remaining Due Amount turant dikhai dega.
                  </Text>
                </Box>
                <Box flex="1" p="3" bg="#eff6ff" borderRadius="xl" border="1px solid #bfdbfe">
                  <HStack spacing="2">
                    <Users size={14} color="#2563eb" />
                    <Text fontSize="xs" color="#1d4ed8" fontWeight="700">Multiple Packages Active</Text>
                  </HStack>
                  <Text fontSize="2xs" color="#1e40af" mt="1">
                    Purana active package retain rahega aur naye staff ke hiring limits add ho jayenge.
                  </Text>
                </Box>
              </HStack>

            </VStack>
          </ModalBody>

          <ModalFooter
            bg="white"
            borderTop="1px solid #e2e8f0"
            py="4"
            px="6"
            justifyContent="space-between"
          >
            <Text fontSize="xs" color="#94a3b8">
              {activateForm.planId && selectedPlanPreview
                ? `📦 ${selectedPlanPreview.name} • Total: ₹${Number(activateForm.totalAmount || selectedPlanPreview.price || 0).toLocaleString('en-IN')} • Paid: ₹${Number(activateForm.amountPaid || 0).toLocaleString('en-IN')}`
                : 'Koi plan select nahi hua'}
            </Text>
            <HStack spacing="3">
              <Button variant="ghost" onClick={onActivateModalClose} size="sm" isDisabled={isActivating} borderRadius="lg">
                Cancel
              </Button>
              <Button
                bgGradient="linear(135deg, #f59e0b, #ef4444)"
                color="white"
                _hover={{ opacity: 0.88, transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(0)' }}
                size="sm"
                borderRadius="lg"
                fontWeight="800"
                leftIcon={<Zap size={14} />}
                onClick={handleActivatePlan}
                isLoading={isActivating}
                loadingText="Activating..."
                isDisabled={!activateForm.planId || activateForm.amountPaid === ''}
                boxShadow="0 4px 14px rgba(245,158,11,0.4)"
                px="6"
              >
                ⚡ Assign / Activate Plan Now
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── MODAL: Edit Subscription & Collect Remaining Payment ─────────── */}
      <Modal isOpen={isEditSubOpen} onClose={onEditSubClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader
            bg="linear-gradient(135deg, #2563eb, #1d4ed8)"
            color="white"
            py="4"
            px="6"
          >
            <Flex align="center" justify="space-between">
              <HStack spacing="3">
                <Box p="2" bg="whiteAlpha.200" borderRadius="lg">
                  <Edit3 size={18} color="white" />
                </Box>
                <Box>
                  <Text fontSize="md" fontWeight="800">Edit Package & Collect Remaining Payment</Text>
                  <Text fontSize="xs" color="whiteAlpha.800" fontWeight="400">
                    {customer?.name} • {selectedSubForEdit?.plan?.name || 'Package'}
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" top="16px" right="16px" />

          <ModalBody p="6" bg="white">
            <VStack spacing="5" align="stretch">
              
              {/* Current Balance Overview Banner */}
              {selectedSubForEdit && (
                <Box p="4" bg="#eff6ff" borderRadius="xl" border="1px solid #bfdbfe">
                  <SimpleGrid columns={3} gap="3" textAlign="center">
                    <Box>
                      <Text fontSize="2xs" color="#64748b" fontWeight="700">TOTAL PACKAGE VALUE</Text>
                      <Text fontSize="lg" fontWeight="900" color="#0f172a">
                        ₹{(selectedSubForEdit.totalAmount ?? selectedSubForEdit.plan?.price ?? selectedSubForEdit.amountPaid ?? 0).toLocaleString('en-IN')}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="2xs" color="#64748b" fontWeight="700">AMOUNT ALREADY PAID</Text>
                      <Text fontSize="lg" fontWeight="900" color="#16a34a">
                        ₹{(selectedSubForEdit.amountPaid ?? 0).toLocaleString('en-IN')}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="2xs" color="#64748b" fontWeight="700">CURRENT DUE / REMAINING</Text>
                      <Text fontSize="lg" fontWeight="900" color="#dc2626">
                        ₹{(selectedSubForEdit.dueAmount ?? Math.max(0, (selectedSubForEdit.totalAmount ?? selectedSubForEdit.plan?.price ?? 0) - (selectedSubForEdit.amountPaid ?? 0))).toLocaleString('en-IN')}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              )}

              {/* Section 1: Collect New Payment */}
              <Box p="4" bg="#f8fafc" borderRadius="xl" border="1px solid #e2e8f0">
                <Text fontSize="xs" fontWeight="800" color="#1e293b" mb="3" textTransform="uppercase">
                  💰 Collect New / Remaining Payment
                </Text>
                <VStack spacing="3" align="stretch">
                  <HStack spacing="3" align="start">
                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">New Amount Received (₹)</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder='e.g. 15000'
                        value={editSubForm.newPaymentAmount}
                        onChange={e => setEditSubForm(prev => ({ ...prev, newPaymentAmount: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                        fontWeight="700"
                        color="#16a34a"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Payment Method</FormLabel>
                      <Select
                        value={editSubForm.paymentMethod}
                        onChange={e => setEditSubForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      >
                        <option value="cash">💵 Cash</option>
                        <option value="upi">📱 UPI</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                        <option value="cheque">📄 Cheque</option>
                        <option value="other">📝 Other</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack spacing="3" align="start">
                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Payment Ref / Txn ID</FormLabel>
                      <Input
                        placeholder='e.g. UPI Ref / Receipt #'
                        value={editSubForm.paymentReference}
                        onChange={e => setEditSubForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Note / Description</FormLabel>
                      <Input
                        placeholder='e.g. Second installment paid'
                        value={editSubForm.paymentNote}
                        onChange={e => setEditSubForm(prev => ({ ...prev, paymentNote: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </Box>

              {/* Section 2: Direct Adjustments (Price, Due, Validity, Limits) */}
              <Box p="4" bg="#f8fafc" borderRadius="xl" border="1px solid #e2e8f0">
                <Text fontSize="xs" fontWeight="800" color="#1e293b" mb="3" textTransform="uppercase">
                  ⚙️ Package Limits & Validity Adjustments
                </Text>
                <VStack spacing="3" align="stretch">
                  <HStack spacing="3" align="start">
                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Total Package Price (₹)</FormLabel>
                      <Input
                        type="number"
                        value={editSubForm.totalAmount}
                        onChange={e => setEditSubForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Manual Due Balance (₹)</FormLabel>
                      <Input
                        type="number"
                        value={editSubForm.dueAmount}
                        onChange={e => setEditSubForm(prev => ({ ...prev, dueAmount: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Expiry Date</FormLabel>
                      <Input
                        type="date"
                        value={editSubForm.endDate}
                        onChange={e => setEditSubForm(prev => ({ ...prev, endDate: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing="3" align="start">
                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Hiring Limit</FormLabel>
                      <Input
                        type="number"
                        placeholder='Staff count'
                        value={editSubForm.customHiringLimit}
                        onChange={e => setEditSubForm(prev => ({ ...prev, customHiringLimit: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Job Post Limit</FormLabel>
                      <Input
                        type="number"
                        placeholder='Posts count'
                        value={editSubForm.customJobPostLimit}
                        onChange={e => setEditSubForm(prev => ({ ...prev, customJobPostLimit: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel fontSize="xs" fontWeight="700" color="#374151" mb="1">Replacements</FormLabel>
                      <Input
                        type="number"
                        placeholder='Replacement count'
                        value={editSubForm.customReplacementLimit}
                        onChange={e => setEditSubForm(prev => ({ ...prev, customReplacementLimit: e.target.value }))}
                        borderRadius="lg"
                        bg="white"
                        borderColor="#d1d5db"
                        fontSize="sm"
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </Box>

              {/* Payment History Log in Modal */}
              {selectedSubForEdit?.paymentHistory && selectedSubForEdit.paymentHistory.length > 0 && (
                <Box>
                  <Text fontSize="xs" fontWeight="800" color="#64748b" mb="2" textTransform="uppercase">
                    Payment Collection History
                  </Text>
                  <VStack align="stretch" spacing="1.5">
                    {selectedSubForEdit.paymentHistory.map((p, pIdx) => (
                      <Flex key={pIdx} justify="space-between" align="center" p="2.5" bg="#f1f5f9" borderRadius="lg" fontSize="xs">
                        <HStack spacing="2">
                          <Badge colorScheme="green">₹{p.amount?.toLocaleString('en-IN')}</Badge>
                          <Text color="#334155" fontWeight="600">{p.paymentMethod?.toUpperCase()} {p.paymentReference ? `(${p.paymentReference})` : ''}</Text>
                          {p.paymentNote && <Text color="#64748b" fontStyle="italic">- {p.paymentNote}</Text>}
                        </HStack>
                        <Text color="#94a3b8" fontSize="2xs">
                          {p.collectedByName ? `By ${p.collectedByName} • ` : ''}{p.collectedAt ? formatDate(p.collectedAt) : ''}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}

            </VStack>
          </ModalBody>

          <ModalFooter bg="#f8fafc" borderTop="1px solid #e2e8f0" py="4" px="6">
            <HStack spacing="3" w="100%" justify="space-between">
              <Button variant="ghost" onClick={onEditSubClose} size="sm" isDisabled={isUpdatingSub}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                bg="#2563eb"
                _hover={{ bg: '#1d4ed8' }}
                size="sm"
                borderRadius="lg"
                fontWeight="800"
                onClick={handleUpdateSubscription}
                isLoading={isUpdatingSub}
                loadingText="Updating..."
                px="6"
              >
                Save Package & Payment Updates
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default CustomerDashboard;
