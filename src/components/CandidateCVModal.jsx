import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Flex, Text, HStack, Icon, Spinner, useToast
} from '@chakra-ui/react';
import { ImageIcon, FileText, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import CandidateCVPreview from './CandidateCVPreview';
import API_BASE_URL from '../apiConfig';

const BRAND = '#2D2B75';

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
      const element = cvRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 8000,
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

  const handleDownloadPDF = () => {
    if (!candidate) return;
    const cId = candidate._id || candidateId;
    const downloadUrl = `${API_BASE_URL}/candidates/${cId}/resume-cv`;
    
    // Open official verified resume generator from backend (same as mobile app)
    const win = window.open(downloadUrl, '_blank');
    if (!win) {
      window.location.href = downloadUrl;
    }
    toast({ 
      title: "Downloading Resume PDF", 
      description: "Official ZomoCook verified PDF download started.",
      status: "success", 
      duration: 3000,
      isClosable: true
    });
  };

  const handleCopyLink = () => {
    if (!candidate) return;
    const cId = candidate._id || candidateId;
    const shareUrl = `${API_BASE_URL}/candidates/${cId}/resume-cv`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Resume Link Copied!",
      description: "Link copied to clipboard. You can share this link directly with customers on WhatsApp.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="#e2e8f0" maxW="870px">
        <ModalHeader color={BRAND} bg="white" borderBottom="1px solid #e2e8f0" borderRadius="0.375rem 0.375rem 0 0">
          Candidate Resume Preview {candidate?.name ? `– ${candidate.name}` : ''}
        </ModalHeader>
        <ModalCloseButton mt="1" />
        
        <ModalBody pb={6} pt={6} minH="300px">
          {isLoading ? (
            <Flex justify="center" align="center" h="full" direction="column" py="16">
              <Spinner size="xl" color={BRAND} mb="4" />
              <Text color="#64748b" fontWeight="500">Fetching professional details...</Text>
            </Flex>
          ) : candidate ? (
            <Flex justify="center" overflowX="auto" overflowY="auto" maxH="72vh" py="2">
              <CandidateCVPreview candidate={candidate} ref={cvRef} />
            </Flex>
          ) : (
            <Flex justify="center" align="center" h="full" py="16">
              <Text color="red.500">Failed to load candidate details.</Text>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid #e2e8f0" bg="white" borderRadius="0 0 0.375rem 0.375rem" py="4" px="6">
          <Flex w="full" justify="space-between" align="center" gap="4" wrap="wrap">
            <Text fontSize="xs" color="#64748b">
              Please wait a moment for photo to load before downloading PNG.
            </Text>
            <Flex gap="3" align="center" wrap="wrap">
              <Button 
                onClick={handleCopyLink} 
                variant="outline"
                colorScheme="blue" 
                isDisabled={isLoading || !candidate}
                size="md"
                display="flex"
                alignItems="center"
                gap="2"
              >
                <Icon as={Copy} boxSize={4} />
                Copy Link
              </Button>
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
