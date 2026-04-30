import React, { useState } from 'react';
import { Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch, IconButton, Tooltip } from '@chakra-ui/react';
import { Edit3, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, tableHeadStyle, thStyle, trHover } from '../components/ui';
import { Button } from '@chakra-ui/react';

const RoleList = () => {
  const [roles] = useState([
    { id: 1, name: 'Telemarketing', status: true },
    { id: 2, name: 'Sales', status: true },
    { id: 3, name: 'Customer', status: true },
  ]);

  return (
    <Box pb="10">
      <PageHeader
        title="Role Record List"
        breadcrumb="Role Record List"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>,
          <Button key="add" as={Link} to="/roles/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }}>Add Role</Button>,
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Role Record List</Text>
        </Flex>
        <TableControls searchPlaceholder="Search roles..." />
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>{['Sr.No.', 'Role Name', 'Status', 'Action'].map(h => <Th key={h} {...thStyle}>{h}</Th>)}</Tr>
            </Thead>
            <Tbody>
              {roles.map((role, i) => (
                <Tr key={role.id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600">{i + 1}</Td>
                  <Td py="3.5" color="#1e293b" fontSize="sm" fontWeight="600">{role.name}</Td>
                  <Td py="3.5"><Switch isChecked={role.status} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} /></Td>
                  <Td py="3.5">
                    <Tooltip label="Edit Role">
                      <IconButton icon={<Edit3 size={13} />} size="xs" bg="#e6eeff" color={BRAND} borderRadius="lg" _hover={{ bg: BRAND, color: 'white' }} aria-label="edit" transition="all 0.15s" />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${roles.length}`} total={roles.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default RoleList;
