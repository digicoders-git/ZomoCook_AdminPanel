import React, { useState } from 'react';
import { Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, IconButton, Tooltip } from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, tableHeadStyle, thStyle, trHover } from '../components/ui';

const QueryHistory = () => {
  const [queries] = useState([
    { id: 1, profileImage: '-', name: 'Arti mishra', phone: '8303941040', email: 'artim6747@gmail.com', message: 'Urgently job ki need h', dateTime: '30 Mar 2026 06:17 PM' },
    { id: 2, profileImage: '-', name: 'Amit', phone: '7206066775', email: '', message: 'Hello mujhe job', dateTime: '30 Mar 2026 04:30 PM' },
    { id: 3, profileImage: '-', name: '-', phone: '-', email: '', message: 'Vtgvgvgv', dateTime: '24 Mar 2026 10:40 AM' },
    { id: 4, profileImage: '-', name: '-', phone: '-', email: '', message: 'Tvtctvc', dateTime: '24 Mar 2026 10:39 AM' },
    { id: 5, profileImage: '-', name: '-', phone: '-', email: '', message: 'Hvhvhv', dateTime: '24 Mar 2026 10:37 AM' },
  ]);

  return (
    <Box pb="10">
      <PageHeader title="Query History List" breadcrumb="Query History List" />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Query History List</Text>
        </Flex>
        <TableControls searchPlaceholder="Search queries..." />
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead {...tableHeadStyle}>
              <Tr>{['Sr.No.', 'Profile Image', 'Candidate Info', 'Message', 'Date & Time', 'Action'].map(h => <Th key={h} {...thStyle}>{h}</Th>)}</Tr>
            </Thead>
            <Tbody>
              {queries.map((q, i) => (
                <Tr key={q.id} {...trHover}>
                  <Td py="3.5" color="#64748b" fontSize="sm" fontWeight="600">{i + 1}</Td>
                  <Td py="3.5" color="#94a3b8" fontSize="sm" textAlign="center">{q.profileImage}</Td>
                  <Td py="3.5">
                    <VStack align="start" spacing="0.5">
                      <Text fontSize="sm" color="#1e293b" fontWeight="700">{q.name}</Text>
                      {q.phone && q.phone !== '-' && <Text fontSize="xs" color="#64748b">{q.phone}</Text>}
                      {q.email && <Text fontSize="xs" color="#94a3b8">{q.email}</Text>}
                    </VStack>
                  </Td>
                  <Td py="3.5" color="#475569" fontSize="sm" fontWeight="500">{q.message}</Td>
                  <Td py="3.5" color="#64748b" fontSize="xs">{q.dateTime}</Td>
                  <Td py="3.5">
                    <Tooltip label="Delete Query">
                      <IconButton icon={<Trash2 size={13} />} size="xs" bg="#fff0f0" color={ACCENT} borderRadius="lg" _hover={{ bg: ACCENT, color: 'white' }} aria-label="delete" transition="all 0.15s" />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <TableFooter showing={`1 to ${queries.length}`} total={queries.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default QueryHistory;
