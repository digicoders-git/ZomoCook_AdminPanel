import { useState } from 'react';
import {
  Box, VStack, HStack, Text, Heading, Button, Link as ChakraLink,
  useToast, Flex, Icon,
} from '@chakra-ui/react';
import { Eye, EyeOff, ArrowRight, UtensilsCrossed, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRAND = '#004aad';
const ACCENT = '#ed1c24';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to ZomoCook Admin Panel.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/');
    }, 1500);
  };

  return (
    <Box minH="100vh" display="flex" bg="#f4f7fb" position="relative">
      {/* Mobile Split Background */}
      <Box 
        display={{ base: 'block', lg: 'none' }} 
        position="absolute" 
        top="0" 
        left="0" 
        w="full" 
        h="40vh" 
        zIndex="0"
        bg={`linear-gradient(145deg, ${BRAND} 0%, #0062e6 100%)`}
        borderBottomRadius="30px"
      >
        <Box position="absolute" top="-40px" right="-40px" w="150px" h="150px" borderRadius="full" bg="rgba(255,255,255,0.06)" />
      </Box>

      {/* Left Panel (Desktop only) */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="45%"
        flexDirection="column"
        bg={`linear-gradient(145deg, ${BRAND} 0%, #0062e6 60%, #0040a0 100%)`}
        position="relative"
        overflow="hidden"
        p="12"
        justifyContent="space-between"
      >
        {/* Background decorative circles */}
        <Box position="absolute" top="-80px" right="-80px" w="320px" h="320px" borderRadius="full" bg="rgba(255,255,255,0.05)" />
        <Box position="absolute" bottom="-60px" left="-60px" w="260px" h="260px" borderRadius="full" bg="rgba(255,255,255,0.04)" />
        <Box position="absolute" top="40%" left="60%" w="180px" h="180px" borderRadius="full" bg="rgba(237,28,36,0.12)" />

        {/* Logo */}
        <Flex align="center" gap="3" position="relative" zIndex="1">
          <Box w="48px" h="48px" borderRadius="12px" bg="white" overflow="hidden" display="flex" alignItems="center" justifyContent="center" boxShadow="0 4px 16px rgba(0,0,0,0.15)">
            <img src="/logo.jpg" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="800" color="white" lineHeight="1.1">ZomoCook</Text>
            <Text fontSize="11px" color="rgba(255,255,255,0.65)" fontWeight="500" letterSpacing="0.5px">Admin Panel</Text>
          </Box>
        </Flex>

        {/* Center Content */}
        <VStack align="flex-start" spacing="8" position="relative" zIndex="1">
          <Box>
            <Box
              display="inline-flex"
              alignItems="center"
              gap="2"
              bg="rgba(237,28,36,0.2)"
              border="1px solid rgba(237,28,36,0.35)"
              px="3"
              py="1.5"
              borderRadius="full"
              mb="5"
            >
              <Box w="6px" h="6px" borderRadius="full" bg={ACCENT} />
              <Text fontSize="11px" fontWeight="700" color="rgba(255,255,255,0.9)" letterSpacing="0.5px" textTransform="uppercase">
                Secure Admin Access
              </Text>
            </Box>
            <Heading color="white" fontSize="3xl" fontWeight="800" lineHeight="1.2" mb="3">
              Manage Your<br />
              <Box as="span" color={ACCENT}>Culinary</Box> Platform
            </Heading>
            <Text color="rgba(255,255,255,0.65)" fontSize="sm" lineHeight="1.7" maxW="320px">
              Access the complete ZomoCook admin dashboard to manage jobs, candidates, customers, and more.
            </Text>
          </Box>

          {/* Feature pills */}
          <VStack align="flex-start" spacing="3">
            {[
              { icon: UtensilsCrossed, text: 'Manage cooking jobs & candidates' },
              { icon: ShieldCheck, text: 'Role-based access control' },
              { icon: Zap, text: 'Real-time dashboard analytics' },
            ].map(({ icon, text }) => (
              <HStack key={text} spacing="3">
                <Flex w="32px" h="32px" borderRadius="8px" bg="rgba(255,255,255,0.12)" align="center" justify="center" flexShrink={0}>
                  <Icon as={icon} boxSize={4} color="white" />
                </Flex>
                <Text fontSize="sm" color="rgba(255,255,255,0.8)" fontWeight="500">{text}</Text>
              </HStack>
            ))}
          </VStack>
        </VStack>

        {/* Bottom tagline */}
        <Text fontSize="xs" color="rgba(255,255,255,0.4)" position="relative" zIndex="1">
          © 2026 ZomoCook. All rights reserved. Crafted with ❤️ by <a href="https://digicoders.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(255, 0, 0)', textDecoration: 'underline', fontWeight: 'bold',fontSize: '14px' }}>Team Digicoders</a>
        </Text>
      </Box>

      {/* Right Panel — Login Form */}
      <Flex
        flex="1"
        alignItems={{ base: 'flex-start', lg: 'center' }}
        justifyContent="center"
        px={{ base: '4', sm: '10', md: '12' }}
        py={{ base: '20', md: '12' }}
        bg="transparent"
        minH="100vh"
        position="relative"
        zIndex="1"
      >
        <Box w="full" maxW={{ base: 'full', sm: '420px' }}>

          {/* Mobile Header */}
          <Box display={{ base: 'block', lg: 'none' }} textAlign="center" mb="10">
            <Flex justify="center" mb="5">
              <Box w="84px" h="84px" p="2.5" borderRadius="24px" bg="white" overflow="hidden" display="flex" alignItems="center" justifyContent="center" boxShadow="0 12px 40px rgba(0,0,0,0.25)">
                <img src="/logo.jpg" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
            </Flex>
            <Text fontSize="3xl" fontWeight="900" color="white" lineHeight="1.1" letterSpacing="-1px">ZomoCook</Text>
            <Text fontSize="13px" color="rgba(255,255,255,0.9)" fontWeight="600" mt="2" letterSpacing="1.5px" textTransform="uppercase">Admin Portal</Text>
          </Box>

          {/* Card */}
          <Box
            bg="white"
            borderRadius={{ base: '3xl', lg: '2xl' }}
            overflow="hidden"
            boxShadow={{ base: '0 30px 70px rgba(0,0,0,0.15)', lg: '0 8px 40px rgba(0,74,173,0.1)' }}
            border="1px solid #e8edf5"
            position="relative"
          >
            {/* Top gradient bar */}
            <Box h="6px" bgGradient={`linear(to-r, ${BRAND}, ${ACCENT})`} />

            <Box px={{ base: '7', sm: '10' }} pt="10" pb="10">

              {/* Heading */}
              <Box mb="8">
                <Heading fontSize={{ base: '2xl', sm: '2xl' }} fontWeight="900" color="#1e293b" mb="2" letterSpacing="-0.5px">Welcome Back</Heading>
                <Text fontSize="md" color="#64748b" fontWeight="500">Sign in to continue to admin</Text>
              </Box>

              <form onSubmit={handleLogin}>

                {/* Email */}
                <Box mb="5">
                  <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="1px" mb="2">
                    Email Address
                  </Text>
                  <Box
                    as="input"
                    type="email"
                    placeholder="admin@zomocook.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '14px',
                      color: '#1e293b',
                      background: '#f8faff',
                      border: '1.5px solid #dde6f5',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.18s',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = '#fff';
                      e.target.style.borderColor = BRAND;
                      e.target.style.boxShadow = `0 0 0 3px ${BRAND}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.background = '#f8faff';
                      e.target.style.borderColor = '#dde6f5';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Box>

                {/* Password */}
                <Box mb="5">
                  <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="1px" mb="2">
                    Password
                  </Text>
                  <Box position="relative">
                    <Box
                      as="input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 48px 0 16px',
                        fontSize: '14px',
                        color: '#1e293b',
                        background: '#f8faff',
                        border: '1.5px solid #dde6f5',
                        borderRadius: '12px',
                        outline: 'none',
                        transition: 'all 0.18s',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = BRAND;
                        e.target.style.boxShadow = `0 0 0 3px ${BRAND}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.background = '#f8faff';
                        e.target.style.borderColor = '#dde6f5';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <Box
                      position="absolute"
                      right="14px"
                      top="50%"
                      transform="translateY(-50%)"
                      cursor="pointer"
                      color="#94a3b8"
                      onClick={() => setShowPassword(!showPassword)}
                      _hover={{ color: BRAND }}
                      display="flex"
                      alignItems="center"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </Box>
                  </Box>
                </Box>

                {/* Remember + Forgot */}
                {/* <Flex justify="space-between" align="center" mb="6">
                  <HStack spacing="2" cursor="pointer" onClick={() => {}}>
                    <Box
                      w="16px" h="16px"
                      borderRadius="4px"
                      border={`2px solid #cbd5e1`}
                      bg="white"
                      flexShrink={0}
                    />
                    <Text fontSize="sm" color="#64748b">Remember me</Text>
                  </HStack>
                  <ChakraLink */}
                    {/* fontSize="sm"
                    fontWeight="600"
                    color={BRAND}
                    _hover={{ color: ACCENT, textDecoration: 'none' }}
                    transition="color 0.18s"
                  >
                    Forgot password?
                  </ChakraLink>
                </Flex> */}

                {/* Submit Button */}
                <Button
                  type="submit"
                  w="full"
                  h="12"
                  fontSize="sm"
                  fontWeight="700"
                  bg={BRAND}
                  color="white"
                  borderRadius="xl"
                  rightIcon={<ArrowRight size={18} />}
                  isLoading={isLoading}
                  loadingText="Signing In..."
                  _hover={{ bg: '#003d91', transform: 'translateY(-1px)', boxShadow: `0 8px 24px ${BRAND}40` }}
                  _active={{ transform: 'translateY(0)', bg: '#003080' }}
                  transition="all 0.18s"
                  boxShadow={`0 4px 16px ${BRAND}30`}
                >
                  Sign In
                </Button>

              </form>

              {/* Footer dots */}
              {/* <HStack justify="center" spacing="2" mt="7" pt="6" borderTop="1px solid #f1f5f9">
                <Box w="6px" h="6px" borderRadius="full" bg={BRAND} />
                <Text fontSize="xs" color="#94a3b8" fontWeight="500">ZomoCook Admin v1.0</Text>
                <Box w="6px" h="6px" borderRadius="full" bg={ACCENT} />
              </HStack> */}

            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;
