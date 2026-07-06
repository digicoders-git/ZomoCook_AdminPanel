import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton,
  useToast, HStack, Spinner, Input, Select, Textarea, VStack, Grid, GridItem,
  Icon, Switch, useColorModeValue
} from '@chakra-ui/react';
import { Plus, Edit2, Trash2, Info, Send, Crown, Diamond, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const [feeForm, setFeeForm] = useState({
    amount: '',
    status: 'Active',
    description: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const [plansRes, settingsRes] = await Promise.all([
        axios.get(`${apiUrl}/plans/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (plansRes.data.success) {
        setPlans(plansRes.data.data);
      }
      
      if (settingsRes.data.success) {
        const s = settingsRes.data.settings || {};
        setSettings(s);
        setFeeForm({
          amount: s.jobPostFee?.toString() || '299',
          status: s.jobPostFeeStatus !== false ? 'Active' : 'Inactive',
          description: s.jobPostFeeDescription || 'Hiring processing fee is a one-time amount charged from customers while posting a job. This amount is non-refundable.'
        });
      }
    } catch (err) {
      toast({
        title: 'Error fetching data',
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
    fetchData();
  }, []);

  const handleUpdateFee = async () => {
    setIsUpdatingFee(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const updateData = {
        jobPostFee: Number(feeForm.amount),
        jobPostFeeStatus: feeForm.status === 'Active',
        jobPostFeeDescription: feeForm.description
      };

      const res = await axios.put(`${apiUrl}/settings`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast({ title: 'Fee updated successfully', status: 'success', duration: 2000, isClosable: true });
        fetchData();
      }
    } catch (err) {
      toast({
        title: 'Error updating fee',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('adminToken');
          const apiUrl = import.meta.env.VITE_API_URL;
          const res = await axios.delete(`${apiUrl}/plans/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            toast({ title: 'Package deleted', status: 'success', duration: 2000, isClosable: true });
            fetchData();
          }
        } catch (err) {
          toast({
            title: 'Error deleting package',
            description: err.response?.data?.message || err.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    });
  };

  const togglePlanStatus = async (plan) => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(`${apiUrl}/plans/${plan._id}`, { isActive: !plan.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      toast({ title: 'Status updated', status: 'success', duration: 2000 });
    } catch (err) {
      toast({ title: 'Error updating status', status: 'error', duration: 2000 });
    }
  };

  const getPlanIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('premium')) return { icon: Crown, color: '#f59e0b', bg: '#fef3c7' };
    if (n.includes('standard')) return { icon: Diamond, color: '#3b82f6', bg: '#eff6ff' };
    return { icon: Send, color: '#10b981', bg: '#ecfdf5' };
  };

  const getBadgeColor = (name) => {
    const n = name.toLowerCase();
    if (n.includes('premium')) return 'purple';
    if (n.includes('standard')) return 'orange';
    return 'green';
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={2}>
          <Text fontSize="2xl" fontWeight="bold" color="#1e293b">
            Subscription Plans
          </Text>
          <Text fontSize="sm" color="#64748b" mt="1">/ Subscription Plans</Text>
        </HStack>
      </Flex>

      {/* Tabs / Navigation */}
      <Flex borderBottom="1px solid #e2e8f0" mb="6">
        <Box borderBottom="2px solid #2563eb" pb="3" px="4" cursor="pointer">
          <Text color="#2563eb" fontWeight="600" fontSize="sm">Hiring Processing Fee</Text>
        </Box>
        <Box pb="3" px="4" cursor="pointer">
          <Text color="#64748b" fontWeight="600" fontSize="sm">Service Packages</Text>
        </Box>
        <Box ml="auto" pb="2">
          <Button size="sm" colorScheme="blue" bg="#2563eb" onClick={() => {
            const el = document.getElementById('fee-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>
            + Add / Update Fee
          </Button>
        </Box>
      </Flex>

      {/* Info Alert */}
      <Flex bg="#f8fafc" border="1px solid #e2e8f0" p="3" borderRadius="md" mb="6" align="center">
        <Icon as={Info} color="#3b82f6" mr="2" size={18} />
        <Text fontSize="sm" color="#475569">Manage the hiring processing fee. This fee will be applicable for all new job postings.</Text>
      </Flex>

      {/* Fee Section */}
      <Box id="fee-section" bg="white" p="6" borderRadius="xl" boxShadow="sm" border="1px solid #e2e8f0" mb="10">
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 2fr' }} gap="8">
          <GridItem>
            <HStack align="start" spacing="4">
              <Flex align="center" justify="center" w="12" h="12" bg="#f3e8ff" borderRadius="full">
                <Icon as={Receipt} color="#a855f7" size={24} />
              </Flex>
              <VStack align="start" spacing="1">
                <Text fontWeight="bold" color="#1e293b" fontSize="md">Hiring Processing Fee</Text>
                <HStack>
                  <Text fontSize="2xl" fontWeight="800" color="#6366f1">₹{feeForm.amount || 0}</Text>
                  <Badge colorScheme={feeForm.status === 'Active' ? 'green' : 'red'} px="2" py="0.5" borderRadius="md">
                    {feeForm.status}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="#64748b" mt="2" lineHeight="tall">
                  This is a one-time non-refundable fee charged from customers while posting a job on the platform.
                </Text>
              </VStack>
            </HStack>
          </GridItem>
          
          <GridItem>
            <VStack align="start" spacing="4" w="100%">
              <Box w="100%">
                <Text fontSize="xs" fontWeight="bold" color="#1e293b" mb="1">Fee Amount (₹) *</Text>
                <Input 
                  value={feeForm.amount} 
                  onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                  size="sm" 
                  borderRadius="md"
                />
              </Box>
              <Box w="100%">
                <Text fontSize="xs" fontWeight="bold" color="#1e293b" mb="1">Status</Text>
                <Select 
                  value={feeForm.status} 
                  onChange={(e) => setFeeForm({...feeForm, status: e.target.value})}
                  size="sm" 
                  borderRadius="md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </Box>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing="4" w="100%">
              <Box w="100%">
                <Text fontSize="xs" fontWeight="bold" color="#1e293b" mb="1">Description</Text>
                <Textarea 
                  value={feeForm.description} 
                  onChange={(e) => setFeeForm({...feeForm, description: e.target.value})}
                  size="sm" 
                  borderRadius="md" 
                  rows={4}
                  resize="none"
                />
              </Box>
              
              <Flex w="100%" justify="space-between" align="flex-end">
                <HStack spacing="8">
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="#1e293b">Last Updated By</Text>
                    <Text fontSize="xs" color="#64748b">Admin User</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="#1e293b">Last Updated On</Text>
                    <Text fontSize="xs" color="#64748b">
                      {new Date(settings?.updatedAt || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Text>
                  </Box>
                </HStack>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  bg="#2563eb" 
                  onClick={handleUpdateFee}
                  isLoading={isUpdatingFee}
                >
                  Update Fee
                </Button>
              </Flex>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {/* Service Packages Section */}
      <Flex justify="space-between" align="center" mb="4">
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="#1e293b" mb="1">Service Packages</Text>
          <Text fontSize="sm" color="#64748b">Create and manage service packages shown to customers during hire process.</Text>
        </Box>
        <Button size="sm" colorScheme="blue" bg="#2563eb" leftIcon={<Plus size={16} />} onClick={() => navigate('/plans/add')}>
          Add Package
        </Button>
      </Flex>

      <Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid #e2e8f0" overflow="hidden" mb="6">
        <Table variant="simple" size="md">
          <Thead bg="#f8fafc">
            <Tr>
              <Th fontSize="xs" color="#64748b" fontWeight="700">PLAN NAME</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700">BADGE</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700">SERVICE CHARGE<br/>(FIXED AMOUNT)</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700">MIN. HIRING<br/>(ALLOWED)</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700">VALIDITY<br/>(MINIMUM)</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700">DESCRIPTION</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700">STATUS</Th>
              <Th fontSize="xs" color="#64748b" fontWeight="700" textAlign="center">ACTIONS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {plans.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={8} color="gray.500">No packages found.</Td>
              </Tr>
            ) : (
              plans.map((plan) => {
                const iconData = getPlanIcon(plan.name);
                return (
                  <Tr key={plan._id} _hover={{ bg: '#f8fafc' }}>
                    <Td>
                      <HStack>
                        <Flex align="center" justify="center" w="10" h="10" bg={iconData.bg} borderRadius="md">
                          <Icon as={iconData.icon} color={iconData.color} size={20} />
                        </Flex>
                        <VStack align="start" spacing="0">
                          <Text fontWeight="bold" color="#1e293b" fontSize="sm">{plan.name}</Text>
                          <Text fontSize="xs" color="#64748b" maxW="200px" isTruncated>
                            {plan.features?.[0] || 'Ideal for your hiring requirements.'}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getBadgeColor(plan.name)} variant="subtle" px="3" py="1" borderRadius="full" fontSize="xs">
                        {plan.name.split(' ')[0].toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontWeight="bold" color="#10b981">₹ {plan.price.toLocaleString('en-IN')}</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="600" color="#1e293b">{plan.hiringLimit || 1}</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="600" color="#1e293b">{(plan.durationDays / 30).toFixed(0)} Months</Text>
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="#475569" maxW="250px" whiteSpace="normal">
                        This package includes {plan.hiringLimit} hires with {(plan.durationDays / 30).toFixed(0)} months validity.
                      </Text>
                    </Td>
                    <Td>
                      <VStack spacing={1}>
                        <Switch colorScheme="green" isChecked={plan.isActive} onChange={() => togglePlanStatus(plan)} />
                        <Text fontSize="xs" color={plan.isActive ? 'green.500' : 'gray.400'} fontWeight="600">
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack justify="center" spacing={2}>
                        <IconButton
                          icon={<Edit2 size={16} />}
                          aria-label="Edit"
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          borderRadius="md"
                          onClick={() => navigate(`/plans/edit/${plan._id}`)}
                        />
                        <IconButton
                          icon={<Trash2 size={16} />}
                          aria-label="Delete"
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          borderRadius="md"
                          onClick={() => handleDelete(plan._id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Guide Section */}
      <Box bg="#f8fafc" p="4" borderRadius="lg" border="1px solid #e2e8f0" mb="8">
        <VStack align="start" spacing="2">
          <HStack><Icon as={Info} color="#2563eb" size={16} /><Text fontSize="sm" fontWeight="bold" color="#1e293b">Package Details Guide</Text></HStack>
          <HStack><Icon as={Info} color="#2563eb" size={14} /><Text fontSize="sm" color="#475569"><b>Service Charge:</b> Fixed amount charged from the customer for the package.</Text></HStack>
          <HStack><Icon as={Info} color="#2563eb" size={14} /><Text fontSize="sm" color="#475569"><b>Minimum Hiring (Allowed):</b> Minimum number of hirings that can be done under this package.</Text></HStack>
          <HStack><Icon as={Info} color="#2563eb" size={14} /><Text fontSize="sm" color="#475569"><b>Validity (Minimum):</b> Minimum time period the package will be valid from the date of activation.</Text></HStack>
          <HStack><Icon as={Info} color="#2563eb" size={14} /><Text fontSize="sm" color="#475569"><b>Status:</b> Active packages will be visible to users in the application.</Text></HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default PlanList;
