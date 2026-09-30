import { useState, useEffect, useRef } from 'react';
import {
  Box, HStack, Text, VStack, Button, Badge, useToast, useDisclosure,
  Flex, FormLabel, Select, Table, Thead, Tbody, Tr, Th, Td,
  Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  SimpleGrid, FormControl, Icon, IconButton, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import {
  Zap, Clock, UtensilsCrossed, Filter, RotateCcw, Search, Eye, Calendar,
  UserPlus, MoreVertical, CheckCircle2, Edit3, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, PageFooter, BRAND, ACCENT, TableCard, TableControls
} from '../components/ui';
import PageContentLoader from '../components/PageContentLoader';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const darkThStyle = {
  color: 'white',
  bg: '#0f2343',
  fontSize: 'xs',
  fontWeight: '800',
  py: '4',
  px: '4',
  border: '1px solid #1a365d',
  textAlign: 'center',
  textTransform: 'none',
  letterSpacing: '0.5px'
};

const customTdStyle = {
  py: '4',
  px: '4',
  border: '1px solid #edf2f7',
  fontSize: 'xs',
  fontWeight: '600',
  color: '#2d3748',
  textAlign: 'center',
  verticalAlign: 'middle'
};

const QuickBookingsDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [leadManagers, setLeadManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Change Status Modal State
  const [selectedJobForStatus, setSelectedJobForStatus] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState('New');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();

  // Assign Lead Manager Modal State
  const [selectedJobForAssign, setSelectedJobForAssign] = useState(null);
  const [selectedLeadManager, setSelectedLeadManager] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();

  // Delete Dialog State
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelDeleteRef = useRef();

  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const roleName = (adminData?.role?.name || '').toLowerCase();
  const isSuperAdmin =
    adminData?.email?.toLowerCase() === 'zomocookadmin@gmail.com' ||
    roleName === 'super admin' ||
    (adminData?.type === 'admin' && !adminData?.role);
  const isLeadManager = !isSuperAdmin && (adminData?.type === 'user' || (adminData?.type === 'admin' && !!adminData?.role && roleName !== 'super admin'));

  // Search & Filters
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    bookingType: '', // 'daily' or 'party'
    city: '',
    status: '',
    leadManager: ''
  });

  const isPartyBooking = (job) => {
    if (!job) return false;
    return (
      job.jobCategory === 'party' ||
      job.bookingType === 'party' ||
      !!job.partyRequirement ||
      (job.title || '').toLowerCase().includes('party') ||
      (job.overview || '').toLowerCase().includes('party')
    );
  };

  const isDailyBooking = (job) => {
    if (!job) return false;
    if (isPartyBooking(job)) return false;
    return job.jobCategory === 'daily' || job.bookingType === 'daily' || (job.staffRequirements && job.staffRequirements.length > 0);
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs?_t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        let allJobs = response.data.jobs || [];
        let quickBookings = allJobs.filter(j => isDailyBooking(j) || isPartyBooking(j));
        quickBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(quickBookings);
      }
    } catch (error) {
      console.error('Error fetching quick bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadManagers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setLeadManagers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching lead managers:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchLeadManagers();
  }, []);

  const getCustomerName = (job) => {
    if (!job) return 'N/A';
    if (job.customer && typeof job.customer === 'object' && job.customer.name) return job.customer.name;
    if (job.createdBy && typeof job.createdBy === 'object' && job.createdBy.name) return job.createdBy.name;
    return 'N/A';
  };

  const getCustomerPhone = (job) => {
    if (!job) return 'N/A';
    if (job.customer && typeof job.customer === 'object') return job.customer.phone || job.customer.contactPhone || 'N/A';
    if (job.createdBy && typeof job.createdBy === 'object') return job.createdBy.phone || 'N/A';
    return 'N/A';
  };

  // Mark as Paid / Toggle Payment via Backend API
  const handleTogglePaymentStatus = async (job) => {
    try {
      const newStatus = job.paymentStatus === 'paid' ? 'pending' : 'paid';
      const response = await axios.put(`${API_BASE_URL}/jobs/${job._id}`, {
        paymentStatus: newStatus
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Payment Status Updated',
          description: `Booking ${job.jobCode || ''} marked as ${newStatus.toUpperCase()}.`,
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
        fetchJobs();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update payment status.',
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    }
  };

  // Change Status via Backend API
  const handleStatusSubmit = async () => {
    if (!selectedJobForStatus) return;
    setIsUpdatingStatus(true);
    try {
      const response = await axios.patch(`${API_BASE_URL}/jobs/${selectedJobForStatus._id}/status-string`, {
        status: newStatusValue
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Status Updated',
          description: `Status changed to ${newStatusValue} successfully.`,
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
        onStatusClose();
        fetchJobs();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status.',
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Assign Lead Manager via Backend API
  const handleAssignLeadManagerSubmit = async () => {
    if (!selectedJobForAssign) return;
    setIsAssigning(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${selectedJobForAssign._id}`, {
        leadManager: selectedLeadManager,
        ...(selectedLeadManager && { status: 'Assigned' })
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Lead Manager Assigned',
          description: `Assigned to ${selectedLeadManager || 'Unassigned'} successfully.`,
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
        onAssignClose();
        fetchJobs();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign Lead Manager.',
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Delete Job via Backend API
  const handleDeleteJobSubmit = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/jobs/${jobToDelete._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Booking Deleted',
          description: 'Quick Booking record deleted successfully.',
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
        onDeleteClose();
        fetchJobs();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete record.',
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (isLeadManager) {
      const cleanStr = (s) => String(s || '').toLowerCase().replace(/[\s_-]/g, '');
      const lm = cleanStr(job.leadManager);
      const meName = cleanStr(adminData.name);
      const meId = cleanStr(adminData._id);
      const meEmail = cleanStr(adminData.email);
      if (lm !== meName && lm !== meId && lm !== meEmail) return false;
    }

    if (filters.bookingType === 'daily' && !isDailyBooking(job)) return false;
    if (filters.bookingType === 'party' && !isPartyBooking(job)) return false;

    const matchesSearch =
      (job.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.jobCode || '').toLowerCase().includes(search.toLowerCase()) ||
      getCustomerName(job).toLowerCase().includes(search.toLowerCase());

    const matchesCity = !filters.city || (job.city || '').toLowerCase() === filters.city.toLowerCase();
    const matchesStatus = !filters.status || (job.status || '').toLowerCase() === filters.status.toLowerCase();
    const matchesLeadManager = !filters.leadManager || job.leadManager === filters.leadManager;

    return matchesSearch && matchesCity && matchesStatus && matchesLeadManager;
  });

  const totalDaily = jobs.filter(isDailyBooking).length;
  const totalParty = jobs.filter(isPartyBooking).length;
  const totalNew = jobs.filter(j => (j.status || 'New').toLowerCase() === 'new').length;

  const totalPages = Math.ceil(filteredJobs.length / parseInt(entries));
  const startIndex = (currentPage - 1) * parseInt(entries);
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + parseInt(entries));

  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Box pb="10">
      <Flex align="center" justify="space-between" mb="6" wrap="wrap" gap="4">
        <VStack align="start" spacing="1">
          <HStack spacing="2">
            <Icon as={Zap} color="#0f62fe" boxSize={6} />
            <Text fontSize="2xl" fontWeight="800" color="#0B1A30">Quick Bookings & Events Dashboard</Text>
          </HStack>
          <Text fontSize="sm" color="#64748b">View and manage all Daily Basis Staff and Chef for Party booking requests</Text>
        </VStack>
      </Flex>

      {/* Overview Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="4" mb="6">
        <Box bg="white" p="4" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 10px rgba(0,74,173,0.03)">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#64748b">TOTAL BOOKINGS</Text>
              <Text fontSize="2xl" fontWeight="800" color="#0B1A30">{jobs.length}</Text>
            </Box>
            <Flex w="42px" h="42px" borderRadius="lg" bg="#eff6ff" align="center" justify="center">
              <Icon as={Zap} color="#0f62fe" boxSize={5} />
            </Flex>
          </HStack>
        </Box>
        <Box bg="white" p="4" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 10px rgba(0,74,173,0.03)">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#64748b">DAILY BASIS JOBS</Text>
              <Text fontSize="2xl" fontWeight="800" color="#1d4ed8">{totalDaily}</Text>
            </Box>
            <Flex w="42px" h="42px" borderRadius="lg" bg="#eff6ff" align="center" justify="center">
              <Icon as={Clock} color="#1d4ed8" boxSize={5} />
            </Flex>
          </HStack>
        </Box>
        <Box bg="white" p="4" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 10px rgba(0,74,173,0.03)">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#64748b">CHEF FOR PARTY</Text>
              <Text fontSize="2xl" fontWeight="800" color="#c2410c">{totalParty}</Text>
            </Box>
            <Flex w="42px" h="42px" borderRadius="lg" bg="#fff7ed" align="center" justify="center">
              <Icon as={UtensilsCrossed} color="#c2410c" boxSize={5} />
            </Flex>
          </HStack>
        </Box>
        <Box bg="white" p="4" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 10px rgba(0,74,173,0.03)">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#64748b">NEW / PENDING</Text>
              <Text fontSize="2xl" fontWeight="800" color="#059669">{totalNew}</Text>
            </Box>
            <Flex w="42px" h="42px" borderRadius="lg" bg="#f0fdf4" align="center" justify="center">
              <Icon as={Calendar} color="#059669" boxSize={5} />
            </Flex>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Filter Options */}
      <Box bg="white" p="5" borderRadius="xl" border="1px solid #e8edf5" mb="6" boxShadow="0 2px 12px rgba(0,74,173,0.03)">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing="4">
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569">Booking Type</FormLabel>
            <Select size="sm" h="38px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.bookingType} onChange={(e) => setFilters({...filters, bookingType: e.target.value})}>
              <option value="">All Booking Types</option>
              <option value="daily">Daily Basis Jobs</option>
              <option value="party">Chef for Party</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569">Status</FormLabel>
            <Select size="sm" h="38px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Active">Active</option>
              <option value="Hold">Hold</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569">City</FormLabel>
            <Select size="sm" h="38px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}>
              <option value="">All Cities</option>
              {Array.from(new Set(jobs.map(j => j.city))).filter(Boolean).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569">Lead Manager</FormLabel>
            <Select size="sm" h="38px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.leadManager} onChange={(e) => setFilters({...filters, leadManager: e.target.value})}>
              <option value="">All Managers</option>
              {leadManagers.map(lm => (
                <option key={lm._id} value={lm.name}>{lm.name}</option>
              ))}
            </Select>
          </FormControl>
          <Flex align="flex-end" gap="2">
            <Button size="sm" h="38px" flex="1" variant="outline" onClick={() => { setFilters({ bookingType: '', city: '', status: '', leadManager: '' }); setSearch(''); }}>
              Reset
            </Button>
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Table Section */}
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between" flexWrap="wrap" gap="4">
          <HStack><Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="2" /><Text fontSize="sm" fontWeight="700" color="#1e293b">Quick Booking Records ({filteredJobs.length})</Text></HStack>
          <TableControls search={search} onSearch={setSearch} entries={entries} onEntriesChange={setEntries} searchPlaceholder="Search by job code, customer name, city..." />
        </Flex>

        <Box overflowX="auto">
          {isLoading ? (
            <PageContentLoader />
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th {...darkThStyle}>Sr.No.</Th>
                  <Th {...darkThStyle}>Booking Code & Date</Th>
                  <Th {...darkThStyle}>Booking Category</Th>
                  <Th {...darkThStyle}>Customer Details</Th>
                  <Th {...darkThStyle}>Requirement / Event</Th>
                  <Th {...darkThStyle}>Location / Venue</Th>
                  <Th {...darkThStyle}>Pricing / Advance</Th>
                  <Th {...darkThStyle}>Lead Manager</Th>
                  <Th {...darkThStyle}>Status</Th>
                  <Th {...darkThStyle}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedJobs.map((job, idx) => {
                  const party = isPartyBooking(job);
                  const isPaid = job.paymentStatus === 'paid';
                  const currentStatus = (job.status || 'New').toUpperCase();

                  let statusBg = '#e0f2fe';
                  let statusColor = '#0369a1';
                  if (currentStatus === 'ACTIVE' || currentStatus === 'COMPLETED') {
                    statusBg = '#dcfce7';
                    statusColor = '#15803d';
                  } else if (currentStatus === 'HOLD') {
                    statusBg = '#e0f2fe';
                    statusColor = '#0284c7';
                  } else if (currentStatus === 'CANCELLED') {
                    statusBg = '#fee2e2';
                    statusColor = '#b91c1c';
                  } else if (currentStatus === 'ASSIGNED') {
                    statusBg = '#fef3c7';
                    statusColor = '#b45309';
                  }

                  return (
                    <Tr key={job._id} _hover={{ bg: '#fbfcfd' }}>
                      <Td {...customTdStyle}>{startIndex + idx + 1}</Td>
                      <Td {...customTdStyle}>
                        <VStack align="center" spacing="0.5">
                          <Badge bg={party ? "#fff7ed" : "#eff6ff"} color={party ? "#c2410c" : "#1d4ed8"} px="2" py="0.5" borderRadius="md" fontSize="11px" fontWeight="700">
                            {job.jobCode || 'N/A'}
                          </Badge>
                          <Text fontSize="10px" color="#64748b">{formatDate(job.createdAt)}</Text>
                        </VStack>
                      </Td>
                      <Td {...customTdStyle}>
                        <Badge px="2.5" py="1" borderRadius="full" fontSize="10px" fontWeight="800" bg={party ? "#fff7ed" : "#eff6ff"} color={party ? "#c2410c" : "#1d4ed8"} border="1px solid" borderColor={party ? "#ffedd5" : "#dbeafe"}>
                          {party ? '🎉 Chef for Party' : '⏱️ Daily Basis'}
                        </Badge>
                      </Td>
                      <Td {...customTdStyle}>
                        <VStack align="center" spacing="0.5">
                          <Text fontWeight="700" color="#1e293b">{getCustomerName(job)}</Text>
                          <Text fontSize="11px" color="#64748b">{getCustomerPhone(job)}</Text>
                        </VStack>
                      </Td>
                      <Td {...customTdStyle}>
                        {party ? (
                          <VStack align="center" spacing="0.5">
                            <Badge bg="#fef3c7" color="#92400e" px="2" py="0.5" fontSize="10px">
                              {job.event || job.jobPosition || 'Party Event'}
                            </Badge>
                            <Text fontSize="11px">{job.noOfGuests ? `${job.noOfGuests} Guests` : 'N/A'}</Text>
                          </VStack>
                        ) : (
                          <VStack align="center" spacing="1">
                            {job.staffRequirements && job.staffRequirements.length > 0 ? (
                              job.staffRequirements.map((s, i) => (
                                <Badge key={i} bg="#f0fdf4" color="#166534" px="2" py="0.5" fontSize="10px">
                                  {s.role || 'Staff'} x {s.count || 1} ({s.days || 1} Days)
                                </Badge>
                              ))
                            ) : (
                              <Text fontSize="11px">{job.title || 'Daily Staff'}</Text>
                            )}
                          </VStack>
                        )}
                      </Td>
                      <Td {...customTdStyle}>
                        <VStack align="center" spacing="0.5">
                          <Text fontWeight="600">{job.city}, {job.state}</Text>
                          <Text fontSize="10px" color="#64748b">{job.address || job.outletName || job.basicFacility || 'N/A'}</Text>
                        </VStack>
                      </Td>
                      <Td {...customTdStyle}>
                        <VStack align="center" spacing="0.5">
                          <Text fontWeight="700" color="#059669">₹{job.advanceAmount || job.jobPostFee || (job.pricing ? job.pricing.totalAmount : 0)}</Text>
                          <Badge bg={isPaid ? '#dcfce7' : '#fef3c7'} color={isPaid ? '#15803d' : '#b45309'} fontSize="9px">
                            {isPaid ? 'PAID' : 'PENDING'}
                          </Badge>
                        </VStack>
                      </Td>
                      <Td {...customTdStyle}>
                        <Badge px="2" py="1" borderRadius="full" fontSize="10px" bg={job.leadManager ? '#eff6ff' : '#f8fafc'} color={job.leadManager ? '#1d4ed8' : '#94a3b8'}>
                          {job.leadManager || 'UNASSIGNED'}
                        </Badge>
                      </Td>
                      <Td {...customTdStyle}>
                        <Badge px="2.5" py="1" borderRadius="md" bg={statusBg} color={statusColor} fontSize="11px" fontWeight="700">
                          {job.status || 'NEW'}
                        </Badge>
                      </Td>

                      {/* 3-Dots Action Menu Dropdown */}
                      <Td {...customTdStyle}>
                        <Menu isLazy placement="bottom-end">
                          <MenuButton
                            as={IconButton}
                            icon={<MoreVertical size={16} />}
                            variant="ghost"
                            size="sm"
                            color="#0f62fe"
                            bg="#f0f6ff"
                            _hover={{ bg: '#dbeafe', color: '#1d4ed8' }}
                            _active={{ bg: '#bfdbfe' }}
                            borderRadius="lg"
                            aria-label="Actions"
                          />
                          <MenuList
                            borderRadius="xl"
                            border="1px solid #e2e8f0"
                            boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                            p="1.5"
                            minW="190px"
                            zIndex="10"
                          >
                            {/* 1. View Order -> Dedicated Full Page */}
                            <MenuItem
                              icon={<Eye size={15} color="#0f62fe" />}
                              fontSize="xs"
                              fontWeight="600"
                              color="#1e293b"
                              borderRadius="md"
                              py="2"
                              _hover={{ bg: '#eff6ff', color: '#0f62fe' }}
                              onClick={() => navigate(`/jobs/view/${job._id}`)}
                            >
                              View Order
                            </MenuItem>

                            {/* 2. Mark as Paid -> Backend API update */}
                            <MenuItem
                              icon={<CheckCircle2 size={15} color="#16a34a" />}
                              fontSize="xs"
                              fontWeight="600"
                              color="#1e293b"
                              borderRadius="md"
                              py="2"
                              _hover={{ bg: '#f0fdf4', color: '#16a34a' }}
                              onClick={() => handleTogglePaymentStatus(job)}
                            >
                              {isPaid ? 'Mark as Pending' : 'Mark as Paid'}
                            </MenuItem>

                            {/* 3. Change Status -> Backend API update */}
                            <MenuItem
                              icon={<RotateCcw size={15} color="#ea580c" />}
                              fontSize="xs"
                              fontWeight="600"
                              color="#1e293b"
                              borderRadius="md"
                              py="2"
                              _hover={{ bg: '#fff7ed', color: '#ea580c' }}
                              onClick={() => {
                                setSelectedJobForStatus(job);
                                setNewStatusValue(job.status || 'New');
                                onStatusOpen();
                              }}
                            >
                              Change Status
                            </MenuItem>

                            {/* 4. Assign to Leads Manager -> Backend API update */}
                            <MenuItem
                              icon={<UserPlus size={15} color="#2563eb" />}
                              fontSize="xs"
                              fontWeight="600"
                              color="#1e293b"
                              borderRadius="md"
                              py="2"
                              _hover={{ bg: '#eff6ff', color: '#2563eb' }}
                              onClick={() => {
                                setSelectedJobForAssign(job);
                                setSelectedLeadManager(job.leadManager || '');
                                onAssignOpen();
                              }}
                            >
                              Assign to Leads Manager
                            </MenuItem>

                            {/* 5. Edit Order -> Dedicated Full Page */}
                            <MenuItem
                              icon={<Edit3 size={15} color="#7c3aed" />}
                              fontSize="xs"
                              fontWeight="600"
                              color="#1e293b"
                              borderRadius="md"
                              py="2"
                              _hover={{ bg: '#f5f3ff', color: '#7c3aed' }}
                              onClick={() => navigate(`/jobs/edit/${job._id}`)}
                            >
                              Edit Order
                            </MenuItem>

                            {/* 6. Delete -> Backend API update */}
                            <MenuItem
                              icon={<Trash2 size={15} color="#dc2626" />}
                              fontSize="xs"
                              fontWeight="600"
                              color="#dc2626"
                              borderRadius="md"
                              py="2"
                              _hover={{ bg: '#fef2f2', color: '#dc2626' }}
                              onClick={() => {
                                setJobToDelete(job);
                                onDeleteOpen();
                              }}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
                {paginatedJobs.length === 0 && (
                  <Tr><Td colSpan={10} textAlign="center" py="8" color="#94a3b8">No Quick Booking records found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </TableCard>

      {/* ── Change Status Modal ── */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="bold">
            <HStack spacing="2">
              <Icon as={RotateCcw} color="#ea580c" />
              <Text>Change Order Status</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="4">
            {selectedJobForStatus && (
              <VStack spacing="4" align="stretch">
                <Box bg="#f8fafc" p="3" borderRadius="lg" border="1px solid #e2e8f0">
                  <Text fontSize="xs" color="#64748b">Booking Code: <b>{selectedJobForStatus.jobCode || 'N/A'}</b></Text>
                  <Text fontSize="xs" color="#64748b">Customer: <b>{getCustomerName(selectedJobForStatus)}</b></Text>
                  <Text fontSize="xs" color="#64748b">Current Status: <Badge colorScheme="blue">{selectedJobForStatus.status || 'New'}</Badge></Text>
                </Box>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569">Select New Status</FormLabel>
                  <Select
                    value={newStatusValue}
                    onChange={(e) => setNewStatusValue(e.target.value)}
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Active">Active</option>
                    <option value="Hold">Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" size="sm" onClick={onStatusClose}>Cancel</Button>
            <Button colorScheme="orange" size="sm" isLoading={isUpdatingStatus} onClick={handleStatusSubmit}>
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Assign to Leads Manager Modal ── */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="bold">
            <HStack spacing="2">
              <Icon as={UserPlus} color="#2563eb" />
              <Text>Assign to Leads Manager</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="4">
            {selectedJobForAssign && (
              <VStack spacing="4" align="stretch">
                <Box bg="#eff6ff" p="3" borderRadius="lg" border="1px solid #dbeafe">
                  <Text fontSize="xs" color="#1e293b">Booking Code: <b>{selectedJobForAssign.jobCode || 'N/A'}</b></Text>
                  <Text fontSize="xs" color="#1e293b">Customer: <b>{getCustomerName(selectedJobForAssign)}</b></Text>
                  <Text fontSize="xs" color="#1e293b">Current Manager: <b>{selectedJobForAssign.leadManager || 'Unassigned'}</b></Text>
                </Box>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569">Choose Leads Manager</FormLabel>
                  <Select
                    placeholder="-- Select Lead Manager --"
                    value={selectedLeadManager}
                    onChange={(e) => setSelectedLeadManager(e.target.value)}
                    borderRadius="lg"
                    bg="#f8faff"
                    border="1.5px solid #dde6f5"
                  >
                    {leadManagers.map(lm => (
                      <option key={lm._id} value={lm.name}>{lm.name} ({lm.email || 'Manager'})</option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" size="sm" onClick={onAssignClose}>Cancel</Button>
            <Button colorScheme="blue" size="sm" isLoading={isAssigning} onClick={handleAssignLeadManagerSubmit}>
              Assign Manager
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="md" fontWeight="bold">
              Delete Quick Booking Record?
            </AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="#64748b">
              Are you sure you want to delete booking <b>{jobToDelete?.jobCode || ''}</b> ({getCustomerName(jobToDelete)})? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap="2">
              <Button ref={cancelDeleteRef} size="sm" onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" size="sm" isLoading={isDeleting} onClick={handleDeleteJobSubmit}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <PageFooter />
    </Box>
  );
};

export default QuickBookingsDashboard;
