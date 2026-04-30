import {
  Box, Flex, Text, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Checkbox, Avatar, HStack
} from '@chakra-ui/react';
import {
  Filter, FileText, ArrowLeft, XCircle, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';

const RejectedCandidatesList = () => {
  const candidates = [
    {
      id: 1,
      candidateImage: null,
      name: 'John Doe',
      gender: 'Male',
      email: 'john.doe@example.com',
      phone: '9876543210',
      state: 'Maharashtra',
      city: 'Mumbai',
      preferredCities: ['Pune', 'Nashik'],
      jobTitle: 'Senior Cook',
      jobCategory: 'Residential Job',
      jobType: 'Full Time',
      jobPosition: 'Continental Cook',
      vacancy: 2,
      joiningType: 'Urgent',
      salaryRange: 'INR 25000 - 30000',
      experienceRange: '5 - 7 Years',
      clientName: 'Private Villa',
      jobState: 'Maharashtra',
      jobCity: 'Mumbai',
      demoPersonName: 'Mr. Sharma',
      demoPersonPhone: '9123456789',
      demoPersonAddress: 'Bandra West, Mumbai',
      demoDate: '15 Apr 2026',
      demoTime: '11:00 AM',
      scheduledAt: '10 Apr 2026 02:00 PM',
      rescheduleRequested: 'No',
      applyDate: '05 Apr 2026, 10:30 AM',
      shortlistDate: '07 Apr 2026, 11:00 AM',
      demoAt: '15 Apr 2026, 11:00 AM',
      rejectedAt: '16 Apr 2026, 04:00 PM',
      status: 'Rejected',
    },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Rejected Candidates Records"
        breadcrumb="Rejected Candidates Records"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Filter
          </Button>,
          <Button key="back" as={Link} to="/" leftIcon={<ArrowLeft size={14} />} size="sm" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="lg" _hover={{ bg: '#f0f5ff' }}>
            Back
          </Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between">
          <HStack spacing="3">
            <Box w="3px" h="18px" bg="#ef4444" borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Rejected Candidates Records</Text>
          </HStack>
          <HStack spacing="2">
            <Button leftIcon={<Filter size={14} />} size="xs" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="md" _hover={{ borderColor: BRAND, color: BRAND }}>
              Filter
            </Button>
            <Button as={Link} to="/" leftIcon={<ArrowLeft size={14} />} size="xs" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="md" _hover={{ bg: '#f0f5ff' }}>
              Back
            </Button>
          </HStack>
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
              {candidates.length > 0 ? (
                candidates.map((c, index) => (
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
                        <Button leftIcon={<XCircle size={14} fill="white" />} size="sm" bg="#ef4444" color="white" _hover={{ bg: '#dc2626' }} borderRadius="4px" px="10" py="4" fontSize="13px" fontWeight="700" textTransform="none">
                          Rejected
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
                            borderColor="#ef4444"
                            color="#ef4444"
                            bg="transparent"
                            textTransform="none"
                            fontWeight="600"
                            border="1px solid #ef4444"
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
                            borderColor="#475569"
                            color="#475569"
                            bg="transparent"
                            textTransform="none"
                            fontWeight="600"
                            border="1px solid #475569"
                          >
                            <XCircle size={12} /> Rejected: {c.rejectedAt}
                          </Badge>
                        </VStack>
                      </VStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={9} textAlign="center" py="10">
                    <Text color="#64748b">No data available in table</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={candidates.length > 0 ? `1 to ${candidates.length}` : "0 to 0"} total={candidates.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default RejectedCandidatesList;
