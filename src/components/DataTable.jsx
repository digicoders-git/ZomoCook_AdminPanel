import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  VStack
} from '@chakra-ui/react';
import { Search, Plus, MoreHorizontal, Filter, Download, Edit2, Trash2, Eye } from 'lucide-react';

const BRAND = '#004aad';
const ACCENT = '#ed1c24';

const DataTable = ({ 
  columns, 
  data, 
  title, 
  onAdd, 
  searchPlaceholder = "Search records..." 
}) => {
  return (
    <Box borderRadius="xl" overflow="hidden" bg="white" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
      {/* Table Header / Toolbar */}
      <Flex px="6" py="4" justify="space-between" align="center" wrap="wrap" gap="4" borderBottom="1px solid #f1f5f9">
        <VStack align="start" spacing="0.5">
          <HStack spacing="3">
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">{title}</Text>
          </HStack>
          <Text fontSize="xs" color="#94a3b8" fontWeight="500" ml="6">{data.length} total records found</Text>
        </VStack>
        
        <HStack spacing="2" flex={{ base: "1", md: "auto" }} minW={{ base: "full", md: "auto" }}>
          <InputGroup size="sm" maxW={{ base: "full", md: "220px" }}>
            <InputLeftElement pointerEvents="none">
              <Search size={14} color="#94a3b8" />
            </InputLeftElement>
            <Input 
              placeholder={searchPlaceholder} 
              bg="#f8faff"
              border="1.5px solid #dde6f5"
              borderRadius="lg"
              fontSize="sm"
              _focus={{ bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}20` }}
              _hover={{ borderColor: '#c0d0f0' }}
            />
          </InputGroup>
          <IconButton 
            icon={<Filter size={14} />} 
            size="sm" 
            variant="outline" 
            borderColor="#dde6f5" 
            color="#64748b" 
            borderRadius="lg"
            _hover={{ borderColor: BRAND, color: BRAND }}
            aria-label="Filter" 
          />
          <IconButton 
            icon={<Download size={14} />} 
            size="sm" 
            variant="outline" 
            borderColor="#dde6f5" 
            color="#64748b" 
            borderRadius="lg"
            _hover={{ borderColor: BRAND, color: BRAND }}
            aria-label="Export" 
          />
          <Button 
            leftIcon={<Plus size={14} />} 
            size="sm"
            bg={BRAND}
            color="white"
            borderRadius="lg" 
            px="6"
            onClick={onAdd}
            _hover={{ bg: '#003d91' }}
            boxShadow={`0 4px 12px ${BRAND}30`}
          >
            Add New
          </Button>
        </HStack>
      </Flex>

      {/* Table Content */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="#f8faff">
            <Tr>
              <Th w="50px" borderBottom="2px solid #e8edf5" py="3.5">
                <Checkbox size="sm" sx={{ '.chakra-checkbox__control[data-checked]': { bg: BRAND, borderColor: BRAND } }} />
              </Th>
              {columns.map((col) => (
                <Th 
                  key={col.header} 
                  color="#64748b"
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.5px"
                  textTransform="uppercase"
                  borderBottom="2px solid #e8edf5"
                  py="3.5"
                >
                  {col.header}
                </Th>
              ))}
              <Th borderBottom="2px solid #e8edf5" textAlign="right" color="#64748b" fontSize="10px" fontWeight="700" letterSpacing="0.5px" textTransform="uppercase" py="3.5">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, i) => (
              <Tr 
                key={i} 
                _hover={{ bg: '#f8faff' }} 
                transition="background 0.15s"
                borderBottom="1px solid #f1f5f9"
              >
                <Td borderBottom="1px solid #f1f5f9" py="3.5">
                  <Checkbox size="sm" sx={{ '.chakra-checkbox__control[data-checked]': { bg: BRAND, borderColor: BRAND } }} />
                </Td>
                {columns.map((col) => (
                  <Td 
                    key={col.header} 
                    borderBottom="1px solid #f1f5f9"
                    py="3.5"
                  >
                    {col.cell ? col.cell(row) : (
                      <Text fontSize="sm" fontWeight="500" color="#475569">
                        {row[col.accessor]}
                      </Text>
                    )}
                  </Td>
                ))}
                <Td borderBottom="1px solid #f1f5f9" textAlign="right" py="3.5">
                  <Menu>
                    <MenuButton 
                      as={IconButton} 
                      icon={<MoreHorizontal size={14} />} 
                      variant="ghost" 
                      size="xs"
                      color="#94a3b8"
                      borderRadius="lg"
                      _hover={{ bg: `${BRAND}10`, color: BRAND }}
                    />
                    <MenuList 
                      bg="white" 
                      borderColor="#e8edf5"
                      boxShadow="0 8px 30px rgba(0,74,173,0.1)"
                      p="2"
                      borderRadius="xl"
                      minW="140px"
                    >
                      <MenuItem icon={<Eye size={13} />} borderRadius="md" _hover={{ bg: `${BRAND}08`, color: BRAND }} color="#475569" fontSize="sm">View</MenuItem>
                      <MenuItem icon={<Edit2 size={13} />} borderRadius="md" _hover={{ bg: `${BRAND}08`, color: BRAND }} color="#475569" fontSize="sm">Edit</MenuItem>
                      <MenuItem icon={<Trash2 size={13} />} borderRadius="md" _hover={{ bg: '#fff0f0', color: ACCENT }} color={ACCENT} fontSize="sm">Delete</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination Footer */}
      <Flex justify="space-between" align="center" px="5" py="3" borderTop="1px solid #f1f5f9" bg="#fafbfc">
        <Text fontSize="xs" color="#94a3b8">Showing 1 to {data.length} of {data.length} entries</Text>
        <HStack spacing="1">
          <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }} isDisabled>Previous</Button>
          <Button size="xs" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#003d91' }} minW="7">1</Button>
          <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>2</Button>
          <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>3</Button>
          <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Next</Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default DataTable;
