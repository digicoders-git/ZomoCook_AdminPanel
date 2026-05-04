import React, { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, 
  IconButton, Tooltip, Spinner, useToast, Avatar, useDisclosure 
} from '@chakra-ui/react';
import { Trash2, RefreshCcw } from 'lucide-react';
import { 
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, 
  tableHeadStyle, thStyle, trHover, ConfirmationModal 
} from '../components/ui';
import axios from 'axios';

const QueryHistory = () => {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => {}, type: 'danger' });

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/queries`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setQueries(response.data.queries);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch queries', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [searchTerm]);

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Query?',
      description: 'Are you sure you want to delete this query history? This will permanently remove the record.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          await axios.delete(`${apiUrl}/queries/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setQueries(prev => prev.filter(q => q._id !== id));
          toast({ title: 'Deleted', status: 'success' });
        } catch (error) {
          toast({ title: 'Error', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  return (
    <Box pb="10">
      <PageHeader 
        title="Query History List" 
        breadcrumb="Query History List"
        actions={[
          <IconButton 
            key="refresh" 
            icon={<RefreshCcw size={16} />} 
            onClick={fetchQueries} 
            size="sm" 
            variant="outline" 
            aria-label="Refresh" 
          />
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Query History List</Text>
        </Flex>
        <TableControls search={searchTerm} onSearch={setSearchTerm} searchPlaceholder="Search queries..." />
        
        <Box overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm" minW="700px">
              <Thead {...tableHeadStyle}>
                <Tr>
                  <Th {...thStyle} whiteSpace="nowrap">Sr.No.</Th>
                  <Th {...thStyle} whiteSpace="nowrap">Profile</Th>
                  <Th {...thStyle} whiteSpace="nowrap">Candidate Info</Th>
                  <Th {...thStyle} whiteSpace="nowrap">Message</Th>
                  <Th {...thStyle} whiteSpace="nowrap">Date & Time</Th>
                  <Th {...thStyle} whiteSpace="nowrap">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {queries.map((q, i) => (
                  <Tr key={q._id} {...trHover}>
                    <Td py="4" color="#64748b" fontSize="xs" fontWeight="600" minW="55px">{i + 1}</Td>
                    <Td py="4" minW="65px">
                      <Avatar size="sm" name={q.name} bg={BRAND} color="white" />
                    </Td>
                    <Td py="4" minW="180px">
                      <VStack align="start" spacing="0.5">
                        <Text fontSize="xs" color="#1e293b" fontWeight="700" whiteSpace="nowrap">{q.name}</Text>
                        <Text fontSize="10px" color="#64748b" whiteSpace="nowrap">{q.phone}</Text>
                        <Text fontSize="10px" color="#94a3b8" whiteSpace="nowrap">{q.email}</Text>
                      </VStack>
                    </Td>
                    <Td py="4" minW="200px">
                      <Text color="#475569" fontSize="xs" fontWeight="500" noOfLines={2} maxW="250px">
                        {q.message}
                      </Text>
                    </Td>
                    <Td py="4" color="#64748b" fontSize="xs" whiteSpace="nowrap" minW="150px">
                      {new Date(q.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Td>
                    <Td py="4" minW="60px">
                      <Tooltip label="Delete Query">
                        <IconButton 
                          icon={<Trash2 size={13} />} 
                          size="xs" 
                          bg="#fff0f0" 
                          color={ACCENT} 
                          borderRadius="lg" 
                          _hover={{ bg: ACCENT, color: 'white' }} 
                          onClick={() => handleDelete(q._id)}
                          aria-label="delete" 
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
                {queries.length === 0 && <Tr><Td colSpan={6} py="10" textAlign="center" color="#94a3b8">No queries found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`1 to ${queries.length}`} total={queries.length} />
      </TableCard>

      <ConfirmationModal 
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        type={confirmConfig.type}
        confirmColor={confirmConfig.type === 'danger' ? ACCENT : BRAND}
      />

      <PageFooter />
    </Box>
  );
};

export default QueryHistory;
