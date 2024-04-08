import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { GiConversation } from "react-icons/gi";
import Conversation from "../components/Conversation";
import MessageContainer from "../components/MessageContainer";

const ChatPage = () => {
  return (
    <Box
      position={"absolute"}
      left={"50%"}
      p={4}
      transform={"translateX(-50%)"}
      w={{
        base: "100%",
        md: "80%",
        lg: "750px",
      }}
    >
      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{
          sm: "400px",
          md: "full",
        }}
        mx={"auto"}
      >
        <Flex flex={30}>
          <Text fontWeight={700} color={useColorMode("gray.600", "gray.400")}>
            Your Conversations
          </Text>
          <form>
            <Flex>
              <Flex alignItems={"center"} gap={2}>
                <Input placeholder="Search for a user" />
                <Button size={"sm"}>
                  <SearchIcon />
                </Button>
              </Flex>
            </Flex>
          </form>
          {true &&
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}
              >
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}
          <Conversation />
        </Flex>
        <Flex
          flex={70}
          borderRadius={"md"}
          flexDir={"column"}
          justifyContent={"center"}
          height={"400px"}
          p={2}
        >
          <GiConversation size={100} />
          <Text fontSize={20}>Select a convsersation to start messaging</Text>
        </Flex>
        <MessageContainer/>
      </Flex>
    </Box>
  );
};

export default ChatPage;
