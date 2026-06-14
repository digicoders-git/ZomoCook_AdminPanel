import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  HStack,
  Spinner
} from '@chakra-ui/react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${apiUrl}/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      toast({
        title: 'Error fetching plans',
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
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await axios.delete(`${apiUrl}/plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          toast({ title: 'Plan deleted', status: 'success', duration: 2000, isClosable: true });
          fetchPlans();
        }
      } catch (err) {
        toast({
          title: 'Error deleting plan',
          description: err.response?.data?.message || err.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          Subscription Plans
        </Text>
        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="blue"
          onClick={() => navigate('/plans/add')}
        >
          Add Plan
        </Button>
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
                  <Th>Name</Th>
                  <Th>Price (₹)</Th>
                  <Th>Duration (Days)</Th>
                  <Th>Job Limit</Th>
                  <Th>Hiring Limit</Th>
                  <Th>Status</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {plans.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                      No plans found.
                    </Td>
                  </Tr>
                ) : (
                  plans.map((plan) => (
                    <Tr key={plan._id} _hover={{ bg: 'gray.50' }}>
                      <Td fontWeight="medium">
                        {plan.name}
                        {plan.isPopular && <Badge ml={2} colorScheme="purple">Popular</Badge>}
                        {plan.isBestValue && <Badge ml={2} colorScheme="orange">Best Value</Badge>}
                      </Td>
                      <Td>₹{plan.price}</Td>
                      <Td>{plan.durationDays} Days</Td>
                      <Td>{plan.jobPostLimit}</Td>
                      <Td>{plan.hiringLimit}</Td>
                      <Td>
                        <Badge colorScheme={plan.isActive ? 'green' : 'red'}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        <HStack justify="flex-end" spacing={2}>
                          <IconButton
                            icon={<Edit2 size={16} />}
                            aria-label="Edit Plan"
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => navigate(`/plans/edit/${plan._id}`)}
                          />
                          <IconButton
                            icon={<Trash2 size={16} />}
                            aria-label="Delete Plan"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(plan._id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PlanList;
