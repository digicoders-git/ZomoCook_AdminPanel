import React from 'react';
import { Box, Badge, HStack, Text, Icon, VStack, Button } from '@chakra-ui/react';
import DataTable from '../components/DataTable';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Plus, Filter } from 'lucide-react';
import { PageHeader, PageFooter, BRAND } from '../components/ui';

const JobList = () => {
  const navigate = useNavigate();
  
  const columns = [
    {
      header: 'Job Title',
      accessor: 'title',
      cell: (row) => (
        <VStack align="start" spacing="0">
          <Text fontSize="sm" fontWeight="700" color="#1e293b">{row.title}</Text>
          <Text fontSize="xs" color={BRAND} fontWeight="600">{row.client}</Text>
        </VStack>
      )
    },
    { 
      header: 'Category', 
      accessor: 'category',
      cell: (row) => (
        <Badge bg="#e6eeff" color={BRAND} borderRadius="full" px="2.5" py="0.5" fontSize="10px" fontWeight="700">
          {row.category}
        </Badge>
      )
    },
    { 
      header: 'Salary Range', 
      accessor: 'salary',
      cell: (row) => (
        <HStack spacing="1" color="#16a34a">
          <Icon as={IndianRupee} boxSize={3} />
          <Text fontSize="sm" fontWeight="700">{row.salary}</Text>
        </HStack>
      )
    },
    { 
      header: 'Details', 
      accessor: 'details',
      cell: (row) => (
        <VStack align="start" spacing="1">
          <HStack spacing="1">
            <Icon as={MapPin} boxSize={3} color="#94a3b8" />
            <Text fontSize="xs" color="#64748b" fontWeight="500">{row.location}</Text>
          </HStack>
          <HStack spacing="1">
            <Icon as={Clock} boxSize={3} color="#94a3b8" />
            <Text fontSize="xs" color="#64748b" fontWeight="500">{row.type}</Text>
          </HStack>
        </VStack>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge 
          bg={row.status === 'Active' ? '#ecfdf5' : '#fff0f0'}
          color={row.status === 'Active' ? '#16a34a' : '#ed1c24'}
          border={`1px solid ${row.status === 'Active' ? '#bbf7d0' : '#fecaca'}`}
          borderRadius="full" 
          px="2.5"
          py="0.5"
          fontSize="10px"
          fontWeight="700"
        >
          {row.status}
        </Badge>
      )
    }
  ];

  const data = [
    { id: 1, title: 'Head Chef', client: 'Grand Hyatt', category: 'Hotel Job', salary: '45k - 60k', location: 'Mumbai', type: 'Full-time', status: 'Active' },
    { id: 2, title: 'Home Cook', client: 'Sunil Verma', category: 'Home Cook', salary: '1.5k / day', location: 'Delhi', type: 'Daily Pay', status: 'Active' },
    { id: 3, title: 'Pastry Chef', client: 'Sweet Delights', category: 'Hotel Job', salary: '25k - 35k', location: 'Jaipur', type: 'Part-time', status: 'Closed' },
    { id: 4, title: 'Commis I', client: 'The Taj Palace', category: 'Hotel Job', salary: '20k - 25k', location: 'Goa', type: 'Full-time', status: 'Active' },
    { id: 5, title: 'Bartender', client: 'Sky Bar', category: 'Daily Pay', salary: '2k / shift', location: 'Bangalore', type: 'Shift Based', status: 'Active' },
  ];

  return (
    <Box pb="10">
      <PageHeader
        title="Job Management"
        breadcrumb="Job Management"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Filter</Button>,
          <Button key="add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} onClick={() => navigate('/jobs/add')}>Add</Button>,
        ]}
      />
      
      <DataTable 
        title="Job List" 
        columns={columns} 
        data={data} 
        onAdd={() => navigate('/jobs/add')}
        searchPlaceholder="Search jobs by title, client or location..."
      />
      
      <PageFooter />
    </Box>
  );
};

export default JobList;
