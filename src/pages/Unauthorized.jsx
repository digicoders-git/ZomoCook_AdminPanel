import { Box, Text, Button, HStack, Icon } from '@chakra-ui/react';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRAND = '#004aad';
const ACCENT = '#ed1c24';

const Unauthorized = () => {
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  return (
    <Box
      minH="100vh"
      bg="#f4f7fb"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="4"
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="0 8px 40px rgba(0,74,173,0.10)"
        border="1px solid #e8edf5"
        p={{ base: '8', md: '14' }}
        maxW="480px"
        w="full"
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        {/* Top color bar */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="4px"
          bgGradient={`linear(to-r, ${ACCENT}, #ff6b6b)`}
        />

        {/* Icon */}
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          w="88px"
          h="88px"
          borderRadius="full"
          bg="#fff0f0"
          border="2px solid #fecaca"
          mb="6"
          mx="auto"
        >
          <Icon as={ShieldX} boxSize={10} color={ACCENT} />
        </Box>

        {/* 403 badge */}
        <Box
          display="inline-flex"
          alignItems="center"
          gap="2"
          bg="#fff0f0"
          border="1px solid #fecaca"
          px="3"
          py="1"
          borderRadius="full"
          mb="4"
        >
          <Box w="6px" h="6px" borderRadius="full" bg={ACCENT} />
          <Text fontSize="11px" fontWeight="800" color={ACCENT} letterSpacing="1px" textTransform="uppercase">
            403 — Access Denied
          </Text>
        </Box>

        <Text
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="900"
          color="#1e293b"
          mb="3"
          lineHeight="1.2"
        >
          Permission Required
        </Text>

        <Text fontSize="sm" color="#64748b" lineHeight="1.8" mb="2">
          You don't have access to this page.
        </Text>
        <Text fontSize="sm" color="#94a3b8" lineHeight="1.8" mb="8">
          Your current role{' '}
          <Box as="span" fontWeight="700" color={BRAND}>
            "{adminData?.role?.name || 'Staff User'}"
          </Box>{' '}
          does not include permission for this section. Please contact your administrator.
        </Text>

        <HStack spacing="3" justify="center">
          <Button
            leftIcon={<ArrowLeft size={15} />}
            onClick={() => navigate(-1)}
            variant="outline"
            borderColor="#dde6f5"
            color="#64748b"
            borderRadius="lg"
            size="sm"
            _hover={{ bg: '#f8faff', borderColor: BRAND, color: BRAND }}
          >
            Go Back
          </Button>
          <Button
            leftIcon={<Home size={15} />}
            onClick={() => navigate('/')}
            bg={BRAND}
            color="white"
            borderRadius="lg"
            size="sm"
            _hover={{ bg: '#003d91' }}
            boxShadow={`0 4px 12px ${BRAND}30`}
          >
            Dashboard
          </Button>
        </HStack>

        {/* Bottom decorative dots */}
        <HStack spacing="1.5" justify="center" mt="8">
          {[ACCENT, BRAND, '#94a3b8'].map((c, i) => (
            <Box key={i} w="6px" h="6px" borderRadius="full" bg={c} opacity={0.4} />
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default Unauthorized;
