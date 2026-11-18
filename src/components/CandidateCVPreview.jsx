import React, { forwardRef, useState } from 'react';
import { Box, Flex, Text, HStack, VStack, Image, Grid, Divider, Icon } from '@chakra-ui/react';
import { MapPin, Phone, Mail, User } from 'lucide-react';
import API_BASE_URL, { UPLOAD_BASE_URL } from '../apiConfig';

const CandidateCVPreview = forwardRef(({ candidate }, ref) => {
  const [imgError, setImgError] = useState(false);
  if (!candidate) return null;

  const DARK_BLUE = '#004aad';
  const LIGHT_TEXT = '#ffffff';
  const PRIMARY_TEXT = '#004aad';
  const SECONDARY_TEXT = '#475569';
  const LIGHT_BLUE = '#e0e7ff';

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return Math.abs(age) + ' Years';
  };

  const currentAddress = [candidate.city, candidate.state].filter(Boolean).join(', ') || candidate.address || 'N/A';
  const languages = candidate.languages?.join(', ') || 'Hindi, English';
  const skills = candidate.skills?.length > 0 ? candidate.skills : ['Table Service', 'Customer Handling', 'Food & Beverage Service', 'POS Basic', 'Hygiene & Cleanliness'];

  let profileImageSrc = null;
  if (candidate.profileImage && !candidate.profileImage.includes('default') && !imgError) {
    if (candidate.profileImage.startsWith('http') || candidate.profileImage.startsWith('data:')) {
      profileImageSrc = candidate.profileImage;
    } else {
      const cleanPath = candidate.profileImage.replace(/^[/\\]+/, '');
      profileImageSrc = `${UPLOAD_BASE_URL}/${cleanPath}`;
    }
  }

  const formatDuration = (dur) => {
    if (!dur) return 'Duration N/A';
    const s = String(dur).trim();
    if (!isNaN(parseInt(s, 10)) && !s.toLowerCase().includes('year') && !s.toLowerCase().includes('month')) {
      return `${parseInt(s, 10)} ${parseInt(s, 10) === 1 ? 'Year' : 'Years'}`;
    }
    return s;
  };

  const SectionHeading = ({ title }) => (
    <Box mt="5" mb="2.5">
      <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT} textTransform="uppercase" letterSpacing="wider">
        {title}
      </Text>
      <Divider borderColor={LIGHT_BLUE} borderWidth="1.5px" mt="1.5" opacity={1} />
    </Box>
  );

  const SidebarHeading = ({ title }) => (
    <Box mt="6" mb="3" w="full">
      <Text fontSize="sm" fontWeight="800" color={LIGHT_TEXT} textTransform="uppercase" letterSpacing="wider">
        {title}
      </Text>
      <Divider borderColor="#3b82f6" borderWidth="1px" mt="1.5" opacity={0.6} />
    </Box>
  );

  const role = candidate.jobPreference?.jobPositions?.[0] || candidate.jobPreference?.jobCategory?.[0] || 'Professional Chef';
  const rawExp = candidate.jobPreference?.experience?.value ?? candidate.experience ?? '0';
  const parsedExp = parseInt(rawExp, 10);
  const expValueRaw = isNaN(parsedExp) ? rawExp : String(parsedExp);
  const expUnitRaw = candidate.jobPreference?.experience?.unit === 'months' ? 'Months' : 'Years';
  const expString = String(expValueRaw).toLowerCase().includes('year') ? expValueRaw : `${expValueRaw}+ ${expUnitRaw}`;
  const subtitle = `${role} - ${expString} Experience`;

  const expectedSalary = parseInt(candidate.jobPreference?.expectedSalary);
  const expectedSalaryText = isNaN(expectedSalary) || expectedSalary === 0 ? 'Not Disclosed' : `₹${expectedSalary} - ₹${expectedSalary + 5000} / Month`;

  const currentSalary = parseInt(candidate.jobPreference?.currentSalary);
  const currentSalaryText = isNaN(currentSalary) || currentSalary === 0 ? 'Not Disclosed' : `₹${currentSalary} - ₹${currentSalary + 5000} / Month`;

  return (
    <Flex 
      ref={ref} 
      bg="white" 
      w="800px" 
      minH="1131px" 
      direction="column"
      color={PRIMARY_TEXT} 
      fontFamily="'Outfit', sans-serif" 
      boxShadow="0 4px 20px rgba(0,0,0,0.08)"
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      <Flex flex="1">
        
        {/* Left Main Column */}
        <Box flex="6" p="8" pr="6" pt="10">
          <Text fontSize="3xl" fontWeight="900" color={PRIMARY_TEXT} letterSpacing="tight" textTransform="uppercase" lineHeight="1.1">
            {candidate.name}
          </Text>
          <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT} mt="1.5" mb="5" letterSpacing="wide" textTransform="uppercase">
            {subtitle}
          </Text>
          
          <SectionHeading title="Summary" />
          <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
            {candidate.about || `Experienced and dedicated hospitality professional with ${expValueRaw}+ ${expUnitRaw.toLowerCase()} of expertise in food service operations, team coordination, guest handling, and maintaining high standards of hygiene and service. Seeking a challenging role to contribute to operational excellence and customer satisfaction.`}
          </Text>

          <SectionHeading title="Work Experience" />
          
          {/* Last Company */}
          {candidate.workExperience?.lastCompany?.name && (
            <Box mb="4">
              <HStack justify="space-between" align="flex-end" mb="1">
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT} textTransform="uppercase">
                  {candidate.workExperience.lastCompany.name}
                </Text>
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                  {formatDuration(candidate.workExperience.lastCompany.duration)}
                </Text>
              </HStack>
              <Text fontSize="xs" fontWeight="700" color={PRIMARY_TEXT} mb="1">
                {candidate.workExperience.lastCompany.role || 'Job Position'}
              </Text>
              <VStack align="start" spacing="1.5" pl="0" mt="1.5">
                <HStack align="start" spacing="2">
                  <Text color={SECONDARY_TEXT} fontSize="xs" mt="0.5">•</Text>
                  <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                    Delivered high-quality service and maintained operational efficiency.
                  </Text>
                </HStack>
                <HStack align="start" spacing="2">
                  <Text color={SECONDARY_TEXT} fontSize="xs" mt="0.5">•</Text>
                  <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                    Collaborated with team members and ensured all standards and procedures were followed.
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Previous Experiences */}
          {candidate.workExperience?.experiences?.map((exp, idx) => (
            <Box mb="3.5" key={idx}>
              <HStack justify="space-between" align="flex-end" mb="1">
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT} textTransform="uppercase">
                  {exp.jobProfile || exp.position || 'Job Position'}
                </Text>
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                  {exp.from} {exp.to ? `- ${exp.to}` : ''}
                </Text>
              </HStack>
              {exp.position && exp.position !== exp.jobProfile && (
                <Text fontSize="xs" fontWeight="700" color={PRIMARY_TEXT} mb="1">
                  {exp.position}
                </Text>
              )}
              {exp.shortDetail && (
                <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall" pl="0" mt="1">
                  {exp.shortDetail}
                </Text>
              )}
            </Box>
          ))}

          {/* Education Section */}
          {candidate.education && candidate.education.length > 0 && (
            <>
              <SectionHeading title="Education" />
              {candidate.education.map((edu, idx) => (
                <Box mb="3.5" key={idx}>
                  <HStack justify="space-between" align="flex-end" mb="1">
                    <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                      {edu.title || 'Degree/Certificate'}
                    </Text>
                    <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                      {edu.from} {edu.to ? `- ${edu.to}` : ''}
                    </Text>
                  </HStack>
                  {edu.shortDetail && (
                    <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                      {edu.shortDetail}
                    </Text>
                  )}
                </Box>
              ))}
            </>
          )}
          
          <SectionHeading title="Additional Details" />
          <Flex wrap="wrap" rowGap="3" columnGap="0" pt="1">
            <Box w="50%">
              <Text fontSize="2xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase" letterSpacing="wider" mb="0.5">Total Experience</Text>
              <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>{expString}</Text>
            </Box>
            <Box w="50%">
              <Text fontSize="2xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase" letterSpacing="wider" mb="0.5">Expected Salary</Text>
              <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>{expectedSalaryText}</Text>
            </Box>
            <Box w="50%">
              <Text fontSize="2xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase" letterSpacing="wider" mb="0.5">Current Salary</Text>
              <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>{currentSalaryText}</Text>
            </Box>
            <Box w="50%">
              <Text fontSize="2xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase" letterSpacing="wider" mb="0.5">Ready to Relocate</Text>
              <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>Yes</Text>
            </Box>
          </Flex>
        </Box>

        {/* Right Sidebar Column */}
        <Box flex="4" bg="linear-gradient(135deg, #004aad 0%, #0062e6 100%)" p="8" pl="6" color={LIGHT_TEXT}>
          
          {/* Profile Picture at Top Right */}
          <Flex justify="center" mb="6" mt="1">
            <Box 
              border="4px solid rgba(255, 255, 255, 0.3)" 
              borderRadius="full" 
              overflow="hidden"
              w="130px"
              h="130px"
              bg="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
            >
              {profileImageSrc ? (
                <Image 
                  src={profileImageSrc} 
                  alt={candidate.name} 
                  w="full" 
                  h="full" 
                  objectFit="cover" 
                  crossOrigin="anonymous"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Icon as={User} boxSize="70px" color="#cbd5e1" />
              )}
            </Box>
          </Flex>

          {/* Contact Info */}
          <Box w="full">
            <Box mb="3.5">
              <Box bg="white" borderRadius="full" display="inline-block" verticalAlign="middle" mr="2.5" w="22px" h="22px" textAlign="center" lineHeight="20px">
                <MapPin size={11} color={DARK_BLUE} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              </Box>
              <Text as="span" fontSize="xs" fontWeight="600" display="inline-block" verticalAlign="middle">{currentAddress}</Text>
            </Box>
            <Box mb="3.5">
              <Box bg="white" borderRadius="full" display="inline-block" verticalAlign="middle" mr="2.5" w="22px" h="22px" textAlign="center" lineHeight="20px">
                <Phone size={11} color={DARK_BLUE} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              </Box>
              <Text as="span" fontSize="xs" fontWeight="600" display="inline-block" verticalAlign="middle">{candidate.phone}</Text>
            </Box>
            <Box>
              <Box bg="white" borderRadius="full" display="inline-block" verticalAlign="middle" mr="2.5" w="22px" h="22px" textAlign="center" lineHeight="20px">
                <Mail size={11} color={DARK_BLUE} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              </Box>
              <Text as="span" fontSize="xs" fontWeight="600" wordBreak="break-word" display="inline-block" verticalAlign="middle">{candidate.email || 'N/A'}</Text>
            </Box>
          </Box>

          <SidebarHeading title="Core Qualifications" />
          <VStack align="start" spacing="1.5" pl="1" w="full">
            {skills.slice(0, 6).map((skill, idx) => (
              <HStack key={idx} align="start" spacing="2.5">
                <Text color="white" fontSize="xs" mt="0.5">•</Text>
                <Text fontSize="xs" fontWeight="600">{skill}</Text>
              </HStack>
            ))}
          </VStack>

          <SidebarHeading title="Personal Details" />
          <Flex direction="column" gap="2.5" w="full">
            <Flex w="full">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" w="95px">Age</Text>
              <Text fontSize="xs" fontWeight="700" flex="1">{candidate.age ? `${candidate.age} Years` : calculateAge(candidate.dob)}</Text>
            </Flex>

            <Flex w="full">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" w="95px">Gender</Text>
              <Text fontSize="xs" fontWeight="700" flex="1">{candidate.gender ? candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1) : 'N/A'}</Text>
            </Flex>

            <Flex w="full">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" w="95px">Marital Status</Text>
              <Text fontSize="xs" fontWeight="700" flex="1">{candidate.maritalStatus ? candidate.maritalStatus.charAt(0).toUpperCase() + candidate.maritalStatus.slice(1) : 'Single'}</Text>
            </Flex>

            <Box w="full" mt="0.5">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" mb="0.5">Languages</Text>
              <Text fontSize="xs" fontWeight="700">{languages}</Text>
            </Box>
          </Flex>

          <SidebarHeading title="Certifications" />
          <VStack align="start" spacing="1.5" pl="1" w="full">
            <HStack align="start" spacing="2.5">
              <Text color="white" fontSize="xs" mt="0.5">•</Text>
              <Text fontSize="xs" fontWeight="600">Verified Profile – ZomoCook</Text>
            </HStack>
            <HStack align="start" spacing="2.5">
              <Text color="white" fontSize="xs" mt="0.5">•</Text>
              <Text fontSize="xs" fontWeight="600">Aadhaar & Mobile Verified</Text>
            </HStack>
          </VStack>

        </Box>
      </Flex>

      {/* Footer Section */}
      <Box w="full" bg="white" mt="auto">
        <Box p="4" px="7" pt="2.5" borderTop="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" mb="2" wrap="wrap" gap="2">
            <Flex align="center" gap="1.5" minW="fit-content">
              <Text fontSize="sm" color="#16a34a" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Aadhaar Verified</Text>
            </Flex>
            <Flex align="center" gap="1.5" minW="fit-content">
              <Text fontSize="sm" color="#16a34a" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Mobile Verified</Text>
            </Flex>
            <Flex align="center" gap="1.5" minW="fit-content">
              <Text fontSize="sm" color="#16a34a" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Address Verified</Text>
            </Flex>
            <Flex align="center" gap="1.5" minW="fit-content">
              <Text fontSize="sm" color="#16a34a" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Experience Verified</Text>
            </Flex>
          </Flex>

          <Flex justify="center" mt="2">
            <Box px="3" py="0.5" borderRadius="full" border="1px solid #16a34a" bg="green.50">
              <Text fontSize="10px" fontWeight="800" color="#166534" whiteSpace="nowrap">Profile Reviewed by ZomoCook</Text>
            </Box>
          </Flex>
        </Box>
        
        <div style={{ background: 'linear-gradient(135deg, #004aad 0%, #0062e6 100%)', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', top: '1px' }}>
              <img src="/logo.png" onError={(e) => { e.target.src = `${UPLOAD_BASE_URL}/uploads/logo.png`; }} alt="ZomoCook" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '11px', lineHeight: '1.4' }}>This profile has been verified by ZomoCook Recruitment Team.</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '500', fontSize: '10px', lineHeight: '1.4' }}>We ensure trusted, skilled & professional staff for your business.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '13px' }}>🌐</span>
            <div style={{ color: 'white', fontSize: '11px', fontWeight: '600' }}>www.zomocook.com</div>
          </div>
        </div>
      </Box>
    </Flex>
  );
});

export default CandidateCVPreview;
