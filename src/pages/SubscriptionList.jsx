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
  HStack
} from '@chakra-ui/react';
import axios from 'axios';
import { CreditCard, Activity, AlertCircle, Clock } from 'lucide-react';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [stats, setStats] = useState({
    totalSold: 0,
    activeCount: 0,
    expiredCount: 0,
    expiringSoonCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          Subscription History
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card bg="white" shadow="sm" borderTop="4px solid" borderColor="blue.500">
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

        <Card bg="white" shadow="sm" borderTop="4px solid" borderColor="green.500">
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

        <Card bg="white" shadow="sm" borderTop="4px solid" borderColor="orange.400">
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

        <Card bg="white" shadow="sm" borderTop="4px solid" borderColor="red.500">
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
                </Tr>
              </Thead>
              <Tbody>
                {subscriptionsData.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8} color="gray.500">
                      No subscriptions found.
                    </Td>
                  </Tr>
                ) : (
                  subscriptionsData.map((sub) => {
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
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SubscriptionList;
