import React from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Icon, Checkbox, Avatar,
} from '@chakra-ui/react';
import {
  Filter, FileText, ArrowLeft, UserCheck, Clock, Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';

const ApplicationsList = () => {
  const applications = [
    {
      id: 1,
      candidateImage: 'https://bit.ly/dan-abramov',
      name: 'Shubham vaish',
      gender: 'Male',
      email: 'shubham.vaish5@gmail.com',
      phone: '9555443292',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      preferredCities: ['Lucknow'],
      jobTitle: 'Head Chef',
      jobCategory: 'Hotel Job',
      jobType: 'Full Time',
      jobPosition: 'North Indian CDP',
      vacancy: 1,
      joiningType: 'Urgent',
      salaryRange: 'INR 16000 - 18000',
      experienceRange: '6 - 8 Years',
      clientName: 'Sangam Kitchen Services',
      jobState: 'Uttar Pradesh',
      jobCity: 'Lucknow',
      applyDate: '08 Apr 2026, 12:20 PM',
      status: 'Applied',
    },
    {
      id: 2,
      candidateImage: 'https://bit.ly/kent-c-dodds',
      name: 'Gaurav Gupta',
      gender: 'Male',
      email: 'gaurav.g@example.com',
      phone: '9696559848',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      preferredCities: ['Lucknow', 'Kanpur'],
      jobTitle: 'Bakery Chef',
      jobCategory: 'Home Cook Job',
      jobType: 'Part Time',
      jobPosition: 'Bakery Specialist',
      vacancy: 2,
      joiningType: 'Immediate',
      salaryRange: 'INR 20000 - 25000',
      experienceRange: '3 - 5 Years',
      clientName: 'Private Residence',
      jobState: 'Uttar Pradesh',
      jobCity: 'Lucknow',
      applyDate: '10 Apr 2026, 10:15 AM',
      status: 'Applied',
    },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Total Applications Record List"
        breadcrumb="Total Applications Record List"
        actions={[
          <Button key="assign" leftIcon={<UserCheck size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Assign Candidates
          </Button>,
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Filters
          </Button>,
          <Button key="back" as={Link} to="/" leftIcon={<ArrowLeft size={14} />} size="sm" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="lg" _hover={{ bg: '#f0f5ff' }}>
            Back
          </Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Total Applications Record List</Text>
        </Flex>

        <TableControls defaultEntries="50" searchPlaceholder="Search..." />

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>
                <Th {...thStyle} w="40px"><Checkbox colorScheme="blue" /></Th>
                <Th {...thStyle} minW="60px">NO.</Th>
                <Th {...thStyle} minW="150px">CANDIDATE IMAGE</Th>
                <Th {...thStyle} minW="280px">CANDIDATE DETAILS</Th>
                <Th {...thStyle} minW="300px">JOB DETAILS</Th>
                <Th {...thStyle} minW="280px">APPLY DATE & STATUS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {applications.map((c, index) => (
                <Tr key={c.id} {...trHover}>
                  <Td {...tdStyle} textAlign="center"><Checkbox colorScheme="blue" /></Td>
                  <Td {...tdStyle} color="#475569" fontWeight="600" textAlign="center">{index + 1}</Td>
                  <Td {...tdStyle} textAlign="center">
                    <VStack spacing="3" align="center">
                      <Avatar size="lg" name={c.name} src={c.candidateImage} border="2px solid #f8faff" />
                      <HStack spacing="2">
                        <Button size="xs" leftIcon={<FileText size={12} />} bg="#43767f" color="white" _hover={{ bg: '#33666f' }} borderRadius="4px" px="4">Resume</Button>
                        <Button size="xs" leftIcon={<FileText size={12} />} bg="#f97316" color="white" _hover={{ bg: '#ea580c' }} borderRadius="4px" px="4">CV</Button>
                      </HStack>
                    </VStack>
                  </Td>
                  <Td {...tdStyle}>
                    <VStack align="start" spacing="1.5">
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Name: </Box>{c.name}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Gender: </Box>{c.gender}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Email ID: </Box>{c.email}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Phone No.: </Box>{c.phone}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">State: </Box>{c.state}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">City: </Box>{c.city}</Text>
                      <Flex align="start" pt="1">
                        <Text fontSize="13px" fontWeight="700" color="#1e293b" mr="2" whiteSpace="nowrap">Preferred Cities:</Text>
                        <VStack align="start" spacing="1">
                          {c.preferredCities.map(city => (
                            <Badge key={city} bg="#ff6b00" color="white" borderRadius="4px" px="2" py="1" fontSize="11px" textTransform="none" fontWeight="600" minW="80px" textAlign="center">{city}</Badge>
                          ))}
                        </VStack>
                      </Flex>
                    </VStack>
                  </Td>
                  <Td {...tdStyle}>
                    <VStack align="start" spacing="1.5">
                      <Text fontWeight="700" color="#0000ff" fontSize="15px" mb="1" _hover={{ textDecoration: 'underline', cursor: 'pointer' }}>{c.jobTitle}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Job Category: </Box>{c.jobCategory}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Job Type: </Box>{c.jobType}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Job Position: </Box>{c.jobPosition}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">No. Of Vacancy: </Box>{c.vacancy}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Joining Type: </Box>{c.joiningType}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Salary Range: </Box>{c.salaryRange}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Experience Range: </Box>{c.experienceRange}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Customer/Client Name: </Box>{c.clientName}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">State: </Box>{c.jobState}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">City: </Box>{c.jobCity}</Text>
                    </VStack>
                  </Td>
                  <Td {...tdStyle} textAlign="center">
                    <VStack spacing="3" align="center">
                      <Button leftIcon={<Send size={14} fill="white" />} size="sm" bg="#1a83ff" color="white" _hover={{ bg: '#0070f0' }} borderRadius="4px" px="10" py="4" fontSize="13px" fontWeight="700">
                        Applied
                      </Button>
                      <Badge
                        variant="outline"
                        borderRadius="full"
                        px="4"
                        py="1.5"
                        w="full"
                        fontSize="11px"
                        display="flex"
                        alignItems="center"
                        gap="2"
                        borderColor="#3b82f6"
                        color="#3b82f6"
                        bg="transparent"
                        textTransform="none"
                        fontWeight="600"
                        border="1px solid #3b82f6"
                      >
                        <Clock size={14} /> Applied: {c.applyDate}
                      </Badge>
                    </VStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${applications.length}`} total={applications.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default ApplicationsList;
