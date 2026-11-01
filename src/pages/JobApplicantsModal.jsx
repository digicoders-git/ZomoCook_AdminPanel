import { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Box, Text, Flex, Avatar, Badge, Button,
  Spinner, VStack, HStack, Tabs, TabList, Tab, TabPanels, TabPanel,
  useToast, Icon, Select, FormControl, FormLabel, Progress
} from "@chakra-ui/react";
import { User, MapPin, Phone, Briefcase, UserPlus, CheckCircle2, ShieldCheck, Key, Info, Star, MessageSquareQuote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import { BRAND, ACCENT, Loading } from "../components/ui";

const UPLOAD_BASE = API_BASE_URL.replace("/api", "");

const statusGroups = {
  Applied: (s) => s === "Applied",
  Assigned: (s) => s === "Assigned",
  Shortlisted: (s) => ["Shortlisted", "Demo Scheduled", "Demo In Progress", "Demo Completed", "Reschedule Requested"].includes(s),
  Hired: (s) => s === "Hired",
  Rejected: (s) => ["Rejected", "Not Interested", "On Hold", "Cancelled", "Demo Cancelled"].includes(s),
};

const getStatusColorScheme = (s) => {
  if (["Applied"].includes(s)) return "blue";
  if (["Assigned"].includes(s)) return "green";
  if (["Demo In Progress"].includes(s)) return "purple";
  if (["Demo Completed"].includes(s)) return "teal";
  if (["Shortlisted", "Demo Scheduled", "Reschedule Requested"].includes(s)) return "orange";
  if (["Hired"].includes(s)) return "green";
  return "red";
};

// Candidate Reviews & Rating Breakdown Modal
export const CandidateReviewsModal = ({ isOpen, onClose, cook }) => {
  const [loading, setLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    rating: 5.0,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  });

  useEffect(() => {
    if (!isOpen || !cook) return;
    let isMounted = true;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const cookId = cook.id || cook._id || 'unknown';
        const phone = cook.phone || '';
        const name = cook.name || '';
        const res = await axios.get(`${API_BASE_URL}/reviews/cook/${cookId}`, {
          params: { phone, name }
        });
        if (isMounted && res.data && res.data.success) {
          setReviewsData({
            rating: res.data.rating || cook.rating || 5.0,
            totalReviews: res.data.totalReviews || (res.data.reviews ? res.data.reviews.length : 0),
            breakdown: res.data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            reviews: res.data.reviews || []
          });
        }
      } catch (err) {
        console.error('Failed to load cook reviews:', err);
        if (isMounted) {
          setReviewsData({
            rating: cook.rating || 4.8,
            totalReviews: 0,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            reviews: []
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReviews();
    return () => { isMounted = false; };
  }, [isOpen, cook]);

  if (!cook) return null;

  const currentRating = Number(reviewsData.rating || cook.rating || 4.8).toFixed(1);
  const total = reviewsData.totalReviews || reviewsData.reviews.length || 0;
  const breakdown = reviewsData.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const renderStars = (score, size = 16) => {
    const num = Math.round(Number(score) || 5);
    return (
      <HStack spacing="1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon
            key={i}
            as={Star}
            boxSize={`${size}px`}
            fill={i <= num ? "#eab308" : "#e2e8f0"}
            color={i <= num ? "#eab308" : "#cbd5e1"}
          />
        ))}
      </HStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg="#f8faff" borderBottom="1px solid #edf2f7" py="4" px="5">
          <Flex align="center" justify="space-between">
            <HStack spacing="3">
              <Avatar
                size="md"
                src={cook.image ? (cook.image.startsWith("http") ? cook.image : `${UPLOAD_BASE}/${cook.image}`) : undefined}
                name={cook.name || "Staff"}
                bg={BRAND}
                color="white"
                fontWeight="700"
              />
              <Box>
                <HStack spacing="2" flexWrap="wrap">
                  <Text fontSize="md" fontWeight="800" color="#1e293b">
                    {cook.name || "Cook Profile"}
                  </Text>
                  {cook.role && (
                    <Badge colorScheme="purple" fontSize="10px" px="2" py="0.5" borderRadius="md">
                      {cook.role}
                    </Badge>
                  )}
                </HStack>
                <HStack spacing="3" mt="0.5" fontSize="xs" color="#64748b" flexWrap="wrap">
                  {cook.city && <Text>📍 {cook.city}</Text>}
                  {cook.experience && <Text>Exp: {cook.experience}</Text>}
                  {cook.phone && <Text>📞 {cook.phone}</Text>}
                </HStack>
              </Box>
            </HStack>
            <ModalCloseButton position="static" />
          </Flex>
        </ModalHeader>

        <ModalBody p="5">
          {/* Rating Summary Card */}
          <Box p="4" bg="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" borderRadius="16px" border="1px solid #fde68a" mb="5">
            <Flex direction={{ base: "column", sm: "row" }} align="center" justify="space-between" gap="4">
              <VStack spacing="1" align={{ base: "center", sm: "flex-start" }} minW="130px">
                <Text fontSize="11px" fontWeight="800" color="#854d0e" textTransform="uppercase" letterSpacing="0.5px">
                  Overall Rating
                </Text>
                <HStack align="baseline" spacing="1">
                  <Text fontSize="34px" fontWeight="900" color="#78350f" lineHeight="1">
                    {currentRating}
                  </Text>
                  <Text fontSize="md" fontWeight="700" color="#92400e">
                    / 5.0
                  </Text>
                </HStack>
                <HStack spacing="1">
                  {renderStars(currentRating, 16)}
                </HStack>
                <Text fontSize="11px" fontWeight="600" color="#a16207" mt="1">
                  {total > 0 ? `Based on ${total} customer review${total > 1 ? 's' : ''}` : 'Verified Staff Rating'}
                </Text>
              </VStack>

              {/* Breakdown Bars */}
              <VStack spacing="1.5" flex="1" w="100%" pl={{ sm: 4 }} borderLeft={{ sm: "1px solid #fde68a" }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = breakdown[star] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : (star === 5 ? 100 : 0);
                  return (
                    <HStack key={star} spacing="2" w="100%" fontSize="11px">
                      <HStack spacing="0.5" w="30px" justify="flex-end">
                        <Text fontWeight="700" color="#78350f">{star}</Text>
                        <Icon as={Star} boxSize="10px" fill="#eab308" color="#eab308" />
                      </HStack>
                      <Progress
                        value={pct}
                        size="xs"
                        flex="1"
                        borderRadius="full"
                        colorScheme="yellow"
                        bg="#fef08a"
                      />
                      <Text w="28px" fontWeight="600" color="#854d0e" textAlign="right">
                        {count}
                      </Text>
                    </HStack>
                  );
                })}
              </VStack>
            </Flex>
          </Box>

          {/* Customer Reviews Header */}
          <Flex align="center" justify="space-between" mb="3">
            <HStack spacing="2">
              <Icon as={MessageSquareQuote} color="#1e293b" boxSize={4} />
              <Text fontSize="sm" fontWeight="800" color="#1e293b">
                Customer Reviews & Comments ({reviewsData.reviews.length})
              </Text>
            </HStack>
          </Flex>

          {/* Reviews List */}
          {loading ? (
            <Flex justify="center" align="center" py="8">
              <Spinner size="md" color={BRAND} />
            </Flex>
          ) : reviewsData.reviews.length === 0 ? (
            <Box p="6" textAlign="center" bg="#f8fafc" borderRadius="14px" border="1px dashed #cbd5e1">
              <Icon as={Star} boxSize={8} color="#eab308" mb="2" />
              <Text fontSize="sm" fontWeight="700" color="#334155">
                No written customer reviews yet
              </Text>
              <Text fontSize="xs" color="#64748b" mt="1">
                This cook maintains an active profile with a verified rating of {currentRating} / 5.0. Reviews submitted by customers upon job completion will appear here.
              </Text>
            </Box>
          ) : (
            <VStack spacing="3" align="stretch">
              {reviewsData.reviews.map((rev, i) => (
                <Box
                  key={rev._id || i}
                  p="3.5"
                  bg="#f8fafc"
                  border="1px solid #e2e8f0"
                  borderRadius="12px"
                  transition="all 0.15s"
                  _hover={{ borderColor: "#cbd5e1", bg: "white", boxShadow: "sm" }}
                >
                  <Flex justify="space-between" align="flex-start" mb="2" flexWrap="wrap" gap="2">
                    <HStack spacing="2">
                      <Avatar size="xs" name={rev.customerName || rev.customer?.name || "Customer"} bg="#3b82f6" color="white" />
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="#1e293b">
                          {rev.customerName || rev.customer?.name || "Verified Customer"}
                        </Text>
                        <Text fontSize="10px" color="#94a3b8">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (rev.reviewDate || 'Recently')}
                        </Text>
                      </Box>
                    </HStack>
                    <HStack spacing="2">
                      {rev.serviceCategory && (
                        <Badge fontSize="10px" colorScheme="blue" variant="subtle" px="2" borderRadius="md">
                          {rev.serviceCategory}
                        </Badge>
                      )}
                      <HStack spacing="1" bg="#fefce8" px="2" py="0.5" borderRadius="md" border="1px solid #fef08a">
                        <Icon as={Star} boxSize="11px" fill="#eab308" color="#eab308" />
                        <Text fontSize="xs" fontWeight="800" color="#854d0e">
                          {Number(rev.rating || 5).toFixed(1)}
                        </Text>
                      </HStack>
                    </HStack>
                  </Flex>

                  {rev.comment && (
                    <Text fontSize="xs" color="#334155" lineHeight="1.5" bg="white" p="2.5" borderRadius="8px" border="1px solid #edf2f7">
                      "{rev.comment}"
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="#f8faff" borderTop="1px solid #edf2f7" py="3">
          <Button size="sm" variant="ghost" onClick={onClose} fontWeight="700">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const CandidateCard = ({ 
  app, 
  navigate, 
  selectable, 
  isSelected, 
  onToggleSelect, 
  onUpdateStatus, 
  onAssignStaff,
  isAssigning,
  assignedStaffEntry,
  job,
  onOpenRatingModal
}) => {
  const candidate = app.candidate || {};
  const imageUrl = candidate.profileImage
    ? (candidate.profileImage.startsWith("http") ? candidate.profileImage : `${UPLOAD_BASE}/${candidate.profileImage}`)
    : null;

  const positions = candidate.jobPreference?.jobPositions || [];
  const role = app.appliedRole || (positions.length > 0 ? positions[0] : (assignedStaffEntry?.role || "Cook"));
  const city = candidate.city || "";
  const phone = candidate.phone || assignedStaffEntry?.phone || "";
  const exp = candidate.jobPreference?.experience;
  const experience = exp ? `${exp.value || 0} ${exp.unit || "years"}` : (assignedStaffEntry?.experience || "");

  const isAssigned = app.status === "Assigned" || !!assignedStaffEntry;
  const startOtp = assignedStaffEntry?.startOtp || job?.startOtp;
  const endOtp = assignedStaffEntry?.endOtp || job?.endOtp;
  const staffLiveStatus = assignedStaffEntry?.status || app.status || "Assigned";

  const rawRating = candidate.rating ?? assignedStaffEntry?.rating ?? app.rating ?? 4.8;
  const ratingValue = (typeof rawRating === 'number' ? rawRating : parseFloat(rawRating) || 4.8).toFixed(1);

  return (
    <Box
      bg={isSelected ? "#e8f0ff" : "white"}
      border="1px solid"
      borderColor={isAssigned ? "#bbf7d0" : isSelected ? BRAND : "#e8edf5"}
      borderRadius="xl"
      p="4"
      mb="3"
      _hover={{ boxShadow: "md", borderColor: isAssigned ? "#86efac" : BRAND }}
      transition="all 0.2s"
    >
      <Flex align="flex-start" gap="3" flexWrap="wrap">
        {selectable && !isAssigned && (
          <Box mr="1" pt="1" onClick={(e) => { e.stopPropagation(); onToggleSelect(app._id); }}>
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
          name={candidate.name || assignedStaffEntry?.name || "Staff"}
          bg={BRAND}
          color="white"
          cursor={candidate._id ? "pointer" : "default"}
          onClick={() => candidate._id && navigate(`/candidates/view/${candidate._id}`)}
        />
        <Box flex="1" minW="220px">
          <Flex align="center" gap="2" mb="1" flexWrap="wrap">
            <Text 
              fontSize="sm" 
              fontWeight="700" 
              color="#1e293b" 
              cursor={candidate._id ? "pointer" : "default"}
              onClick={() => candidate._id && navigate(`/candidates/view/${candidate._id}`)}
              _hover={{ textDecoration: candidate._id ? "underline" : "none" }}
            >
              {candidate.name || assignedStaffEntry?.name || "Unknown"}
            </Text>

            {/* Candidate Rating Badge (Clickable) */}
            <HStack
              as="button"
              type="button"
              spacing="1"
              bg="#fefce8"
              border="1px solid #fef08a"
              px="2"
              py="0.5"
              borderRadius="md"
              cursor="pointer"
              title="Click to view candidate ratings and reviews"
              _hover={{ bg: "#fef08a", transform: "scale(1.05)" }}
              transition="all 0.15s"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenRatingModal) {
                  onOpenRatingModal(candidate, assignedStaffEntry, app);
                }
              }}
            >
              <Icon as={Star} fill="#eab308" color="#eab308" boxSize="13px" />
              <Text fontSize="xs" fontWeight="700" color="#854d0e">
                {ratingValue}/5
              </Text>
            </HStack>

            <Badge colorScheme={isAssigned ? "green" : getStatusColorScheme(app.status)} fontSize="10px" px="2" borderRadius="md">
              {isAssigned ? "Assigned" : app.status}
            </Badge>
            {role && (
              <Badge colorScheme="purple" variant="solid" fontSize="10px" px="2" py="0.5" borderRadius="md">
                {isAssigned ? `Role: ${role}` : `Applied: ${role}`}
              </Badge>
            )}
          </Flex>

          <HStack spacing="3" flexWrap="wrap">
            {city && <Text fontSize="xs" color="#64748b">📍 {city}</Text>}
            {experience && <Text fontSize="xs" color="#64748b">Exp: {experience}</Text>}
            {phone && <Text fontSize="xs" color="#64748b">📞 {phone}</Text>}
          </HStack>

          {/* OTP Box for Assigned candidates */}
          {isAssigned && (startOtp || endOtp) && (
            <HStack spacing="4" mt="3" p="2.5" bg="#f0fdf4" borderRadius="lg" border="1px solid #bbf7d0" flexWrap="wrap">
              {startOtp && (
                <Box>
                  <Text fontSize="10px" color="#166534" fontWeight="800">START OTP (COOK)</Text>
                  <Text fontSize="sm" fontWeight="800" color="#0284c7" letterSpacing="1px">{startOtp}</Text>
                </Box>
              )}
              {endOtp && (
                <Box borderLeft="1px solid #86efac" pl="3">
                  <Text fontSize="10px" color="#166534" fontWeight="800">END OTP (CUSTOMER)</Text>
                  <Text fontSize="sm" fontWeight="800" color="#16a34a" letterSpacing="1px">{endOtp}</Text>
                </Box>
              )}
              <Box borderLeft="1px solid #86efac" pl="3">
                <Text fontSize="10px" color="#166534" fontWeight="800">LIVE STATUS</Text>
                <Badge colorScheme={staffLiveStatus === 'Completed' ? 'green' : (staffLiveStatus === 'Started' ? 'blue' : 'purple')} fontSize="10px">
                  {staffLiveStatus}
                </Badge>
              </Box>
            </HStack>
          )}
        </Box>

        {/* Action Buttons */}
        <HStack spacing="2" flexShrink="0" ml="auto" align="center" flexWrap="wrap">
          {candidate._id && (
            <Button
              size="xs"
              variant="ghost"
              color={BRAND}
              fontWeight="700"
              onClick={() => navigate(`/candidates/view/${candidate._id}`)}
            >
              View Profile
            </Button>
          )}

          {/* Direct OTP Assignment Button */}
          {!isAssigned && onAssignStaff && (
            <Button
              size="xs"
              colorScheme="green"
              leftIcon={<ShieldCheck size={14} />}
              isLoading={isAssigning}
              loadingText="Assigning..."
              onClick={(e) => {
                e.stopPropagation();
                onAssignStaff(app);
              }}
              fontWeight="700"
              borderRadius="md"
              boxShadow="xs"
            >
              Assign Staff (OTP Flow)
            </Button>
          )}

          {onUpdateStatus && !isAssigned && app.status === "Applied" && (
            <>
              <Button
                size="xs"
                colorScheme="orange"
                variant="outline"
                fontWeight="700"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAssignStaff) {
                    onAssignStaff(app);
                  } else {
                    onUpdateStatus(app._id, "Shortlisted");
                  }
                }}
              >
                Shortlist
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="ghost"
                fontWeight="700"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(app._id, "Rejected");
                }}
              >
                Reject
              </Button>
            </>
          )}

          {onUpdateStatus && !isAssigned && ["Shortlisted", "Demo Scheduled", "Demo In Progress", "Demo Completed", "Reschedule Requested"].includes(app.status) && (
            <>
              <Button
                size="xs"
                colorScheme="blue"
                variant="outline"
                fontWeight="700"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(app._id, "Hired");
                }}
              >
                Hire
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="ghost"
                fontWeight="700"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(app._id, "Rejected");
                }}
              >
                Reject
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

const JobApplicantsModal = ({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle, 
  job: propJob = null, 
  initialTab = 0, 
  targetRole = '',
  onSuccess 
}) => {
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(propJob);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedApps, setSelectedApps] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(targetRole || 'All');
  
  // Role selection dialog state (when multiple requirements exist and user clicks assign)
  const [roleSelectApp, setRoleSelectApp] = useState(null);
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState('');

  // Cook ratings & reviews modal state
  const [selectedCookForReview, setSelectedCookForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenCookReview = (candidate, staffEntry, app) => {
    setSelectedCookForReview({
      id: candidate?._id || staffEntry?.candidate?._id || staffEntry?.candidate,
      name: candidate?.name || staffEntry?.name || app?.candidate?.name || "Staff",
      phone: candidate?.phone || staffEntry?.phone || "",
      image: candidate?.profileImage || staffEntry?.profileImage || null,
      role: app?.appliedRole || staffEntry?.role || (candidate?.jobPreference?.jobPositions && candidate.jobPreference.jobPositions[0]) || "",
      rating: candidate?.rating ?? staffEntry?.rating ?? 4.8,
      city: candidate?.city || staffEntry?.city || "",
      experience: candidate?.jobPreference?.experience ? `${candidate.jobPreference.experience.value || 0} ${candidate.jobPreference.experience.unit || 'years'}` : (staffEntry?.experience || '')
    });
    setIsReviewModalOpen(true);
  };

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && jobId) {
      fetchApplications();
      fetchJobDetails();
      setSelectedApps([]);
      setActiveTab(initialTab);
      setSelectedRoleFilter(targetRole || 'All');
    }
  }, [isOpen, jobId, initialTab, targetRole]);

  useEffect(() => {
    if (propJob) {
      setJob(propJob);
    }
  }, [propJob]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.job) {
        setJob(res.data.job);
      }
    } catch (err) {
      console.error("Error fetching job details in modal:", err);
    }
  };

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

  // Perform OTP Staff Assignment
  const handleAssignStaff = async (app, chosenRole = '') => {
    const candidate = app.candidate || {};
    const candId = candidate._id || app.candidate;
    if (!candId) {
      toast({ title: "Error", description: "Candidate details missing.", status: "error" });
      return;
    }

    // Available requirements for this job
    const reqs = job?.staffRequirements || [];
    const activeTargetRole = (selectedRoleFilter && selectedRoleFilter !== 'All') ? selectedRoleFilter : targetRole;
    
    // If job has multiple requirements and no role specified yet, open role selector dialog
    if (!chosenRole && !activeTargetRole && reqs.length > 1) {
      setRoleSelectApp(app);
      setSelectedRoleForAssign(app.appliedRole || reqs[0]?.role || 'Cook');
      return;
    }

    const finalRole = chosenRole || activeTargetRole || app.appliedRole || app.applicationData?.role || (reqs[0]?.role) || (candidate.jobPreference?.jobPositions?.[0]) || 'Cook';
    const exp = candidate.jobPreference?.experience;
    const expStr = exp ? `${exp.value || ''} ${exp.unit || 'years'}` : '';

    setAssigningId(app._id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${API_BASE_URL}/jobs/${jobId}/assign-staff`, {
        candidateId: candId,
        name: candidate.name || 'Staff',
        role: finalRole,
        phone: candidate.phone || '',
        experience: expStr
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast({
          title: "🎉 Staff Assigned Successfully!",
          description: `${candidate.name || 'Staff'} assigned as ${finalRole}. Start OTP: ${res.data.startOtp}, End OTP: ${res.data.endOtp}`,
          status: "success",
          duration: 6000,
          isClosable: true
        });

        // Refresh applications and parent job
        await fetchApplications();
        await fetchJobDetails();
        if (onSuccess) onSuccess();

        // Switch to Assigned tab to show the generated OTPs
        setActiveTab(1);
      }
    } catch (err) {
      console.error("Assign staff error:", err);
      const errorMsg = err.response?.data?.message || "Failed to assign staff.";
      toast({ title: "Assignment Failed", description: errorMsg, status: "error", duration: 5000, isClosable: true });
    } finally {
      setAssigningId(null);
      setRoleSelectApp(null);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    setAssigningId(appId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.patch(`${API_BASE_URL}/applications/${appId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const otpDesc = res.data.startOtp ? ` Start OTP: ${res.data.startOtp}, End OTP: ${res.data.endOtp}` : '';
      toast({ 
        title: status === "Assigned" ? "🎉 Staff Assigned!" : (status === "Shortlisted" ? "Shortlisted!" : (status === "Hired" ? "Hired!" : "Status Updated")), 
        description: `Candidate status updated to ${status}.${otpDesc}`, 
        status: "success", 
        duration: 5000,
        isClosable: true
      });

      await fetchApplications();
      await fetchJobDetails();
      if (onSuccess) onSuccess();

      if (status === "Assigned") {
        setActiveTab(1);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMsg = err.response?.data?.message || "Failed to update candidate status.";
      toast({ title: "Error", description: errorMsg, status: "error", duration: 5000, isClosable: true });
    } finally {
      setAssigningId(null);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedApps.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const activeRole = (selectedRoleFilter && selectedRoleFilter !== 'All') ? selectedRoleFilter : (targetRole || job?.staffRequirements?.[0]?.role || 'Cook');
      // Assign staff via OTP endpoint for each selected candidate
      for (const appId of selectedApps) {
        const app = applications.find(a => a._id === appId);
        if (app) {
          const cand = app.candidate || {};
          const candId = cand._id || app.candidate;
          if (candId) {
            const exp = cand.jobPreference?.experience;
            const expStr = exp ? `${exp.value || ''} ${exp.unit || 'years'}` : '';
            const role = activeRole || app.appliedRole || 'Cook';
            await axios.post(`${API_BASE_URL}/jobs/${jobId}/assign-staff`, {
              candidateId: candId,
              name: cand.name || 'Staff',
              role,
              phone: cand.phone || '',
              experience: expStr
            }, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.error("Bulk item assign error:", e));
          }
        }
      }

      toast({ 
        title: "🎉 Candidates Assigned!", 
        description: `${selectedApps.length} candidates assigned with Start & End OTPs.`, 
        status: "success", 
        duration: 5000 
      });
      setSelectedApps([]);
      await fetchApplications();
      await fetchJobDetails();
      if (onSuccess) onSuccess();
      setActiveTab(1);
    } catch (err) {
      console.error("Bulk assign error:", err);
      toast({ title: "Error", description: "Failed to assign candidates.", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Extract all roles present in job requirements or applications
  const availableRoles = [];
  if (job?.staffRequirements && Array.isArray(job.staffRequirements)) {
    job.staffRequirements.forEach(r => {
      const title = r.role || r.category || r.staffCategory;
      if (title && !availableRoles.includes(title)) availableRoles.push(title);
    });
  }
  if (job?.commercialStaffList && Array.isArray(job.commercialStaffList)) {
    job.commercialStaffList.forEach(r => {
      const title = r.role || r.category || r.staffCategory;
      if (title && !availableRoles.includes(title)) availableRoles.push(title);
    });
  }
  if (job?.partyRequirement?.role && !availableRoles.includes(job.partyRequirement.role)) {
    availableRoles.push(job.partyRequirement.role);
  }
  if (job?.jobPosition && !availableRoles.includes(job.jobPosition)) {
    availableRoles.push(job.jobPosition);
  }
  applications.forEach(a => {
    const r = a.appliedRole || a.role || a.applicationData?.role;
    if (r && !availableRoles.includes(r)) availableRoles.push(r);
  });
  if (job?.assignedStaff && Array.isArray(job.assignedStaff)) {
    job.assignedStaff.forEach(s => {
      if (s.role && !availableRoles.includes(s.role)) availableRoles.push(s.role);
    });
  }

  const normalizeRole = (r) => {
    if (!r) return '';
    return String(r)
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const getApplicantRole = (app) => {
    return (
      app.appliedRole ||
      app.role ||
      app.staffEntry?.role ||
      app.applicationData?.role ||
      app.applicationData?.appliedRole ||
      ""
    );
  };

  const matchesRole = (app, roleFilter) => {
    if (!roleFilter || roleFilter === "All" || roleFilter === "All Positions" || roleFilter === "All Roles") {
      return true;
    }
    const filterNorm = normalizeRole(roleFilter);
    const candRole = normalizeRole(getApplicantRole(app));
    if (!candRole) {
      if (availableRoles.length <= 1) return true;
      return false;
    }
    return candRole === filterNorm;
  };

  // Helper to check if application is assigned
  const isAppAssigned = (a) => {
    if (a.status === 'Assigned') return true;
    if (job?.assignedStaff && Array.isArray(job.assignedStaff)) {
      const candId = (a.candidate?._id || a.candidate)?.toString();
      return job.assignedStaff.some(s => (s.candidate?._id || s.candidate)?.toString() === candId);
    }
    return false;
  };

  // Synthesize assigned list including applications with status Assigned and job.assignedStaff entries
  const allAssignedList = [];
  const assignedCandidateIds = new Set();

  applications.forEach(app => {
    if (isAppAssigned(app)) {
      const candId = (app.candidate?._id || app.candidate)?.toString();
      assignedCandidateIds.add(candId);
      const staffEntry = job?.assignedStaff?.find(s => (s.candidate?._id || s.candidate)?.toString() === candId);
      allAssignedList.push({ ...app, staffEntry });
    }
  });

  // Also include any assignedStaff entries from job that might not have an application object
  if (job?.assignedStaff && Array.isArray(job.assignedStaff)) {
    job.assignedStaff.forEach(s => {
      const candId = (s.candidate?._id || s.candidate)?.toString();
      if (candId && !assignedCandidateIds.has(candId)) {
        allAssignedList.push({
          _id: `staff-${candId}`,
          status: 'Assigned',
          appliedRole: s.role,
          candidate: typeof s.candidate === 'object' ? s.candidate : { _id: s.candidate, name: s.name, phone: s.phone },
          staffEntry: s
        });
        assignedCandidateIds.add(candId);
      }
    });
  }

  // Filter both applications and assigned list by selected role filter
  const roleFilteredApplications = applications.filter(a => matchesRole(a, selectedRoleFilter));
  const assignedList = allAssignedList.filter(item => matchesRole(item, selectedRoleFilter));

  // Group applications
  const applied = roleFilteredApplications.filter(a => statusGroups.Applied(a.status) && !isAppAssigned(a));
  const shortlisted = roleFilteredApplications.filter(a => statusGroups.Shortlisted(a.status) && !isAppAssigned(a));
  const hired = roleFilteredApplications.filter(a => statusGroups.Hired(a.status) && !isAppAssigned(a));
  const rejected = roleFilteredApplications.filter(a => statusGroups.Rejected(a.status));

  const EmptyState = ({ message = "No candidates in this category" }) => (
    <VStack py="8" spacing="3">
      <Text fontSize="2xl">😕</Text>
      <Text fontSize="sm" color="#94a3b8" fontWeight="600">{message}</Text>
    </VStack>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" maxH="85vh">
          <ModalHeader borderBottom="1px solid #f1f5f9" pb="4">
            <Flex justify="space-between" align="center" pr="6">
              <HStack spacing="3">
                <Box w="4px" h="20px" bg={BRAND} borderRadius="full" />
                <Box>
                  <Text fontSize="md" fontWeight="800" color="#1e293b">Job Applicants & Staff Assignment</Text>
                  <HStack spacing="2">
                    <Text fontSize="xs" color="#64748b" fontWeight="500">{jobTitle}</Text>
                    {targetRole && (
                      <Badge colorScheme="blue" fontSize="10px">Role: {targetRole}</Badge>
                    )}
                  </HStack>
                </Box>
              </HStack>
              {selectedApps.length > 0 && (
                <Button
                  size="xs"
                  colorScheme="green"
                  leftIcon={<ShieldCheck size={14} />}
                  onClick={handleBulkAssign}
                  isLoading={loading}
                  fontWeight="700"
                >
                  Assign Selected ({selectedApps.length})
                </Button>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton top="4" right="4" />

          <ModalBody px="5" py="4">
            {loading ? (
              <Loading message="Loading applicants..." size="sm" />
            ) : applications.length === 0 && allAssignedList.length === 0 ? (
              <VStack py="12" spacing="3">
                <Text fontSize="3xl">😕</Text>
                <Text fontSize="sm" color="#94a3b8" fontWeight="600">No applicants yet for this job</Text>
              </VStack>
            ) : (
              <>
                {/* Position / Role Filter Selector Bar */}
                {availableRoles.length > 0 && (
                  <Flex
                    align="center"
                    justify="space-between"
                    mb="3"
                    p="2.5"
                    bg="#f8fafc"
                    borderRadius="xl"
                    border="1px solid #e2e8f0"
                    flexWrap="wrap"
                    gap="2"
                  >
                    <HStack spacing="2">
                      <Icon as={Briefcase} size={15} color="#475569" />
                      <Text fontSize="xs" fontWeight="700" color="#334155">
                        Filter by Position:
                      </Text>
                      {selectedRoleFilter !== 'All' && (
                        <Badge colorScheme="purple" fontSize="10px" px="2" py="0.5" borderRadius="md">
                          Showing: {selectedRoleFilter}
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing="2">
                      <Select
                        size="xs"
                        w="auto"
                        minW="180px"
                        borderRadius="md"
                        bg="white"
                        fontWeight="700"
                        color={BRAND}
                        value={selectedRoleFilter}
                        onChange={(e) => setSelectedRoleFilter(e.target.value)}
                      >
                        <option value="All">All Positions ({applications.length + allAssignedList.length})</option>
                        {availableRoles.map((r, i) => {
                          const count = applications.filter(a => matchesRole(a, r)).length + allAssignedList.filter(a => matchesRole(a, r)).length;
                          return (
                            <option key={i} value={r}>
                              {r} ({count})
                            </option>
                          );
                        })}
                      </Select>
                      {selectedRoleFilter !== 'All' && (
                        <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => setSelectedRoleFilter('All')}>
                          Show All
                        </Button>
                      )}
                    </HStack>
                  </Flex>
                )}

                <Tabs colorScheme="blue" variant="soft-rounded" size="sm" index={activeTab} onChange={setActiveTab}>
                  <TabList mb="4" gap="2" flexWrap="wrap">
                    <Tab fontWeight="700" fontSize="xs" _selected={{ bg: "#eff6ff", color: "#1d4ed8" }}>
                      Applied ({applied.length})
                    </Tab>
                    <Tab fontWeight="700" fontSize="xs" _selected={{ bg: "#f0fdf4", color: "#15803d" }}>
                      Assigned ({assignedList.length})
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
                  {/* 1. Applied Candidates Tab */}
                  <TabPanel px="0" py="0">
                    {applied.length === 0 ? (
                      <EmptyState message="No pending applied candidates." />
                    ) : (
                      applied.map(app => (
                        <CandidateCard 
                          key={app._id} 
                          app={app} 
                          navigate={navigate} 
                          selectable={true}
                          isSelected={selectedApps.includes(app._id)}
                          onToggleSelect={handleToggleSelect}
                          onUpdateStatus={handleUpdateStatus}
                          onAssignStaff={handleAssignStaff}
                          isAssigning={assigningId === app._id}
                          job={job}
                          onOpenRatingModal={handleOpenCookReview}
                        />
                      ))
                    )}
                    {applied.length > 0 && (
                      <Box mt="3" p="3" bg="#f0fdf4" borderRadius="md" border="1px solid #bbf7d0" display="flex" alignItems="center" gap="2">
                        <Icon as={ShieldCheck} size={16} color="#16a34a" />
                        <Text fontSize="xs" color="#166534" fontWeight="600">
                          Click <b>"Assign Staff (OTP Flow)"</b> on any applicant to assign them directly with Start & End OTPs.
                        </Text>
                      </Box>
                    )}
                  </TabPanel>

                  {/* 2. Assigned Staff Tab */}
                  <TabPanel px="0" py="0">
                    {assignedList.length === 0 ? (
                      <EmptyState message="No staff assigned yet." />
                    ) : (
                      assignedList.map(item => (
                        <CandidateCard 
                          key={item._id} 
                          app={item} 
                          navigate={navigate}
                          assignedStaffEntry={item.staffEntry}
                          job={job}
                          onOpenRatingModal={handleOpenCookReview}
                        />
                      ))
                    )}
                  </TabPanel>

                  {/* 3. Shortlisted Candidates Tab */}
                  <TabPanel px="0" py="0">
                    {shortlisted.length === 0 ? (
                      <EmptyState message="No shortlisted candidates." />
                    ) : (
                      shortlisted.map(app => (
                        <CandidateCard 
                          key={app._id} 
                          app={app} 
                          navigate={navigate} 
                          onUpdateStatus={handleUpdateStatus}
                          onAssignStaff={handleAssignStaff}
                          isAssigning={assigningId === app._id}
                          job={job}
                          onOpenRatingModal={handleOpenCookReview}
                        />
                      ))
                    )}
                  </TabPanel>

                  {/* 4. Hired Tab */}
                  <TabPanel px="0" py="0">
                    {hired.length === 0 ? (
                      <EmptyState message="No hired candidates." />
                    ) : (
                      hired.map(app => (
                        <CandidateCard key={app._id} app={app} navigate={navigate} job={job} onOpenRatingModal={handleOpenCookReview} />
                      ))
                    )}
                  </TabPanel>

                  {/* 5. Rejected Tab */}
                  <TabPanel px="0" py="0">
                    {rejected.length === 0 ? (
                      <EmptyState message="No rejected candidates." />
                    ) : (
                      rejected.map(app => (
                        <CandidateCard key={app._id} app={app} navigate={navigate} job={job} onOpenRatingModal={handleOpenCookReview} />
                      ))
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Role Selection Modal (if job has multiple staff requirements) */}
      <Modal isOpen={!!roleSelectApp} onClose={() => setRoleSelectApp(null)} size="sm" isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="800">
            Select Role for {roleSelectApp?.candidate?.name || 'Staff'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="3">
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700">Requirement Role</FormLabel>
              <Select
                size="sm"
                borderRadius="lg"
                value={selectedRoleForAssign}
                onChange={(e) => setSelectedRoleForAssign(e.target.value)}
              >
                {job?.staffRequirements && job.staffRequirements.map((r, i) => {
                  const roleTitle = r.role || r.category || r.staffCategory || `Role #${i + 1}`;
                  return <option key={i} value={roleTitle}>{roleTitle}</option>;
                })}
                <option value="Cook">Cook</option>
                <option value="Chef">Chef</option>
                <option value="Assistant Cook">Assistant Cook</option>
                <option value="Helper">Helper</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px solid #f1f5f9" pt="3">
            <Button size="sm" variant="ghost" mr="2" onClick={() => setRoleSelectApp(null)}>Cancel</Button>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<ShieldCheck size={14} />}
              onClick={() => handleAssignStaff(roleSelectApp, selectedRoleForAssign)}
            >
              Assign with OTP
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Candidate Rating & Customer Reviews Details Modal */}
      <CandidateReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        cook={selectedCookForReview}
      />
    </>
  );
};

export default JobApplicantsModal;
