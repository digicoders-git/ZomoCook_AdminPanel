import { useEffect, useState } from 'react';
import { 
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Avatar, Switch, 
  IconButton, Icon, useToast, Button, useDisclosure, Collapse, SimpleGrid, 
  FormControl, FormLabel, Select, Input
} from '@chakra-ui/react';
import { Edit3, Filter, Plus, Trash2, Search, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, 
  BRAND, ACCENT, tableHeadStyle, thStyle, trHover, ConfirmationModal 
} from '../components/ui';
import axios from 'axios';

const CustomerList = () => {
  const navigate = useNavigate(); 
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    namePhone: '',
    status: ''
  });

  const fetchCustomers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/customers`, {
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ category: '', namePhone: '', status: '' });
    setSearch('');
    setCurrentPage(1);
  };

  // Filter and Paginate Data
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.contactPhone.includes(search);
    
    const matchesCategory = !filters.category || customer.propertyCategory === filters.category;
    const matchesNamePhone = !filters.namePhone || 
      customer.name.toLowerCase().includes(filters.namePhone.toLowerCase()) ||
      customer.contactPhone.includes(filters.namePhone);
    const matchesStatus = !filters.status || customer.accountStatus === filters.status;

    return matchesSearch && matchesCategory && matchesNamePhone && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / parseInt(entries));
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
          toast({ title: 'Error', description: 'Failed to delete customer.', status: 'error', duration: 2000, position: 'top-right' });
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

  return (
    <Box pb="10">
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

      <Collapse in={showFilters} animateOpacity>
        <Box bg="white" p={{ base: '4', md: '5' }} borderRadius="xl" border="1px solid #e8edf5" mb="6" boxShadow="0 2px 12px rgba(0,74,173,0.05)">
          <Flex align={{ base: 'stretch', md: 'flex-end' }} gap="3" direction={{ base: 'column', md: 'row' }} wrap="wrap">
            <Box w={{ base: 'full', md: 'auto' }} flex={{ md: '1' }} minW={{ md: '180px' }}>
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Category</FormLabel>
              <Select 
                size="sm" 
                h="40px"
                borderRadius="lg" 
                bg="#f8faff" 
                border="1.5px solid #dde6f5"
                placeholder="Select Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="villa">Private Villa</option>
                <option value="canteen">Canteen</option>
                <option value="restaurant">Restaurant</option>
                <option value="home">Home</option>
              </Select>
            </Box>
            <Box w={{ base: 'full', md: 'auto' }} flex={{ md: '1' }} minW={{ md: '180px' }}>
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Customer Name/Phone</FormLabel>
              <Input 
                size="sm" 
                h="40px"
                borderRadius="lg" 
                bg="#f8faff" 
                border="1.5px solid #dde6f5"
                placeholder="Name or Phone"
                value={filters.namePhone}
                onChange={(e) => handleFilterChange('namePhone', e.target.value)}
              />
            </Box>
            <Box w={{ base: 'full', md: 'auto' }} flex={{ md: '1' }} minW={{ md: '150px' }}>
              <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="2">Status</FormLabel>
              <Select 
                size="sm" 
                h="40px"
                borderRadius="lg" 
                bg="#f8faff" 
                border="1.5px solid #dde6f5"
                placeholder="-- Select Status --"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Box>
            <Flex gap="3" w={{ base: 'full', md: 'auto' }} direction={{ base: 'row', md: 'row' }}>
              <Button flex={{ base: '1', md: 'none' }} h="40px" px={{ base: '4', md: '8' }} bg={ACCENT} color="white" leftIcon={<Search size={16} />} _hover={{ bg: '#c8151c' }} borderRadius="lg" fontSize="sm" fontWeight="700" onClick={() => setCurrentPage(1)}>Search</Button>
              <Button flex={{ base: '1', md: 'none' }} h="40px" px={{ base: '4', md: '8' }} variant="outline" color="#475569" borderColor="#dde6f5" leftIcon={<RotateCcw size={16} />} _hover={{ bg: '#f1f5f9' }} borderRadius="lg" fontSize="sm" fontWeight="700" onClick={resetFilters}>Reset</Button>
            </Flex>
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
          <Table variant="simple" size="sm" minW="650px">
            <Thead {...tableHeadStyle}>
              <Tr>
                {['Sr.No.', 'Profile Image', 'Customer/Client Details', 'Password', 'Customer Status', 'Status', 'Action'].map(h => (
                  <Th key={h} {...thStyle} whiteSpace="nowrap">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {paginatedCustomers.map((row, index) => (
                <Tr key={row._id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600" minW="55px">{startIndex + index + 1}</Td>
                  <Td py="3.5" minW="65px">
                    <Avatar size="md" src={getProfileImg(row.profilePic)} bg="#e6eeff" border="2px solid #e8edf5" />
                  </Td>
                  <Td py="3.5" minW="180px">
                    <VStack align="start" spacing="0.5">
                      <HStack spacing="1" flexWrap="wrap"><Text fontSize="xs" color="#94a3b8" whiteSpace="nowrap">Category:</Text><Text fontSize="xs" color="#475569" fontWeight="600">{row.propertyCategory}</Text></HStack>
                      <HStack spacing="1" flexWrap="wrap"><Text fontSize="xs" color="#94a3b8" whiteSpace="nowrap">Name:</Text><Text fontSize="xs" color="#1e293b" fontWeight="700">{row.name}</Text></HStack>
                      <HStack spacing="1" flexWrap="wrap"><Text fontSize="xs" color="#94a3b8" whiteSpace="nowrap">Phone:</Text><Text fontSize="xs" color="#475569">{row.contactPhone}</Text></HStack>
                      <HStack spacing="1" flexWrap="wrap"><Text fontSize="xs" color="#94a3b8" whiteSpace="nowrap">Email:</Text><Text fontSize="xs" color="#475569">{row.email}</Text></HStack>
                    </VStack>
                  </Td>
                  <Td py="3.5" minW="75px"><Text fontSize="sm" color="#475569" fontFamily="mono">******</Text></Td>
                  <Td py="3.5" minW="105px">
                    <Text fontSize="xs" fontWeight="700" color={row.customerStatus === 'running' ? '#16a34a' : '#ef4444'}
                      bg={row.customerStatus === 'running' ? '#ecfdf5' : '#fef2f2'}
                      border={`1px solid ${row.customerStatus === 'running' ? '#bbf7d0' : '#fecaca'}`}
                      px="2.5" py="0.5" borderRadius="full" display="inline-block" textTransform="capitalize" whiteSpace="nowrap">
                      {row.customerStatus}
                    </Text>
                  </Td>
                  <Td py="3.5" minW="65px">
                    <Switch 
                      isChecked={row.accountStatus === 'active'} 
                      onChange={() => confirmStatusToggle(row._id, row.accountStatus)}
                      sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} 
                    />
                  </Td>
                  <Td py="3.5" minW="80px">
                    <HStack spacing="2">
                      <IconButton icon={<Edit3 size={14} />} size="xs" bg="#e6eeff" color={BRAND} borderRadius="lg" _hover={{ bg: BRAND, color: 'white' }} aria-label="Edit" onClick={() => navigate(`/customers/edit/${row._id}`)} />
                      <IconButton icon={<Trash2 size={14} />} size="xs" bg="#fff1f1" color={ACCENT} borderRadius="lg" _hover={{ bg: ACCENT, color: 'white' }} aria-label="Delete" onClick={() => confirmDelete(row._id)} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter 
          showing={`${filteredCustomers.length > 0 ? startIndex + 1 : 0} to ${Math.min(startIndex + parseInt(entries), filteredCustomers.length)}`} 
          total={filteredCustomers.length}
          currentPage={currentPage}
          onPageChange={(p) => { if(p > 0 && p <= totalPages) setCurrentPage(p); }}
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

      <PageFooter />
    </Box>
  );
};

export default CustomerList;
