import {
  Box, Flex, Text, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Checkbox, Avatar,
} from '@chakra-ui/react';
import {
  Filter, FileText, ArrowLeft, Calendar, Clock, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';

const ShortlistedCandidatesList = () => {
  const candidates = [
    {
      id: 1,
      candidateImage: null,
      name: 'Sushmita Sahani',
      gender: 'Female',
      email: 'sushmita@8500',
      phone: '7905718500',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      preferredCities: ['Lucknow District'],
      jobTitle: 'Cooking Chef',
      jobCategory: 'Hotel Job',
      jobType: 'Full Time',
      jobPosition: 'Assistant/ Helper Cook',
      vacancy: 5,
      joiningType: 'Urgent',
      salaryRange: 'INR 8000 - 10000',
      experienceRange: '2 - 4 Years',
      clientName: 'New Lucknow Kitchen',
      jobState: 'Andhra Pradesh',
      jobCity: 'Adoni',
      demoDetails: 'Reschedule Requested: No',
      applyDate: '30 Mar 2026, 10:49 PM',
      shortlistDate: '30 Mar 2026, 11:16 PM',
      status: 'Shortlisted',
    },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Shortlisted Candidates Records"
        breadcrumb="Shortlisted Candidates Records"
        actions={[
          <Button key="demo" leftIcon={<Calendar size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Schedule Demo
          </Button>,
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Filter
          </Button>,
          <Button key="back" as={Link} to="/" leftIcon={<ArrowLeft size={14} />} size="sm" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="lg" _hover={{ bg: '#f0f5ff' }}>
            Back
          </Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Shortlisted Candidates Records</Text>
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
                <Th {...thStyle} minW="220px">DEMO PERSON DETAILS</Th>
                <Th {...thStyle} minW="220px">DEMO DETAILS</Th>
                <Th {...thStyle} minW="120px">SHOW IN APP</Th>
                <Th {...thStyle} minW="280px">APPLY DATE & STATUS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {candidates.map((c, index) => (
                <Tr key={c.id} {...trHover}>
                  <Td {...tdStyle} textAlign="center"><Checkbox colorScheme="blue" /></Td>
                  <Td {...tdStyle} color="#475569" fontWeight="600" textAlign="center">{index + 1}</Td>
                  <Td {...tdStyle} textAlign="center">
                    <VStack spacing="3" align="center">
                      <Avatar size="lg" name={c.name} src={c.candidateImage} border="2px solid #f8faff" />
                      <Button size="xs" leftIcon={<FileText size={12} />} bg="#f97316" color="white" _hover={{ bg: '#ea580c' }} borderRadius="4px" px="6" py="3">CV</Button>
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
                  <Td {...tdStyle} textAlign="center" verticalAlign="middle">—</Td>
                  <Td {...tdStyle} fontSize="13px" color="#475569" verticalAlign="middle">{c.demoDetails}</Td>
                  <Td {...tdStyle} textAlign="center" verticalAlign="middle">—</Td>
                  <Td {...tdStyle} textAlign="center">
                    <VStack spacing="3" align="center">
                      <Button leftIcon={<CheckCircle2 size={14} fill="white" />} size="sm" bg="#f97316" color="white" _hover={{ bg: '#ea580c' }} borderRadius="4px" px="10" py="4" fontSize="13px" fontWeight="700" textTransform="none">
                        Shortlisted
                      </Button>
                      <VStack spacing="1.5" w="full">
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
                          borderColor="#f97316"
                          color="#f97316"
                          bg="transparent"
                          textTransform="none"
                          fontWeight="600"
                          border="1px solid #f97316"
                        >
                          <Clock size={12} /> Applied: {c.applyDate}
                        </Badge>
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
                          borderColor="#f97316"
                          color="#f97316"
                          bg="transparent"
                          textTransform="none"
                          fontWeight="600"
                          border="1px solid #f97316"
                        >
                          <CheckCircle2 size={12} /> Shortlisted: {c.shortlistDate}
                        </Badge>
                      </VStack>
                    </VStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${candidates.length}`} total={candidates.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default ShortlistedCandidatesList;
