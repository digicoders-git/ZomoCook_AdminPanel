

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td,
  IconButton, Tooltip, Spinner, useToast, Avatar, useDisclosure,
  Grid, GridItem, Select, Input, InputGroup, InputLeftElement, Button, Badge, Menu, MenuButton, MenuList, MenuItem,
  Collapse, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Divider
} from '@chakra-ui/react';
import { 
  Trash2, RefreshCcw, Search, Filter, ChevronUp, ChevronDown, 
  MessageSquare, MessageCircle, User, Users, Activity, Clock, 
  AlertCircle, CheckCircle, Lock, Eye, Phone, MoreVertical, Plus, Send, Download
} from 'lucide-react';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT,
  tableHeadStyle, thStyle, trHover, ConfirmationModal
} from '../components/ui';
import axios from 'axios';

const statusColors = {
  'New': 'yellow.400',
  'Assigned': 'blue.500',
  'In Progress': 'purple.500',
  'Waiting for Customer': 'orange.400',
  'Waiting for Candidate': 'blue.400',
  'Escalated': 'red.500',
  'Resolved': 'green.500',
  'Closed': 'gray.500'
};

const statusWorkflow = Object.keys(statusColors);

const QueryHistory = () => {
  const [queries, setQueries] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMobile, setFilterMobile] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterDateRange, setFilterDateRange] = useState('All Time'); // Changed default to All Time for better UX
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const toast = useToast();
  
  // Disclosures & Modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [selectedAssignUser, setSelectedAssignUser] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => { }, type: 'danger' });

  const filteredAssignUsers = systemUsers.filter(u => 
    u.name.toLowerCase().includes(assignSearch.toLowerCase()) || 
    (u.role?.name && u.role.name.toLowerCase().includes(assignSearch.toLowerCase()))
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      
      const [queriesRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/queries`, {
          params: { search: searchTerm },
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${apiUrl}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (queriesRes.data.success) {
        const mappedQueries = queriesRes.data.queries.map(q => ({
          ...q,
          category: q.category || (Math.random() > 0.5 ? 'Candidate' : 'Customer'),
          profileInitials: q.name ? q.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
          profileBg: q.category === 'Customer' ? 'green.500' : 'blue.500',
          statusMock: q.status || 'New',
          assignedToName: q.assignedToName || (q.assignedTo ? q.assignedTo.name : 'Unassigned'),
          assignedToRole: q.assignedToRole || (q.assignedTo ? (q.assignedTo.role?.name || 'Staff') : ''),
        }));
        setQueries(mappedQueries);
      }

      if (usersRes.data.success) {
        setSystemUsers(usersRes.data.users);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    onViewOpen();
  };

  const handleOpenAssign = (query) => {
    setSelectedQuery(query);
    setSelectedAssignUser(query.assignedTo?._id || '');
    setAssignSearch('');
    onAssignOpen();
  };

  const submitAssign = async () => {
    if (!selectedAssignUser) {
      toast({ title: 'Please select a user', status: 'warning' });
      return;
    }
    setIsAssigning(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      
      // Update query assignment in backend
      await axios.put(`${apiUrl}/queries/${selectedQuery._id}`, {
        assignedTo: selectedAssignUser,
        status: 'Assigned' // Automatically update status
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const assignedUserObj = systemUsers.find(u => u._id === selectedAssignUser);

      // Update local state
      setQueries(prev => prev.map(q => {
        if (q._id === selectedQuery._id) {
          return {
            ...q,
            assignedTo: assignedUserObj,
            assignedToName: assignedUserObj.name,
            assignedToRole: assignedUserObj.role?.name || 'Staff',
            statusMock: 'Assigned',
            status: 'Assigned'
          };
        }
        return q;
      }));

      toast({ title: 'Query Assigned Successfully', status: 'success' });
      onAssignClose();
    } catch (error) {
      toast({ title: 'Error assigning query', status: 'error' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Query?',
      description: 'Are you sure you want to delete this query history?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          await axios.delete(`${apiUrl}/queries/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setQueries(prev => prev.filter(q => q._id !== id));
          toast({ title: 'Deleted', status: 'success' });
        } catch (error) {
          toast({ title: 'Error', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const handleResetFilters = () => {
    setFilterCategory('All');
    setFilterMobile('');
    setFilterStatus('All Status');
    setFilterDateRange('All Time');
    setFilterFromDate('');
    setFilterToDate('');
    setSearchTerm('');
  };

  // Filter Logic
  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      // 1. Category Filter
      if (filterCategory !== 'All' && q.category !== filterCategory) return false;
      
      // 2. Mobile Filter
      if (filterMobile && !q.phone?.includes(filterMobile)) return false;
      
      // 3. Status Filter
      if (filterStatus !== 'All Status' && q.statusMock !== filterStatus) return false;
      
      // 4. Date Range Filter
      if (filterDateRange !== 'All Time') {
        const queryDate = new Date(q.createdAt);
        const now = new Date();
        if (filterDateRange === 'This Month') {
          if (queryDate.getMonth() !== now.getMonth() || queryDate.getFullYear() !== now.getFullYear()) return false;
        } else if (filterDateRange === 'Last Month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (queryDate.getMonth() !== lastMonth.getMonth() || queryDate.getFullYear() !== lastMonth.getFullYear()) return false;
        } else if (filterDateRange === 'Custom') {
          if (filterFromDate && queryDate < new Date(filterFromDate)) return false;
          // Set toDate to end of the day
          const toDateObj = filterToDate ? new Date(filterToDate) : null;
          if (toDateObj) {
            toDateObj.setHours(23, 59, 59, 999);
            if (queryDate > toDateObj) return false;
          }
        }
      }

      return true;
    });
  }, [queries, filterCategory, filterMobile, filterStatus, filterDateRange, filterFromDate, filterToDate]);


  const StatusDot = ({ status }) => (
    <Box w="6px" h="6px" borderRadius="full" bg={statusColors[status] || 'gray.500'} mr="2" display="inline-block" />
  );

  const getStatusCount = (statusName) => filteredQueries.filter(q => (q.statusMock === statusName || q.status === statusName)).length;
  
  const dynamicSummaryStats = [
    { id: 'total', label: 'Total Queries', value: filteredQueries.length, color: 'blue', icon: MessageSquare, bg: '#e0e7ff' },
    { id: 'new', label: 'New', value: getStatusCount('New'), color: 'yellow', icon: MessageCircle, bg: '#fef08a' },
    { id: 'assigned', label: 'Assigned', value: getStatusCount('Assigned'), color: 'cyan', icon: User, bg: '#cffafe' },
    { id: 'in_progress', label: 'In Progress', value: getStatusCount('In Progress'), color: 'purple', icon: Activity, bg: '#f3e8ff' },
    { id: 'waiting', label: 'Waiting', value: getStatusCount('Waiting for Customer') + getStatusCount('Waiting for Candidate'), color: 'orange', icon: Clock, bg: '#ffedd5' },
    { id: 'escalated', label: 'Escalated', value: getStatusCount('Escalated'), color: 'red', icon: AlertCircle, bg: '#fee2e2' },
    { id: 'resolved', label: 'Resolved', value: getStatusCount('Resolved'), color: 'green', icon: CheckCircle, bg: '#dcfce7' },
    { id: 'closed', label: 'Closed', value: getStatusCount('Closed'), color: 'gray', icon: Lock, bg: '#f1f5f9' },
  ];

  const dynamicQuickActions = [
    { label: 'My Open Queries', count: filteredQueries.filter(q => q.statusMock !== 'Closed' && q.statusMock !== 'Resolved').length, color: 'blue' },
    { label: 'Unassigned Queries', count: getStatusCount('New'), color: 'blue' },
    { label: 'Escalated Queries', count: getStatusCount('Escalated'), color: 'red' },
    { label: 'Following Today', count: 0, color: 'green' },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Query Management"
        breadcrumb="Query History"
        actions={[
          <Button key="export" variant="outline" size="sm" leftIcon={<Download size={16} />} borderColor="#dde6f5" color="#004aad">
            Export
          </Button>,
          <Button key="add" size="sm" leftIcon={<Plus size={16} />} bg="#004aad" color="white" _hover={{ bg: '#003d91' }}>
            Add Query
          </Button>
        ]}
      />

      <Box w="100%">
          {/* Filters Section */}
          <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" p="5" mb="6" boxShadow="sm">
            <Flex justify="space-between" align="center" mb="4">
              <HStack color="#004aad">
                <Filter size={18} />
                <Text fontSize="sm" fontWeight="700">Filter Queries</Text>
              </HStack>
              <Button size="xs" variant="ghost" onClick={() => setShowFilters(!showFilters)} rightIcon={showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />} color="#64748b">
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Flex>
            <Collapse in={showFilters} animateOpacity>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(5, 1fr)' }} gap="4" mb="4">
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="#64748b" mb="1.5">Category</Text>
                  <Select size="sm" borderRadius="lg" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Candidate">Candidate</option>
                    <option value="Customer">Customer</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="#64748b" mb="1.5">Search by Mobile No.</Text>
                  <Input size="sm" borderRadius="lg" placeholder="Enter mobile number" value={filterMobile} onChange={(e) => setFilterMobile(e.target.value)} />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="#64748b" mb="1.5">Status</Text>
                  <Select size="sm" borderRadius="lg" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="All Status">All Status</option>
                    {statusWorkflow.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="#64748b" mb="1.5">Date Range</Text>
                  <Select size="sm" borderRadius="lg" value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)}>
                    <option value="All Time">All Time</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="Custom">Custom</option>
                  </Select>
                </Box>
                <HStack align="flex-end" spacing="2">
                  <Box flex="1">
                    <Text fontSize="xs" fontWeight="600" color={filterDateRange === 'Custom' ? "#64748b" : "#cbd5e1"} mb="1.5">From Date</Text>
                    <Input size="sm" borderRadius="lg" type="date" disabled={filterDateRange !== 'Custom'} value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="xs" fontWeight="600" color={filterDateRange === 'Custom' ? "#64748b" : "#cbd5e1"} mb="1.5">To Date</Text>
                    <Input size="sm" borderRadius="lg" type="date" disabled={filterDateRange !== 'Custom'} value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)} />
                  </Box>
                </HStack>
              </Grid>
              <HStack>
                {/* Note: Filters are applied automatically via useMemo, but we can keep Search button to trigger API search if needed */}
                <Button size="sm" bg="#004aad" color="white" leftIcon={<Search size={14} />} px="6" onClick={fetchData}>Refresh Data</Button>
                <Button size="sm" variant="outline" leftIcon={<RefreshCcw size={14} />} onClick={handleResetFilters}>Reset</Button>
              </HStack>
            </Collapse>
          </Box>

          {/* Summary Cards */}
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)' }} gap="4" mb="6">
            {dynamicSummaryStats.map(stat => (
              <Box key={stat.id} bg="white" p="4" borderRadius="2xl" border="1px solid" borderColor={`${stat.color}.100`} textAlign="center" boxShadow="0 4px 12px rgba(0,0,0,0.02)"
                position="relative" overflow="hidden"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 20px rgba(0,0,0,0.06)', borderColor: `${stat.color}.200` }}>
                <Box position="absolute" top="-10px" right="-10px" opacity="0.04" transform="scale(2)">
                  <stat.icon size={64} color={stat.color} />
                </Box>
                <Flex justify="center" mb="3" position="relative" zIndex="1">
                  <Flex align="center" justify="center" w="40px" h="40px" borderRadius="xl" bg={`linear-gradient(135deg, ${stat.bg}, white)`} color={`${stat.color}.600`} boxShadow="sm" border="1px solid" borderColor="white">
                    <stat.icon size={18} />
                  </Flex>
                </Flex>
                <Text fontSize="10px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" mb="1" position="relative" zIndex="1">{stat.label}</Text>
                <Text fontSize="2xl" fontWeight="900" color="#1e293b" position="relative" zIndex="1">{stat.value}</Text>
              </Box>
            ))}
          </Grid>

          {/* Table */}
          <TableCard>
            <Box overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
              {isLoading ? (
                <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
              ) : (
                <Table variant="simple" size="sm" minW="1000px">
                  <Thead {...tableHeadStyle}>
                    <Tr>
                      <Th {...thStyle} whiteSpace="nowrap">SR. NO.</Th>
                      <Th {...thStyle} whiteSpace="nowrap">CATEGORY</Th>
                      <Th {...thStyle} whiteSpace="nowrap">PROFILE</Th>
                      <Th {...thStyle} whiteSpace="nowrap">CANDIDATE / CUSTOMER INFO</Th>
                      <Th {...thStyle} whiteSpace="nowrap">MOBILE NO.</Th>
                      <Th {...thStyle} whiteSpace="nowrap">MESSAGE</Th>
                      <Th {...thStyle} whiteSpace="nowrap">STATUS</Th>
                      <Th {...thStyle} whiteSpace="nowrap">ASSIGNED TO</Th>
                      <Th {...thStyle} whiteSpace="nowrap">DATE & TIME</Th>
                      <Th {...thStyle} whiteSpace="nowrap" textAlign="center">ACTION</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredQueries.map((q, i) => (
                      <Tr key={q._id} {...trHover}>
                        <Td py="4" color="#1e293b" fontSize="xs" fontWeight="700">{i + 1}</Td>
                        <Td py="4">
                          <Badge 
                            bg="transparent" 
                            color={q.category === 'Customer' ? 'green.500' : 'blue.500'} 
                            textTransform="none" 
                            fontSize="xs" 
                            fontWeight="600"
                          >
                            {q.category}
                          </Badge>
                        </Td>
                        <Td py="4">
                          <Avatar size="sm" name={q.name} bg={q.profileBg} color="white" fontWeight="bold" />
                        </Td>
                        <Td py="4">
                          <VStack align="start" spacing="0">
                            <Text fontSize="xs" color="#1e293b" fontWeight="700" whiteSpace="nowrap">{q.name}</Text>
                            <Text fontSize="10px" color="#64748b" whiteSpace="nowrap">{q.email}</Text>
                          </VStack>
                        </Td>
                        <Td py="4">
                          <Text fontSize="xs" color="#475569" fontWeight="500">{q.phone}</Text>
                        </Td>
                        <Td py="4" minW="150px">
                          <Text color="#475569" fontSize="xs" noOfLines={1} maxW="150px">
                            {q.message}
                          </Text>
                        </Td>
                        <Td py="4" whiteSpace="nowrap">
                          <Flex align="center">
                            <StatusDot status={q.statusMock} />
                            <Text fontSize="xs" fontWeight="600" color={statusColors[q.statusMock] || 'gray.600'}>
                              {q.statusMock}
                            </Text>
                          </Flex>
                        </Td>
                        <Td py="4">
                          <VStack align="start" spacing="0">
                            <Text fontSize="xs" color="#1e293b" fontWeight="700" whiteSpace="nowrap">{q.assignedToName}</Text>
                            <Text fontSize="10px" color="#64748b" whiteSpace="nowrap">{q.assignedToRole}</Text>
                          </VStack>
                        </Td>
                        <Td py="4" color="#64748b" fontSize="xs" whiteSpace="nowrap">
                          <Text fontWeight="600" color="#475569">
                            {new Date(q.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Text>
                          <Text fontSize="10px">
                            {new Date(q.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </Text>
                        </Td>
                        <Td py="4" textAlign="center">
                          <HStack spacing="1" justify="center">
                            <Tooltip label="View">
                              <IconButton onClick={() => handleViewQuery(q)} icon={<Eye size={14} />} size="xs" variant="ghost" color="#004aad" aria-label="view" />
                            </Tooltip>
                            <Tooltip label="Call">
                              <IconButton as="a" href={`tel:${q.phone}`} icon={<Phone size={14} />} size="xs" variant="ghost" color="green.500" aria-label="call" />
                            </Tooltip>
                            <Tooltip label="WhatsApp">
                              <IconButton as="a" href={`https://wa.me/${q.phone}?text=Hi%20${q.name},%20regarding%20your%20query`} target="_blank" icon={<MessageCircle size={14} />} size="xs" variant="ghost" color="green.400" aria-label="whatsapp" />
                            </Tooltip>
                            <Menu placement="bottom-end">
                              <MenuButton as={IconButton} icon={<MoreVertical size={14} />} size="xs" variant="ghost" color="#64748b" />
                              <MenuList minW="120px" fontSize="sm" boxShadow="lg" p="1" borderRadius="xl">
                                <MenuItem borderRadius="md" color="#1e293b" _hover={{ bg: '#f1f5f9' }} onClick={() => handleOpenAssign(q)}>Assign to User</MenuItem>
                                <MenuItem borderRadius="md" color="red.500" _hover={{ bg: 'red.50' }} onClick={() => handleDelete(q._id)}>Delete</MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                    {filteredQueries.length === 0 && <Tr><Td colSpan={10} py="10" textAlign="center" color="#94a3b8">No queries found.</Td></Tr>}
                  </Tbody>
                </Table>
              )}
            </Box>
            <TableFooter showing={`1 to ${filteredQueries.length > 10 ? 10 : filteredQueries.length}`} total={filteredQueries.length} />
          </TableCard>
      </Box>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        type={confirmConfig.type}
        confirmColor={confirmConfig.type === 'danger' ? ACCENT : BRAND}
      />

      {/* View Query Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden" boxShadow="xl">
          <Box bg="#004aad" color="white" px="6" py="4">
            <Text fontWeight="bold" fontSize="lg">Query Details</Text>
            <ModalCloseButton color="white" top="3" right="4" />
          </Box>
          <ModalBody p="6">
            {selectedQuery && (
              <VStack align="stretch" spacing="4">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="md" name={selectedQuery.name} bg={selectedQuery.profileBg} color="white" />
                    <VStack align="start" spacing="0">
                      <Text fontWeight="bold" color="#1e293b">{selectedQuery.name}</Text>
                      <Text fontSize="sm" color="#64748b">{selectedQuery.email}</Text>
                    </VStack>
                  </HStack>
                  <Badge bg={selectedQuery.category === 'Customer' ? 'green.100' : 'blue.100'} color={selectedQuery.category === 'Customer' ? 'green.600' : 'blue.600'} px="3" py="1" borderRadius="full">
                    {selectedQuery.category}
                  </Badge>
                </Flex>
                
                <Divider borderColor="#e8edf5" />
                
                <Grid templateColumns="1fr 1fr" gap="4">
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="#94a3b8" textTransform="uppercase" mb="1">Phone</Text>
                    <Text fontSize="sm" fontWeight="500" color="#1e293b">{selectedQuery.phone}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="#94a3b8" textTransform="uppercase" mb="1">Status</Text>
                    <Flex align="center">
                      <StatusDot status={selectedQuery.statusMock} />
                      <Text fontSize="sm" fontWeight="600" color={statusColors[selectedQuery.statusMock] || 'gray.600'}>
                        {selectedQuery.statusMock}
                      </Text>
                    </Flex>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="#94a3b8" textTransform="uppercase" mb="1">Assigned To</Text>
                    <Text fontSize="sm" fontWeight="500" color="#1e293b">{selectedQuery.assignedToName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="#94a3b8" textTransform="uppercase" mb="1">Date & Time</Text>
                    <Text fontSize="sm" fontWeight="500" color="#1e293b">
                      {new Date(selectedQuery.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Text>
                  </Box>
                </Grid>

                <Box bg="#f8faff" p="4" borderRadius="lg" border="1px solid #dde6f5">
                  <Text fontSize="xs" fontWeight="600" color="#004aad" textTransform="uppercase" mb="2">Message Content</Text>
                  <Text fontSize="sm" color="#475569" whiteSpace="pre-wrap">
                    {selectedQuery.message}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid #e8edf5" bg="#fafbfc">
            <Button variant="outline" size="sm" onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign User Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader color="#1e293b">Assign Query to User</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontSize="sm" color="#64748b" mb="4">
              Select a system user (from roles & permissions) to assign this query to.
            </Text>
            
            <InputGroup mb="4">
              <InputLeftElement pointerEvents="none">
                <Search size={14} color="#64748b" />
              </InputLeftElement>
              <Input 
                placeholder="Search by name or role..." 
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                bg="#f8faff"
                borderColor="#dde6f5"
                _focus={{ borderColor: '#004aad', boxShadow: 'none' }}
              />
            </InputGroup>

            <VStack 
              align="stretch" 
              maxH="300px" 
              overflowY="auto" 
              spacing="2"
              sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' } }}
            >
              {filteredAssignUsers.length > 0 ? filteredAssignUsers.map(user => (
                <Flex 
                  key={user._id} 
                  p="3" 
                  borderRadius="md" 
                  border="1px solid"
                  borderColor={selectedAssignUser === user._id ? '#004aad' : '#e8edf5'}
                  bg={selectedAssignUser === user._id ? '#eff6ff' : 'white'}
                  cursor="pointer"
                  onClick={() => setSelectedAssignUser(user._id)}
                  _hover={{ bg: selectedAssignUser === user._id ? '#eff6ff' : '#f8faff' }}
                  align="center"
                  justify="space-between"
                  transition="all 0.2s"
                >
                  <HStack>
                    <Avatar size="sm" name={user.name} bg="#004aad" color="white" />
                    <VStack align="start" spacing="0">
                      <Text fontSize="sm" fontWeight="600" color="#1e293b">{user.name}</Text>
                      <Text fontSize="xs" color="#64748b">{user.role?.name || 'Staff'}</Text>
                    </VStack>
                  </HStack>
                  {selectedAssignUser === user._id && <CheckCircle size={18} color="#004aad" />}
                </Flex>
              )) : (
                <Text fontSize="sm" color="#94a3b8" textAlign="center" py="4">No users found.</Text>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onAssignClose} mr={3} size="sm">Cancel</Button>
            <Button 
              colorScheme="blue" 
              bg="#004aad" 
              _hover={{ bg: '#003d91' }}
              onClick={submitAssign} 
              isLoading={isAssigning}
              size="sm"
            >
              Assign User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default QueryHistory;
