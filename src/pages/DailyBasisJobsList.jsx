import { useState, useEffect } from 'react';
import {
  Box, HStack, Text, VStack, Button, Badge, useToast, useDisclosure,
  Flex, FormLabel, Select, Table, Thead, Tbody, Tr, Th, Td,
  Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  SimpleGrid, FormControl, Icon, Avatar
} from '@chakra-ui/react';
import { Plus, Filter, Edit3, RotateCcw, Search, Eye, ChevronDown, Trash2, Calendar, Clock, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, PageFooter, BRAND, ACCENT, TableCard, TableControls,
  ConfirmationModal
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

const DailyBasisJobsList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  
  const [jobs, setJobs] = useState([]);
  const [leadManagers, setLeadManagers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignJob, setAssignJob] = useState(null);
  const [selectedLeadManager, setSelectedLeadManager] = useState('');
  const [selectedJobView, setSelectedJobView] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const roleName = (adminData?.role?.name || '').toLowerCase();
  const isSuperAdmin =
    adminData?.email?.toLowerCase() === 'zomocookadmin@gmail.com' ||
    roleName === 'super admin' ||
    (adminData?.type === 'admin' && !adminData?.role);
  const isLeadManager = !isSuperAdmin && (adminData?.type === 'user' || (adminData?.type === 'admin' && !!adminData?.role && roleName !== 'super admin'));

  // Confirmation State
  const [confirmConfig, setConfirmConfig] = useState({
    title: '', description: '', onConfirm: () => {}, type: 'danger', confirmLabel: 'Confirm'
  });

  // Search & Filters
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    city: '',
    status: '',
    hiringPurpose: '', // commercial vs domestic
    leadManager: ''
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs?jobCategory=daily&_t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        let fetchedJobs = (response.data.jobs || []).filter(j => j.jobCategory === 'daily');
        fetchedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(fetchedJobs);
      }
    } catch (error) {
      console.error('Error fetching daily basis jobs:', error);
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

  const handleAssignLeadManager = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${assignJob._id}`, {
        leadManager: selectedLeadManager,
        ...(selectedLeadManager && { status: 'Assigned' })
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        toast({ title: 'Success', description: 'Lead Manager assigned successfully.', status: 'success', duration: 2500 });
        fetchJobs();
        onAssignClose();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to assign Lead Manager.', status: 'error', duration: 2500 });
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
            <Icon as={Clock} color="#0f62fe" boxSize={6} />
            <Text fontSize="2xl" fontWeight="800" color="#0B1A30">Daily Basis Staff Bookings</Text>
          </HStack>
          <Text fontSize="sm" color="#64748b">View and manage all Daily Basis Staff hiring requests</Text>
        </VStack>
      </Flex>

      {/* Filter Options */}
      <Box bg="white" p="5" borderRadius="xl" border="1px solid #e8edf5" mb="6" boxShadow="0 2px 12px rgba(0,74,173,0.03)">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="4">
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569">Status</FormLabel>
            <Select size="sm" h="38px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
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
            <Button size="sm" h="38px" flex="1" variant="outline" onClick={() => { setFilters({ city: '', status: '', hiringPurpose: '', leadManager: '' }); setSearch(''); }}>
              Reset
            </Button>
          </Flex>
        </SimpleGrid>
      </Box>

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between" flexWrap="wrap" gap="4">
          <HStack><Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="2" /><Text fontSize="sm" fontWeight="700" color="#1e293b">Daily Basis Job Records ({filteredJobs.length})</Text></HStack>
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
                  <Th {...darkThStyle}>Job Code & Date</Th>
                  <Th {...darkThStyle}>Customer Details</Th>
                  <Th {...darkThStyle}>Staff Requirements</Th>
                  <Th {...darkThStyle}>Location / Outlet</Th>
                  <Th {...darkThStyle}>Pricing / Advance</Th>
                  <Th {...darkThStyle}>Lead Manager</Th>
                  <Th {...darkThStyle}>Status</Th>
                  <Th {...darkThStyle}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedJobs.map((job, idx) => (
                  <Tr key={job._id}>
                    <Td {...customTdStyle}>{startIndex + idx + 1}</Td>
                    <Td {...customTdStyle}>
                      <VStack align="center" spacing="0.5">
                        <Badge bg="#eff6ff" color="#1d4ed8" px="2" py="0.5" borderRadius="md" fontSize="11px" fontWeight="700">
                          {job.jobCode || 'N/A'}
                        </Badge>
                        <Text fontSize="10px" color="#64748b">{formatDate(job.createdAt)}</Text>
                      </VStack>
                    </Td>
                    <Td {...customTdStyle}>
                      <VStack align="center" spacing="0.5">
                        <Text fontWeight="700" color="#1e293b">{getCustomerName(job)}</Text>
                        <Text fontSize="11px" color="#64748b">{getCustomerPhone(job)}</Text>
                      </VStack>
                    </Td>
                    <Td {...customTdStyle}>
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
                    </Td>
                    <Td {...customTdStyle}>
                      <VStack align="center" spacing="0.5">
                        <Text fontWeight="600">{job.city}, {job.state}</Text>
                        <Text fontSize="10px" color="#64748b">{job.outletName || job.basicFacility || 'N/A'}</Text>
                      </VStack>
                    </Td>
                    <Td {...customTdStyle}>
                      <VStack align="center" spacing="0.5">
                        <Text fontWeight="700" color="#059669">₹{job.advanceAmount || job.jobPostFee || 0}</Text>
                        <Badge bg={job.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7'} color={job.paymentStatus === 'paid' ? '#15803d' : '#b45309'} fontSize="9px">
                          {job.paymentStatus ? job.paymentStatus.toUpperCase() : 'FREE'}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td {...customTdStyle}>
                      <Badge px="2" py="1" borderRadius="full" fontSize="10px" bg={job.leadManager ? '#eff6ff' : '#f8fafc'} color={job.leadManager ? '#1d4ed8' : '#94a3b8'}>
                        {job.leadManager || 'Unassigned'}
                      </Badge>
                    </Td>
                    <Td {...customTdStyle}>
                      <Badge px="2" py="1" borderRadius="md" bg="#e0f2fe" color="#0369a1" fontSize="11px">
                        {job.status || 'New'}
                      </Badge>
                    </Td>
                    <Td {...customTdStyle}>
                      <HStack justify="center" spacing="1">
                        <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => { setSelectedJobView(job); onViewOpen(); }}>
                          View Details
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {paginatedJobs.length === 0 && (
                  <Tr><Td colSpan={9} textAlign="center" py="8" color="#94a3b8">No Daily Basis Staff records found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </TableCard>

      {/* Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl" isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" maxH="85vh">
          <ModalHeader fontSize="md" fontWeight="bold">⏱️ Daily Basis Staff Booking Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody py="4">
            {selectedJobView && (
              <VStack align="stretch" spacing="4" fontSize="xs">
                <HStack justify="space-between" bg="#eff6ff" p="3" borderRadius="lg" border="1px solid #dbeafe">
                  <Text fontWeight="bold" fontSize="sm" color="#1d4ed8">Job Code: {selectedJobView.jobCode || 'N/A'}</Text>
                  <Badge bg={selectedJobView.status === 'Active' ? '#dcfce7' : '#fef3c7'} color={selectedJobView.status === 'Active' ? '#15803d' : '#b45309'} px="2.5" py="1" borderRadius="md" fontSize="11px">
                    Status: {selectedJobView.status || 'New'}
                  </Badge>
                </HStack>
                <Box bg="#f8fafc" p="3.5" borderRadius="lg" border="1px solid #e2e8f0">
                  <Text fontWeight="800" color="#1e293b" mb="2" fontSize="xs">CUSTOMER & LOCATION DETAILS</Text>
                  <SimpleGrid columns={2} spacing="2">
                    <Text><Box as="span" fontWeight="700" color="#475569">Customer Name:</Box> {getCustomerName(selectedJobView)}</Text>
                    <Text><Box as="span" fontWeight="700" color="#475569">Phone Number:</Box> {getCustomerPhone(selectedJobView)}</Text>
                    <Text><Box as="span" fontWeight="700" color="#475569">Hiring Purpose / Outlet:</Box> {selectedJobView.outletName || selectedJobView.hiringPurpose || 'N/A'}</Text>
                    <Text><Box as="span" fontWeight="700" color="#475569">City & State:</Box> {selectedJobView.city}, {selectedJobView.state}</Text>
                    <Text gridColumn="span 2"><Box as="span" fontWeight="700" color="#475569">Address / Venue:</Box> {selectedJobView.address || 'N/A'}</Text>
                    <Text><Box as="span" fontWeight="700" color="#475569">Lead Manager:</Box> {selectedJobView.leadManager || 'Unassigned'}</Text>
                  </SimpleGrid>
                </Box>
                <Box bg="#f0fdf4" p="3.5" borderRadius="lg" border="1px solid #bbf7d0">
                  <Text fontWeight="800" color="#166534" mb="2" fontSize="xs">STAFF REQUIREMENTS & TIMINGS</Text>
                  {selectedJobView.staffRequirements && selectedJobView.staffRequirements.length > 0 ? (
                    selectedJobView.staffRequirements.map((s, idx) => (
                      <Box key={idx} bg="white" p="2.5" borderRadius="md" mb="2" border="1px solid #dcfce7">
                        <Flex justify="space-between" mb="1">
                          <Text fontWeight="700" color="#166534">{s.role || s.category || 'Staff'} x {s.count || 1}</Text>
                          <Text fontWeight="700" color="#059669">Rate: ₹{s.perDayRate || s.ratePerDay || 0}/Day</Text>
                        </Flex>
                        <Text>Days: {s.days || 1} | Gender: {s.genderPref || 'Any'}</Text>
                        <Text>Start Date: {s.startDate || 'N/A'} | Timings: {s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : (s.timing || 'N/A')}</Text>
                      </Box>
                    ))
                  ) : (
                    <Text color="#475569">{selectedJobView.overview || selectedJobView.title}</Text>
                  )}
                </Box>
                <Box bg="#f8fafc" p="3.5" borderRadius="lg" border="1px solid #e2e8f0">
                  <Text fontWeight="800" color="#1e293b" mb="2" fontSize="xs">PRICING & ADVANCE PAYMENT</Text>
                  <SimpleGrid columns={2} spacing="2">
                    <Text><Box as="span" fontWeight="700" color="#475569">25% Advance Amount:</Box> <Box as="span" color="#059669" fontWeight="700">₹{selectedJobView.advanceAmount || selectedJobView.jobPostFee || 0}</Box></Text>
                    <Text><Box as="span" fontWeight="700" color="#475569">Payment Status:</Box> {selectedJobView.paymentStatus ? selectedJobView.paymentStatus.toUpperCase() : 'FREE'}</Text>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap="3">
            <Button size="sm" colorScheme="blue" onClick={() => { onViewClose(); navigate(`/jobs/view/${selectedJobView._id}`); }}>
              Open Full Details Page
            </Button>
            <Button size="sm" variant="ghost" onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default DailyBasisJobsList;
