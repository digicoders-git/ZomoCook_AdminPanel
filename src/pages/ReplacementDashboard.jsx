import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Button, Input, Select,
  Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem,
  IconButton, Badge
} from '@chakra-ui/react';
import { Search, ChevronDown, MoreVertical, Plus, UserPlus, RefreshCw, X, Trash2, LayoutDashboard, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const ReplacementDashboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState('10');
  const [search, setSearch] = useState('');
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReplacements();
  }, []);

  const fetchReplacements = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/api/replacements`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        setReplacements(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching replacements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return { bg: '#fff7ed', color: '#ea580c' }; // Orange
      case 'In Progress': return { bg: '#f0fdf4', color: '#16a34a' }; // Green
      case 'Resolved': return { bg: '#f0fdfa', color: '#0d9488' }; // Teal
      case 'Rejected': return { bg: '#fef2f2', color: '#dc2626' }; // Red
      default: return { bg: 'gray.100', color: 'gray.800' };
    }
  };

  const getCategoryColor = (category) => {
    return category === 'Commercial' ? { bg: '#eff6ff', color: '#2563eb' } : { bg: '#f0fdf4', color: '#16a34a' };
  };

  const getPackageColor = (pkg) => {
    if (pkg.includes('Standard')) return '#f59e0b';
    if (pkg.includes('Basic')) return '#3b82f6';
    if (pkg.includes('Premium')) return '#9333ea';
    return 'gray.600';
  };

  return (
    <Box p="6" bg="#f8fafc" minH="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="#0f172a">Replacement Dashboard</Text>
          <HStack fontSize="sm" color="gray.500" mt="1" spacing="2">
            <Text cursor="pointer" _hover={{color: BRAND}}>Dashboard</Text>
            <ChevronDown size={14} transform="rotate(-90deg)" />
            <Text cursor="pointer" _hover={{color: BRAND}}>Job Management</Text>
            <ChevronDown size={14} transform="rotate(-90deg)" />
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
          { title: 'Total Requests', count: '24', icon: Briefcase, color: BRAND, bg: '#eff6ff', sub: 'All Time' },
          { title: 'Pending', count: '6', icon: LayoutDashboard, color: '#f59e0b', bg: '#fffbeb', sub: '25.00%' },
          { title: 'In Progress', count: '8', icon: RefreshCw, color: '#10b981', bg: '#ecfdf5', sub: '33.33%' },
          { title: 'Resolved', count: '10', icon: LayoutDashboard, color: '#8b5cf6', bg: '#f5f3ff', sub: '41.67%' }
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
              <Select size="sm" borderRadius="md" value="All">
                <option value="All">All</option>
                <option value="Commercial">Commercial</option>
                <option value="Domestic">Domestic</option>
              </Select>
            </Box>
            <Box flex="1.5" minW="200px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Customer Name / No.</Text>
              <Input size="sm" borderRadius="md" placeholder="Search by name or mobile..." bg="white" />
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Current Package</Text>
              <Select size="sm" borderRadius="md" value="All">
                <option value="All">All</option>
                <option value="Basic Plan">Basic Plan</option>
                <option value="Standard Plan">Standard Plan</option>
                <option value="Premium Plan">Premium Plan</option>
              </Select>
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Status</Text>
              <Select size="sm" borderRadius="md" value="All">
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb="1.5">Assign To (Lead Manager)</Text>
              <Select size="sm" borderRadius="md" value="All">
                <option value="All">All</option>
                <option value="Amit Verma">Amit Verma</option>
                <option value="Neha Singh">Neha Singh</option>
                <option value="Rohit Tiwari">Rohit Tiwari</option>
              </Select>
            </Box>
            <HStack spacing="2" mb="0.5">
              <Button size="sm" variant="outline" colorScheme="gray" borderRadius="md" px="6">Reset</Button>
              <Button size="sm" bg={BRAND} color="white" _hover={{bg: '#003785'}} borderRadius="md" px="6">Apply Filters</Button>
            </HStack>
          </Flex>
        </Box>

        {/* Table Controls */}
        <Flex justify="space-between" p="4" bg="white" align="center">
          <HStack spacing="2">
            <Text fontSize="sm" color="gray.600" fontWeight="600">Show</Text>
            <Select size="sm" w="70px" borderRadius="md" value={entries} onChange={(e) => setEntries(e.target.value)}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Select>
            <Text fontSize="sm" color="gray.600" fontWeight="600">entries</Text>
          </HStack>
          <HStack w="300px">
            <Box position="relative" w="full">
              <Input
                size="sm"
                pl="8"
                borderRadius="md"
                placeholder="Search in table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                <Th {...darkThStyle}>Current Cook Name</Th>
                <Th {...darkThStyle}>Reason</Th>
                <Th {...darkThStyle}>Status</Th>
                <Th {...darkThStyle}>Assign To</Th>
                <Th {...darkThStyle}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan="10" textAlign="center">Loading...</Td></Tr>
              ) : replacements.length === 0 ? (
                <Tr><Td colSpan="10" textAlign="center">No replacement requests found</Td></Tr>
              ) : replacements.map((row, index) => (
                <Tr key={row._id} _hover={{ bg: '#f8fafc' }}>
                  <Td {...customTdStyle}>{index + 1}</Td>
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
                  <Td {...customTdStyle}>{row.staffName}</Td>
                  <Td {...customTdStyle} maxW="150px">
                    <Text fontSize="xs" color="gray.600" isTruncated>{row.reason}</Text>
                  </Td>
                  <Td {...customTdStyle}>
                    <Badge bg={getStatusColor(row.status).bg} color={getStatusColor(row.status).color} px="2.5" py="1" borderRadius="full" fontSize="10px">
                      {row.status}
                    </Badge>
                  </Td>
                  <Td {...customTdStyle} fontWeight="700">{row.assignTo?.name || 'Unassigned'}</Td>
                  <Td {...customTdStyle}>
                    <Menu placement="bottom-end">
                      <MenuButton as={IconButton} icon={<MoreVertical size={16} />} size="sm" variant="ghost" />
                      <MenuList fontSize="sm" minW="150px" boxShadow="lg" p="1">
                        <MenuItem icon={<Plus size={14} />} _hover={{bg: '#f8fafc', color: BRAND}}>Create Leads</MenuItem>
                        <MenuItem icon={<UserPlus size={14} />} _hover={{bg: '#f8fafc', color: BRAND}}>Assign</MenuItem>
                        <MenuItem icon={<RefreshCw size={14} />} _hover={{bg: '#f8fafc', color: BRAND}}>Change Status</MenuItem>
                        <MenuItem icon={<X size={14} />} color="red.500" _hover={{bg: '#fef2f2'}}>Reject</MenuItem>
                        <MenuItem icon={<Trash2 size={14} />} color="red.500" _hover={{bg: '#fef2f2'}}>Delete</MenuItem>
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
            Showing 1 to 10 of 24 entries
          </Text>
          <HStack spacing="2">
            <Button size="sm" w="32px" h="32px" bg="white" border="1px solid #e2e8f0" disabled>&lt;</Button>
            <Button size="sm" w="32px" h="32px" bg={BRAND} color="white">1</Button>
            <Button size="sm" w="32px" h="32px" bg="white" border="1px solid #e2e8f0">2</Button>
            <Button size="sm" w="32px" h="32px" bg="white" border="1px solid #e2e8f0">3</Button>
            <Button size="sm" w="32px" h="32px" bg="white" border="1px solid #e2e8f0">&gt;</Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default ReplacementDashboard;
