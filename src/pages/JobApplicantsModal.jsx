import { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, Box, Text, Flex, Avatar, Badge, Button,
  Spinner, VStack, HStack, Tabs, TabList, Tab, TabPanels, TabPanel,
  useToast
} from "@chakra-ui/react";
import { User, MapPin, Phone, Briefcase, UserPlus, CheckCircle2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import { BRAND, ACCENT, Loading } from "../components/ui";

const UPLOAD_BASE = API_BASE_URL.replace("/api", "");

const statusGroups = {
  Applied:  (s) => s === "Applied",
  Shortlisted: (s) => s === "Shortlisted" || s === "Demo Scheduled" || s === "Reschedule Requested",
  Hired: (s) => s === "Hired",
  Rejected: (s) => s === "Rejected" || s === "Not Interested" || s === "On Hold" || s === "Cancelled",
};

const getStatusColorScheme = (s) => {
  if (["Applied"].includes(s)) return "blue";
  if (["Shortlisted", "Demo Scheduled", "Reschedule Requested"].includes(s)) return "orange";
  if (["Hired"].includes(s)) return "green";
  return "red";
};

const CandidateCard = ({ app, navigate, selectable, isSelected, onToggleSelect, onAssign }) => {
  const candidate = app.candidate || {};
  const imageUrl = candidate.profileImage
    ? (candidate.profileImage.startsWith("http") ? candidate.profileImage : `${UPLOAD_BASE}/${candidate.profileImage}`)
    : null;

  const positions = candidate.jobPreference?.jobPositions || [];
  const role = positions.length > 0 ? positions[0] : "Cook";
  const city = candidate.city || "";
  const phone = candidate.phone || "";
  const exp = candidate.jobPreference?.experience;
  const experience = exp ? `${exp.value || 0} ${exp.unit || "years"}` : "";

  return (
    <Box
      bg={isSelected ? "#e8f0ff" : "white"}
      border="1px solid"
      borderColor={isSelected ? BRAND : "#e8edf5"}
      borderRadius="xl"
      p="4"
      mb="3"
      _hover={{ boxShadow: "md", borderColor: BRAND, cursor: "pointer" }}
      transition="all 0.2s"
    >
      <Flex align="center" gap="3">
        {selectable && (
          <Box mr="2" onClick={(e) => { e.stopPropagation(); onToggleSelect(app._id); }}>
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={() => {}} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </Box>
        )}
        <Avatar
          size="md"
          src={imageUrl}
          name={candidate.name || "Unknown"}
          bg={BRAND}
          color="white"
          onClick={() => navigate(`/candidates/view/${candidate._id}`)}
        />
        <Box flex="1" minW="0" onClick={() => navigate(`/candidates/view/${candidate._id}`)}>
          <Flex align="center" gap="2" mb="1" flexWrap="wrap">
            <Text fontSize="sm" fontWeight="700" color="#1e293b" noOfLines={1}>
              {candidate.name || "Unknown"}
            </Text>
            <Badge colorScheme={getStatusColorScheme(app.status)} fontSize="10px" px="2" borderRadius="md">
              {app.status}
            </Badge>
          </Flex>
          <HStack spacing="3" flexWrap="wrap">
            <HStack spacing="1">
              <Text fontSize="xs" color="#64748b">{role}</Text>
            </HStack>
            {city && <Text fontSize="xs" color="#64748b">📍 {city}</Text>}
            {experience && <Text fontSize="xs" color="#64748b">Exp: {experience}</Text>}
          </HStack>
          {phone && <Text fontSize="xs" color="#64748b" mt="1">📞 {phone}</Text>}
        </Box>
        <HStack spacing="3" flexShrink="0" ml="auto">
          <Text fontSize="sm" color={BRAND} fontWeight="700" cursor="pointer" onClick={(e) => { e.stopPropagation(); navigate(`/candidates/view/${candidate._id}`); }}>View</Text>
          
          {(app.status === "Applied" || app.status === "Shortlisted") && (
            <Text fontSize="sm" color="#cbd5e1">|</Text>
          )}

          {app.status === "Applied" && (
            <HStack spacing="1" cursor="pointer" color={BRAND} onClick={(e) => { e.stopPropagation(); onAssign && onAssign(app._id); }}>
              <Text fontSize="sm" fontWeight="700">Assign</Text>
              <Icon as={UserPlus} size={16} />
            </HStack>
          )}
          
          {app.status === "Shortlisted" && (
            <HStack spacing="1" color="green.600">
              <Icon as={CheckCircle2} size={16} />
              <Text fontSize="sm" fontWeight="700">Assigned</Text>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

const JobApplicantsModal = ({ isOpen, onClose, jobId, jobTitle, initialTab = 0 }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && jobId) {
      fetchApplications();
      setSelectedApps([]);
      setActiveTab(initialTab);
    }
  }, [isOpen, jobId, initialTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_BASE_URL}/applications`, {
        params: { jobId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.applications)) {
        setApplications(res.data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      toast({ title: "Error", description: "Failed to load applicants.", status: "error", duration: 3000 });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (appId) => {
    setSelectedApps(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleAssignSingle = async (appId) => {
    setAssigning(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(`${API_BASE_URL}/applications/${appId}/status`, 
        { status: "Shortlisted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Assigned!", description: "Candidate moved to Shortlisted.", status: "success", duration: 3000 });
      fetchApplications();
    } catch (err) {
      console.error("Error assigning applicant:", err);
      toast({ title: "Error", description: "Failed to assign candidate.", status: "error", duration: 3000 });
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedApps.length === 0) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem("adminToken");
      const promises = selectedApps.map(appId => 
        axios.patch(`${API_BASE_URL}/applications/${appId}/status`, 
          { status: "Shortlisted" },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(promises);
      toast({ title: "Success", description: `${selectedApps.length} candidates shortlisted successfully.`, status: "success", duration: 3000 });
      setSelectedApps([]);
      fetchApplications();
    } catch (err) {
      console.error("Bulk assign error:", err);
      toast({ title: "Error", description: "Failed to assign candidates.", status: "error", duration: 3000 });
    } finally {
      setAssigning(false);
    }
  };

  const applied = applications.filter(a => statusGroups.Applied(a.status));
  const shortlisted = applications.filter(a => statusGroups.Shortlisted(a.status));
  const hired = applications.filter(a => statusGroups.Hired(a.status));
  const rejected = applications.filter(a => statusGroups.Rejected(a.status));

  const EmptyState = () => (
    <VStack py="8" spacing="3">
      <Text fontSize="2xl">😕</Text>
      <Text fontSize="sm" color="#94a3b8" fontWeight="600">No candidates in this category</Text>
    </VStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" maxH="85vh">
        <ModalHeader borderBottom="1px solid #f1f5f9" pb="4">
          <HStack spacing="3">
            <Box w="4px" h="20px" bg={BRAND} borderRadius="full" />
            <Box>
              <Text fontSize="md" fontWeight="800" color="#1e293b">Job Applicants</Text>
              <Text fontSize="xs" color="#64748b" fontWeight="500">{jobTitle}</Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top="4" right="4" />

        <ModalBody px="5" py="4">
          {loading ? (
            <Loading message="Loading applicants..." size="sm" />
          ) : applications.length === 0 ? (
            <VStack py="12" spacing="3">
              <Text fontSize="3xl">😕</Text>
              <Text fontSize="sm" color="#94a3b8" fontWeight="600">No applicants yet for this job</Text>
            </VStack>
          ) : (
            <Tabs colorScheme="blue" variant="soft-rounded" size="sm" index={activeTab} onChange={setActiveTab}>
              <TabList mb="4" gap="2" flexWrap="wrap">
                <Tab fontWeight="700" fontSize="xs" _selected={{ bg: "#e8f0ff", color: BRAND }}>
                  Applied ({applied.length})
                </Tab>
                <Tab fontWeight="700" fontSize="xs" _selected={{ bg: "#fff7ed", color: "orange.600" }}>
                  Shortlisted ({shortlisted.length})
                </Tab>
                <Tab fontWeight="700" fontSize="xs" _selected={{ bg: "#f0fdf4", color: "green.600" }}>
                  Hired ({hired.length})
                </Tab>
                <Tab fontWeight="700" fontSize="xs" _selected={{ bg: "#fff1f2", color: ACCENT }}>
                  Rejected ({rejected.length})
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px="0" py="0">
                  {applied.length === 0 ? <EmptyState /> : applied.map(app => (
                    <CandidateCard 
                      key={app._id} 
                      app={app} 
                      navigate={navigate} 
                      onAssign={handleAssignSingle}
                    />
                  ))}
                  {applied.length > 0 && (
                    <Box mt="2" p="3" bg="#eff6ff" borderRadius="md" border="1px solid" borderColor="#bfdbfe" display="flex" alignItems="center" gap="2">
                      <Icon as={Info} size={16} color="#3b82f6" />
                      <Text fontSize="sm" color="#1e40af" fontWeight="500">
                        Assigned candidate will now appear in Shortlisted tab.
                      </Text>
                    </Box>
                  )}
                </TabPanel>
                <TabPanel px="0" py="0">
                  {shortlisted.length === 0 ? <EmptyState /> : shortlisted.map(app => (
                    <CandidateCard 
                      key={app._id} 
                      app={app} 
                      navigate={navigate} 
                      onAssign={handleAssignSingle}
                    />
                  ))}
                </TabPanel>
                <TabPanel px="0" py="0">
                  {hired.length === 0 ? <EmptyState /> : hired.map(app => (
                    <CandidateCard key={app._id} app={app} navigate={navigate} />
                  ))}
                </TabPanel>
                <TabPanel px="0" py="0">
                  {rejected.length === 0 ? <EmptyState /> : rejected.map(app => (
                    <CandidateCard key={app._id} app={app} navigate={navigate} />
                  ))}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default JobApplicantsModal;
