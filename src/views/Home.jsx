import React from "react";
import { Button } from "@chakra-ui/button";
import { useDispatch } from "react-redux";

import { logout } from "../state/user/userSlice";
import { Flex } from "@chakra-ui/layout";

const Home = () => {
  const dispatch = useDispatch();

  return (
    <Flex minH={"100vh"}>
      <Button onClick={() => dispatch(logout())}>logout</Button>
    </Flex>
  );
};

export default Home;
