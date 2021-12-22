import React from "react";
import {
  NavLink as ReactRouterLink,
  useResolvedPath,
  useMatch,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { RiChatPollFill, RiFeedbackFill } from "react-icons/ri";
import { FiMenu } from "react-icons/fi";
import { MdHome } from "react-icons/md";
import { RiAdminLine, RiLogoutBoxLine } from "react-icons/ri";

import { logout } from "../state/user/userSlice";
import { ROLES } from "../utils/constants";

const LayoutWithNavbar = ({ children: layoutChildren }) => {
  const currentUser = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const sidebar = useDisclosure();

  return (
    <Box
      as="section"
      bg={useColorModeValue("gray.50", "gray.700")}
      minH="100vh"
    >
      <SidebarContent display={{ base: "none", md: "unset" }} />
      <Drawer
        isOpen={sidebar.isOpen}
        onClose={sidebar.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px="4"
          bg={useColorModeValue("white", "gray.800")}
          borderBottomWidth="1px"
          borderColor={useColorModeValue("inherit", "gray.700")}
          h="14"
        >
          <IconButton
            aria-label="Menu"
            display={{ base: "inline-flex", md: "none" }}
            onClick={sidebar.onOpen}
            icon={<FiMenu />}
            size="sm"
          />

          <Flex align="center" ml={"auto"}>
            <Button
              onClick={() => dispatch(logout())}
              size="sm"
              leftIcon={<Icon as={RiLogoutBoxLine} />}
            >
              Log out
            </Button>
            <Avatar
              as={ReactRouterLink}
              to={"/profile"}
              ml="4"
              size="sm"
              name="anubra266"
              src="https://external-preview.redd.it/fAFuBHWbVrt1_IQVRyLUVP1UCP2Yi2R-I2LzKC9ibo8.jpg?auto=webp&s=cd4e3eaf1926e236fb0082150d44b17b93a97b26"
              cursor="pointer"
            />
            <Text ml={2} fontWeight="bold">
              {currentUser?.email?.split("@")[0]}
            </Text>
          </Flex>
        </Flex>

        <Box as="main" p="4">
          {layoutChildren}
        </Box>
      </Box>
    </Box>
  );
};

const SidebarContent = (props) => {
  const user = useSelector((state) => state.user.value);

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg={useColorModeValue("white", "gray.800")}
      borderColor={useColorModeValue("inherit", "gray.700")}
      borderRightWidth="1px"
      w="60"
      {...props}
    >
      <Flex px="4" py="5" align="center">
        <Text
          fontSize="2xl"
          ml="2"
          color={useColorModeValue("brand.500", "white")}
          fontWeight="semibold"
        >
          Feedbackfy
        </Text>
      </Flex>
      <Flex
        flex="1"
        direction="column"
        as="nav"
        fontSize="sm"
        color="gray.600"
        aria-label="Main Navigation"
      >
        <NavItem icon={MdHome} to={"/"}>
          Home
        </NavItem>
        {user?.role === ROLES.ADMIN && (
          <NavItem icon={RiAdminLine} to={"/admin"}>
            Admin
          </NavItem>
        )}
        {user?.role !== ROLES.ADMIN && <NavItem icon={RiChatPollFill} to={"/pegs"}>
          Pegs
        </NavItem>}
        {user?.role !== ROLES.ADMIN && <NavItem icon={RiFeedbackFill} to={"/feedbacks"}>
          Feedbacks
        </NavItem>}
        {/* <NavItem icon={HiCode} onClick={integrations.onToggle}>
          Integrations
          <Icon
            as={MdKeyboardArrowRight}
            ml="auto"
            transform={integrations.isOpen && "rotate(90deg)"}
          />
        </NavItem>
        <Collapse in={integrations.isOpen}>
          <NavItem pl="12" py="2">
            Shopify
          </NavItem>
          <NavItem pl="12" py="2">
            Slack
          </NavItem>
          <NavItem pl="12" py="2">
            Zapier
          </NavItem>
        </Collapse> */}
      </Flex>
    </Box>
  );
};

const NavItem = (props) => {
  const { icon, children, to, ...rest } = props;
  const bgColorContainer = useColorModeValue("gray.100", "gray.900");
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Flex
      as={ReactRouterLink}
      to={to}
      align="center"
      px="4"
      pl="4"
      py="3"
      cursor="pointer"
      color={useColorModeValue("inherit", "gray.400")}
      bg={match ? bgColorContainer : "transparent"}
      _hover={{
        bg: bgColorContainer,
        color: useColorModeValue("gray.900", "gray.200"),
      }}
      role="group"
      fontWeight="semibold"
      transition=".15s ease"
      {...rest}
    >
      {icon && <Icon mx="2" boxSize="4" as={icon} />}
      {children}
    </Flex>
  );
};

export default LayoutWithNavbar;
