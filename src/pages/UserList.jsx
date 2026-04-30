import React, { useState } from 'react';
import { Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Switch, IconButton, Avatar, Badge } from '@chakra-ui/react';
import { Edit3, Trash2, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, tableHeadStyle, thStyle, trHover } from '../components/ui';
import { Button } from '@chakra-ui/react';

const UserList = () => {
  const [users] = useState([
    { id: 1, name: 'Admin User', email: 'admin@zomocook.com', phone: '9876543210', role: 'Super Admin', status: true, image: 'https://images.unsplash.com/photo-1619946769363-107e822026a7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80' },
    { id: 2, name: 'Sales Manager', email: 'sales@zomocook.com', phone: '9876543211', role: 'Sales', status: true, image: '' },
  ]);

  return (
    <Box pb="10">
      <PageHeader
        title="System User List"
        breadcrumb="User List"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>,
          <Button key="add" as={Link} to="/users/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }}>Add User</Button>,
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">System User List</Text>
        </Flex>
        <TableControls searchPlaceholder="Search users..." />
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>{['Sr.No.', 'User', 'Contact Info', 'Role', 'Status', 'Action'].map(h => <Th key={h} {...thStyle}>{h}</Th>)}</Tr>
            </Thead>
            <Tbody>
              {users.map((user, i) => (
                <Tr key={user.id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600">{i + 1}</Td>
                  <Td py="3.5">
                    <HStack spacing="3">
                      <Avatar size="sm" src={user.image} name={user.name} border="2px solid #e8edf5" />
                      <Text color="#1e293b" fontSize="sm" fontWeight="600">{user.name}</Text>
                    </HStack>
                  </Td>
                  <Td py="3.5">
                    <VStack align="start" spacing="0.5">
                      <Text color="#475569" fontSize="xs" fontWeight="500">{user.email}</Text>
                      <Text color="#94a3b8" fontSize="xs">{user.phone}</Text>
                    </VStack>
                  </Td>
                  <Td py="3.5">
                    <Badge px="2.5" py="0.5" borderRadius="full" fontSize="10px" fontWeight="700" bg="#e6eeff" color={BRAND} border={`1px solid ${BRAND}30`}>{user.role}</Badge>
                  </Td>
                  <Td py="3.5"><Switch isChecked={user.status} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} /></Td>
                  <Td py="3.5">
                    <HStack spacing="1.5">
                      <IconButton icon={<Edit3 size={13} />} size="xs" bg="#e6eeff" color={BRAND} borderRadius="lg" _hover={{ bg: BRAND, color: 'white' }} aria-label="edit" transition="all 0.15s" />
                      <IconButton icon={<Trash2 size={13} />} size="xs" bg="#fff0f0" color={ACCENT} borderRadius="lg" _hover={{ bg: ACCENT, color: 'white' }} aria-label="delete" transition="all 0.15s" />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${users.length}`} total={users.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default UserList;
