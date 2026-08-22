import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Avatar,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button
} from '@chakra-ui/react';
import axios from 'axios';
import { CreditCard, Activity, AlertCircle, Clock, Eye } from 'lucide-react';

const SubscriptionList = () => {
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [stats, setStats] = useState({
    totalSold: 0,
    activeCount: 0,
    expiredCount: 0,
    expiringSoonCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${apiUrl}/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSubscriptionsData(res.data.subscriptions);
        setStats(res.data.stats);
      }
    } catch (err) {
      toast({
        title: 'Error fetching subscriptions',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleViewHistory = (user) => {
    if (!user || !user._id) return;
    const history = subscriptionsData.filter(sub => sub.user?._id === user._id);
    setSelectedUser(user);
    setUserHistory(history);
    setIsModalOpen(true);
  };

  const userStats = React.useMemo(() => {
    let total = userHistory.length;
    let active = 0;
    let expired = 0;
    let expiringSoon = 0;

    userHistory.forEach(sub => {
      if (sub.status === 'Active') {
        active++;
        if (sub.isExpiringSoon) {
          expiringSoon++;
        }
      } else {
        expired++;
      }
    });

    return { total, active, expired, expiringSoon };
  }, [userHistory]);

  const filteredSubscriptions = React.useMemo(() => {
    return subscriptionsData.filter(sub => {
      if (filterType === 'active') {
        return sub.status === 'Active';
      }
      if (filterType === 'expiring') {
        return sub.status === 'Active' && sub.isExpiringSoon;
      }
      if (filterType === 'expired') {
        return sub.status === 'Expired' || sub.status === 'Cancelled';
      }
      return true; // all
    });
  }, [subscriptionsData, filterType]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          Subscription History
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card 
          bg={filterType === 'all' ? "blue.50" : "white"} 
          shadow={filterType === 'all' ? "md" : "sm"} 
          borderTop="4px solid" 
          borderColor="blue.500"
          cursor="pointer"
          onClick={() => setFilterType('all')}
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color="gray.500" fontSize="sm">Total Plans Sold</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{stats.totalSold}</StatNumber>
                </Box>
                <Box p={3} bg="blue.50" borderRadius="md" color="blue.500">
                  <CreditCard size={24} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card 
          bg={filterType === 'active' ? "green.50" : "white"} 
          shadow={filterType === 'active' ? "md" : "sm"} 
          borderTop="4px solid" 
          borderColor="green.500"
          cursor="pointer"
          onClick={() => setFilterType('active')}
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color="gray.500" fontSize="sm">Active Plans</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{stats.activeCount}</StatNumber>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md" color="green.500">
                  <Activity size={24} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card 
          bg={filterType === 'expiring' ? "orange.50" : "white"} 
          shadow={filterType === 'expiring' ? "md" : "sm"} 
          borderTop="4px solid" 
          borderColor="orange.400"
          cursor="pointer"
          onClick={() => setFilterType('expiring')}
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color="gray.500" fontSize="sm">Expiring Soon</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{stats.expiringSoonCount}</StatNumber>
                </Box>
                <Box p={3} bg="orange.50" borderRadius="md" color="orange.400">
                  <Clock size={24} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card 
          bg={filterType === 'expired' ? "red.50" : "white"} 
          shadow={filterType === 'expired' ? "md" : "sm"} 
          borderTop="4px solid" 
          borderColor="red.500"
          cursor="pointer"
          onClick={() => setFilterType('expired')}
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color="gray.500" fontSize="sm">Expired Plans</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{stats.expiredCount}</StatNumber>
                </Box>
                <Box p={3} bg="red.50" borderRadius="md" color="red.500">
                  <AlertCircle size={24} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filter Status & Reset */}
      <Flex justify="space-between" align="center" mb={4} px={1}>
        <Text fontSize="sm" fontWeight="bold" color="gray.600">
          Showing: {
            filterType === 'all' ? 'All Subscriptions' :
            filterType === 'active' ? 'Active Subscriptions' :
            filterType === 'expiring' ? 'Expiring Soon Subscriptions' :
            'Expired & Cancelled Subscriptions'
          } ({filteredSubscriptions.length})
        </Text>
        {filterType !== 'all' && (
          <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => setFilterType('all')}>
            Clear Filter / Show All
          </Button>
        )}
      </Flex>

      <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
        {isLoading ? (
          <Flex justify="center" p={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>User</Th>
                  <Th>Plan Details</Th>
                  <Th>Amount</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSubscriptions.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                      No matching subscriptions found.
                    </Td>
                  </Tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const user = sub.user || {};
                    const plan = sub.plan || {};

                    return (
                      <Tr key={sub._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={user.name} src={user.profilePic ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${user.profilePic}` : ''} />
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.800">{user.name || 'Unknown'}</Text>
                              <Text fontSize="xs" color="gray.500">{user.phone || 'N/A'}</Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontWeight="medium" fontSize="sm">{plan.name || 'Unknown Plan'}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {plan.durationDays} Days • Job Limit: {plan.jobPostLimit}
                          </Text>
                        </Td>
                        <Td fontWeight="bold" color="green.600">₹{sub.amountPaid}</Td>
                        <Td fontSize="sm">{new Date(sub.startDate).toLocaleDateString()}</Td>
                        <Td fontSize="sm">
                          {new Date(sub.endDate).toLocaleDateString()}
                          {sub.isExpiringSoon && sub.status === 'Active' && (
                            <Text fontSize="xs" color="orange.500" fontWeight="bold">Expiring Soon</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={sub.status === 'Active' ? 'green' : (sub.status === 'Cancelled' ? 'gray' : 'red')}>
                            {sub.status}
                          </Badge>
                        </Td>
                        <Td>
                          <IconButton
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            icon={<Eye size={16} />}
                            aria-label="View user subscription history"
                            onClick={() => handleViewHistory(user)}
                          />
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Subscription Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="4xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader borderBottomWidth="1px">
            <Flex align="center" gap={3}>
              <Avatar size="sm" name={selectedUser?.name} src={selectedUser?.profilePic ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${selectedUser.profilePic}` : ''} />
              <Box>
                <Text fontWeight="bold" fontSize="md">{selectedUser?.name || 'User'}'s Subscription History</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">{selectedUser?.phone || 'N/A'}</Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {/* Stats row */}
            <SimpleGrid columns={{ base: 1, sm: 4 }} spacing={4} mb={6}>
              <Card bg="blue.50" shadow="none" border="1px solid" borderColor="blue.100">
                <CardBody p={4}>
                  <Text fontSize="xs" color="blue.600" fontWeight="semibold">Total Purchased</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.800">{userStats.total}</Text>
                </CardBody>
              </Card>
              <Card bg="green.50" shadow="none" border="1px solid" borderColor="green.100">
                <CardBody p={4}>
                  <Text fontSize="xs" color="green.600" fontWeight="semibold">Active Plans</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.800">{userStats.active}</Text>
                </CardBody>
              </Card>
              <Card bg="orange.50" shadow="none" border="1px solid" borderColor="orange.100">
                <CardBody p={4}>
                  <Text fontSize="xs" color="orange.600" fontWeight="semibold">Expiring Soon</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.800">{userStats.expiringSoon}</Text>
                </CardBody>
              </Card>
              <Card bg="red.50" shadow="none" border="1px solid" borderColor="red.100">
                <CardBody p={4}>
                  <Text fontSize="xs" color="red.600" fontWeight="semibold">Expired / Cancelled</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="red.800">{userStats.expired}</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* List of plans */}
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th py={3}>Plan Name</Th>
                    <Th py={3}>Amount</Th>
                    <Th py={3}>Start Date & Time</Th>
                    <Th py={3}>End Date & Time</Th>
                    <Th py={3}>Payment Details</Th>
                    <Th py={3}>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {userHistory.map((sub) => {
                    const plan = sub.plan || {};
                    const formatDateTime = (dateStr) => {
                      if (!dateStr) return 'N/A';
                      try {
                        const date = new Date(dateStr);
                        return date.toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        });
                      } catch (e) {
                        return 'N/A';
                      }
                    };

                    return (
                      <Tr key={sub._id}>
                        <Td fontWeight="semibold">{plan.name || 'Unknown Plan'}</Td>
                        <Td fontWeight="bold" color="green.600">₹{sub.amountPaid}</Td>
                        <Td>{formatDateTime(sub.startDate)}</Td>
                        <Td>{formatDateTime(sub.endDate)}</Td>
                        <Td fontSize="xs" color="gray.600">
                          {(sub.paymentId || sub.cfPaymentId || sub.razorpayPaymentId) ? (
                            <Box>
                              <Text>Pay ID: <Text as="span" fontFamily="mono" color="blue.600">{sub.paymentId || sub.cfPaymentId || sub.razorpayPaymentId}</Text></Text>
                              {(sub.orderId || sub.cfOrderId || sub.razorpayOrderId) && (
                                <Text>Order ID: <Text as="span" fontFamily="mono" color="gray.500">{sub.orderId || sub.cfOrderId || sub.razorpayOrderId}</Text></Text>
                              )}
                            </Box>
                          ) : (
                            <Text color="gray.400">Manual / Direct</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={sub.status === 'Active' ? 'green' : (sub.status === 'Cancelled' ? 'gray' : 'red')}>
                            {sub.status}
                          </Badge>
                          {sub.isExpiringSoon && sub.status === 'Active' && (
                            <Text fontSize="10px" color="orange.500" fontWeight="bold" mt={0.5}>Expiring Soon</Text>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </ModalBody>
          <ModalFooter borderTopWidth="1px">
            <Button colorScheme="blue" onClick={() => setIsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubscriptionList;
