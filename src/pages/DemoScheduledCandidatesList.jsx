import {
  Box, Flex, Text, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Checkbox, Avatar,
} from '@chakra-ui/react';
import {
  Filter, FileText, ArrowLeft, Calendar, Clock, CheckCircle2, Edit3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';

const DemoScheduledCandidatesList = () => {
  const candidates = [
    {
      id: 1,
      candidateImage: null,
      name: 'Warne',
      gender: 'Male',
      email: 'warne@yara.gl',
      phone: '9889874002',
      state: 'Assam',
      city: 'Baksa',
      preferredCities: ['Abiramam', 'Abohar', 'Abrama'],
      jobTitle: 'test',
      jobCategory: 'Hotel Job',
      jobType: 'Full Time',
      jobPosition: 'Bakery Chef',
      vacancy: 1,
      joiningType: 'Urgent',
      salaryRange: 'INR 8000 - 10000',
      experienceRange: '1 - 2 Years',
      clientName: 'Home cook',
      jobState: 'Andhra Pradesh',
      jobCity: 'Adoni',
      demoPersonName: 'Test',
      demoPersonPhone: '9845619846',
      demoPersonAddress: 'rtygbhnjkm',
      demoDate: '03 Apr 2026',
      demoTime: '12:00 PM',
      scheduledAt: '28 Mar 2026 11:31 AM',
      rescheduleRequested: 'No',
      applyDate: '28 Mar 2026, 11:31 AM',
      shortlistDate: '28 Mar 2026, 11:31 AM',
      demoAt: '28 Mar 2026, 11:31 AM',
      status: 'Demo Scheduled',
    },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Demo Scheduled Candidates Records"
        breadcrumb="Demo Scheduled Candidates Records"
        actions={[
          <Button key="status" leftIcon={<Edit3 size={14} />} size="sm" variant="outline" borderColor="#ff6b00" color="#ff6b00" borderRadius="lg" _hover={{ bg: '#fff7ed' }}>
            Update Status
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
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Demo Scheduled Candidates Records</Text>
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
                      <Avatar size="lg" name={c.name} border="2px solid #f8faff" />
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
                  <Td {...tdStyle}>
                    <VStack align="start" spacing="2">
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Name: </Box>{c.demoPersonName}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Phone No: </Box>{c.demoPersonPhone}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Address: </Box>{c.demoPersonAddress}</Text>
                    </VStack>
                  </Td>
                  <Td {...tdStyle}>
                    <VStack align="start" spacing="2">
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Demo Date: </Box>{c.demoDate}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Demo Time: </Box>{c.demoTime}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Scheduled At: </Box>{c.scheduledAt}</Text>
                      <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Reschedule Requested: </Box>{c.rescheduleRequested}</Text>
                    </VStack>
                  </Td>
                  <Td {...tdStyle} textAlign="center" verticalAlign="middle">—</Td>
                  <Td {...tdStyle} textAlign="center">
                    <VStack spacing="3" align="center">
                      <Button leftIcon={<Calendar size={14} fill="white" />} size="sm" bg="#ffb800" color="white" _hover={{ bg: '#e0a100' }} borderRadius="4px" px="10" py="4" fontSize="13px" fontWeight="700" textTransform="none">
                        Demo Scheduled
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
                          borderColor="#ffb800"
                          color="#ffb800"
                          bg="transparent"
                          textTransform="none"
                          fontWeight="600"
                          border="1px solid #ffb800"
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
                          borderColor="#ffb800"
                          color="#ffb800"
                          bg="transparent"
                          textTransform="none"
                          fontWeight="600"
                          border="1px solid #ffb800"
                        >
                          <CheckCircle2 size={12} /> Shortlisted: {c.shortlistDate}
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
                          borderColor="#ffb800"
                          color="#ffb800"
                          bg="transparent"
                          textTransform="none"
                          fontWeight="600"
                          border="1px solid #ffb800"
                        >
                          <Calendar size={12} /> Demo: {c.demoAt}
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

export default DemoScheduledCandidatesList;
