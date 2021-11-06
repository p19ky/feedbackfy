import React from "react";
import { Flex, VStack } from "@chakra-ui/layout";
import { FiHome, FiUser } from "react-icons/fi";
import { useBreakpointValue } from "@chakra-ui/media-query";
import { useDispatch, useSelector } from "react-redux";
import { RiAdminLine, RiLogoutBoxLine } from "react-icons/ri";

import NavItem from "./NavItem";
import { ROLES } from "../constants";
import { logout } from "../state/user/userSlice";

const Navbar = () => {
  const user = useSelector((state) => state.user.value);
  const navWidth = useBreakpointValue({ base: "min-content", md: "200px" });
  const dispatch = useDispatch();

  return (
    <Flex
      boxShadow="lg"
      borderRadius="md"
      p={2}
      flexDir="column"
      width={navWidth}
      justifyContent="space-between"
    >
      <NavbarVStack>
        <NavItem icon={FiHome} title="Home" to={"/"} />
        {user?.role === ROLES.ADMIN && (
          <NavItem icon={RiAdminLine} title="Admin" to={"/admin"} />
        )}
      </NavbarVStack>

      <NavbarVStack>
        <NavItem
          icon={FiUser}
          title={user?.email?.split("@")[0]}
          to={"/profile"}
        />
        <NavItem
          icon={RiLogoutBoxLine}
          title={"Sign out"}
          onClick={() => dispatch(logout())}
          isLink={false}
        />
      </NavbarVStack>
    </Flex>
  );
};

const NavbarVStack = ({ children }) => (
  <VStack spacing={2} align="flex-start">
    {children}
  </VStack>
);

export default Navbar;
