import React from 'react';
import { Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Avatar, Switch, IconButton, Icon } from '@chakra-ui/react';
import { Edit3, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, tableHeadStyle, thStyle, trHover, StatusBadge } from '../components/ui';
import { Button } from '@chakra-ui/react';

const CustomerList = () => {
  const navigate = useNavigate();

  const data = [
    { id: 1, srNo: 1, profileImg: '', category: 'Canteen', name: 'testing outlet', phone: '9089475839', email: 'dts.shubhamphp@gmail.com', password: '1234', customerStatus: 'Running', status: true },
    { id: 2, srNo: 2, profileImg: 'https://bit.ly/dan-abramov', category: 'Home', name: 'Pradeep singh', phone: '9519808734', email: 'pradeepsingh@gmail.com', password: '1236547896', customerStatus: 'Running', status: true },
    { id: 3, srNo: 3, profileImg: 'https://bit.ly/kent-c-dodds', category: 'Restaurant', name: 'New Lucknow Kitchen', phone: '9519808734', email: 'Newlucknowkicthen@gmail.com', password: '1236547896', customerStatus: 'Running', status: true },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Customer/Client Record List"
        breadcrumb="Customer/Client Record List"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>,
          <Button key="add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} onClick={() => navigate('/customers/add')}>Add</Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Customer/Client Record List</Text>
        </Flex>

        <TableControls searchPlaceholder="Search customers..." />

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>
                {['Sr.No.', 'Profile Image', 'Customer/Client Details', 'Password', 'Customer Status', 'Status', 'Action'].map(h => (
                  <Th key={h} {...thStyle}>{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => (
                <Tr key={row.id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600">{row.srNo}</Td>
                  <Td py="3.5">
                    <Avatar size="md" src={row.profileImg} bg="#e6eeff" border="2px solid #e8edf5" />
                  </Td>
                  <Td py="3.5">
                    <VStack align="start" spacing="0.5">
                      <HStack spacing="1"><Text fontSize="xs" color="#94a3b8">Category:</Text><Text fontSize="xs" color="#475569" fontWeight="600">{row.category}</Text></HStack>
                      <HStack spacing="1"><Text fontSize="xs" color="#94a3b8">Name:</Text><Text fontSize="xs" color="#1e293b" fontWeight="700">{row.name}</Text></HStack>
                      <HStack spacing="1"><Text fontSize="xs" color="#94a3b8">Phone:</Text><Text fontSize="xs" color="#475569">{row.phone}</Text></HStack>
                      <HStack spacing="1"><Text fontSize="xs" color="#94a3b8">Email:</Text><Text fontSize="xs" color="#475569">{row.email}</Text></HStack>
                    </VStack>
                  </Td>
                  <Td py="3.5"><Text fontSize="sm" color="#475569" fontFamily="mono">{row.password}</Text></Td>
                  <Td py="3.5">
                    <Text fontSize="xs" fontWeight="700" color={row.customerStatus === 'Running' ? '#16a34a' : '#64748b'}
                      bg={row.customerStatus === 'Running' ? '#ecfdf5' : '#f8fafc'}
                      border={`1px solid ${row.customerStatus === 'Running' ? '#bbf7d0' : '#e2e8f0'}`}
                      px="2.5" py="0.5" borderRadius="full" display="inline-block">
                      {row.customerStatus}
                    </Text>
                  </Td>
                  <Td py="3.5">
                    <Switch isChecked={row.status} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} />
                  </Td>
                  <Td py="3.5">
                    <IconButton icon={<Edit3 size={14} />} size="xs" bg="#e6eeff" color={BRAND} borderRadius="lg"
                      _hover={{ bg: BRAND, color: 'white' }} aria-label="Edit" transition="all 0.15s" />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${data.length}`} total={data.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default CustomerList;
