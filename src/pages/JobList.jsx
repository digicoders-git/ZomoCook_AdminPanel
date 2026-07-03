import { useState, useEffect } from 'react';
import { 
  Box, HStack, Text, VStack, Button, Switch, IconButton, 
  useToast, useDisclosure, Collapse, Flex, Badge,
  FormLabel, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
  Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import { Plus, Filter, Edit3, RotateCcw, Search, Eye, ChevronDown, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, PageFooter, BRAND, ACCENT, TableCard, TableControls, 
  TableFooter, thStyle, trHover, ConfirmationModal 
} from '../components/ui';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import JobApplicantsModal from './JobApplicantsModal';

const JobList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isApplicantsOpen, onOpen: onApplicantsOpen, onClose: onApplicantsClose } = useDisclosure();
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = localStorage.getItem('adminToken');
  
  // Confirmation State
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
    type: 'danger',
    confirmLabel: 'Confirm'
  });

  // Search and Pagination states
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    status: '',
    datePreset: '',
    customDate: ''
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ category: '', city: '', status: '', datePreset: '', customDate: '' });
    setSearch('');
    setCurrentPage(1);
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

  // Filter and Paginate Data
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      job.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !filters.category || job.jobCategory === filters.category;
    const matchesCity = !filters.city || job.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesStatus = !filters.status || (filters.status === 'active' ? job.isActive : !job.isActive);

    // Date matching logic
    let matchesDate = true;
    if (filters.customDate) {
      const jobDate = new Date(job.createdAt).toDateString();
      const filterDate = new Date(filters.customDate).toDateString();
      matchesDate = jobDate === filterDate;
    } else if (filters.datePreset) {
      const jobTime = new Date(job.createdAt).getTime();
      const now = new Date().getTime();
      const diffMs = now - jobTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (filters.datePreset === 'today') {
        matchesDate = new Date(job.createdAt).toDateString() === new Date().toDateString();
      } else if (filters.datePreset === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = new Date(job.createdAt).toDateString() === yesterday.toDateString();
      } else if (filters.datePreset === 'weekly') {
        matchesDate = diffDays <= 7;
      } else if (filters.datePreset === 'monthly') {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesCategory && matchesCity && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredJobs.length / parseInt(entries));
  const startIndex = (currentPage - 1) * parseInt(entries);
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + parseInt(entries));

  return (
    <Box pb="10">
      <PageHeader
        title="Job Management"
        breadcrumb="Job Management"
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
          <Button key="add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} onClick={() => navigate('/jobs/add')}>Add</Button>,
        ]}
      />

      <Collapse in={showFilters} animateOpacity>
        <Box bg="white" p="5" borderRadius="xl" border="1px solid #e8edf5" mb="6" boxShadow="0 2px 12px rgba(0,74,173,0.05)">
          <Flex align="flex-end" gap="4" wrap="wrap">
            <Box flex="1" minW="200px">
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Category</FormLabel>
              <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" placeholder="Select Job Category" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                <option value="hotel">Hotel Job</option>
                <option value="home">Home Cook Job</option>
                <option value="daily">Daily Pay Job</option>
              </Select>
            </Box>
            <Box flex="1" minW="200px">
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">City</FormLabel>
              <Input size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" placeholder="Filter by City" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
            </Box>
            <Box flex="1" minW="200px">
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Status</FormLabel>
              <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" placeholder="-- Select Status --" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Box>
            <Box flex="1" minW="200px">
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Date Range</FormLabel>
              <Select size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" placeholder="All Dates" value={filters.datePreset} onChange={(e) => handleFilterChange('datePreset', e.target.value)}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
              </Select>
            </Box>
            <Box flex="1" minW="200px">
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Specific Date</FormLabel>
              <Input type="date" size="sm" h="40px" borderRadius="lg" bg="#f8faff" border="1.5px solid #dde6f5" value={filters.customDate} onChange={(e) => handleFilterChange('customDate', e.target.value)} />
            </Box>
            <HStack spacing="3">
              <Button h="40px" px="8" bg={ACCENT} color="white" leftIcon={<Search size={16} />} _hover={{ bg: '#c8151c' }} borderRadius="lg" fontSize="sm" fontWeight="700" onClick={() => setCurrentPage(1)}>Search</Button>
              <Button h="40px" px="8" variant="outline" color="#475569" borderColor="#dde6f5" leftIcon={<RotateCcw size={16} />} _hover={{ bg: '#f1f5f9' }} borderRadius="lg" fontSize="sm" fontWeight="700" onClick={resetFilters}>Reset</Button>
            </HStack>
          </Flex>
        </Box>
      </Collapse>
      
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Job Record List</Text>
        </Flex>

        <TableControls 
          search={search} 
          onSearch={(val) => { setSearch(val); setCurrentPage(1); }} 
          entries={entries} 
          onEntriesChange={(val) => { setEntries(val); setCurrentPage(1); }} 
        />

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#f8faff">
              <Tr>
                <Th {...thStyle} border="1px solid #edf2f7" textAlign="center" w="60px">Sr.No.</Th>
                <Th {...thStyle} border="1px solid #edf2f7" minW="150px">Job Code</Th>
                <Th {...thStyle} border="1px solid #edf2f7" minW="300px">Job Details</Th>
                <Th {...thStyle} border="1px solid #edf2f7" minW="250px">Job Overview</Th>
                <Th {...thStyle} border="1px solid #edf2f7" w="100px" textAlign="center">Applied</Th>
                <Th {...thStyle} border="1px solid #edf2f7" w="100px" textAlign="center">Assigned</Th>
                <Th {...thStyle} border="1px solid #edf2f7" w="150px" textAlign="center">Status</Th>
                <Th {...thStyle} border="1px solid #edf2f7" textAlign="center" w="120px">Toggle Status</Th>
                <Th {...thStyle} border="1px solid #edf2f7" textAlign="center" w="100px">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedJobs.map((row, index) => (
                <Tr key={row._id} {...trHover}>
                  <Td py="4" border="1px solid #edf2f7" textAlign="center" fontSize="xs" color="#475569">{startIndex + index + 1}</Td>
                  
                  {/* Job Code */}
                  <Td py="4" border="1px solid #edf2f7">
                    <VStack align="center" spacing="1">
                      <Text fontSize="sm" fontWeight="800" color="#0000ff">{row.jobCode || 'N/A'}</Text>
                      <Text fontSize="10px" color="#64748b" fontWeight="600">{new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                      <Text fontSize="10px" color="#64748b" fontWeight="600">{new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </VStack>
                  </Td>

                  {/* Job Details */}
                  <Td py="4" border="1px solid #edf2f7">
                    <VStack align="start" spacing="1">
                      <Text fontSize="md" fontWeight="700" color="#0000ff" _hover={{ textDecoration: 'underline', cursor: 'pointer' }}>{row.title}</Text>
                      <Text fontSize="xs" fontWeight="800" color="#0000ff" textTransform="uppercase">{row.jobPosition}</Text>
                      <Text fontSize="xs" color="#1e293b">Job Category: <Box as="span" color="#475569" fontWeight="500">{row.jobCategory === 'hotel' ? 'Hotel Job' : row.jobCategory === 'home' ? 'Home Cook Job' : 'Daily Pay Job'}</Box></Text>
                      {row.jobCategory === 'daily' && <Text fontSize="xs" color="#1e293b">Event Name: <Box as="span" color="#475569" fontWeight="500">{row.event}</Box></Text>}
                      {row.jobCategory !== 'daily' && <Text fontSize="xs" color="#1e293b">Property Category: <Box as="span" color="#475569" fontWeight="500">{row.propertyCategory}</Box></Text>}
                      <Text fontSize="xs" color="#1e293b">State Name: <Box as="span" color="#475569" fontWeight="500">{row.state}</Box></Text>
                      <Text fontSize="xs" color="#1e293b">City Name: <Box as="span" color="#475569" fontWeight="500">{row.city}</Box></Text>
                    </VStack>
                  </Td>

                   {/* Job Overview */}
                  <Td py="4" border="1px solid #edf2f7">
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" fontWeight="700" color="#1e293b">{row.jobPosition} : <Box as="span" color="#475569" fontWeight="500">{row.packageOrGuestOrVacancy} {row.jobCategory === 'hotel' ? 'Vacancy' : 'Guests'}</Box></Text>
                      <Text fontSize="xs" fontWeight="700" color="#0000ff">Total Vacancy: {row.packageOrGuestOrVacancy || '1'}</Text>
                    </VStack>
                  </Td>

                  {/* Applied Candidates Column */}
                  <Td py="4" border="1px solid #edf2f7" textAlign="center">
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      px="3" py="1"
                      borderRadius="full"
                      fontSize="xs"
                      cursor="pointer"
                      onClick={() => { setSelectedJob(row); onApplicantsOpen(); }}
                      _hover={{ transform: 'scale(1.1)', opacity: 0.9 }}
                      transition="all 0.15s"
                    >
                      {row.appliedCount ?? row.applied ?? 0}
                    </Badge>
                  </Td>

                  {/* Assigned Candidates Column */}
                  <Td py="4" border="1px solid #edf2f7" textAlign="center">
                    <Badge
                      colorScheme="green"
                      variant="solid"
                      px="3" py="1"
                      borderRadius="full"
                      fontSize="xs"
                      cursor="pointer"
                      onClick={() => { setSelectedJob(row); onApplicantsOpen(); }}
                      _hover={{ transform: 'scale(1.1)', opacity: 0.9 }}
                      transition="all 0.15s"
                    >
                      {row.assignedCount ?? row.assigned ?? 0}
                    </Badge>
                  </Td>

                  {/* Status Dropdown */}
                  <Td py="4" border="1px solid #edf2f7" textAlign="center">
                    <Menu size="sm">
                      <MenuButton 
                        as={Button} 
                        size="xs" 
                        rightIcon={<ChevronDown size={14} />}
                        fontSize="xs"
                        fontWeight="700"
                        bg={row.status === 'Urgent' ? '#fed7d7' : row.status === 'New' ? '#e6f6ff' : row.status === 'Active' ? '#f0fdf4' : '#f1f5f9'}
                        color={row.status === 'Urgent' ? '#c53030' : row.status === 'New' ? '#0070f0' : row.status === 'Active' ? '#16a34a' : '#475569'}
                        _hover={{ opacity: 0.8 }}
                        _active={{ opacity: 0.7 }}
                        minW="85px"
                      >
                        {row.status}
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
                  <Td py="4" border="1px solid #edf2f7" textAlign="center">
                    <Switch 
                      isChecked={row.isActive} 
                      onChange={() => confirmToggleStatus(row._id, row.isActive)}
                      sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} 
                    />
                  </Td>
                  
                  <Td py="4" border="1px solid #edf2f7" textAlign="center">
                    <HStack spacing="2" justify="center">
                      <IconButton icon={<Edit3 size={16} />} size="sm" bg="#f97316" color="white" borderRadius="md" _hover={{ bg: '#ea580c' }} aria-label="Edit" onClick={() => navigate(`/jobs/edit/${row._id}`)} />
                      <IconButton icon={<Eye size={16} />} size="sm" bg="#1a83ff" color="white" borderRadius="md" _hover={{ bg: '#0070f0' }} aria-label="View" onClick={() => navigate(`/jobs/view/${row._id}`)} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {!isLoading && paginatedJobs.length === 0 && <Tr><Td colSpan={6} py="10" textAlign="center" color="#94a3b8">No records found.</Td></Tr>}
            </Tbody>
          </Table>
        </Box>
        
        <TableFooter 
          showing={`${filteredJobs.length > 0 ? startIndex + 1 : 0} to ${Math.min(startIndex + parseInt(entries), filteredJobs.length)}`} 
          total={filteredJobs.length}
          currentPage={currentPage}
          onPageChange={(p) => setCurrentPage(p)}
          totalPages={totalPages}
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
    </Box>
  );
};

export default JobList;
