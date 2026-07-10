import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Flex, Text, HStack, Icon, Spinner, useToast
} from '@chakra-ui/react';
import { ImageIcon, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import CandidateCVPreview from './CandidateCVPreview';
import API_BASE_URL from '../apiConfig';

const BRAND = '#004aad';

const CandidateCVModal = ({ isOpen, onClose, candidateId, preloadedCandidate }) => {
  const [candidate, setCandidate] = useState(preloadedCandidate || null);
  const [isLoading, setIsLoading] = useState(false);
  const cvRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (preloadedCandidate) {
      setCandidate(preloadedCandidate);
      return;
    }

    if (isOpen && candidateId) {
      const fetchCandidate = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('adminToken');
          const response = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            setCandidate(response.data.candidate);
          } else {
            throw new Error(response.data.message || 'Failed to fetch candidate');
          }
        } catch (error) {
          console.error('Error fetching candidate:', error);
          toast({
            title: "Error fetching candidate details",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          onClose(); // Close modal on error
        } finally {
          setIsLoading(false);
        }
      };
      fetchCandidate();
    }
  }, [isOpen, candidateId, preloadedCandidate, onClose, toast]);

  const handleDownloadPNG = async () => {
    if (!cvRef.current || !candidate) return;
    try {
      const canvas = await html2canvas(cvRef.current, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Resume_${candidate.name.replace(/\s+/g, '_')}.png`;
      link.click();
      toast({ title: 'PNG downloaded successfully', status: 'success', duration: 2000 });
    } catch (error) {
      console.error("Error generating PNG", error);
      toast({ title: "Failed to generate PNG", status: "error", duration: 3000 });
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current || !candidate) return;
    try {
      const canvas = await html2canvas(cvRef.current, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Resume_${candidate.name.replace(/\s+/g, '_')}.pdf`);
      toast({ title: 'PDF downloaded successfully', status: 'success', duration: 2000 });
    } catch (error) {
      console.error("Error generating PDF", error);
      toast({ title: "Failed to generate PDF", status: "error", duration: 3000 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="#e2e8f0" maxW="850px">
        <ModalHeader color={BRAND} bg="white" borderBottom="1px solid #e2e8f0" borderRadius="0.375rem 0.375rem 0 0">
          Candidate Resume Preview
        </ModalHeader>
        <ModalCloseButton mt="1" />
        
        <ModalBody pb={6} pt={6} minH="300px">
          {isLoading ? (
            <Flex justify="center" align="center" h="full" direction="column">
              <Spinner size="xl" color={BRAND} mb="4" />
              <Text color="#64748b" fontWeight="500">Fetching professional details...</Text>
            </Flex>
          ) : candidate ? (
            <Flex justify="center" overflowX="auto" overflowY="hidden">
              <CandidateCVPreview candidate={candidate} ref={cvRef} />
            </Flex>
          ) : (
            <Flex justify="center" align="center" h="full">
              <Text color="red.500">Failed to load candidate details.</Text>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid #e2e8f0" bg="white" borderRadius="0 0 0.375rem 0.375rem" py="4" px="6">
          <Flex w="full" justify="space-between" align="center" gap="4">
            <Text fontSize="sm" color="#64748b" whiteSpace="nowrap">Please wait a moment for images to load before downloading.</Text>
            <Flex gap="3" align="center">
              <Button 
                onClick={handleDownloadPNG} 
                colorScheme="blue" 
                isDisabled={isLoading || !candidate}
                size="md"
                display="flex"
                alignItems="center"
                gap="2"
              >
                <Icon as={ImageIcon} boxSize={4} />
                Download PNG
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                colorScheme="red" 
                isDisabled={isLoading || !candidate}
                size="md"
                display="flex"
                alignItems="center"
                gap="2"
              >
                <Icon as={FileText} boxSize={4} />
                Download PDF
              </Button>
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CandidateCVModal;
