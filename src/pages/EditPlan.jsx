import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Switch,
  Checkbox,
  SimpleGrid,
  useToast,
  Textarea,
  Spinner,
  Center
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: '',
    jobPostLimit: '',
    hiringLimit: '',
    features: '',
    isPopular: false,
    isBestValue: false,
    isActive: true,
    allowedJobCategories: ['hotel', 'home', 'daily']
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${apiUrl}/plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          const plan = res.data.data;
          setFormData({
            name: plan.name || '',
            price: plan.price || '',
            durationDays: plan.durationDays || '',
            jobPostLimit: plan.jobPostLimit || '',
            hiringLimit: plan.hiringLimit || '',
            features: plan.features ? plan.features.join('\n') : '',
            isPopular: plan.isPopular || false,
            isBestValue: plan.isBestValue || false,
            isActive: plan.isActive ?? true,
            allowedJobCategories: plan.allowedJobCategories?.length ? plan.allowedJobCategories : ['hotel', 'home', 'daily']
          });
        }
      } catch (err) {
        toast({
          title: 'Error fetching plan',
          description: err.response?.data?.message || err.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/plans/list');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, [id, navigate, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryToggle = (cat) => {
    setFormData((prev) => {
      const cats = prev.allowedJobCategories.includes(cat)
        ? prev.allowedJobCategories.filter(c => c !== cat)
        : [...prev.allowedJobCategories, cat];
      return { ...prev, allowedJobCategories: cats };
    });
  };

  const handleCategoryToggle = (cat) => {
    setFormData((prev) => {
      const cats = prev.allowedJobCategories.includes(cat)
        ? prev.allowedJobCategories.filter(c => c !== cat)
        : [...prev.allowedJobCategories, cat];
      return { ...prev, allowedJobCategories: cats };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        jobPostLimit: Number(formData.jobPostLimit),
        hiringLimit: Number(formData.hiringLimit),
        features: formData.features.split('\n').map(f => f.trim()).filter(f => f),
        allowedJobCategories: formData.allowedJobCategories,
      };

      const res = await axios.put(`${apiUrl}/plans/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast({ title: 'Plan updated successfully', status: 'success', duration: 2000, isClosable: true });
        navigate('/plans/list');
      }
    } catch (err) {
      toast({
        title: 'Error updating plan',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box maxW="800px" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">Edit Plan</Text>
        </HStack>
      </Flex>

      <Box bg="white" borderRadius="xl" p={8} boxShadow="sm">
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Plan Name</FormLabel>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Standard Plan" />
            </FormControl>

            <HStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Price (₹)</FormLabel>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="699" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Duration (Days)</FormLabel>
                <Input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} placeholder="90" />
              </FormControl>
            </HStack>

            <HStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Job Post Limit</FormLabel>
                <Input type="number" name="jobPostLimit" value={formData.jobPostLimit} onChange={handleChange} placeholder="5" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Hiring Limit</FormLabel>
                <Input type="number" name="hiringLimit" value={formData.hiringLimit} onChange={handleChange} placeholder="2" />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>Features (One per line)</FormLabel>
              <Textarea 
                name="features" 
                value={formData.features} 
                onChange={handleChange} 
                rows={5}
                placeholder="Contact & Chat with Cook&#10;Priority Listing&#10;Replacement Support" 
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Allowed Job Categories</FormLabel>
              <Text fontSize="sm" color="gray.500" mb={3}>Select which job types are included in this plan</Text>
              <SimpleGrid columns={3} spacing={4}>
                {[
                  { value: 'hotel', label: 'Commercial', color: 'blue' },
                  { value: 'home', label: 'Domestic', color: 'green' },
                  { value: 'daily', label: 'Daily Job', color: 'orange' },
                ].map(({ value, label, color }) => (
                  <Box
                    key={value}
                    border="2px solid"
                    borderColor={formData.allowedJobCategories.includes(value) ? `${color}.400` : 'gray.200'}
                    borderRadius="lg"
                    p={4}
                    cursor="pointer"
                    bg={formData.allowedJobCategories.includes(value) ? `${color}.50` : 'white'}
                    onClick={() => handleCategoryToggle(value)}
                    transition="all 0.2s"
                  >
                    <HStack spacing={3}>
                      <Checkbox
                        isChecked={formData.allowedJobCategories.includes(value)}
                        colorScheme={color}
                        onChange={() => handleCategoryToggle(value)}
                        onClick={e => e.stopPropagation()}
                      />
                      <Text fontWeight="semibold" color={formData.allowedJobCategories.includes(value) ? `${color}.700` : 'gray.600'}>
                        {label}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </FormControl>

            <HStack spacing={10}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isPopular" mb="0">Is Popular?</FormLabel>
                <Switch id="isPopular" name="isPopular" isChecked={formData.isPopular} onChange={handleChange} colorScheme="purple" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isBestValue" mb="0">Is Best Value?</FormLabel>
                <Switch id="isBestValue" name="isBestValue" isChecked={formData.isBestValue} onChange={handleChange} colorScheme="orange" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isActive" mb="0">Is Active?</FormLabel>
                <Switch id="isActive" name="isActive" isChecked={formData.isActive} onChange={handleChange} colorScheme="green" />
              </FormControl>
            </HStack>

            <Flex justify="flex-end" pt={4}>
              <Button type="submit" colorScheme="blue" leftIcon={<Save size={18} />} isLoading={isSubmitting}>
                Update Plan
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default EditPlan;
