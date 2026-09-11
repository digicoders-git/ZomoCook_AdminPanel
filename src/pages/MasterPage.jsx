import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  IconButton, SimpleGrid, FormControl, FormLabel, Input, Select, Switch,
  Flex, useToast, Spinner, Badge, Image, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '@chakra-ui/react';
import {
  Plus, Edit, Trash2, Save, RotateCcw, List as ListIcon, RefreshCcw, AlertTriangle
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageHeader, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle, thStyle, trHover, ConfirmationModal } from '../components/ui';
import axios from 'axios';

const MasterPage = () => {
  const { category, action } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isListView = action === 'list' || !action;

  const [data, setData] = useState([]);
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Confirmation Modal States
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    description: '',
    onConfirm: () => { },
    type: 'danger',
    confirmLabel: 'Confirm'
  });

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    parentId: '',
    status: 'active',
    link: '',
    heading: '',
    content: '',
    experienceFrom: '',
    experienceTo: '',
    salaryFrom: '',
    salaryTo: '',
    timeFrom: '',
    timeTo: ''
  });
  const [file, setFile] = useState(null);

  // Quick Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    value: '',
    parentId: '',
    status: 'active',
    link: '',
    heading: '',
    content: '',
    experienceFrom: '',
    experienceTo: '',
    salaryFrom: '',
    salaryTo: '',
    timeFrom: '',
    timeTo: ''
  });
  const [editFile, setEditFile] = useState(null);

  const handleOpenEdit = (item) => {
    fetchParents();
    setEditingItem(item);
    setEditFormData({
      name: item.name || '',
      value: item.value || '',
      parentId: item.parentId?._id || item.parentId || '',
      status: item.status || 'active',
      link: item.link || '',
      heading: item.heading || '',
      content: item.content || '',
      experienceFrom: item.experienceFrom || '',
      experienceTo: item.experienceTo || '',
      salaryFrom: item.salaryFrom || '',
      salaryTo: item.salaryTo || '',
      timeFrom: item.timeFrom || '',
      timeTo: item.timeTo || ''
    });
    setEditFile(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const payload = new FormData();
      const submissionData = { ...editFormData };
      if (category === 'time-ranges' && !submissionData.name) submissionData.name = 'Time Slot';

      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] !== undefined && submissionData[key] !== null) {
          payload.append(key, submissionData[key]);
        }
      });
      if (editFile) payload.append('image', editFile);

      const response = await axios.put(`${apiUrl}/masters/${editingItem._id}`, payload, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        toast({ title: 'Success', description: 'Record updated successfully.', status: 'success' });
        setIsEditOpen(false);
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update record', status: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('adminToken');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/masters/${category}`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.masters);
        setSelectedIds([]);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch records', status: 'error' });
    } finally { setIsLoading(false); }
  };

  const fetchParents = async () => {
    let parentCategory = '';
    if (category === 'job-menu' || category === 'skill-categories') parentCategory = 'job-positions';
    if (category === 'skills') parentCategory = 'skill-categories';
    if (category === 'cities') parentCategory = 'states';
    if (category === 'cooking-preferences') parentCategory = 'cooking-categories';
    if (category === 'facilities') parentCategory = 'property-categories';
    if (!parentCategory) return;
    try {
      const response = await axios.get(`${apiUrl}/masters/${parentCategory}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) setParents(response.data.masters);
    } catch (error) { console.error('Failed to fetch parents'); }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
    if (isListView) fetchData();
    else {
      fetchParents();
      setFormData({ name: '', value: '', parentId: '', status: 'active', link: '', heading: '', content: '', experienceFrom: '', experienceTo: '', salaryFrom: '', salaryTo: '', timeFrom: '', timeTo: '' });
      setFile(null);
    }
  }, [category, action, searchTerm]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data.map(item => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      title: `Delete ${selectedIds.length} Selected Records?`,
      description: `Are you sure you want to delete ${selectedIds.length} record(s)? This action cannot be undone.`,
      confirmLabel: 'Delete Selected',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.post(`${apiUrl}/masters/bulk-delete`, { ids: selectedIds }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          toast({ title: 'Deleted', description: `${selectedIds.length} item(s) deleted successfully.`, status: 'success' });
          setSelectedIds([]);
          fetchData();
        } catch (error) {
          toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete selected records', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = new FormData();
      const submissionData = { ...formData };
      if (category === 'time-ranges' && !submissionData.name) submissionData.name = 'Time Slot';

      Object.keys(submissionData).forEach(key => payload.append(key, submissionData[key]));
      if (file) payload.append('image', file);
      const response = await axios.post(`${apiUrl}/masters/${category}`, payload, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        toast({ title: 'Success', description: 'Record created.', status: 'success' });
        navigate(`/masters/${category}/list`);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed', status: 'error' });
    } finally { setIsSaving(false); }
  };

  const handleToggleStatus = (id, currentStatus) => {
    setConfirmConfig({
      title: 'Change Status?',
      description: `Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this record?`,
      confirmLabel: currentStatus === 'active' ? 'Deactivate' : 'Activate',
      type: 'info',
      onConfirm: async () => {
        try {
          const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
          await axios.put(`${apiUrl}/masters/${id}`, { status: newStatus }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setData(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
          toast({ title: 'Status Updated', status: 'success', duration: 2000 });
        } catch (error) { toast({ title: 'Error', status: 'error' }); }
        onClose();
      }
    });
    onOpen();
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Record?',
      description: 'This will permanently remove the record. This action cannot be undone.',
      confirmLabel: 'Delete Now',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${apiUrl}/masters/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setData(prev => prev.filter(item => item._id !== id));
          setSelectedIds(prev => prev.filter(i => i !== id));
          toast({ title: 'Deleted Successfully', status: 'success' });
        } catch (error) { toast({ title: 'Error', status: 'error' }); }
        onClose();
      }
    });
    onOpen();
  };

  const formatCategory = (cat) => cat ? cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  const getColumns = () => {
    switch (category) {
      case 'job-menu': return ['SR.NO.', 'POSITION', 'MENU NAME', 'STATUS', 'ACTION'];
      case 'job-categories': return ['SR.NO.', 'CATEGORY NAME', 'STATUS', 'ACTION'];
      case 'skill-categories': return ['SR.NO.', 'POSITION', 'CATEGORY NAME', 'STATUS', 'ACTION'];
      case 'skills': return ['SR.NO.', 'CATEGORY', 'SKILL NAME', 'STATUS', 'ACTION'];
      case 'job-positions': return ['SR.NO.', 'POSITION NAME', 'COLOR', 'STATUS', 'ACTION'];
      case 'experiences': return ['SR.NO.', 'EXPERIENCE REQUIRED', 'STATUS', 'ACTION'];
      case 'salaries': return ['SR.NO.', 'OFFERED SALARY', 'STATUS', 'ACTION'];
      case 'time-ranges': return ['SR.NO.', 'FROM TIME', 'TO TIME', 'STATUS', 'ACTION'];
      case 'cooking-preferences': return ['SR.NO.', 'TYPE', 'PREFERENCE NAME', 'STATUS', 'ACTION'];
      case 'facilities': return ['SR.NO.', 'TYPE', 'FACILITY NAME', 'STATUS', 'ACTION'];
      case 'cities': return ['SR.NO.', 'STATE', 'CITY NAME', 'STATUS', 'ACTION'];
      case 'states': return ['SR.NO.', 'STATE NAME', 'STATUS', 'ACTION'];
      case 'sliders': return ['SR.NO.', 'IMAGE', 'TITLE', 'STATUS', 'ACTION'];
      case 'videos': return ['SR.NO.', 'TITLE', 'VIDEO URL', 'STATUS', 'ACTION'];
      case 'cms': return ['SR.NO.', 'PAGENAME', 'HEADING', 'STATUS', 'ACTION'];
      default: return ['SR.NO.', 'NAME', 'STATUS', 'ACTION'];
    }
  };

  const renderAddForm = () => {
    const isJobMenu = category === 'job-menu';
    const isJobCategory = category === 'job-categories';
    const isSkillCategory = category === 'skill-categories';
    const isSkills = category === 'skills';
    const isPosition = category === 'job-positions';
    const isCity = category === 'cities';
    const isExpRange = category === 'experience-ranges';
    const isSalaryRange = category === 'salary-ranges';
    const isTimeRange = category === 'time-ranges';
    const isCookingPref = category === 'cooking-preferences';
    const isFacility = category === 'facilities';
    const isSlider = category === 'sliders';
    const isVideo = category === 'videos';
    const isCMS = category === 'cms';

    return (
      <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm">
        <Flex justify="space-between" align="center" px="5" py="4" borderBottom="1px solid #f1f5f9">
          <HStack spacing="3">
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Add {formatCategory(category)} Record</Text>
          </HStack>
          <Button as={Link} to={`/masters/${category}/list`} leftIcon={<ListIcon size={13} />} bg="#ff6b2b" color="white" size="sm" borderRadius="lg" _hover={{ bg: '#e55a1d' }}>List</Button>
        </Flex>
        <Box p="8">
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: isCMS ? 2 : 3 }} spacing="5" mb="6">
              {(isJobMenu || isSkillCategory || isSkills || isCity || isCookingPref || isFacility) && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>{isCity ? 'Select State' : isSkills ? 'Skill Category' : (isCookingPref || isFacility) ? 'Type' : 'Select Position'}</FormLabel>
                  <Select {...selectStyle} placeholder={(isCookingPref || isFacility) ? 'Select Type' : 'Choose Parent'} value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}>
                    {parents.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </Select>
                </FormControl>
              )}

              {!isTimeRange && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>{isCMS ? 'Pagename' : (isSlider || isVideo) ? 'Title' : category === 'experiences' ? 'Experience Required' : category === 'salaries' ? 'Offered Salary' : isSalaryRange ? 'Currency Type' : isExpRange ? 'Type' : isJobMenu ? 'Menu Name' : isPosition ? 'Position Name' : isCity ? 'City Name' : isFacility ? 'Facility Name' : isJobCategory ? 'Category Name' : 'Name'}</FormLabel>
                  {isCMS ? (
                    <Select {...selectStyle} placeholder="Select Pagename" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}>
                      <option value="About Us">About Us</option>
                      <option value="Privacy Policy">Privacy Policy</option>
                      <option value="Terms & Conditions">Terms & Conditions</option>
                      <option value="Contact Us">Contact Us</option>
                    </Select>
                  ) : (
                    <Input {...inputStyle} placeholder={(isSlider || isVideo) ? 'Enter Title' : category === 'experiences' ? 'Enter Experience Required (e.g., Fresher, 1 – 2 years)' : category === 'salaries' ? 'Enter Offered Salary (e.g., ₹35,000 – ₹50,000/month)' : isSalaryRange ? 'Enter Currency Type' : isExpRange ? 'Enter Type' : isFacility ? 'Enter Facility Name' : isJobCategory ? 'Enter Category Name' : 'Enter Name'} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  )}
                </FormControl>
              )}

              {isCMS && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Heading</FormLabel>
                  <Input {...inputStyle} placeholder="Enter Heading" value={formData.heading} onChange={(e) => setFormData({ ...formData, heading: e.target.value })} />
                </FormControl>
              )}

              {isSlider && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Image</FormLabel>
                  <Input type="file" p="1" {...inputStyle} onChange={(e) => setFile(e.target.files[0])} />
                </FormControl>
              )}

              {isVideo && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Video Url</FormLabel>
                  <Input {...inputStyle} placeholder="Enter Video Url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                </FormControl>
              )}

              {isTimeRange && (
                <>
                  <FormControl isRequired><FormLabel {...labelStyle}>From Time</FormLabel><Input {...inputStyle} placeholder="Enter From Time" value={formData.timeFrom} onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>To Time</FormLabel><Input {...inputStyle} placeholder="Enter To Time" value={formData.timeTo} onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })} /></FormControl>
                </>
              )}

              {isExpRange && (
                <>
                  <FormControl isRequired><FormLabel {...labelStyle}>Experience From</FormLabel><Input {...inputStyle} placeholder="Enter Range From" value={formData.experienceFrom} onChange={(e) => setFormData({ ...formData, experienceFrom: e.target.value })} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Experience To</FormLabel><Input {...inputStyle} placeholder="Enter Range To" value={formData.experienceTo} onChange={(e) => setFormData({ ...formData, experienceTo: e.target.value })} /></FormControl>
                </>
              )}

              {isSalaryRange && (
                <>
                  <FormControl isRequired><FormLabel {...labelStyle}>Salary Range From</FormLabel><Input {...inputStyle} placeholder="Enter Range From" value={formData.salaryFrom} onChange={(e) => setFormData({ ...formData, salaryFrom: e.target.value })} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Salary Range To</FormLabel><Input {...inputStyle} placeholder="Enter Range To" value={formData.salaryTo} onChange={(e) => setFormData({ ...formData, salaryTo: e.target.value })} /></FormControl>
                </>
              )}

              {isPosition && (
                <FormControl isRequired>
                  <FormLabel {...labelStyle}>Color Code (Hex)</FormLabel>
                  <Input {...inputStyle} placeholder="#000000" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel {...labelStyle}>Status</FormLabel>
                <Select {...selectStyle} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            {isCMS && (
              <FormControl isRequired mb="6">
                <FormLabel {...labelStyle}>Description</FormLabel>
                <Box border="1px solid #e2e8f0" borderRadius="lg" overflow="hidden">
                  <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData({ ...formData, content: val })} style={{ height: '250px', marginBottom: '40px' }} />
                </Box>
              </FormControl>
            )}

            <HStack spacing="3" justify="flex-end">
              <Button leftIcon={<RotateCcw size={14} />} variant="outline" size="sm" onClick={() => navigate(`/masters/${category}/list`)} bg="#3b7280" color="white" border="none" _hover={{ bg: '#2d5a65' }}>Reset</Button>
              <Button type="submit" isLoading={isSaving} leftIcon={<Save size={14} />} bg="#ff6b2b" color="white" size="sm" px="6" _hover={{ bg: '#e55a1d' }}>Submit</Button>
            </HStack>
          </form>
        </Box>
      </Box>
    );
  };

  const renderListView = () => {
    const isTimeRange = category === 'time-ranges';
    const isCookingPref = category === 'cooking-preferences';
    const isFacility = category === 'facilities';
    const isSlider = category === 'sliders';
    const isVideo = category === 'videos';
    const isCMS = category === 'cms';
    return (
      <VStack spacing="5" align="stretch">
        <Box bg="white" p="5" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm">
          <Flex justify="space-between" align="center">
            <HStack spacing="3">
              <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
              <Text fontSize="sm" fontWeight="700" color="#1e293b">{formatCategory(category)} Record List</Text>
            </HStack>
            <HStack spacing="2">
              <IconButton icon={<RefreshCcw size={14} />} size="sm" variant="outline" onClick={fetchData} aria-label="Refresh" />
              <Button leftIcon={<Plus size={13} />} bg={BRAND} color="white" size="sm" borderRadius="lg" onClick={() => navigate(`/masters/${category}/add`)}>Add New</Button>
            </HStack>
          </Flex>
        </Box>
        <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="sm">
          <Box px="5" py="4" borderBottom="1px solid #f1f5f9">
            <Input placeholder="Search..." size="sm" maxW="300px" borderRadius="lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Box>
          <Box overflowX="auto">
            {isLoading ? <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex> : (
              <Table variant="simple" size="sm">
                <Thead bg="#f8faff"><Tr>{getColumns().map(col => <Th key={col} {...thStyle} py="4">{col}</Th>)}</Tr></Thead>
                <Tbody>
                  {data.map((item, i) => (
                    <Tr key={item._id} {...trHover}>
                      <Td py="4" color="#64748b" fontSize="xs" fontWeight="600">{i + 1}</Td>
                      {isSlider && <Td py="4"><Image src={`${apiUrl}/${item.image}`} w="60px" h="40px" borderRadius="lg" objectFit="cover" fallbackSrc="https://via.placeholder.com/60x40" /></Td>}
                      {(category === 'job-menu' || category === 'skill-categories' || category === 'skills' || category === 'cities' || isCookingPref || isFacility) && (
                        <Td py="4" color="#475569" fontSize="xs" fontWeight="600">{item.parentId?.name || 'N/A'}</Td>
                      )}
                      {!isTimeRange && <Td py="4" color="#1e293b" fontSize="xs" fontWeight="700">{item.name}</Td>}
                      {isCMS && <Td py="4" color="#475569" fontSize="xs">{item.heading}</Td>}
                      {isVideo && <Td py="4" color="#475569" fontSize="xs" maxW="200px" isTruncated>{item.link}</Td>}
                      {category === 'experience-ranges' && (
                        <>
                          <Td py="4" color="#475569" fontSize="xs">{item.experienceFrom}</Td>
                          <Td py="4" color="#475569" fontSize="xs">{item.experienceTo}</Td>
                        </>
                      )}
                      {category === 'salary-ranges' && (
                        <>
                          <Td py="4" color="#475569" fontSize="xs">{item.salaryFrom}</Td>
                          <Td py="4" color="#475569" fontSize="xs">{item.salaryTo}</Td>
                        </>
                      )}
                      {category === 'time-ranges' && (
                        <>
                          <Td py="4" color="#475569" fontSize="xs">{item.timeFrom}</Td>
                          <Td py="4" color="#475569" fontSize="xs">{item.timeTo}</Td>
                        </>
                      )}
                      {category === 'job-positions' && <Td py="4"><Badge bg={item.value} color="white" px="2">{item.value}</Badge></Td>}
                      <Td py="4"><Switch size="sm" isChecked={item.status === 'active'} onChange={() => handleToggleStatus(item._id, item.status)} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} /></Td>
                      <Td py="4">
                        <HStack spacing="2">
                          <IconButton
                            size="xs"
                            icon={<Edit size={12} />}
                            bg="#eef2ff"
                            color="#3b82f6"
                            borderRadius="lg"
                            _hover={{ bg: '#3b82f6', color: 'white' }}
                            onClick={() => handleOpenEdit(item)}
                            aria-label="Edit"
                            title="Quick Edit Record"
                          />
                          <IconButton
                            size="xs"
                            icon={<Trash2 size={12} />}
                            bg="#fff0f0"
                            color={ACCENT}
                            borderRadius="lg"
                            _hover={{ bg: ACCENT, color: 'white' }}
                            onClick={() => handleDelete(item._id)}
                            aria-label="Delete"
                            title="Delete Record"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </Box>
      </VStack>
    );
  };

  const isJobMenu = category === 'job-menu';
  const isJobCategory = category === 'job-categories';
  const isSkillCategory = category === 'skill-categories';
  const isSkills = category === 'skills';
  const isPosition = category === 'job-positions';
  const isCity = category === 'cities';
  const isExpRange = category === 'experience-ranges';
  const isSalaryRange = category === 'salary-ranges';
  const isTimeRange = category === 'time-ranges';
  const isCookingPref = category === 'cooking-preferences';
  const isFacility = category === 'facilities';
  const isSlider = category === 'sliders';
  const isVideo = category === 'videos';
  const isCMS = category === 'cms';

  return (
    <Box pb="10">
      <PageHeader title={formatCategory(category)} breadcrumb={formatCategory(category)} />
      {isListView ? renderListView() : renderAddForm()}
      <PageFooter />

      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel={confirmConfig.confirmLabel}
        type={confirmConfig.type}
        confirmColor={confirmConfig.type === 'danger' ? ACCENT : BRAND}
      />

      {/* Quick Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size={isCMS ? "2xl" : "lg"} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden">
          <ModalHeader bg="#f8faff" borderBottom="1px solid #e8edf5" fontSize="md" fontWeight="700">
            Edit {formatCategory(category)} Record
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSaveEdit}>
            <ModalBody p="6">
              <VStack spacing="4" align="stretch">
                {(isJobMenu || isSkillCategory || isSkills || isCity || isCookingPref || isFacility) && (
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Parent / Group</FormLabel>
                    <Select {...selectStyle} value={editFormData.parentId} onChange={(e) => setEditFormData({ ...editFormData, parentId: e.target.value })}>
                      {parents.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </Select>
                  </FormControl>
                )}

                {!isTimeRange && (
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>{isCMS ? 'Pagename' : (isSlider || isVideo) ? 'Title' : category === 'experiences' ? 'Experience Required' : category === 'salaries' ? 'Offered Salary' : isSalaryRange ? 'Currency Type' : isExpRange ? 'Type' : isJobMenu ? 'Menu Name' : isPosition ? 'Position Name' : isCity ? 'City Name' : isFacility ? 'Facility Name' : isJobCategory ? 'Category Name' : 'Name'}</FormLabel>
                    {isCMS ? (
                      <Select {...selectStyle} value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}>
                        <option value="About Us">About Us</option>
                        <option value="Privacy Policy">Privacy Policy</option>
                        <option value="Terms & Conditions">Terms & Conditions</option>
                        <option value="Contact Us">Contact Us</option>
                      </Select>
                    ) : (
                      <Input {...inputStyle} value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                    )}
                  </FormControl>
                )}

                {isPosition && (
                  <FormControl>
                    <FormLabel {...labelStyle}>Color / Code</FormLabel>
                    <Input {...inputStyle} value={editFormData.value} onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })} />
                  </FormControl>
                )}

                {isCMS && (
                  <>
                    <FormControl isRequired>
                      <FormLabel {...labelStyle}>Heading</FormLabel>
                      <Input {...inputStyle} value={editFormData.heading} onChange={(e) => setEditFormData({ ...editFormData, heading: e.target.value })} />
                    </FormControl>
                    <FormControl mt={3}>
                      <FormLabel {...labelStyle}>Content</FormLabel>
                      <ReactQuill theme="snow" value={editFormData.content} onChange={(val) => setEditFormData({ ...editFormData, content: val })} />
                    </FormControl>
                  </>
                )}

                {isSlider && (
                  <FormControl>
                    <FormLabel {...labelStyle}>Change Image (Optional)</FormLabel>
                    <Input type="file" p="1" {...inputStyle} onChange={(e) => setEditFile(e.target.files[0])} />
                  </FormControl>
                )}

                {isVideo && (
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Video URL</FormLabel>
                    <Input {...inputStyle} value={editFormData.link} onChange={(e) => setEditFormData({ ...editFormData, link: e.target.value })} />
                  </FormControl>
                )}

                {category === 'experience-ranges' && (
                  <HStack spacing="3">
                    <FormControl>
                      <FormLabel {...labelStyle}>Experience From</FormLabel>
                      <Input {...inputStyle} value={editFormData.experienceFrom} onChange={(e) => setEditFormData({ ...editFormData, experienceFrom: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel {...labelStyle}>Experience To</FormLabel>
                      <Input {...inputStyle} value={editFormData.experienceTo} onChange={(e) => setEditFormData({ ...editFormData, experienceTo: e.target.value })} />
                    </FormControl>
                  </HStack>
                )}

                {category === 'salary-ranges' && (
                  <HStack spacing="3">
                    <FormControl>
                      <FormLabel {...labelStyle}>Salary From</FormLabel>
                      <Input {...inputStyle} value={editFormData.salaryFrom} onChange={(e) => setEditFormData({ ...editFormData, salaryFrom: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel {...labelStyle}>Salary To</FormLabel>
                      <Input {...inputStyle} value={editFormData.salaryTo} onChange={(e) => setEditFormData({ ...editFormData, salaryTo: e.target.value })} />
                    </FormControl>
                  </HStack>
                )}

                {category === 'time-ranges' && (
                  <HStack spacing="3">
                    <FormControl>
                      <FormLabel {...labelStyle}>From Time</FormLabel>
                      <Input type="time" {...inputStyle} value={editFormData.timeFrom} onChange={(e) => setEditFormData({ ...editFormData, timeFrom: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel {...labelStyle}>To Time</FormLabel>
                      <Input type="time" {...inputStyle} value={editFormData.timeTo} onChange={(e) => setEditFormData({ ...editFormData, timeTo: e.target.value })} />
                    </FormControl>
                  </HStack>
                )}

                <FormControl display="flex" alignItems="center" pt="2">
                  <FormLabel mb="0" {...labelStyle}>Status Active</FormLabel>
                  <Switch isChecked={editFormData.status === 'active'} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.checked ? 'active' : 'inactive' })} sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter bg="#f8faff" borderTop="1px solid #e8edf5" py="3">
              <Button variant="ghost" mr="3" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" bg={BRAND} color="white" size="sm" isLoading={isSaving} _hover={{ opacity: 0.9 }}>Save Changes</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MasterPage;
