import React, { useState } from 'react';
import { Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch, IconButton, Image, Tooltip } from '@chakra-ui/react';
import { Edit3, Trash2, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, tableHeadStyle, thStyle, trHover } from '../components/ui';
import { Button } from '@chakra-ui/react';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, image: 'https://bit.ly/dan-abramov', title: 'गेस की कमी है, JOB की नहीं', createdAt: '30-03-2026', status: true },
    { id: 2, image: 'https://bit.ly/dan-abramov', title: 'aaj hi paye job aaply kre', createdAt: '30-03-2026', status: true },
    { id: 3, image: 'https://bit.ly/ryan-florence', title: 'test 1', createdAt: '28-03-2026', status: true },
    { id: 4, image: 'https://bit.ly/ryan-florence', title: 'Test', createdAt: '28-03-2026', status: true },
  ]);

  return (
    <Box pb="10">
      <PageHeader
        title="Notification Record List"
        breadcrumb="Notification Record List"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>,
          <Button key="add" as={Link} to="/notifications/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }}>Add Notification</Button>,
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Notification Record List</Text>
        </Flex>
        <TableControls searchPlaceholder="Search notifications..." />
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>{['Sr.No.', 'Image', 'Title', 'Created At', 'Status', 'Action'].map(h => <Th key={h} {...thStyle}>{h}</Th>)}</Tr>
            </Thead>
            <Tbody>
              {notifications.map((n, i) => (
                <Tr key={n.id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600">{i + 1}</Td>
                  <Td py="3.5"><Box w="40px" h="40px" borderRadius="lg" overflow="hidden" border="2px solid #e8edf5"><Image src={n.image} alt={n.title} w="full" h="full" objectFit="cover" /></Box></Td>
                  <Td py="3.5" color="#1e293b" fontSize="sm" fontWeight="600">{n.title}</Td>
                  <Td py="3.5" color="#64748b" fontSize="sm">{n.createdAt}</Td>
                  <Td py="3.5"><Switch isChecked={n.status} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} /></Td>
                  <Td py="3.5">
                    <HStack spacing="1.5">
                      <Tooltip label="Edit"><IconButton icon={<Edit3 size={13} />} size="xs" bg="#e6eeff" color={BRAND} borderRadius="lg" _hover={{ bg: BRAND, color: 'white' }} aria-label="edit" /></Tooltip>
                      <Tooltip label="Delete"><IconButton icon={<Trash2 size={13} />} size="xs" bg="#fff0f0" color={ACCENT} borderRadius="lg" _hover={{ bg: ACCENT, color: 'white' }} aria-label="delete" /></Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${notifications.length}`} total={notifications.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default NotificationList;
