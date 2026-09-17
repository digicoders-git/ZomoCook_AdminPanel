import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Icon, Spinner, useToast, Grid, Badge, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel, Button, IconButton, Divider, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Textarea, Switch, FormControl, FormLabel, SimpleGrid
} from '@chakra-ui/react';
import { Briefcase, Users, CreditCard, Award, Calendar, CheckCircle, Clock, MapPin, Building, ArrowLeft, Phone, Mail, MoreVertical, LayoutDashboard, Ban, Trash2, Plus, Copy, Check, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
                
                {/* Active Subscription Banner / Card */}
                <Box bg="white" p="6" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm">
                  <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="4" mb="4">
                    <Box>
                      <HStack spacing="2">
                        <Text fontSize="lg" fontWeight="800" color="#0f172a">Current Active Subscription</Text>
                        {activeSubscriptions?.length > 0 ? (
                          <Badge colorScheme="green" variant="solid" px="2.5" py="0.5" borderRadius="full">ACTIVE</Badge>
                        ) : (
                          <Badge colorScheme="red" variant="subtle" px="2.5" py="0.5" borderRadius="full">NO ACTIVE PACKAGE</Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="#64748b" mt="1">
                        Subscription package details, validity, and hiring limits currently active for this customer
                      </Text>
                    </Box>
                    <Button
                      leftIcon={<Sparkles size={16} />}
                      bg="#7c3aed"
                      color="white"
                      _hover={{ bg: '#6d28d9' }}
                      size="sm"
                      borderRadius="lg"
                      onClick={onPlanModalOpen}
                    >
                      + Create Custom Package
                    </Button>
                  </Flex>

                  {activeSubscriptions?.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 4 }} gap="4" p="4" bg="#f8fafc" borderRadius="xl" border="1px solid #e2e8f0">
                      <Box>
                        <Text fontSize="xs" color="#64748b" fontWeight="600">Plan Name</Text>
                        <HStack mt="1">
                          <Text fontSize="md" fontWeight="800" color="#0f172a">{activeSubscriptions[0].plan?.name || 'Active Plan'}</Text>
                          {activeSubscriptions[0].plan?.isCustom && (
                            <Badge colorScheme="purple" fontSize="2xs">CUSTOM</Badge>
                          )}
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="#64748b" fontWeight="600">Price Paid</Text>
                        <Text fontSize="md" fontWeight="800" color="#16a34a" mt="1">
                          ₹{(activeSubscriptions[0].amount || activeSubscriptions[0].plan?.price || 0).toLocaleString('en-IN')}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="#64748b" fontWeight="600">Validity Period</Text>
                        <Text fontSize="sm" fontWeight="700" color="#0f172a" mt="1">
                          {formatDate(activeSubscriptions[0].startDate)} → {formatDate(activeSubscriptions[0].endDate)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="#64748b" fontWeight="600">Limits</Text>
                        <Text fontSize="sm" fontWeight="700" color="#0f172a" mt="1">
                          Posts: {activeSubscriptions[0].plan?.jobPostLimit ?? 'N/A'} • Replacements: {activeSubscriptions[0].plan?.replacementLimit ?? 0}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  ) : (
                    <Box p="6" textAlign="center" bg="#f8fafc" borderRadius="xl" border="1px dashed #cbd5e1">
                      <Text fontSize="sm" fontWeight="700" color="#475569" mb="1">This customer has not purchased any package yet.</Text>
                      <Text fontSize="xs" color="#64748b" mb="3">You can create a tailored package with custom price and limits, and publish it directly to their app.</Text>
                      <Button size="sm" bg={BRAND} color="white" _hover={{ bg: '#1e1c52' }} onClick={onPlanModalOpen} leftIcon={<Sparkles size={14} />}>
                        Create Custom Package
                      </Button>
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

    </Box>
  );
};

export default CustomerDashboard;
