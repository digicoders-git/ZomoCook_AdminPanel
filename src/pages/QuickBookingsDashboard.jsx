import { useState, useEffect } from 'react';
import {
  Box, HStack, Text, VStack, Button, Badge, useToast, useDisclosure,
  Flex, FormLabel, Select, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  SimpleGrid, FormControl, Icon, Stat, StatLabel, StatNumber
} from '@chakra-ui/react';
import { Zap, Clock, UtensilsCrossed, Filter, RotateCcw, Search, Eye, Calendar, UserPlus } from 'lucide-react';
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
        // Filter ONLY Quick Bookings & Events: Daily Basis Staff Bookings + Chef for Party Bookings
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
              <option value="Closed">Closed</option>
              <option value="Hold">Hold</option>
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
                  return (
                    <Tr key={job._id}>
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
                        <Button size="xs" colorScheme={party ? "orange" : "blue"} variant="ghost" onClick={() => { setSelectedJobView(job); onViewOpen(); }}>
                          View Details
                        </Button>
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

      {/* Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="bold">
            {selectedJobView && isPartyBooking(selectedJobView) ? 'Chef for Party Booking Details' : 'Daily Basis Booking Details'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="4">
            {selectedJobView && (
              <VStack align="stretch" spacing="3" fontSize="xs">
                <HStack justify="space-between" bg={isPartyBooking(selectedJobView) ? "#fff7ed" : "#f8fafc"} p="3" borderRadius="lg">
                  <Text fontWeight="bold" color={isPartyBooking(selectedJobView) ? "#c2410c" : "#1e293b"}>
                    Job Code: {selectedJobView.jobCode}
                  </Text>
                  <Text color="#64748b">Date: {formatDate(selectedJobView.createdAt)}</Text>
                </HStack>
                <Box>
                  <Text fontWeight="bold" color="#1e293b" mb="1">Customer Information</Text>
                  <Text>Name: {getCustomerName(selectedJobView)}</Text>
                  <Text>Phone: {getCustomerPhone(selectedJobView)}</Text>
                  <Text>City: {selectedJobView.city}, {selectedJobView.state}</Text>
                  <Text>Address: {selectedJobView.address || 'N/A'}</Text>
                  {selectedJobView.outletName && <Text>Outlet Name: {selectedJobView.outletName}</Text>}
                </Box>
                {isPartyBooking(selectedJobView) ? (
                  <Box borderTop="1px solid #e2e8f0" pt="2">
                    <Text fontWeight="bold" color="#1e293b" mb="1">Party Event & Guests Breakdown</Text>
                    <Text>Event Name: {selectedJobView.event || selectedJobView.jobPosition || 'N/A'}</Text>
                    <Text>Number of Guests: {selectedJobView.noOfGuests || 'N/A'}</Text>
                    {selectedJobView.partyRequirement?.dates && Array.isArray(selectedJobView.partyRequirement.dates) ? (
                      selectedJobView.partyRequirement.dates.map((d, i) => (
                        <Box key={i} bg="#fff7ed" p="2" borderRadius="md" mt="2">
                          <Text fontWeight="700" color="#c2410c">Day {i + 1}: {d.date} ({d.eventType || 'Event'})</Text>
                          {d.meals && d.meals.map((m, mi) => (
                            <Text key={mi} pl="2" fontSize="11px" color="#475569">
                              • {m.name}: {m.guests} Guests | Mode: {m.menuMode || 'N/A'} {m.menu && m.menu.length > 0 ? `(${m.menu.join(', ')})` : ''}
                            </Text>
                          ))}
                        </Box>
                      ))
                    ) : (
                      <Text color="#475569" mt="1">{selectedJobView.menuDetails || selectedJobView.overview || selectedJobView.responsibilities || 'N/A'}</Text>
                    )}
                  </Box>
                ) : (
                  <Box borderTop="1px solid #e2e8f0" pt="2">
                    <Text fontWeight="bold" color="#1e293b" mb="1">Staff Requirements & Timings</Text>
                    {selectedJobView.staffRequirements && selectedJobView.staffRequirements.length > 0 ? (
                      selectedJobView.staffRequirements.map((s, idx) => (
                        <Box key={idx} bg="#f1f5f9" p="2" borderRadius="md" mb="2">
                          <Text fontWeight="700">{s.role} - Count: {s.count} | Days: {s.days}</Text>
                          <Text>Rate/Day: ₹{s.perDayRate || s.ratePerDay || 0}</Text>
                          <Text>Gender Preference: {s.genderPref || 'Any'}</Text>
                          <Text>Start Date & Time: {s.startDate || 'N/A'} ({s.startTime || ''} - {s.endTime || ''})</Text>
                        </Box>
                      ))
                    ) : (
                      <Text>{selectedJobView.overview || selectedJobView.title}</Text>
                    )}
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default QuickBookingsDashboard;
