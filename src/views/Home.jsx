import React from "react";
import { Heading, VStack } from "@chakra-ui/layout";
import { Lottie } from "@crello/react-lottie";

import animationData from "../assets/lotties/working.json";

const defaultLottieOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const Home = () => {
  return (
    <VStack spacing={0} h="max-content">
      <Heading fontSize="6xl">Welcome to Feedbackfy!</Heading>
      <Lottie config={defaultLottieOptions} height={300} width={300} />
    </VStack>
  );
};
export default Home;
