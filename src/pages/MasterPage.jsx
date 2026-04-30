import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, IconButton, Breadcrumb, BreadcrumbItem, BreadcrumbLink, SimpleGrid, FormControl, FormLabel, Input, Select, Switch, Flex, useToast, Skeleton } from '@chakra-ui/react';
import { Plus, Edit, Trash2, ChevronRight, Filter, Home, Save, RotateCcw, List as ListIcon, Play } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageHeader, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';

const MasterPage = () => {
  const { category, action } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isListView = action === 'list';
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [category, action]);

  const formatCategory = (cat) => {
    if (!cat) return '';
    return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getColumns = () => {
    switch (category) {
      case 'job-menu': return ['Sr.No.', 'Position Name', 'Menu Name', 'Status', 'Action'];
      case 'skill-categories': return ['Sr.No.', 'Position Name', 'Category Name', 'Status', 'Action'];
      case 'skills': return ['Sr.No.', 'Category Name', 'Skill Name', 'Status', 'Action'];
      case 'job-types': return ['Sr.No.', 'Job Type', 'Status', 'Action'];
      case 'job-positions': return ['Sr.No.', 'Position Name', 'Color Code', 'Status', 'Action'];
      case 'experience-ranges': return ['Sr.No.', 'Type', 'Experience From', 'Experience To', 'Status', 'Action'];
      case 'salary-ranges': return ['Sr.No.', 'Currency Type', 'Salary Range From', 'Salary Range To', 'Status', 'Action'];
      case 'time-ranges': return ['Sr.No.', 'From Time', 'To Time', 'Status', 'Action'];
      case 'cooking-categories': return ['Sr.No.', 'Category Name', 'Status', 'Action'];
      case 'events': return ['Sr.No.', 'Event Name', 'Status', 'Action'];
      case 'cooking-preferences': return ['Sr.No.', 'Type', 'Name', 'Status', 'Action'];
      case 'facilities': return ['Sr.No.', 'Type', 'Facility Name', 'Status', 'Action'];
      case 'benefits': return ['Sr.No.', 'Benefit Name', 'Status', 'Action'];
      case 'property-categories': return ['Sr.No.', 'Category Name', 'Status', 'Action'];
      case 'sliders': return ['Sr.No.', 'Image', 'Title', 'Link', 'Status', 'Action'];
      case 'videos': return ['Sr.No.', 'Video', 'Title', 'Status', 'Action'];
      case 'cms': return ['Sr.No.', 'Page Title', 'Heading', 'Status', 'Action'];
      case 'states': return ['Sr.No.', 'State Name', 'Status', 'Action'];
      case 'cities': return ['Sr.No.', 'City Name', 'State', 'Status', 'Action'];
      default: return ['Sr.No.', 'Name', 'Status', 'Action'];
    }
  };

  const getSampleData = () => {
    const common = { status: 'active', createdAt: '2026-04-29' };
    switch (category) {
      case 'job-menu': return [
        { id: 1, position: 'Waiter', menu: 'menu 2', ...common },
        { id: 2, position: 'Waiter', menu: 'menu 1', ...common },
        { id: 3, position: 'Bakery Chef', menu: 'test', ...common },
      ];
      case 'skill-categories': return [
        { id: 1, position: 'Waiter', name: 'cook skill category', status: 'active' },
        { id: 2, position: 'Executive Chef', name: 'Test', status: 'inactive' },
      ];
      case 'skills': return [
        { id: 1, cat: 'cook skill category', name: '2', status: 'active' },
        { id: 2, cat: 'cook skill category', name: 'test one', status: 'active' },
      ];
      case 'job-types': return [
        { id: 1, name: 'Live IN', status: 'active' },
        { id: 2, name: 'Full Time', status: 'active' },
      ];
      case 'job-positions': return [
        { id: 1, name: 'Helper', color: '#e00606', status: 'active' },
        { id: 2, name: 'Waiter', color: '#634f4f', status: 'active' },
      ];
      case 'states': return [{ id: 1, name: 'Uttar Pradesh', ...common }, { id: 2, name: 'Delhi', ...common }];
      case 'cities': return [{ id: 1, name: 'Lucknow', state: 'Uttar Pradesh', ...common }];
      default: return [{ id: 1, name: `Sample ${formatCategory(category)} 1`, ...common }];
    }
  };

  const getCellValue = (item, col) => {
    if (col === 'Sr.No.') return <Text color="#64748b" fontSize="sm" fontWeight="600">{item.id}</Text>;
    if (col === 'Position Name') return <Text color="#475569" fontWeight="600" fontSize="sm">{item.position || item.name}</Text>;
    if (col === 'Menu Name' || col === 'Job Type' || col === 'Type' || col === 'Currency Type') return <Text color="#475569" fontWeight="600" fontSize="sm">{item.menu || item.name || item.type || item.currency}</Text>;
    if (col === 'Category Name') return <Text color="#475569" fontWeight="600" fontSize="sm">{category === 'skills' ? item.cat : item.name}</Text>;
    if (col === 'Color Code') return <Text color="#64748b" fontSize="sm">{item.color || '-'}</Text>;
    if (col === 'Skill Name' || col === 'Event Name' || col === 'Facility Name' || col === 'Benefit Name' || col === 'State Name' || col === 'City Name' || col === 'Name') return <Text color="#475569" fontWeight="600" fontSize="sm">{item.name}</Text>;
    if (col === 'State') return <Text color="#64748b" fontSize="sm">{item.state}</Text>;
    if (col === 'Image') return <Box w="40px" h="40px" bg="#f8faff" borderRadius="lg" border="1px solid #e8edf5" />;
    if (col === 'Video') return <Button size="xs" bg={BRAND} color="white" leftIcon={<Play size={11} fill="white" />} borderRadius="lg" _hover={{ bg: '#003d91' }}>Watch</Button>;
    if (col === 'Title' || col === 'Page Title') return <Text color="#475569" fontWeight="600" fontSize="sm">{item.title}</Text>;
    if (col === 'Link') return <Text color={BRAND} fontSize="xs">{item.link}</Text>;
    if (col === 'Heading') return <Text color="#64748b" fontSize="sm">{item.heading}</Text>;
    return '-';
  };

  const renderAddForm = () => {
    const isJobMenu = category === 'job-menu';
    const isSkillCategory = category === 'skill-categories';
    const isSkills = category === 'skills';
    const isPosition = category === 'job-positions';
    
    return (
      <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
        <Flex justify="space-between" align="center" px="5" py="4" borderBottom="1px solid #f1f5f9">
          <HStack spacing="3">
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">
              {isJobMenu ? 'Add Menu Item Record' : isSkillCategory || isSkills ? 'Add Skill Category Record' : isPosition ? 'Add Position Record' : `Add ${formatCategory(category)} Record`}
            </Text>
          </HStack>
          <Button as={Link} to={`/masters/${category}/list`} leftIcon={<ListIcon size={13} />} bg={BRAND} color="white" size="sm" borderRadius="lg" _hover={{ bg: '#003d91' }} fontSize="xs" px="4">List</Button>
        </Flex>

        <Box p={{ base: '5', md: '8' }}>
          <SimpleGrid columns={{ base: 1, md: (isJobMenu || isSkillCategory || isSkills || isPosition || category === 'cities') ? 3 : 2 }} spacing="5" mb="6">
            {(isJobMenu || isSkillCategory) ? (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>Position</FormLabel><Select {...selectStyle} placeholder="Select Position"><option>Position 1</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>{isJobMenu ? 'Menu Name' : 'Category Name'}</FormLabel><Input {...inputStyle} placeholder={isJobMenu ? 'Enter name' : 'Enter Category Name'} /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </>
            ) : isSkills ? (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>Skill Category</FormLabel><Select {...selectStyle} placeholder="Select Skill Category"><option>Cooking</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Skill Name</FormLabel><Input {...inputStyle} placeholder="Enter Skill Name" /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </>
            ) : isPosition ? (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>Position Name</FormLabel><Input {...inputStyle} placeholder="Enter Position Name" /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Color Code (Hex)</FormLabel><Input {...inputStyle} placeholder="Enter Color Code" /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </>
            ) : category === 'cities' ? (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>Select State</FormLabel><Select {...selectStyle} placeholder="Choose State"><option>Uttar Pradesh</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>City Name</FormLabel><Input {...inputStyle} placeholder="Enter city name" /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </>
            ) : category === 'cms' ? (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>Page Title</FormLabel><Input {...inputStyle} placeholder="Enter page title" /></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Heading</FormLabel><Input {...inputStyle} placeholder="Enter heading" /></FormControl>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel {...labelStyle}>Content</FormLabel>
                  <Box bg="white" borderRadius="lg" overflow="hidden" border="1.5px solid #dde6f5"><ReactQuill theme="snow" /></Box>
                </FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </>
            ) : (
              <>
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>{category === 'job-types' ? 'Job Type' : (category === 'cooking-categories' || category === 'property-categories') ? 'Category Name' : category === 'events' ? 'Event Name' : category === 'benefits' ? 'Benefit Name' : `${formatCategory(category)} Name`}</FormLabel>
                  <Input {...inputStyle} placeholder={`Enter ${formatCategory(category)} name`} />
                </FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
              </>
            )}
          </SimpleGrid>

          <HStack spacing="3" justify="flex-end">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate(`/masters/${category}/list`)}>Reset</Button>
            <Button leftIcon={<Save size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Submit</Button>
          </HStack>
        </Box>
      </Box>
    );
  };

  const renderListView = () => (
    <VStack spacing="5" align="stretch">
      <Box bg="white" p="5" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
        <Flex justify="space-between" align="center" wrap="wrap" gap="3">
          <HStack spacing="3">
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">{formatCategory(category)} Record List</Text>
          </HStack>
          <HStack spacing="2">
            <Button leftIcon={<Filter size={13} />} variant="outline" size="sm" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>
            <Button leftIcon={<Plus size={13} />} bg={BRAND} color="white" size="sm" borderRadius="lg" _hover={{ bg: '#003d91' }} onClick={() => navigate(`/masters/${category}/add`)}>Add</Button>
          </HStack>
        </Flex>
      </Box>

      <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
        <Flex px="5" py="3" justify="space-between" align="center" borderBottom="1px solid #f1f5f9">
          <HStack spacing="2">
            <Text fontSize="xs" color="#64748b">Show</Text>
            <Select size="xs" w="60px" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" defaultValue="10" _focus={{ borderColor: BRAND }}>
              <option value="10">10</option>
              <option value="25">25</option>
            </Select>
            <Text fontSize="xs" color="#64748b">entries</Text>
          </HStack>
          <HStack spacing="2">
            <Text fontSize="xs" color="#64748b">Search:</Text>
            <Input size="xs" w="180px" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" _focus={{ borderColor: BRAND }} />
          </HStack>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#f8faff">
              <Tr>{getColumns().map(col => <Th key={col} color="#64748b" fontSize="10px" fontWeight="700" letterSpacing="0.5px" textTransform="uppercase" py="3.5" borderBottom="2px solid #e8edf5">{col}</Th>)}</Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Tr key={i}>{getColumns().map((col, idx) => <Td key={idx} py="3.5"><Skeleton height="16px" borderRadius="md" /></Td>)}</Tr>
                ))
              ) : getSampleData().map((item) => (
                <Tr key={item.id} _hover={{ bg: '#f8faff' }} transition="background 0.15s" borderBottom="1px solid #f1f5f9">
                  {getColumns().map(col => (
                    <Td key={col} py="3.5">
                      {col === 'Action' ? (
                        <HStack spacing="1.5">
                          <IconButton size="xs" icon={<Edit size={12} />} bg="#e6eeff" color={BRAND} borderRadius="lg" _hover={{ bg: BRAND, color: 'white' }} aria-label="Edit" />
                          {['job-types', 'cooking-categories', 'events', 'benefits', 'property-categories'].includes(category) && (
                            <IconButton size="xs" icon={<Trash2 size={12} />} bg="#fff0f0" color={ACCENT} borderRadius="lg" _hover={{ bg: ACCENT, color: 'white' }} aria-label="Delete" />
                          )}
                        </HStack>
                      ) : col === 'Status' ? (
                        <Switch size="sm" isChecked={item.status === 'active'} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} />
                      ) : getCellValue(item, col)}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex justify="space-between" align="center" px="5" py="3" borderTop="1px solid #f1f5f9" bg="#fafbfc">
          <Text fontSize="xs" color="#94a3b8">Showing 1 to {getSampleData().length} of {getSampleData().length} entries</Text>
          <HStack spacing="1">
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Previous</Button>
            <Button size="xs" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#003d91' }} minW="7">1</Button>
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Next</Button>
          </HStack>
        </Flex>
      </Box>
    </VStack>
  );

  const pageTitle = category === 'job-menu' ? (action === 'add' ? 'Add Menu Item Record' : 'Menu Item Record List') : (action === 'add' ? `Add ${formatCategory(category)} Record` : `${formatCategory(category)} Record List`);

  return (
    <Box pb="10">
      <PageHeader title={pageTitle} breadcrumb={pageTitle} />
      {isListView ? renderListView() : renderAddForm()}
      <PageFooter />
    </Box>
  );
};

export default MasterPage;
