import React from "react";
import { Flex, VStack } from "@chakra-ui/layout";
import { FiHome, FiUser } from "react-icons/fi";
import { useBreakpointValue } from "@chakra-ui/media-query";
import { useSelector } from "react-redux";
import { RiAdminLine } from "react-icons/ri";

import NavItem from "./NavItem";
import { ROLES } from "../constants";

const Navbar = () => {
  const user = useSelector((state) => state.user.value);
  const navWidth = useBreakpointValue({ base: "min-content", md: "200px" });

  return (
    <Flex
      py={4}
      px={2}
      pos="sticky"
      left="4"
      h="95vh"
      marginTop="2.5vh"
      boxShadow="lg"
      borderRadius="md"
      flexDir="column"
      width={navWidth}
      justifyContent="space-between"
    >
      <VStack spacing={2} align="flex-start">
        <NavItem icon={FiHome} title="Home" to={"/"} />
        {user.role === ROLES.ADMIN && (
          <NavItem icon={RiAdminLine} title="Admin" to={"/admin"} />
        )}
      </VStack>

      <VStack spacing={2} align="flex-start">
        <NavItem icon={FiUser} title="Nume User" to={"/profile"} />
      </VStack>
    </Flex>
  );
};

export default Navbar;
