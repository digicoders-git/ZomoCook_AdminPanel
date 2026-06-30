import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Input, Switch, Flex, Heading, Tooltip, Badge,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Icon } from '@chakra-ui/react';

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [formData, setFormData] = useState({ code: '', title: '', subtitle: '', discountPercent: 0, isActive: true });
  const toast = useToast();
  const token = localStorage.getItem('adminToken');
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/offers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setOffers(res.data.offers);
      }
    } catch (error) {
      toast({ title: 'Failed to fetch offers', status: 'error', isClosable: true });
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpen = (offer = null) => {
    if (offer) {
      setCurrentOffer(offer);
      setFormData({
        code: offer.code,
        title: offer.title,
        subtitle: offer.subtitle,
        discountPercent: offer.discountPercent,
        isActive: offer.isActive
      });
    } else {
      setCurrentOffer(null);
      setFormData({ code: '', title: '', subtitle: '', discountPercent: 0, isActive: true });
    }
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleSubmit = async () => {
    if (!formData.code || !formData.title) {
      toast({ title: 'Code and Title are required', status: 'warning', isClosable: true });
      return;
    }
    try {
      if (currentOffer) {
        await axios.put(`${apiUrl}/offers/${currentOffer._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Offer updated', status: 'success', isClosable: true });
      } else {
        await axios.post(`${apiUrl}/offers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Offer created', status: 'success', isClosable: true });
      }
      fetchOffers();
      handleClose();
    } catch (error) {
      toast({ title: error.response?.data?.message || 'Error saving offer', status: 'error', isClosable: true });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await axios.delete(`${apiUrl}/offers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast({ title: 'Offer deleted', status: 'success', isClosable: true });
        fetchOffers();
      } catch (error) {
        toast({ title: 'Failed to delete offer', status: 'error', isClosable: true });
      }
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      await axios.put(`${apiUrl}/offers/${offer._id}`, { isActive: !offer.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOffers();
    } catch (error) {
      toast({ title: 'Error toggling status', status: 'error', isClosable: true });
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="gray.700">Manage Offers</Heading>
        <Button leftIcon={<Icon as={Plus} />} colorScheme="purple" onClick={() => handleOpen()}>
          Add Offer
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Code</Th>
              <Th>Title</Th>
              <Th>Subtitle</Th>
              <Th>Discount %</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {offers.map(o => (
              <Tr key={o._id}>
                <Td fontWeight="bold" color="purple.600">{o.code}</Td>
                <Td>{o.title}</Td>
                <Td>{o.subtitle}</Td>
                <Td>{o.discountPercent}%</Td>
                <Td>
                  <Switch
                    colorScheme="green"
                    isChecked={o.isActive}
                    onChange={() => handleToggleActive(o)}
                  />
                  <Badge ml={2} colorScheme={o.isActive ? 'green' : 'red'}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <Tooltip label="Edit">
                    <IconButton size="sm" icon={<Icon as={Pencil} boxSize={4} />} colorScheme="blue" mr={2} onClick={() => handleOpen(o)} />
                  </Tooltip>
                  <Tooltip label="Delete">
                    <IconButton size="sm" icon={<Icon as={Trash2} boxSize={4} />} colorScheme="red" onClick={() => handleDelete(o._id)} />
                  </Tooltip>
                </Td>
              </Tr>
            ))}
            {offers.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4} color="gray.500">No offers found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentOffer ? 'Edit Offer' : 'Add Offer'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Promo Code</FormLabel>
              <Input
                placeholder="e.g. ZOM010"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="e.g. Get 10% OFF"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Subtitle</FormLabel>
              <Input
                placeholder="e.g. on your first booking"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Discount Percentage</FormLabel>
              <NumberInput min={0} max={100} value={formData.discountPercent} onChange={(v) => setFormData({ ...formData, discountPercent: Number(v) })}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active Status</FormLabel>
              <Switch colorScheme="green" isChecked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={handleSubmit}>Save</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OfferList;
