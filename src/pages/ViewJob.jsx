import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Flex,
  Button, Spinner, useToast, Image, Table, Thead, Tbody, Tr, Th, Td, Divider
} from '@chakra-ui/react';
import { ArrowLeft, LayoutList, FileText, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PageHeader, PageFooter, BRAND, ACCENT, thStyle, tdStyle } from '../components/ui';

const ViewJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/jobs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch job details', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  if (isLoading) {
    return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} thickness="4px" /></Flex>;
  }

  if (!job) {
    return <Flex h="80vh" align="center" justify="center"><Text>Job not found</Text></Flex>;
  }

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  const DataRow = ({ label, value, isBadge = false }) => (
    <Tr borderBottom="1px solid #f1f5f9">
      <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">{label}</Td>
      <Td py="3" px="6" fontSize="sm" color="#475569" fontWeight="500">
        {isBadge ? (
          <Badge colorScheme="green" variant="solid" px="3" py="0.5" borderRadius="md" textTransform="capitalize">{value}</Badge>
        ) : (
          value || 'N/A'
        )}
      </Td>
    </Tr>
  );

  return (
    <Box pb="10">
      <PageHeader
        title="Job Details"
        actions={[
          <Button 
            key="back" 
            onClick={() => navigate(-1)} 
            leftIcon={<ArrowLeft size={16} />} 
            size="sm" 
            bg="#f97316" 
            color="white" 
            borderRadius="md" 
            px="6"
            _hover={{ bg: '#ea580c' }}
          >
            Back
          </Button>
        ]}
      />

      <VStack spacing="6" align="stretch">
        {/* Job Positions Section */}
        <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
          <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
            <Text fontSize="sm" fontWeight="800" color="#1e293b">Job Positions</Text>
          </Box>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="#f8faff">
                <Tr>
                  <Th {...thStyle} borderRight="1px solid #edf2f7">#</Th>
                  <Th {...thStyle} borderRight="1px solid #edf2f7">Position</Th>
                  <Th {...thStyle} borderRight="1px solid #edf2f7">No of Guests / Vacancy</Th>
                  <Th {...thStyle} borderRight="1px solid #edf2f7">Package / Salary</Th>
                  <Th {...thStyle} borderRight="1px solid #edf2f7">Exp.</Th>
                  <Th {...thStyle} borderRight="1px solid #edf2f7">Joining Type</Th>
                  <Th {...thStyle}>Created Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td {...tdStyle} borderRight="1px solid #edf2f7">1</Td>
                  <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="700" color="#475569">{job.jobPosition}</Td>
                  <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.packageOrGuestOrVacancy || job.noOfGuests || '0'}</Td>
                  <Td {...tdStyle} borderRight="1px solid #edf2f7">₹{job.salaryRange || job.package || 'N/A'}</Td>
                  <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.experienceRange || '-'}</Td>
                  <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.joiningType || '-'}</Td>
                  <Td {...tdStyle}>{new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Job Details Section */}
        <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
          <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
            <Text fontSize="sm" fontWeight="800" color="#1e293b">Job Details</Text>
          </Box>
          
          <Table variant="simple">
            <Tbody>
              <Tr borderBottom="1px solid #f1f5f9">
                <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">Image</Td>
                <Td py="5" px="6">
                  <Flex justify="center" w="full">
                    <Box borderRadius="lg" overflow="hidden" border="1px solid #edf2f7" boxShadow="sm">
                       <Image 
                        src={job.image ? `${apiBase}/${job.image}` : '/placeholder-job.png'} 
                        alt="job" 
                        maxH="150px"
                        fallbackSrc="https://via.placeholder.com/150"
                      />
                    </Box>
                  </Flex>
                </Td>
              </Tr>
              <DataRow label="Job Title" value={job.title} />
              <DataRow label="Job Category" value={job.jobCategory === 'hotel' ? 'Hotel Job' : job.jobCategory === 'home' ? 'Home Cook Job' : 'Daily Pay Job'} />
              <DataRow label="Customer/Client Name" value={job.customer?.name} />
              <DataRow label="State" value={job.state} />
              <DataRow label="City" value={job.city} />
              
              {job.jobCategory === 'daily' && (
                <>
                  <DataRow label="Event" value={job.event} />
                  <DataRow label="Serving Time" value={job.servingTime} />
                </>
              )}
              
              {job.jobCategory !== 'daily' && (
                <DataRow label="Property Category" value={job.propertyCategory} />
              )}

              <DataRow label="Overview" value={job.overview} />
              <DataRow label="Responsibilities" value={job.responsibilities} />
              <DataRow label="Requirements" value={job.requirements} />
              <DataRow label="Benefits" value={job.benefits} />
              <DataRow label="Status" value={job.status} isBadge />
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <PageFooter />
    </Box>
  );
};

export default ViewJob;
