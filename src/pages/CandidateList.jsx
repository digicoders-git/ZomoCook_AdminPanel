import React from 'react';
import { Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Menu, MenuButton, MenuList, MenuItem, Icon } from '@chakra-ui/react';
import { Plus, Filter, Eye, FileText, Settings, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, tableHeadStyle, thStyle, trHover } from '../components/ui';

const CandidateList = () => {
  const candidates = [
    { id: 1, name: 'Gaurav Gupta', gender: 'Male', email: 'digitalgurucse@gmail.com', phone: '9696559848', state: 'Uttar Pradesh', city: 'Lucknow', address: 'Aliganj', jobCategory: 'Hotel Job, Home Cook Job, Daily Pay Job', jobType: 'Part Time, Full Time, Live IN', jobPosition: 'Bakery Chef', preferredCities: 'Lucknow', kycStatus: 'Pending', profileStatus: 'Active' },
    { id: 2, name: 'Shubham vaish', gender: 'Male', email: 'shubham.vaish5@gmail.com', phone: '9919663555', state: 'Uttar Pradesh', city: 'Lucknow', address: 'Aliganj', jobCategory: 'Daily Pay Job', jobType: 'Part Time, Full Time, Live IN', jobPosition: 'Biryani Chef', preferredCities: 'Lucknow', kycStatus: 'Pending', profileStatus: 'Active' },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Candidate Record List"
        breadcrumb="Candidate Record List"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>,
          <Button key="add" as={Link} to="/candidates/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }}>Add Candidate</Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Candidate Record List</Text>
        </Flex>

        <TableControls searchPlaceholder="Search candidates..." />

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>
                {['Sr.No.', 'CV', 'Basic Details', 'Job Preference', 'Job History', 'Status', 'Action'].map(h => (
                  <Th key={h} {...thStyle}>{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {candidates.map((c, index) => (
                <Tr key={c.id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600">{index + 1}</Td>
                  <Td py="3.5">
                    <Button size="xs" bg={BRAND} color="white" leftIcon={<FileText size={11} />} borderRadius="lg" _hover={{ bg: '#003d91' }}>CV</Button>
                  </Td>
                  <Td py="3.5">
                    <VStack align="start" spacing="0.5">
                      {[['Name', c.name], ['Gender', c.gender], ['Email', c.email], ['Phone', c.phone], ['State', c.state], ['City', c.city], ['Address', c.address]].map(([k, v]) => (
                        <HStack key={k} spacing="1"><Text fontSize="10px" color="#94a3b8" fontWeight="600">{k}:</Text><Text fontSize="10px" color="#475569">{v}</Text></HStack>
                      ))}
                    </VStack>
                  </Td>
                  <Td py="3.5">
                    <VStack align="start" spacing="0.5">
                      {[['Job Category', c.jobCategory], ['Job Type', c.jobType], ['Job Position', c.jobPosition], ['Preferred Cities', c.preferredCities]].map(([k, v]) => (
                        <HStack key={k} spacing="1" flexWrap="wrap"><Text fontSize="10px" color="#94a3b8" fontWeight="600">{k}:</Text><Text fontSize="10px" color="#475569">{v}</Text></HStack>
                      ))}
                    </VStack>
                  </Td>
                  <Td py="3.5" textAlign="center"><Text fontSize="xs" color="#94a3b8">—</Text></Td>
                  <Td py="3.5">
                    <VStack align="start" spacing="1">
                      <Badge px="2" py="0.5" borderRadius="full" fontSize="9px" fontWeight="700" bg="#fff8e6" color="#d97706" border="1px solid #fde68a">KYC: {c.kycStatus}</Badge>
                      <Badge px="2" py="0.5" borderRadius="full" fontSize="9px" fontWeight="700" bg="#ecfdf5" color="#16a34a" border="1px solid #bbf7d0">{c.profileStatus}</Badge>
                    </VStack>
                  </Td>
                  <Td py="3.5">
                    <Menu>
                      <MenuButton as={Button} size="xs" bg={BRAND} color="white" rightIcon={<ChevronDown size={11} />} leftIcon={<Settings size={11} />}
                        fontSize="10px" borderRadius="lg" _hover={{ bg: '#003d91' }}>
                        Manage
                      </MenuButton>
                      <MenuList bg="white" borderColor="#e8edf5" boxShadow="0 8px 24px rgba(0,74,173,0.1)" p="1.5" borderRadius="xl" minW="140px">
                        <MenuItem _hover={{ bg: '#f0f5ff', color: BRAND }} color="#475569" fontSize="xs" icon={<Eye size={13} />} borderRadius="md">View Details</MenuItem>
                        <MenuItem _hover={{ bg: '#f0f5ff', color: BRAND }} color="#475569" fontSize="xs" icon={<FileText size={13} />} borderRadius="md">Edit Profile</MenuItem>
                      </MenuList>
                    </Menu>
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

export default CandidateList;
