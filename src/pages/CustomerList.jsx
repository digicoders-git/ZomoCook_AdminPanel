import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Avatar, Switch,
  IconButton, Icon, useToast, Button, useDisclosure, Collapse, SimpleGrid,
  FormControl, FormLabel, Select, Input, Badge,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '@chakra-ui/react';
import { Edit3, Filter, Plus, Trash2, Search, RotateCcw, Eye, MoreVertical, LayoutDashboard, Package, CreditCard, Ban, CheckCircle, UserCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, ACCENT, tableHeadStyle, thStyle, trHover, ConfirmationModal
} from '../components/ui';
import PageContentLoader from '../components/PageContentLoader';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const CustomerList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Current admin data
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const roleName = (adminData?.role?.name || '').toLowerCase();
  const isSuperAdmin =
    adminData?.email?.toLowerCase() === 'zomocookadmin@gmail.com' ||
    adminData?.isSuperAdmin === true ||
    (adminData?.type === 'admin' && !adminData?.role) ||
    roleName === 'super admin';

  const isLeadManager = !isSuperAdmin && (adminData?.type === 'user' || (adminData?.type === 'admin' && !!adminData?.role && roleName !== 'super admin'));

  // Lead Managers state
  const [leadManagers, setLeadManagers] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLeadManager, setSelectedLeadManager] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Confirmation State
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    description: '',
    onConfirm: () => { },
    type: 'danger',
    confirmLabel: 'Confirm'
  });

  // Search and Pagination states
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    leadType: '',
    subscription: '',
    leadStatus: '',
    customerStatus: '',
    salesperson: '',
    dateFrom: '',
    dateTo: ''
  });

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadManagers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/admin/users?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        response = await axios.get(`${API_BASE_URL}/users?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      if (response?.data?.success) {
        setLeadManagers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching lead managers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchLeadManagers();
  }, []);

  const getLeadManagerName = (customer) => {
    if (!customer || !customer.leadManager) return 'Not Assigned';
    const lm = String(customer.leadManager).toLowerCase().trim();
    const found = leadManagers.find(m =>
      String(m._id).toLowerCase() === lm ||
      String(m.name || '').toLowerCase().trim() === lm ||
      String(m.email || '').toLowerCase().trim() === lm
    );
    return found ? found.name : customer.leadManager;
  };

  const handleAssignLeadManager = async () => {
    if (!selectedCustomer) return;
    setIsAssigning(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/customers/${selectedCustomer._id}`, {
        leadManager: selectedLeadManager
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setCustomers(prev => prev.map(c => c._id === selectedCustomer._id ? { ...c, leadManager: selectedLeadManager } : c));
        toast({ title: 'Success', description: 'Lead Manager assigned successfully.', status: 'success', duration: 2000, position: 'top-right' });
        setIsAssignModalOpen(false);
      }
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to assign lead manager', status: 'error', duration: 2000, position: 'top-right' });
    } finally {
      setIsAssigning(false);
    }
  };

  const openAssignModal = (row) => {
    setSelectedCustomer(row);
    const val = row.leadManager || '';
    const found = leadManagers.find(m =>
      String(m._id) === String(val) ||
      String(m.name || '').toLowerCase() === String(val).toLowerCase()
    );
    setSelectedLeadManager(found ? found._id : val);
    setIsAssignModalOpen(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      leadType: '',
      subscription: '',
      leadStatus: '',
      customerStatus: '',
      salesperson: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearch('');
    setCurrentPage(1);
  };

  // Filter and Paginate Data
  const filteredCustomers = customers.filter(customer => {
    if (isLeadManager) {
      const myId = String(adminData?.id || adminData?._id || '').toLowerCase().trim();
      const myName = String(adminData?.name || '').toLowerCase().trim();
      const myEmail = String(adminData?.email || '').toLowerCase().trim();
      const lm = String(customer.leadManager || '').toLowerCase().trim();
      const isAssigned = (myId && lm === myId) || 
                         (myName && lm === myName) || 
                         (myEmail && lm === myEmail);
      if (!isAssigned) return false;
    }

    const matchesSearch =
      (customer.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer.contactPhone || '').includes(search);

    const matchesLeadType = !filters.leadType || (customer.leadType || (customer.activePackage ? 'Paid' : 'Unpaid')).toLowerCase() === filters.leadType.toLowerCase();
    
    const matchesSubscription = !filters.subscription || (
      filters.subscription === 'none'
        ? !customer.activePackage
        : (customer.activePackage?.name || '').toLowerCase().includes(filters.subscription.toLowerCase())
    );

    const matchesLeadStatus = !filters.leadStatus || (customer.leadStatus || '').toLowerCase() === filters.leadStatus.toLowerCase();
    const matchesCustomerStatus = !filters.customerStatus || (customer.customerStatus || '').toLowerCase() === filters.customerStatus.toLowerCase();
    const matchesSalesperson = !filters.salesperson || customer.leadManager === filters.salesperson;

    // Date range filter
    let matchesDate = true;
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      const custDate = new Date(customer.createdAt);
      if (custDate < fromDate) matchesDate = false;
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      const custDate = new Date(customer.createdAt);
      if (custDate > toDate) matchesDate = false;
    }

    return matchesSearch && matchesLeadType && matchesSubscription && matchesLeadStatus && matchesCustomerStatus && matchesSalesperson && matchesDate;
  });

  const totalPages = Math.ceil(filteredCustomers.length / parseInt(entries)) || 1;
  const startIndex = (currentPage - 1) * parseInt(entries);
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + parseInt(entries));

  const confirmStatusToggle = (id, currentStatus) => {
    setConfirmConfig({
      title: 'Update Account Status?',
      description: `Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this customer account? This will affect their ability to post jobs.`,
      confirmLabel: currentStatus === 'active' ? 'Deactivate' : 'Activate',
      type: 'info',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          const response = await axios.patch(`${apiUrl}/customers/${id}/status`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            setCustomers(customers.map(c => c._id === id ? { ...c, accountStatus: response.data.accountStatus } : c));
            toast({ title: 'Success', description: 'Status updated successfully.', status: 'success', duration: 2000, position: 'top-right' });
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to update status.', status: 'error', duration: 2000, position: 'top-right' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const confirmDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Customer?',
      description: 'Are you sure you want to delete this customer record? This action cannot be undone and all associated jobs will be affected.',
      confirmLabel: 'Delete Now',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          const response = await axios.delete(`${apiUrl}/customers/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            setCustomers(customers.filter(c => c._id !== id));
            toast({ title: 'Success', description: 'Customer deleted successfully.', status: 'success', duration: 2000, position: 'top-right' });
          }
        } catch (error) {
          toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete customer.', status: 'error', duration: 2000, position: 'top-right' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const getProfileImg = (path) => {
    if (!path || path === 'default-customer.png') return '';
    if (path.startsWith('http')) return path;
    const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${apiBase}/${path.replace(/\\/g, '/')}`;
  };

  const formatActivityDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { day, time };
  };

  const renderLeadStatusBadge = (status) => {
    const s = (status || 'New Lead').toLowerCase();
    let bg = '#eff6ff';
    let color = '#2563eb';
    let border = '#bfdbfe';

    if (s.includes('hired') || s.includes('joined')) {
      bg = '#ecfdf5';
      color = '#059669';
      border = '#a7f3d0';
    } else if (s.includes('demo')) {
      bg = '#fefce8';
      color = '#ca8a04';
      border = '#fef08a';
    } else if (s.includes('shortlist') || s.includes('review')) {
      bg = '#eff6ff';
      color = '#2563eb';
      border = '#bfdbfe';
    } else if (s.includes('select')) {
      bg = '#f5f3ff';
      color = '#7c3aed';
      border = '#ddd6fe';
    } else if (s.includes('reject') || s.includes('cancel')) {
      bg = '#fef2f2';
      color = '#dc2626';
      border = '#fecaca';
    }

    return (
      <Badge
        px="3"
        py="1"
        borderRadius="md"
        fontSize="xs"
        fontWeight="700"
        bg={bg}
        color={color}
        border={`1px solid ${border}`}
        textTransform="capitalize"
      >
        {status || 'New'}
      </Badge>
    );
  };

  const renderSubscriptionBadge = (pkg) => {
    if (!pkg) {
      return (
        <Badge
          px="3"
          py="1"
          borderRadius="md"
          fontSize="xs"
          fontWeight="600"
          bg="#f1f5f9"
          color="#64748b"
          border="1px solid #e2e8f0"
          textTransform="capitalize"
        >
          Basic
        </Badge>
      );
    }

    const name = (pkg.name || '').toLowerCase();
    let bg = '#f5f3ff';
    let color = '#7c3aed';
    let border = '#ddd6fe';

    if (name.includes('standard')) {
      bg = '#fefce8';
      color = '#b45309';
      border = '#fde68a';
    } else if (name.includes('premium') || name.includes('vip')) {
      bg = '#f5f3ff';
      color = '#7c3aed';
      border = '#e9d5ff';
    } else if (name.includes('basic') || name.includes('starter')) {
      bg = '#eff6ff';
      color = '#2563eb';
      border = '#bfdbfe';
    }

    return (
      <Badge
        px="3"
        py="1"
        borderRadius="md"
        fontSize="xs"
        fontWeight="700"
        bg={bg}
        color={color}
        border={`1px solid ${border}`}
        textTransform="capitalize"
      >
        {pkg.name}
      </Badge>
    );
  };

  return (
    <Box pb="10">
      {isLoading ? (
        <PageContentLoader />
      ) : (
        <>
          <PageHeader
            title="Customer/Client Record List"
            breadcrumb="Customer/Client Record List"
            actions={[
              <Button
                key="filter"
                leftIcon={<Filter size={14} />}
                size="sm"
                variant={showFilters ? "solid" : "outline"}
                bg={showFilters ? BRAND : "transparent"}
                color={showFilters ? "white" : "#64748b"}
                borderColor="#dde6f5"
                borderRadius="lg"
                _hover={{ borderColor: BRAND, color: showFilters ? "white" : BRAND }}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>,
              <Button key="add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} onClick={() => navigate('/customers/add')}>Add</Button>,
            ]}
          />

          {/* Filter Card */}
          <Collapse in={showFilters} animateOpacity>
            <Box bg="white" p={{ base: '4', md: '5' }} borderRadius="2xl" border="1px solid #e8edf5" mb="6" boxShadow="0 2px 12px rgba(0,74,173,0.04)">
              <HStack spacing="2" mb="4">
                <Filter size={18} color="#2D2B75" />
                <Text fontSize="sm" fontWeight="800" color="#1e1b4b">
                  Filter Customers
                </Text>
              </HStack>

              <SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 7 }} gap="3" alignItems="flex-end">
                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Lead Type</FormLabel>
                  <Select
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.leadType}
                    onChange={(e) => handleFilterChange('leadType', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </Select>
                </Box>

                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Subscription</FormLabel>
                  <Select
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.subscription}
                    onChange={(e) => handleFilterChange('subscription', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="none">No Subscription</option>
                  </Select>
                </Box>

                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Lead Status</FormLabel>
                  <Select
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.leadStatus}
                    onChange={(e) => handleFilterChange('leadStatus', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Hired">Hired</option>
                    <option value="Demo">Demo</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Job Posted">Job Posted</option>
                  </Select>
                </Box>

                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Customer Status</FormLabel>
                  <Select
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.customerStatus}
                    onChange={(e) => handleFilterChange('customerStatus', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="running">Running</option>
                    <option value="closed">Closed / Inactive</option>
                  </Select>
                </Box>

                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Salesperson</FormLabel>
                  <Select
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.salesperson}
                    onChange={(e) => handleFilterChange('salesperson', e.target.value)}
                  >
                    <option value="">All</option>
                    {leadManagers.map(lm => (
                      <option key={lm._id} value={lm._id}>{lm.name}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Date From</FormLabel>
                  <Input
                    type="date"
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </Box>

                <Box>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">Date To</FormLabel>
                  <Input
                    type="date"
                    size="sm"
                    h="38px"
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </Box>
              </SimpleGrid>

              <Flex justify="flex-end" gap="2.5" mt="4" pt="3" borderTop="1px solid #f1f5f9">
                <Button
                  size="sm"
                  h="36px"
                  px="4"
                  variant="outline"
                  color="#475569"
                  borderColor="#dde6f5"
                  leftIcon={<RotateCcw size={14} />}
                  _hover={{ bg: '#f8fafc' }}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="700"
                  onClick={resetFilters}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  h="36px"
                  px="5"
                  bg="#2D2B75"
                  color="white"
                  leftIcon={<Search size={14} />}
                  _hover={{ bg: '#1e1b4b' }}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="700"
                  onClick={() => setCurrentPage(1)}
                >
                  Apply Filter
                </Button>
              </Flex>
            </Box>
          </Collapse>

          <TableCard>
            <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
              <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
              <Text fontSize="sm" fontWeight="700" color="#1e293b">Customer/Client Record List</Text>
            </Flex>

            <TableControls
              search={search}
              onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
              entries={entries}
              onEntriesChange={(val) => { setEntries(val); setCurrentPage(1); }}
            />

            <Box overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
              <Table variant="simple" size="sm" minW="1050px">
                <Thead {...tableHeadStyle}>
                  <Tr>
                    {['SR.NO.', 'PROFILE IMAGE', 'CUSTOMER/CLIENT DETAILS', 'LEAD TYPE', 'SUBSCRIPTION', 'LEAD STATUS', 'CUSTOMER STATUS', 'LATEST ACTIVITY', 'STATUS', 'ACTION'].map(h => (
                      <Th key={h} {...thStyle} fontSize="11px" letterSpacing="0.5px" whiteSpace="nowrap">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedCustomers.map((row, index) => {
                    const activity = row.latestActivity;
                    const formattedDate = activity?.date ? formatActivityDate(activity.date) : null;
                    const isPaid = (row.leadType || (row.activePackage ? 'Paid' : 'Unpaid')) === 'Paid';

                    return (
                      <Tr key={row._id} {...trHover}>
                        <Td py="4" color="#1e293b" fontSize="sm" fontWeight="700" minW="55px">
                          {startIndex + index + 1}
                        </Td>
                        <Td py="4" minW="70px">
                          <Avatar size="md" src={getProfileImg(row.profilePic)} bg="#e0e7ff" icon={<Avatar size="md" bg="#e0e7ff" color="#94a3b8" />} border="2px solid #f1f5f9" />
                        </Td>
                        <Td py="4" minW="210px">
                          <VStack align="start" spacing="1">
                            <HStack spacing="1">
                              <Text fontSize="xs" color="#64748b" fontWeight="600">Name:</Text>
                              <Text fontSize="xs" color="#0f172a" fontWeight="800">{row.name}</Text>
                            </HStack>
                            <HStack spacing="1">
                              <Text fontSize="xs" color="#64748b" fontWeight="600">Phone:</Text>
                              <Text fontSize="xs" color="#334155" fontWeight="600">{row.contactPhone || 'N/A'}</Text>
                            </HStack>
                            <HStack spacing="1">
                              <Text fontSize="xs" color="#64748b" fontWeight="600">Email:</Text>
                              <Text fontSize="xs" color="#334155">{row.email || 'N/A'}</Text>
                            </HStack>
                          </VStack>
                        </Td>
                        <Td py="4" minW="110px">
                          <Badge
                            px="2.5"
                            py="1"
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                            bg={isPaid ? '#ecfdf5' : '#fef2f2'}
                            color={isPaid ? '#059669' : '#dc2626'}
                            border={`1px solid ${isPaid ? '#a7f3d0' : '#fecaca'}`}
                            display="inline-flex"
                            alignItems="center"
                            gap="1.5"
                          >
                            <Box w="6px" h="6px" borderRadius="full" bg={isPaid ? '#10b981' : '#ef4444'} />
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </Td>
                        <Td py="4" minW="120px">
                          {renderSubscriptionBadge(row.activePackage)}
                        </Td>
                        <Td py="4" minW="110px">
                          {renderLeadStatusBadge(row.leadStatus)}
                        </Td>
                        <Td py="4" minW="110px">
                          <Badge
                            px="3"
                            py="1"
                            borderRadius="md"
                            fontSize="xs"
                            fontWeight="700"
                            bg={row.customerStatus === 'running' ? '#ecfdf5' : '#f1f5f9'}
                            color={row.customerStatus === 'running' ? '#059669' : '#64748b'}
                            border={`1px solid ${row.customerStatus === 'running' ? '#a7f3d0' : '#e2e8f0'}`}
                            textTransform="capitalize"
                          >
                            {row.customerStatus || 'Running'}
                          </Badge>
                        </Td>
                        <Td py="4" minW="180px">
                          {formattedDate ? (
                            <VStack align="start" spacing="0.5">
                              <Text fontSize="xs" fontWeight="700" color="#1e293b">
                                {formattedDate.day}, {formattedDate.time}
                              </Text>
                              <Text fontSize="2xs" color="#64748b" fontWeight="500">
                                {activity?.desc || activity?.title || 'Activity recorded'}
                              </Text>
                            </VStack>
                          ) : (
                            <Text fontSize="xs" color="#94a3b8">No activity yet</Text>
                          )}
                        </Td>
                        <Td py="4" minW="65px">
                          <Switch
                            isChecked={row.accountStatus === 'active'}
                            onChange={() => confirmStatusToggle(row._id, row.accountStatus)}
                            sx={{ '.chakra-switch__track[data-checked]': { bg: '#2D2B75' } }}
                          />
                        </Td>
                        <Td py="4" minW="80px" textAlign="center">
                          <Menu placement="bottom-end">
                            <MenuButton as={IconButton} icon={<MoreVertical size={16} />} size="sm" variant="ghost" color="#64748b" _hover={{ bg: '#f1f5f9', color: BRAND }} borderRadius="lg" aria-label="Options" />
                            <MenuList minW="180px" boxShadow="lg" p="1.5" borderRadius="xl" border="1px solid #e8edf5">
                              {!isLeadManager && (
                                <MenuItem
                                  borderRadius="md"
                                  py="2"
                                  fontSize="sm"
                                  fontWeight="600"
                                  color="#1e293b"
                                  _hover={{ bg: '#f8fafc', color: BRAND }}
                                  icon={<UserCheck size={16} />}
                                  onClick={() => openAssignModal(row)}
                                >
                                  Assign Lead Manager
                                </MenuItem>
                              )}
                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color="#1e293b" _hover={{ bg: '#f8fafc', color: BRAND }}
                                icon={<LayoutDashboard size={16} />}
                                onClick={() => {
                                  navigate(`/customers/dashboard/${row._id}`, { state: { activeTab: 0 } });
                                }}>
                                View Dashboard
                              </MenuItem>
                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color="#7c3aed" _hover={{ bg: '#f5f3ff', color: '#6d28d9' }}
                                icon={<Sparkles size={16} />}
                                onClick={() => {
                                  navigate(`/customers/dashboard/${row._id}`, { state: { activeTab: 1, openCustomPlanModal: true } });
                                }}>
                                Create Custom Package
                              </MenuItem>
                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color="#1e293b" _hover={{ bg: '#f8fafc', color: BRAND }}
                                icon={<Package size={16} />}
                                onClick={() => {
                                  navigate(`/customers/dashboard/${row._id}`, { state: { activeTab: 1 } });
                                }}>
                                View Packages
                              </MenuItem>
                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color="#1e293b" _hover={{ bg: '#f8fafc', color: BRAND }}
                                icon={<CreditCard size={16} />}
                                onClick={() => {
                                  navigate(`/customers/dashboard/${row._id}`, { state: { activeTab: 5 } });
                                }}>
                                Transactions
                              </MenuItem>
                              
                              <MenuDivider my="1.5" borderColor="#f1f5f9" />
                              
                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color={row.accountStatus === 'active' ? '#ef4444' : '#10b981'} _hover={{ bg: row.accountStatus === 'active' ? '#fef2f2' : '#ecfdf5' }}
                                icon={row.accountStatus === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                onClick={() => confirmStatusToggle(row._id, row.accountStatus)}>
                                {row.accountStatus === 'active' ? 'Block Client' : 'Unblock Client'}
                              </MenuItem>
                              
                              <MenuDivider my="1.5" borderColor="#f1f5f9" />

                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color="#1e293b" _hover={{ bg: '#f8fafc', color: BRAND }}
                                icon={<Edit3 size={16} />}
                                onClick={() => navigate(`/customers/edit/${row._id}`)}>
                                Edit Customer
                              </MenuItem>
                              <MenuItem borderRadius="md" py="2" fontSize="sm" fontWeight="600" color="#ef4444" _hover={{ bg: '#fef2f2' }}
                                icon={<Trash2 size={16} />}
                                onClick={() => confirmDelete(row._id)}>
                                Delete Customer
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
            <TableFooter
              showing={`${filteredCustomers.length > 0 ? startIndex + 1 : 0} to ${Math.min(startIndex + parseInt(entries), filteredCustomers.length)}`}
              total={filteredCustomers.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => { if (p > 0 && p <= totalPages) setCurrentPage(p); }}
            />
          </TableCard>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel={confirmConfig.confirmLabel}
        type={confirmConfig.type}
        confirmColor={confirmConfig.type === 'danger' ? ACCENT : BRAND}
      />

      {/* Assign Lead Manager Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="bold" color="#0B1A30" pb="2">
            Assign Lead Manager
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="4">
            <Text fontSize="xs" color="#64748b" mb="3">
              Assign a Lead Manager to <strong>{selectedCustomer?.name}</strong>. Only this manager and Super Admin will have access to this customer.
            </Text>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700" color="#475569">Select Manager</FormLabel>
              <Select
                size="sm"
                h="40px"
                borderRadius="lg"
                bg="#f8faff"
                border="1.5px solid #dde6f5"
                value={selectedLeadManager}
                onChange={(e) => setSelectedLeadManager(e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {leadManagers.map(lm => (
                  <option key={lm._id} value={lm._id}>
                    {lm.name} ({lm.role?.name || 'Staff'})
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter pt="2">
            <Button size="sm" variant="ghost" mr="3" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              bg={BRAND}
              color="white"
              _hover={{ bg: '#003d91' }}
              isLoading={isAssigning}
              onClick={handleAssignLeadManager}
            >
              Save Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
        </>
      )}
    </Box>
  );
};

export default CustomerList;
