import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Button, Input, Select,
  Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem,
  IconButton, Badge, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormLabel
} from '@chakra-ui/react';
import { Search, ChevronDown, MoreVertical, Plus, UserPlus, RefreshCw, X, Trash2, LayoutDashboard, Briefcase, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const BRAND = '#004aad';
const ACCENT = '#f59e0b';

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

const ReplacementDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Data State
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination State
  const [entries, setEntries] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [filters, setFilters] = useState({
    category: 'All',
    customerSearch: '',
    package: 'All',
    status: 'All',
    assignTo: 'All'
  });

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  
  // Modal Inputs & Assign Candidate states
  const [newStatus, setNewStatus] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [postingJob, setPostingJob] = useState(false);

  useEffect(() => {
    fetchReplacements();
  }, []);

  const fetchReplacements = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/replacements`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        setReplacements(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching replacements:', error);
      toast({
        title: 'Error fetching requests',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // API Actions
  const handleUpdateStatus = async (id, status) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/replacements/${id}`, { status }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        toast({ title: 'Status updated', status: 'success', duration: 2000 });
        fetchReplacements();
        onStatusClose();
      }
    } catch (error) {
      toast({ title: 'Error updating status', status: 'error', duration: 2000 });
    }
  };

  const handleFetchCandidates = async (id) => {
    try {
      setLoadingCandidates(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/replacements/${id}/candidates`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      toast({ title: 'Error fetching candidates', status: 'error', duration: 2000 });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleOpenAssign = (row) => {
    setSelectedRequest(row);
    setSelectedCandidate('');
    handleFetchCandidates(row._id);
    onAssignOpen();
  };

  const handleAssignCandidate = async () => {
    if (!selectedRequest || !selectedCandidate) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/replacements/${selectedRequest._id}/assign-candidate`, 
      { candidateId: selectedCandidate },
      { headers: { Authorization: `Bearer ${adminToken}` } });
      
      if (response.data.success) {
        toast({ title: 'Candidate assigned successfully', status: 'success', duration: 3000 });
        fetchReplacements();
        onAssignClose();
      }
    } catch (error) {
      toast({ title: 'Error assigning candidate', status: 'error', duration: 2000 });
    }
  };

  const handleResolve = async (row) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/replacements/${row._id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        toast({ title: 'Replacement Resolved & Candidate Shortlisted', status: 'success', duration: 3000 });
        fetchReplacements();
      }
    } catch (error) {
      toast({ title: 'Error resolving replacement', description: error.response?.data?.message || '', status: 'error', duration: 3000 });
    }
  };

  const handlePostJob = async () => {
    if (!selectedRequest) return;
    try {
      setPostingJob(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/replacements/${selectedRequest._id}/post-job`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        toast({ title: 'New job posted successfully', status: 'success', duration: 3000 });
        fetchReplacements();
        onAssignClose();
      }
    } catch (error) {
      toast({ title: 'Error posting job', description: error.response?.data?.message || '', status: 'error', duration: 3000 });
    } finally {
      setPostingJob(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_BASE_URL}/replacements/${selectedRequest._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        toast({ title: 'Request deleted successfully', status: 'success', duration: 2000 });
        fetchReplacements();
        onDeleteClose();
      }
    } catch (error) {
      toast({ title: 'Error deleting request', status: 'error', duration: 2000 });
    }
  };

  const handleCreateLeads = () => {
    toast({
      title: 'Create Leads',
      description: 'This feature will redirect to Create Query/Job form. (Coming Soon)',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Filtering Logic
  const filteredData = replacements.filter(row => {
    if (filters.category !== 'All' && row.category !== filters.category) return false;
    if (filters.status !== 'All' && row.status !== filters.status) return false;
    if (filters.package !== 'All' && (!row.customer?.activePlan?.name || !row.customer.activePlan.name.includes(filters.package.split(' ')[0]))) return false;
    if (filters.assignTo !== 'All' && row.assignTo?.name !== filters.assignTo) return false;
    
    if (filters.customerSearch) {
      const s = filters.customerSearch.toLowerCase();
      const name = row.customer?.name?.toLowerCase() || '';
      const phone = row.customer?.phone || '';
      if (!name.includes(s) && !phone.includes(s)) return false;
    }

    if (search) {
      const term = search.toLowerCase();
      const staff = row.staffName?.toLowerCase() || '';
      const reason = row.reason?.toLowerCase() || '';
      if (!staff.includes(term) && !reason.includes(term)) return false;
    }

    return true;
  });

  // Pagination Logic
  const pageSize = parseInt(entries);
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleResetFilters = () => {
    setFilters({ category: 'All', customerSearch: '', package: 'All', status: 'All', assignTo: 'All' });
    setSearch('');
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return { bg: '#fff7ed', color: '#ea580c' };
      case 'In Progress': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'Resolved': return { bg: '#f0fdfa', color: '#0d9488' };
      case 'Rejected': return { bg: '#fef2f2', color: '#dc2626' };
      default: return { bg: 'gray.100', color: 'gray.800' };
    }
  };

  const getCategoryColor = (category) => {
    return category === 'Commercial' ? { bg: '#eff6ff', color: '#2563eb' } : { bg: '#f0fdf4', color: '#16a34a' };
  };

  const getPackageColor = (pkg) => {
    if (!pkg) return 'gray.600';
    if (pkg.includes('Standard')) return '#f59e0b';
    if (pkg.includes('Basic')) return '#3b82f6';
    if (pkg.includes('Premium')) return '#9333ea';
    return 'gray.600';
  };

  const totalRequests = replacements.length;
  const pendingRequests = replacements.filter(r => r.status === 'Pending').length;
  const inProgressRequests = replacements.filter(r => r.status === 'In Progress').length;
  const resolvedRequests = replacements.filter(r => r.status === 'Resolved').length;

  const getPercentage = (count) => {
    if (totalRequests === 0) return '0.00%';
    return ((count / totalRequests) * 100).toFixed(2) + '%';
  };

  return (
    <Box p="6" bg="#f8fafc" minH="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="#0f172a">Replacement Dashboard</Text>
          <HStack fontSize="sm" color="gray.500" mt="1" spacing="2">
            <Text cursor="pointer" _hover={{color: BRAND}}>Dashboard</Text>
            <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
            <Text cursor="pointer" _hover={{color: BRAND}}>Job Management</Text>
            <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
            <Text color={BRAND} fontWeight="600">Replacements</Text>
          </HStack>
        </Box>
        <Flex gap="3" align="center">
          <Select size="sm" w="220px" bg="white" borderRadius="md" defaultValue="may">
            <option value="may">01 May 2025 - 31 May 2025</option>
          </Select>
        </Flex>
      </Flex>

      {/* Stats Cards */}
      <Flex gap="4" mb="6" wrap="wrap">
        {[
          { title: 'Total Requests', count: totalRequests.toString(), icon: Briefcase, color: BRAND, bg: '#eff6ff', sub: 'All Time' },
          { title: 'Pending', count: pendingRequests.toString(), icon: LayoutDashboard, color: '#f59e0b', bg: '#fffbeb', sub: getPercentage(pendingRequests) },
          { title: 'In Progress', count: inProgressRequests.toString(), icon: RefreshCw, color: '#10b981', bg: '#ecfdf5', sub: getPercentage(inProgressRequests) },
          { title: 'Resolved', count: resolvedRequests.toString(), icon: LayoutDashboard, color: '#8b5cf6', bg: '#f5f3ff', sub: getPercentage(resolvedRequests) }
        ].map((stat, idx) => (
          <Box key={idx} flex="1" minW="220px" bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm">
            <HStack justify="space-between">
              <VStack align="start" spacing="1">
                <Text fontSize="sm" color="gray.500" fontWeight="600">{stat.title}</Text>
                <Text fontSize="2xl" fontWeight="bold" color="#0f172a">{stat.count}</Text>
                <Text fontSize="xs" fontWeight="700" color={stat.color}>{stat.sub}</Text>
              </VStack>
              <Box p="3" bg={stat.bg} borderRadius="full">
                <stat.icon size={24} color={stat.color} />
              </Box>
            </HStack>
          </Box>
        ))}
      </Flex>

      {/* Main Table Card */}
      <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm" overflow="hidden">
        {/* Filters */}
        <Box p="5" borderBottom="1px solid #e2e8f0">
          <Text fontSize="sm" fontWeight="bold" color="#0f172a" mb="4">Filters</Text>
          <Flex gap="4" wrap="wrap" align="flex-end">
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Category</Text>
              <Select size="sm" borderRadius="md" value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                <option value="All">All</option>
                <option value="Commercial">Commercial</option>
                <option value="Domestic">Domestic</option>
              </Select>
            </Box>
            <Box flex="1.5" minW="200px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Customer Name / No.</Text>
              <Input size="sm" borderRadius="md" placeholder="Search by name or mobile..." value={filters.customerSearch} onChange={(e) => setFilters({...filters, customerSearch: e.target.value})} />
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Current Package</Text>
              <Select size="sm" borderRadius="md" value={filters.package} onChange={(e) => setFilters({...filters, package: e.target.value})}>
                <option value="All">All</option>
                <option value="Basic Plan">Basic Plan</option>
                <option value="Standard Plan">Standard Plan</option>
                <option value="Premium Plan">Premium Plan</option>
              </Select>
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Status</Text>
              <Select size="sm" borderRadius="md" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Assign To</Text>
              <Select size="sm" borderRadius="md" value={filters.assignTo} onChange={(e) => setFilters({...filters, assignTo: e.target.value})}>
                <option value="All">All</option>
                <option value="Amit Verma">Amit Verma</option>
                <option value="Neha Singh">Neha Singh</option>
                <option value="Rohit Tiwari">Rohit Tiwari</option>
              </Select>
            </Box>
            <HStack spacing="2" mb="0.5">
              <Button size="sm" variant="outline" colorScheme="gray" borderRadius="md" px="6" onClick={handleResetFilters}>Reset</Button>
            </HStack>
          </Flex>
        </Box>

        {/* Table Controls */}
        <Flex justify="space-between" p="4" bg="white" align="center">
          <HStack spacing="2">
            <Text fontSize="sm" color="gray.600" fontWeight="600">Show</Text>
            <Select size="sm" w="70px" borderRadius="md" value={entries} onChange={(e) => { setEntries(e.target.value); setCurrentPage(1); }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Select>
            <Text fontSize="sm" color="gray.600" fontWeight="600">entries</Text>
          </HStack>
          <HStack w="300px">
            <Box position="relative" w="full">
              <Input size="sm" pl="8" borderRadius="md" placeholder="Search in table..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Box position="absolute" left="2" top="2" color="gray.400">
                <Search size={14} />
              </Box>
            </Box>
          </HStack>
        </Flex>

        {/* Table */}
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th {...darkThStyle}>Sr. No.</Th>
                <Th {...darkThStyle}>Category</Th>
                <Th {...darkThStyle}>Customer Name</Th>
                <Th {...darkThStyle}>No. / Address</Th>
                <Th {...darkThStyle}>Current Package</Th>
                <Th {...darkThStyle}>Hiring Package & Support Expiry</Th>
                <Th {...darkThStyle}>Current Cook Name</Th>
                <Th {...darkThStyle}>Reason</Th>
                <Th {...darkThStyle}>Status</Th>
                <Th {...darkThStyle}>Assign To</Th>
                <Th {...darkThStyle}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan="11" textAlign="center">Loading...</Td></Tr>
              ) : paginatedData.length === 0 ? (
                <Tr><Td colSpan="11" textAlign="center">No replacement requests found</Td></Tr>
              ) : paginatedData.map((row, index) => (
                <Tr key={row._id} _hover={{ bg: '#f8fafc' }}>
                  <Td {...customTdStyle}>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td {...customTdStyle}>
                    <Badge bg={getCategoryColor(row.category).bg} color={getCategoryColor(row.category).color} px="2.5" py="1" borderRadius="full" fontSize="10px">
                      {row.category}
                    </Badge>
                  </Td>
                  <Td {...customTdStyle} fontWeight="700">{row.customer?.name || 'N/A'}</Td>
                  <Td {...customTdStyle} textAlign="left" maxW="200px">
                    <Text fontSize="xs" whiteSpace="pre-line" lineHeight="1.5">
                      {row.customer?.phone || 'N/A'}
                      {row.customer?.address ? `\n${row.customer.address}` : ''}
                    </Text>
                  </Td>
                  <Td {...customTdStyle}>
                    <Text fontSize="xs" color={row.customer?.activePlan ? getPackageColor(row.customer.activePlan.name) : 'gray.600'} fontWeight="700" whiteSpace="pre-line">
                      {row.customer?.activePlan?.name || 'No Plan'}
                    </Text>
                  </Td>
                  <Td {...customTdStyle} textAlign="left">
                    {row.servicePackage ? (
                      <VStack align="start" spacing="1">
                        <HStack>
                          <Badge colorScheme="purple" fontSize="10px">{row.servicePackage.packageType}</Badge>
                          <Badge 
                            colorScheme={new Date(row.servicePackage.supportExpiryDate) < new Date() ? 'red' : 'green'} 
                            fontSize="9px"
                          >
                            {new Date(row.servicePackage.supportExpiryDate) < new Date() ? 'Expired' : 'Active'}
                          </Badge>
                        </HStack>
                        <Text fontSize="10px" fontWeight="bold" color="gray.700">
                          Expires: {new Date(row.servicePackage.supportExpiryDate).toLocaleDateString('en-IN')}
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          Replacements: {row.servicePackage.replacementsUsed || 0} / {row.servicePackage.replacementLimit}
                        </Text>
                      </VStack>
                    ) : (
                      <Text fontSize="xs" color="gray.400">No Support Package</Text>
                    )}
                  </Td>
                  <Td {...customTdStyle}>{row.staffName}</Td>
                  <Td {...customTdStyle} maxW="150px">
                    <Text fontSize="xs" color="gray.600" isTruncated>{row.reason}</Text>
                  </Td>
                  <Td {...customTdStyle}>
                    <Badge bg={getStatusColor(row.status).bg} color={getStatusColor(row.status).color} px="2.5" py="1" borderRadius="full" fontSize="10px">
                      {row.status}
                    </Badge>
                  </Td>
                  <Td {...customTdStyle} fontWeight="700">
                    {row.assignedCandidate ? row.assignedCandidate.name : 'Unassigned'}
                  </Td>
                  <Td {...customTdStyle}>
                    <Menu placement="bottom-end">
                      <MenuButton as={IconButton} icon={<MoreVertical size={16} />} size="sm" variant="ghost" />
                      <MenuList fontSize="sm" minW="150px" boxShadow="lg" p="1">
                        <MenuItem icon={<Eye size={14} />} _hover={{bg: '#f8fafc', color: BRAND}} onClick={() => { setSelectedRequest(row); onDetailsOpen(); }}>View Details</MenuItem>
                        {row.status === 'Pending' && <MenuItem icon={<UserPlus size={14} />} _hover={{bg: '#f8fafc', color: BRAND}} onClick={() => handleOpenAssign(row)}>Assign Candidate</MenuItem>}
                        {row.status === 'In Progress' && <MenuItem icon={<CheckCircle size={14} />} _hover={{bg: '#f8fafc', color: 'green.600'}} onClick={() => handleResolve(row)}>Shortlist (Resolve)</MenuItem>}
                        <MenuItem icon={<RefreshCw size={14} />} _hover={{bg: '#f8fafc', color: BRAND}} onClick={() => { setSelectedRequest(row); setNewStatus(row.status); onStatusOpen(); }}>Change Status</MenuItem>
                        <MenuItem icon={<X size={14} />} color="red.500" _hover={{bg: '#fef2f2'}} onClick={() => handleUpdateStatus(row._id, 'Rejected')}>Reject</MenuItem>
                        <MenuItem icon={<Trash2 size={14} />} color="red.500" _hover={{bg: '#fef2f2'}} onClick={() => { setSelectedRequest(row); onDeleteOpen(); }}>Delete</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        {/* Pagination Footer */}
        <Flex justify="space-between" align="center" px="5" py="4" borderTop="1px solid #f1f5f9" bg="white">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </Text>
          <HStack spacing="2">
            <Button size="sm" w="32px" h="32px" bg="white" border="1px solid #e2e8f0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt;</Button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
              <Button key={page} size="sm" w="32px" h="32px" bg={currentPage === page ? BRAND : 'white'} color={currentPage === page ? 'white' : 'gray.800'} border="1px solid #e2e8f0" onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
            <Button size="sm" w="32px" h="32px" bg="white" border="1px solid #e2e8f0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>&gt;</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Modals */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Request Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Select New Status</FormLabel>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStatusClose}>Cancel</Button>
            <Button colorScheme="blue" bg={BRAND} onClick={() => handleUpdateStatus(selectedRequest?._id, newStatus)}>Update Status</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isAssignOpen} onClose={onAssignClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Candidate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingCandidates ? (
              <Text>Loading candidates matching this job...</Text>
            ) : candidates.length > 0 ? (
              <FormControl>
                <FormLabel>Select Matching Candidate</FormLabel>
                <Select placeholder="Select a candidate" value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value)}>
                  {candidates.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone}) - {c.city}</option>
                  ))}
                </Select>
                <Text mt="2" fontSize="xs" color="gray.500">Only showing candidates matching the job criteria.</Text>
              </FormControl>
            ) : (
              <Box textAlign="center" py="4">
                <Text mb="4" color="gray.600">No suitable candidates found for this replacement's job.</Text>
                <Button colorScheme="blue" bg={BRAND} isLoading={postingJob} onClick={handlePostJob}>
                  Post Job for this Replacement
                </Button>
                <Text mt="2" fontSize="xs" color="gray.500">This will duplicate the original job and make it active.</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignClose}>Cancel</Button>
            {candidates.length > 0 && <Button colorScheme="blue" bg={BRAND} onClick={handleAssignCandidate}>Assign Candidate</Button>}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Replacement Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack align="start" spacing="4">
                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">CUSTOMER INFO</Text>
                  <Text fontWeight="600">{selectedRequest.customer?.name} ({selectedRequest.customer?.phone})</Text>
                  <Text fontSize="sm">{selectedRequest.customer?.address}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">OLD STAFF</Text>
                  <Text fontWeight="600">{selectedRequest.staffName}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">REASON FOR REPLACEMENT</Text>
                  <Text fontWeight="600">{selectedRequest.reason}</Text>
                  <Text fontSize="sm">{selectedRequest.details || 'No additional details provided.'}</Text>
                </Box>
                {selectedRequest.job && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">LINKED JOB</Text>
                    <Text fontWeight="600">{selectedRequest.job.title} ({selectedRequest.job.jobCategory})</Text>
                    <Text fontSize="sm">{selectedRequest.job.city}, {selectedRequest.job.state}</Text>
                  </Box>
                )}
                {selectedRequest.newJob && (
                  <Box p="3" bg="blue.50" borderRadius="md" w="full" borderLeft="4px solid" borderColor="blue.500">
                    <Text fontSize="xs" color="blue.700" fontWeight="bold">NEW JOB POSTED</Text>
                    <Text fontSize="sm" color="blue.800">A new job has been posted for this replacement: <b>{selectedRequest.newJob.title}</b></Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onDetailsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this replacement request? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReplacementDashboard;
