import { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Heading, Button, 
  useToast, Flex, Icon, Input, InputGroup, InputRightElement, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Badge, Divider
} from '@chakra-ui/react';
import { Eye, EyeOff, ArrowRight, UtensilsCrossed, ShieldCheck, Zap, KeyRound, Lock, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import API_BASE_URL from '../apiConfig';

const BRAND = '#2D2B75';
const SECONDARY = '#4C49ED';
const ACCENT = '#ED1C24';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Clear any existing session or cached tokens on mount to prevent auto-login
  useEffect(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    sessionStorage.clear();
  }, []);

  // Reset Password Modal State
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const [resetStep, setResetStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetMaskedPhone, setResetMaskedPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  const handleOpenResetModal = () => {
    setResetStep(1);
    setResetIdentifier(email || '');
    setResetPhone('');
    setResetMaskedPhone('');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setShowResetNewPassword(false);
    setShowResetConfirmPassword(false);
    onResetOpen();
  };

  const handleSendResetOtp = async (e) => {
    if (e) e.preventDefault();
    if (!resetIdentifier.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter registered email or mobile number',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/forgot-password`, {
        identifier: resetIdentifier.trim()
      });
      if (res.data.success) {
        setResetPhone(res.data.phone);
        setResetMaskedPhone(res.data.maskedPhone || res.data.phone);
        setResetStep(2);
        toast({
          title: 'OTP Sent',
          description: res.data.message || 'OTP sent successfully to registered mobile.',
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to Send OTP',
        description: err.response?.data?.message || 'Could not send OTP. Please check your email or mobile.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleConfirmResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!resetOtp.trim()) {
      toast({ title: 'OTP Required', description: 'Please enter the 6-digit OTP', status: 'warning' });
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      toast({ title: 'Password Too Short', description: 'Password must be at least 6 characters long', status: 'warning' });
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match', status: 'error' });
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/reset-password`, {
        phone: resetPhone,
        otp: resetOtp.trim(),
        newPassword: resetNewPassword
      });
      if (res.data.success) {
        toast({
          title: 'Password Reset Successful!',
          description: res.data.message || 'You can now sign in with your new password.',
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        onResetClose();
        setPassword(resetNewPassword);
      }
    } catch (err) {
      toast({
        title: 'Reset Failed',
        description: err.response?.data?.message || 'Failed to reset password. Please check your OTP.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data));

        // FCM token save karo login ke baad
        try {
          const { requestFCMToken } = await import('../firebase');
          const fcmToken = await requestFCMToken();
          if (fcmToken) {
            await axios.post(`${API_BASE_URL}/notifications/save-token`, { token: fcmToken }, {
              headers: { Authorization: `Bearer ${response.data.token}` }
            });
          }
        } catch (e) { console.error('FCM setup error:', e); }

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.data.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100dvh"
      w="100vw"
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
      bg="#f4f7fb"
      position="relative"
      overflowX="hidden"
    >
      {/* ── Mobile Top: Blue Header ── */}
      <Box
        display={{ base: 'flex', lg: 'none' }}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        bg={`linear-gradient(145deg, ${BRAND} 0%, ${SECONDARY} 100%)`}
        borderBottomRadius="24px"
        position="relative"
        py="6"
        px="4"
        w="100%"
        flexShrink={0}
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg="rgba(255,255,255,0.07)" />
        <Box position="absolute" bottom="-15px" left="-15px" w="70px" h="70px" borderRadius="full" bg="rgba(255,255,255,0.05)" />

        <Flex justify="center" mb="3" position="relative" zIndex="1">
          <Box
            w="52px"
            h="52px"
            p="2"
            borderRadius="14px"
            bg="white"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 6px 20px rgba(0,0,0,0.18)"
          >
            <img src="/logo.png" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        </Flex>
        <Text fontSize="lg" fontWeight="900" color="white" lineHeight="1.1" letterSpacing="-0.3px" position="relative" zIndex="1">
          ZomoCook
        </Text>
        <Text fontSize="9px" color="rgba(255,255,255,0.85)" fontWeight="600" mt="0.5" letterSpacing="1px" textTransform="uppercase" position="relative" zIndex="1">
          Admin Portal
        </Text>
      </Box>

      {/* ── Desktop Left Panel ── */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="45%"
        flexDirection="column"
        bg={`linear-gradient(145deg, ${BRAND} 0%, ${SECONDARY} 60%, #1d1b4e 100%)`}
        position="relative"
        overflow="hidden"
        p="12"
        justifyContent="space-between"
        minH="100vh"
      >
        <Box position="absolute" top="-80px" right="-80px" w="320px" h="320px" borderRadius="full" bg="rgba(255,255,255,0.05)" />
        <Box position="absolute" bottom="-60px" left="-60px" w="260px" h="260px" borderRadius="full" bg="rgba(255,255,255,0.04)" />
        <Box position="absolute" top="40%" left="60%" w="180px" h="180px" borderRadius="full" bg="rgba(237,28,36,0.12)" />

        {/* Logo */}
        <Flex align="center" gap="3" position="relative" zIndex="1">
          <Box w="48px" h="48px" borderRadius="12px" bg="white" overflow="hidden" display="flex" alignItems="center" justifyContent="center" boxShadow="0 4px 16px rgba(0,0,0,0.15)">
            <img src="/logo.png" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

        <Text fontSize="xs" color="rgba(255,255,255,0.4)" position="relative" zIndex="1">
          © 2026 ZomoCook. All rights reserved. Crafted with ❤️ by <a href="https://digicoders.in/" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}>Team Digicoders</a>
        </Text>
      </Box>

      {/* ── Right Panel: Login Form ── */}
      <Flex
        flex="1"
        w="full"
        alignItems="center"
        justifyContent="center"
        px="4"
        py="6"
        bg={{ base: '#f4f7fb', lg: 'transparent' }}
        position="relative"
        zIndex="1"
        minH={{ base: 'auto', lg: '100vh' }}
      >
        <Box w="full" maxW="420px">

          {/* Card */}
          <Box
            bg="white"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow={{ base: '0 4px 16px rgba(0,74,173,0.08)', lg: '0 8px 40px rgba(0,74,173,0.1)' }}
            border="1px solid #e8edf5"
            position="relative"
            w="full"
          >
            {/* Top gradient bar */}
            <Box h="5px" bgGradient={`linear(to-r, ${BRAND}, ${ACCENT})`} />

            <Box px="5" pt="7" pb="7">

              {/* Heading */}
              <Box mb="6">
                <Heading fontSize="xl" fontWeight="900" color="#1e293b" mb="1.5" letterSpacing="-0.3px">Welcome Back</Heading>
                <Text fontSize="sm" color="#64748b" fontWeight="500" lineHeight="1.4">Sign in to continue to admin</Text>
              </Box>

              <form onSubmit={handleLogin} autoComplete="off">

                {/* Email */}
                <Box mb="5">
                  <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="2">
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    placeholder="admin@zomocook.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    h="44px"
                    fontSize="14px"
                    color="#1e293b"
                    bg="#f8faff"
                    border="1.5px solid"
                    borderColor="#dde6f5"
                    borderRadius="10px"
                    _focus={{ bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                    _hover={{ borderColor: '#aec6ef' }}
                    transition="all 0.18s"
                  />
                </Box>

                {/* Password */}
                <Box mb="2">
                  <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="2">
                    Password
                  </Text>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      h="44px"
                      fontSize="14px"
                      color="#1e293b"
                      bg="#f8faff"
                      border="1.5px solid"
                      borderColor="#dde6f5"
                      borderRadius="10px"
                      pr="44px"
                      _focus={{ bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                      _hover={{ borderColor: '#aec6ef' }}
                      transition="all 0.18s"
                    />
                    <InputRightElement h="44px" w="44px">
                      <IconButton
                        aria-label="Toggle password"
                        icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        variant="ghost"
                        size="sm"
                        color="#94a3b8"
                        _hover={{ color: BRAND, bg: 'transparent' }}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </Box>

                {/* Forgot Password Link */}
                <Flex justify="flex-end" mb="5">
                  <Button
                    variant="link"
                    size="xs"
                    color={SECONDARY}
                    fontWeight="600"
                    _hover={{ textDecoration: 'underline', color: BRAND }}
                    onClick={handleOpenResetModal}
                  >
                    Forgot / Reset Password?
                  </Button>
                </Flex>

                {/* Submit Button */}
                <Button
                  type="submit"
                  w="full"
                  h="44px"
                  fontSize="sm"
                  fontWeight="700"
                  bg={BRAND}
                  color="white"
                  borderRadius="10px"
                  rightIcon={<ArrowRight size={16} />}
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

            </Box>
          </Box>
        </Box>
      </Flex>

      {/* ── Forgot / Reset Password Modal ── */}
      <Modal isOpen={isResetOpen} onClose={onResetClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader bg="#f8faff" borderBottom="1px solid #edf2f7" py="4">
            <HStack spacing="3">
              <Flex w="36px" h="36px" borderRadius="lg" bg={`${BRAND}15`} align="center" justify="center">
                <Icon as={KeyRound} color={BRAND} boxSize="18px" />
              </Flex>
              <Box>
                <Heading size="sm" color="#1e293b">Reset Admin Password</Heading>
                <Text fontSize="xs" color="#64748b" fontWeight="normal">
                  {resetStep === 1 ? 'Step 1 of 2: Verify registered account' : 'Step 2 of 2: Enter OTP & Set new password'}
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt="1" />

          <ModalBody py="6">
            {resetStep === 1 ? (
              <form onSubmit={handleSendResetOtp}>
                <VStack spacing="4" align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#475569" mb="2" textTransform="uppercase" letterSpacing="0.5px">
                      Email or Registered Mobile Number
                    </Text>
                    <InputGroup>
                      <Input
                        type="text"
                        placeholder="e.g. admin@zomocook.in or 9876543210"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        autoFocus
                        h="44px"
                        fontSize="14px"
                        borderRadius="10px"
                        border="1.5px solid #dde6f5"
                        _focus={{ borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                      />
                    </InputGroup>
                    <Text fontSize="xs" color="#94a3b8" mt="1.5">
                      We will send a 6-digit verification code to the registered mobile number on this account.
                    </Text>
                  </Box>

                  <Button
                    type="submit"
                    h="44px"
                    bg={BRAND}
                    color="white"
                    fontSize="sm"
                    fontWeight="700"
                    borderRadius="10px"
                    isLoading={isResetSubmitting}
                    loadingText="Sending OTP..."
                    rightIcon={<ArrowRight size={16} />}
                    _hover={{ bg: '#003d91' }}
                  >
                    Send Verification OTP
                  </Button>
                </VStack>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetPassword}>
                <VStack spacing="4" align="stretch">
                  <Box p="3" bg="#f1f5f9" borderRadius="lg" border="1px solid #e2e8f0">
                    <HStack justify="space-between">
                      <HStack spacing="2">
                        <Smartphone size={16} color="#64748b" />
                        <Text fontSize="xs" color="#334155" fontWeight="600">
                          OTP sent to: <Text as="span" color={BRAND}>{resetMaskedPhone}</Text>
                        </Text>
                      </HStack>
                      <Button
                        size="xs"
                        variant="ghost"
                        color={BRAND}
                        onClick={() => setResetStep(1)}
                        fontWeight="700"
                      >
                        Change
                      </Button>
                    </HStack>
                  </Box>

                  {/* OTP Input */}
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#475569" mb="1.5" textTransform="uppercase" letterSpacing="0.5px">
                      6-Digit OTP
                    </Text>
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      letterSpacing="4px"
                      fontWeight="bold"
                      textAlign="center"
                      fontSize="lg"
                      h="44px"
                      borderRadius="10px"
                      border="1.5px solid #dde6f5"
                      _focus={{ borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                    />
                  </Box>

                  {/* New Password */}
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#475569" mb="1.5" textTransform="uppercase" letterSpacing="0.5px">
                      New Password
                    </Text>
                    <InputGroup>
                      <Input
                        type={showResetNewPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        h="44px"
                        fontSize="14px"
                        borderRadius="10px"
                        border="1.5px solid #dde6f5"
                        _focus={{ borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                      />
                      <InputRightElement h="44px">
                        <IconButton
                          aria-label="Toggle password"
                          icon={showResetNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          variant="ghost"
                          size="sm"
                          color="#94a3b8"
                          onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  {/* Confirm Password */}
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#475569" mb="1.5" textTransform="uppercase" letterSpacing="0.5px">
                      Confirm New Password
                    </Text>
                    <InputGroup>
                      <Input
                        type={showResetConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        h="44px"
                        fontSize="14px"
                        borderRadius="10px"
                        border="1.5px solid #dde6f5"
                        _focus={{ borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                      />
                      <InputRightElement h="44px">
                        <IconButton
                          aria-label="Toggle confirm password"
                          icon={showResetConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          variant="ghost"
                          size="sm"
                          color="#94a3b8"
                          onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  <HStack justify="space-between" pt="2">
                    <Button
                      size="sm"
                      variant="ghost"
                      color="#64748b"
                      leftIcon={<RefreshCw size={14} />}
                      isLoading={isResetSubmitting}
                      onClick={handleSendResetOtp}
                    >
                      Resend OTP
                    </Button>
                    <Button
                      type="submit"
                      h="42px"
                      px="6"
                      bg={BRAND}
                      color="white"
                      fontSize="sm"
                      fontWeight="700"
                      borderRadius="10px"
                      isLoading={isResetSubmitting}
                      loadingText="Resetting..."
                      _hover={{ bg: '#003d91' }}
                    >
                      Set New Password
                    </Button>
                  </HStack>
                </VStack>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Login;
