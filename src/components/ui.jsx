// Shared UI constants and components used across all pages
import React from 'react';
import {
  Box, Flex, Text, HStack, VStack, Icon, Button, Select, Input,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, Badge,
} from '@chakra-ui/react';
import { ChevronRight, LayoutDashboard, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BRAND = '#004aad';
export const ACCENT = '#ed1c24';

// Page header with breadcrumb + title + optional action buttons
export const PageHeader = ({ title, breadcrumb, actions }) => (
  <Flex align="center" justify="space-between" mb="6" wrap="wrap" gap="3">
    <VStack align="start" spacing="1">
      <Breadcrumb spacing="6px" separator={<ChevronRight size={11} color="#94a3b8" />} fontSize="xs" color="#94a3b8">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/" display="flex" alignItems="center" gap="1" _hover={{ color: BRAND }}>
            <Icon as={LayoutDashboard} boxSize={3} /> Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumb && (
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color={BRAND} fontWeight="600">{breadcrumb}</BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>
      <HStack spacing="3" align="center">
        <Box w="4px" h="26px" bg={`linear-gradient(180deg, ${BRAND}, ${ACCENT})`} borderRadius="full" />
        <Text fontSize="2xl" fontWeight="800" color="#1e293b">{title}</Text>
      </HStack>
    </VStack>
    {actions && <HStack spacing="2">{actions}</HStack>}
  </Flex>
);

// White card wrapper for tables
export const TableCard = ({ children }) => (
  <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
    {children}
  </Box>
);

// Table controls bar (show entries + search)
export const TableControls = ({ defaultEntries = "10", searchPlaceholder = "Search..." }) => (
  <Flex px="5" py="4" justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap="3" borderBottom="1px solid #f1f5f9">
    <HStack spacing="2">
      <Text fontSize="sm" color="#64748b">Show</Text>
      <Select size="sm" w="70px" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" defaultValue={defaultEntries}
        _focus={{ borderColor: BRAND }}>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </Select>
      <Text fontSize="sm" color="#64748b">entries</Text>
    </HStack>
    <HStack spacing="2">
      <Text fontSize="sm" color="#64748b">Search:</Text>
      <Input size="sm" w={{ base: 'full', md: '220px' }} placeholder={searchPlaceholder}
        bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg"
        _focus={{ borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}20` }} />
    </HStack>
  </Flex>
);

// Table header row style
export const tableHeadStyle = { bg: '#eef2f7', borderBottom: '1px solid #e2e8f0' };
export const thStyle = { 
  color: '#475569', 
  fontSize: '11px', 
  fontWeight: '700', 
  letterSpacing: '0.5px', 
  textTransform: 'uppercase', 
  py: '4',
  borderRight: '1px solid #e2e8f0',
  _last: { borderRight: 'none' }
};
export const tdStyle = {
  fontSize: 'sm',
  borderRight: '1px solid #e2e8f0',
  _last: { borderRight: 'none' },
  verticalAlign: 'top',
  py: '4'
};
export const trHover = { _hover: { bg: '#f8fafc' }, transition: 'background 0.1s', borderBottom: '1px solid #e2e8f0' };

// Table pagination footer
export const TableFooter = ({ showing, total }) => (
  <Flex justify="space-between" align="center" px="5" py="3" borderTop="1px solid #f1f5f9" bg="#fafbfc">
    <Text fontSize="xs" color="#94a3b8">Showing {showing} of {total} entries</Text>
    <HStack spacing="1">
      <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Previous</Button>
      <Button size="xs" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#003d91' }} minW="7">1</Button>
      <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Next</Button>
    </HStack>
  </Flex>
);

// Form card wrapper
export const FormCard = ({ headerTitle, backTo, backLabel = 'Back to List', children }) => (
  <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
    <Flex justify="space-between" align="center" px="6" py="4" borderBottom="1px solid #f1f5f9">
      <HStack spacing="3">
        <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
        <Text fontSize="sm" fontWeight="700" color="#1e293b">{headerTitle}</Text>
      </HStack>
      {backTo && (
        <Button as={Link} to={backTo} size="sm" bg={BRAND} color="white" borderRadius="lg"
          _hover={{ bg: '#003d91' }} fontSize="xs" fontWeight="600" px="4">
          {backLabel}
        </Button>
      )}
    </Flex>
    <Box p={{ base: '5', md: '8' }}>{children}</Box>
  </Box>
);

// Form label style
export const labelStyle = { fontSize: 'xs', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', mb: '1.5' };

// Input style props
export const inputStyle = {
  bg: '#f8faff', border: '1.5px solid #dde6f5', borderRadius: 'lg', fontSize: 'sm', color: '#1e293b',
  _focus: { bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}18` },
  _hover: { borderColor: '#c0d0f0' },
};

// Select style props
export const selectStyle = {
  bg: '#f8faff', border: '1.5px solid #dde6f5', borderRadius: 'lg', fontSize: 'sm', color: '#1e293b',
  _focus: { bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}18` },
};

// File upload button
export const FileUploadField = ({ label }) => (
  <Flex align="center" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" px="3" py="2.5"
    position="relative" cursor="pointer" _hover={{ borderColor: BRAND }}>
    <Text fontSize="xs" color="#94a3b8">{label || 'Choose File'}</Text>
    <Input type="file" position="absolute" opacity="0" w="full" h="full" cursor="pointer" top="0" left="0" />
  </Flex>
);

// Action buttons for forms
export const FormActions = ({ onReset, submitLabel = 'Submit', isLoading }) => (
  <HStack justify="flex-end" spacing="3" pt="2">
    <Button onClick={onReset} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm"
      _hover={{ bg: '#f8faff', borderColor: BRAND, color: BRAND }}>
      Reset
    </Button>
    <Button type="submit" bg={BRAND} color="white" borderRadius="lg" size="sm" px="6"
      _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`} isLoading={isLoading}>
      {submitLabel}
    </Button>
  </HStack>
);

// Status badge
export const StatusBadge = ({ active }) => (
  <Badge px="2.5" py="0.5" borderRadius="full" fontSize="10px" fontWeight="700"
    bg={active ? '#ecfdf5' : '#fff0f0'} color={active ? '#16a34a' : ACCENT}
    border={`1px solid ${active ? '#bbf7d0' : '#fecaca'}`}>
    {active ? 'Active' : 'Inactive'}
  </Badge>
);

// Page footer
export const PageFooter = () => (
  <Flex justify="center" pt="8" pb="2">
    <HStack spacing="2">
      <Box w="5px" h="5px" borderRadius="full" bg={BRAND} />
      <Text fontSize="xs" color="#94a3b8" fontWeight="500">© 2026 ZomoCook. All rights reserved.Crefted with ❤️ by <a href="https://digicoders.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(255, 0, 0)', textDecoration: 'underline', fontWeight: 'bold',fontSize: '14px' }}>Team Digicoders</a></Text>
      <Box w="5px" h="5px" borderRadius="full" bg={ACCENT} />
    </HStack>
  </Flex>
);
