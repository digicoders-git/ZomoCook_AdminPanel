import { useState, useEffect } from 'react';
import {
  Box, HStack, Text, VStack, Button, Switch, IconButton,
  useToast, useDisclosure, Collapse, Flex, Badge,
  FormLabel, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
  Menu, MenuButton, MenuList, MenuItem, Link as ChakraLink,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton
} from '@chakra-ui/react';
import { Plus, Filter, Edit3, RotateCcw, Search, Eye, ChevronDown, Users, Trash2, Calendar, UserPlus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, PageFooter, BRAND, ACCENT, TableCard, TableControls,
  ConfirmationModal
} from '../components/ui';
import PageContentLoader from '../components/PageContentLoader';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import JobApplicantsModal from './JobApplicantsModal';

const darkThStyle = {
  color: 'white',
  bg: '#0f2343', // Dark navy blue header from Picture 1
  fontSize: 'xs',
  fontWeight: '800',
  py: '4',
  px: '4',
  border: '1px solid #1a365d',
  textAlign: 'center',
  textTransform: 'none', // Display exact casing
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

const JobList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isApplicantsOpen, onOpen: onApplicantsOpen, onClose: onApplicantsClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignJob, setAssignJob] = useState(null);
  const [selectedLeadManager, setSelectedLeadManager] = useState('');
  const [leadManagers, setLeadManagers] = useState([]);

  const token = localStorage.getItem('adminToken');

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
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    status: '',
    startDate: '',
    endDate: '',
    leadManager: ''
  });

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const appResponse = await axios.get(`${API_BASE_URL}/candidates/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        let fetchedJobs = response.data.jobs || [];
        let fetchedApps = [];
        if (appResponse.data.success && Array.isArray(appResponse.data.applications)) {
          fetchedApps = appResponse.data.applications;
        }

        // Compute counts on client-side dynamically so it works with Render production backend
        const enrichedJobs = fetchedJobs.map(job => {
          const jobApps = fetchedApps.filter(app => (app.jobId === job._id || (app.job && app.job._id === job._id)));
          const appliedCount = jobApps.length;
          const assignedCount = jobApps.filter(app => app.status === 'Applied').length;
          return {
            ...job,
            appliedCount,
            assignedCount
          };
        });

        setJobs(enrichedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadManagers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      city: '',
      status: '',
      startDate: '',
      endDate: '',
      leadManager: ''
    });
    setSearch('');
    setShowCustomDate(false);
    setCurrentPage(1);
    toast({
      title: 'Filters Reset',
      status: 'info',
      duration: 1500,
      position: 'top-right'
    });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    toast({
      title: 'Filters Applied',
      status: 'success',
      duration: 1500,
      position: 'top-right'
    });
  };

  const confirmDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Job Record?',
      description: 'Are you sure you want to delete this job? This action cannot be undone and all associated data will be lost.',
      confirmLabel: 'Delete Job',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`${API_BASE_URL}/jobs/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            setJobs(prev => prev.filter(j => j._id !== id));
            toast({ title: 'Deleted', description: 'Job record removed.', status: 'success', duration: 3000, position: 'top-right' });
          }
        } catch (error) {
          toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete job.', status: 'error', duration: 3000, position: 'top-right' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const confirmToggleStatus = (id, currentStatus) => {
    setConfirmConfig({
      title: 'Update Job Status?',
      description: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this job? This will affect its visibility to candidates.`,
      confirmLabel: currentStatus ? 'Deactivate' : 'Activate',
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await axios.patch(`${API_BASE_URL}/jobs/${id}/status`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            toast({ title: 'Success', description: response.data.message, status: 'success', duration: 2000, position: 'top-right' });
            fetchJobs();
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Status update failed.', status: 'error', duration: 3000, position: 'top-right' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const getStatusColors = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'open') return { bg: '#e6fcf5', color: '#0ca678' }; // Green
    if (s === 'new') return { bg: '#e7f5ff', color: '#1c7ed6' }; // Blue
    if (s === 'urgent') return { bg: '#fff5f5', color: '#e03131' }; // Red
    if (s === 'in progress' || s === 'inprogress') return { bg: '#e7f5ff', color: '#1c7ed6' }; // Blue
    if (s === 'hold' || s === 'onhold') return { bg: '#fff4e6', color: '#f76707' }; // Orange
    return { bg: '#f1f3f5', color: '#868e96' }; // Grey (Inactive, Cancelled, Expired)
  };

  const formatCategory = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c === 'home') return 'Home Cook';
    if (c === 'hotel') return 'Hotel';
    if (c === 'daily') return 'Daily Basis';
    return cat || 'N/A';
  };

  const formatSalary = (row) => {
    if (row.jobCategory === 'daily') {
      return row.package ? `₹${row.package}/Day` : 'N/A';
    }
    return row.salaryRange ? `₹${row.salaryRange}` : 'N/A';
  };

  const getUniqueCities = () => {
    const list = Array.from(new Set(jobs.map(j => j.city).filter(Boolean)));
    const defaults = ['Lucknow', 'Kanpur', 'Barabanki', 'Patna'];
    return Array.from(new Set([...list, ...defaults]));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter and Paginate Data
  // Assign/change lead manager API helper
  const handleAssignLeadManager = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${assignJob._id}`, {
        leadManager: selectedLeadManager
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        toast({ title: 'Success', description: 'Lead Manager assigned successfully.', status: 'success', duration: 3000, position: 'top-right' });
        fetchJobs();
        onAssignClose();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to assign Lead Manager.', status: 'error', duration: 3000, position: 'top-right' });
    }
  };

  // Resend notification API helper
  const resendNotification = async (jobId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/resend-notification`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        toast({
          title: 'Notification Resent',
          description: response.data.message || 'Notification resent successfully to all cooks.',
          status: 'success',
          duration: 3000,
          position: 'top-right'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend notification.',
        status: 'error',
        duration: 3000,
        position: 'top-right'
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.city.toLowerCase().includes(search.toLowerCase()) ||
      (job.jobCode || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !filters.category || job.jobCategory === filters.category;
    const matchesCity = !filters.city || job.city.toLowerCase() === filters.city.toLowerCase();
    const matchesStatus = !filters.status || (job.status || '').toLowerCase() === filters.status.toLowerCase();
    const matchesLeadManager = !filters.leadManager || job.leadManager === filters.leadManager;

    // Date matching logic
    let matchesDate = true;
    const jobTime = new Date(job.createdAt).getTime();

    if (showCustomDate) {
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && jobTime >= start.getTime();
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && jobTime <= end.getTime();
      }
    } else if (filters.datePreset) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      if (filters.datePreset === 'today') {
        matchesDate = jobTime >= todayStart;
      } else if (filters.datePreset === 'yesterday') {
        const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
        matchesDate = jobTime >= yesterdayStart && jobTime < todayStart;
      } else if (filters.datePreset === 'weekly') {
        const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
        matchesDate = jobTime >= sevenDaysAgo;
      } else if (filters.datePreset === 'monthly') {
        const thirtyDaysAgo = todayStart - 30 * 24 * 60 * 60 * 1000;
        matchesDate = jobTime >= thirtyDaysAgo;
      }
    }

    return matchesSearch && matchesCategory && matchesCity && matchesStatus && matchesDate && matchesLeadManager;
  });

  const totalPages = Math.ceil(filteredJobs.length / parseInt(entries));
  const startIndex = (currentPage - 1) * parseInt(entries);
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + parseInt(entries));

  return (
    <Box pb="10">
      {isLoading ? (
        <PageContentLoader />
      ) : (
        <>
          {/* Title Header Section */}
          <Flex align="center" justify="space-between" mb="6" wrap="wrap" gap="4">
        <VStack align="start" spacing="1">
          <Text fontSize="2xl" fontWeight="800" color="#0B1A30">Job List</Text>
          <Text fontSize="sm" color="#64748b">Manage all your jobs and leads</Text>
        </VStack>
        <Button
          leftIcon={<Plus size={16} />}
          size="md"
          bg="#0f62fe"
          color="white"
          borderRadius="lg"
          px="6"
          _hover={{ bg: '#0043ce' }}
          onClick={() => navigate('/jobs/add')}
        >
          Add Job
        </Button>
      </Flex>

      {/* Filters Card - Always Visible */}
      <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" mb="6" boxShadow="0 2px 12px rgba(0,74,173,0.03)">
        <Text fontSize="md" fontWeight="800" color="#0B1A30" mb="4">Filters</Text>
        <Flex align="flex-end" gap="4" wrap="wrap" justify="space-between">
          <Box flex="1" minW="180px">
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Category</FormLabel>
            <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <option value="">All Category</option>
              <option value="hotel">Hotel</option>
              <option value="home">Home Cook</option>
              <option value="daily">Daily Basis</option>
            </Select>
          </Box>
          <Box flex="1" minW="180px">
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">City</FormLabel>
            <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
              <option value="">All City</option>
              {getUniqueCities().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Select>
          </Box>
          <Box flex="1" minW="180px">
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Status</FormLabel>
            <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="">All Status</option>
              {['Urgent', 'New', 'Active', 'Inactive', 'Cancelled', 'Expired'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Box>
          <Box flex="1" minW="180px">
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Lead Manager</FormLabel>
            <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.leadManager} onChange={(e) => handleFilterChange('leadManager', e.target.value)}>
              <option value="">All Lead Manager</option>
              {leadManagers.map(lm => (
                <option key={lm._id} value={lm.name}>{lm.name}</option>
              ))}
            </Select>
          </Box>
          <Box flex="1.5" minW="240px">
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Date Range</FormLabel>
            {showCustomDate ? (
              <HStack spacing="2" w="full">
                <Input type="date" size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
                <Text fontSize="xs" color="#94a3b8">to</Text>
                <Input type="date" size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
              </HStack>
            ) : (
              <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.datePreset} onChange={(e) => handleFilterChange('datePreset', e.target.value)}>
                <option value="">Select Range</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
              </Select>
            )}
            <ChakraLink fontSize="11px" fontWeight="700" color="#0f62fe" mt="1.5" display="inline-block" onClick={() => setShowCustomDate(!showCustomDate)}>
              {showCustomDate ? "Use Preset Range" : "Custom Date"}
            </ChakraLink>
          </Box>
          <HStack spacing="2" minW="180px" justify="flex-end" mb={showCustomDate ? "5" : "0"}>
            <Button h="40px" px="6" variant="outline" borderColor="#dde6f5" color="#475569" _hover={{ bg: '#f1f5f9' }} borderRadius="lg" fontSize="xs" fontWeight="700" onClick={resetFilters}>Reset</Button>
            <Button h="40px" px="6" bg="#0f62fe" color="white" _hover={{ bg: '#0043ce' }} borderRadius="lg" fontSize="xs" fontWeight="700" onClick={handleApplyFilters}>Apply</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Table Section */}
      <TableCard>
        <TableControls
          search={search}
          onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
          entries={entries}
          onEntriesChange={(val) => { setEntries(val); setCurrentPage(1); }}
        />

        <Box 
          overflowX="auto"
          sx={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f5f9',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cbd5e1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#94a3b8',
            },
          }}
        >
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th {...darkThStyle} w="80px">Job ID</Th>
                <Th {...darkThStyle} w="100px">Category</Th>
                <Th {...darkThStyle} w="120px">Department</Th>
                <Th {...darkThStyle} w="100px">Customer</Th>
                <Th {...darkThStyle} w="80px">City</Th>
                <Th {...darkThStyle} w="120px">Salary</Th>
                <Th {...darkThStyle} w="65px">Applied</Th>
                <Th {...darkThStyle} w="65px">Assigned</Th>
                <Th {...darkThStyle} w="110px">Lead Manager</Th>
                <Th {...darkThStyle} w="90px">Status</Th>
                <Th {...darkThStyle} w="90px">Toggle Status</Th>
                <Th {...darkThStyle} w="100px">Created Date</Th>
                <Th {...darkThStyle} w="150px">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedJobs.map((row) => {
                const statusLabel = row.status || 'New';
                const colors = getStatusColors(statusLabel);

                return (
                  <Tr key={row._id} _hover={{ bg: '#f8fafc' }} transition="background 0.1s">
                    {/* Job ID */}
                    <Td {...customTdStyle} fontWeight="800" color="#0B1A30">
                      {row.jobCode || 'N/A'}
                    </Td>

                    {/* Category */}
                    <Td {...customTdStyle}>
                      {formatCategory(row.jobCategory)}
                    </Td>

                    {/* Department (Job Position) */}
                    <Td {...customTdStyle}>
                      {row.jobPosition || 'N/A'}
                    </Td>

                    {/* Customer */}
                    <Td {...customTdStyle} fontWeight="700" color="#0B1A30">
                      {row.customer?.name || 'N/A'}
                    </Td>

                    {/* City */}
                    <Td {...customTdStyle}>
                      {row.city || 'N/A'}
                    </Td>

                    {/* Salary */}
                    <Td {...customTdStyle} color="#0B1A30">
                      {formatSalary(row)}
                    </Td>

                    {/* Applied Candidates Badge */}
                    <Td {...customTdStyle}>
                      <Badge
                        colorScheme="blue"
                        variant="solid"
                        px="3.5" py="1.5"
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="700"
                        cursor="pointer"
                        onClick={() => { setSelectedJob(row); onApplicantsOpen(); }}
                        _hover={{ transform: 'scale(1.1)', opacity: 0.9 }}
                        transition="all 0.15s"
                      >
                        {row.appliedCount ?? 0}
                      </Badge>
                    </Td>

                    {/* Assigned Candidates Badge */}
                    <Td {...customTdStyle}>
                      <Badge
                        colorScheme="green"
                        variant="solid"
                        px="3.5" py="1.5"
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="700"
                        cursor="pointer"
                        onClick={() => { setSelectedJob(row); onApplicantsOpen(); }}
                        _hover={{ transform: 'scale(1.1)', opacity: 0.9 }}
                        transition="all 0.15s"
                      >
                        {row.assignedCount ?? 0}
                      </Badge>
                    </Td>

                    {/* Lead Manager */}
                    <Td {...customTdStyle} fontWeight="700" color={row.leadManager ? '#0B1A30' : 'gray.400'}>
                      {row.leadManager || 'Not Assigned'}
                    </Td>

                    {/* Status badge and toggle dropdown */}
                    <Td {...customTdStyle}>
                      <Menu size="sm">
                        <MenuButton
                          as={Button}
                          size="xs"
                          h="26px"
                          px="3"
                          borderRadius="md"
                          bg={colors.bg}
                          color={colors.color}
                          _hover={{ opacity: 0.8 }}
                          _active={{ opacity: 0.7 }}
                          rightIcon={<ChevronDown size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                        >
                          {statusLabel}
                        </MenuButton>
                        <MenuList borderRadius="lg" border="1px solid #e8edf5" boxShadow="sm" p="1">
                          {['Urgent', 'New', 'Active', 'Inactive', 'Cancelled', 'Expired'].map(s => (
                            <MenuItem
                              key={s}
                              fontSize="xs"
                              fontWeight="600"
                              onClick={async () => {
                                try {
                                  await axios.patch(`${API_BASE_URL}/jobs/${row._id}/status-string`, { status: s }, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  toast({ title: 'Success', description: `Status updated to ${s}`, status: 'success', duration: 2000, position: 'top-right' });
                                  fetchJobs();
                                } catch (error) {
                                  console.error('Status update error:', error);
                                  toast({
                                    title: 'Error',
                                    description: error.response?.data?.message || 'Status update failed.',
                                    status: 'error',
                                    duration: 3000,
                                    position: 'top-right'
                                  });
                                }
                              }}
                              _hover={{ bg: '#f8faff', color: BRAND }}
                            >
                              {s}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                    </Td>

                    {/* Toggle Status Switch */}
                    <Td {...customTdStyle}>
                      <Switch
                        isChecked={row.isActive}
                        onChange={() => confirmToggleStatus(row._id, row.isActive)}
                        sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }}
                      />
                    </Td>

                    {/* Created Date */}
                    <Td {...customTdStyle}>
                      {formatDate(row.createdAt)}
                    </Td>

                    {/* Actions */}
                    <Td {...customTdStyle}>
                      <HStack spacing="1" justify="center">
                        <IconButton
                          icon={<Eye size={15} />}
                          size="xs"
                          w="28px"
                          h="28px"
                          variant="ghost"
                          color="#64748b"
                          _hover={{ color: '#0f62fe', bg: '#f1f5f9' }}
                          aria-label="View Details"
                          onClick={() => navigate(`/jobs/view/${row._id}`)}
                        />
                        <IconButton
                          icon={<UserPlus size={15} />}
                          size="xs"
                          w="28px"
                          h="28px"
                          variant="ghost"
                          color="#64748b"
                          _hover={{ color: '#0f62fe', bg: '#f1f5f9' }}
                          aria-label="Edit Lead Manager"
                          onClick={() => {
                            setAssignJob(row);
                            setSelectedLeadManager(row.leadManager || '');
                            onAssignOpen();
                          }}
                        />
                        <IconButton
                          icon={<Send size={14} />}
                          size="xs"
                          w="28px"
                          h="28px"
                          variant="ghost"
                          color="#64748b"
                          _hover={{ color: '#10b981', bg: '#e6fcf5' }}
                          aria-label="Resend Notification"
                          onClick={() => resendNotification(row._id)}
                        />
                        <IconButton
                          icon={<Edit3 size={15} />}
                          size="xs"
                          w="28px"
                          h="28px"
                          variant="ghost"
                          color="#64748b"
                          _hover={{ color: '#0f62fe', bg: '#f1f5f9' }}
                          aria-label="Edit Job"
                          onClick={() => navigate(`/jobs/edit/${row._id}`)}
                        />
                        <IconButton
                          icon={<Trash2 size={15} />}
                          size="xs"
                          w="28px"
                          h="28px"
                          variant="ghost"
                          color="#ef4444"
                          _hover={{ bg: '#fee2e2' }}
                          aria-label="Delete Record"
                          onClick={() => confirmDelete(row._id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
              {!isLoading && paginatedJobs.length === 0 && <Tr><Td colSpan={13} py="10" textAlign="center" color="#94a3b8">No records found.</Td></Tr>}
            </Tbody>
          </Table>
        </Box>

        {/* Custom Pagination Matching Picture 1 */}
        <Flex justify="space-between" align="center" px="5" py="4" borderTop="1px solid #f1f5f9" bg="white" wrap="wrap" gap="4">
          <Text fontSize="xs" color="#475569" fontWeight="600">
            Showing {filteredJobs.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + parseInt(entries), filteredJobs.length)} of {filteredJobs.length} entries
          </Text>
          {totalPages > 1 && (
            <HStack spacing="2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = currentPage === p;
                return (
                  <Button
                    key={p}
                    size="sm"
                    w="36px"
                    h="36px"
                    bg={isCurrent ? '#0f62fe' : 'white'}
                    color={isCurrent ? 'white' : '#475569'}
                    border="1px solid"
                    borderColor={isCurrent ? '#0f62fe' : '#e2e8f0'}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="700"
                    _hover={{ bg: isCurrent ? '#0043ce' : '#f1f5f9' }}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                size="sm"
                w="36px"
                h="36px"
                bg="white"
                color="#475569"
                border="1px solid"
                borderColor="#e2e8f0"
                borderRadius="md"
                fontSize="xs"
                fontWeight="700"
                _hover={{ bg: '#f1f5f9' }}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                »
              </Button>
            </HStack>
          )}
        </Flex>
      </TableCard>

      {/* Assign Lead Manager Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="bold">Assign Lead Manager</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Select ZomoCook team member to assign/change Lead Manager for job: <strong>{assignJob?.jobCode || 'N/A'}</strong>
              </Text>
              <Select 
                placeholder="Select Lead Manager" 
                value={selectedLeadManager} 
                onChange={(e) => setSelectedLeadManager(e.target.value)}
                h="45px"
                borderRadius="lg"
                bg="#f8faff"
                border="1.5px solid #dde6f5"
              >
                {leadManagers.map(user => (
                  <option key={user._id} value={user.name}>{user.name}</option>
                ))}
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid #f1f5f9">
            <Button size="sm" variant="ghost" mr={3} onClick={onAssignClose} borderRadius="lg">
              Cancel
            </Button>
            <Button size="sm" bg="#0f62fe" color="white" _hover={{ bg: '#0043ce' }} onClick={handleAssignLeadManager} borderRadius="lg">
              Save Assignee
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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

      {/* Job Applicants Modal */}
      {selectedJob && (
        <JobApplicantsModal
          isOpen={isApplicantsOpen}
          onClose={onApplicantsClose}
          jobId={selectedJob._id}
          jobTitle={selectedJob.title}
        />
      )}

      <PageFooter />
        </>
      )}
    </Box>
  );
};

export default JobList;
