import {
  Button,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  FormControl,
  Text,
  Textarea,
  ModalFooter,
  Input,
  useColorModeValue,
  Flex,
  Image,
  CloseButton,
} from "@chakra-ui/react";
import { BsFillImageFill } from "react-icons/bs";
import { AddIcon } from "@chakra-ui/icons";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import userAtom from "../atoms/userAtom";
import postsAtom from '../atoms/postsAtom';
import { useRecoilValue} from "recoil";
import useShowToast from "../hooks/useShowToast";
import {useParams} from 'react-router-dom';
const MAX_CHAR = 500;
const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilValue(postsAtom);
  const { handleImageChange, imgURL, setImgURL } = usePreviewImg();
  const user = useRecoilValue(userAtom);
  const {username} = useParams();
  const imageRef = useRef(null);
  const showToast = useShowToast();
  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };
  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "/application/json",
        },
        body: JSON.stringify({
          postedBy: user._id,
          text: postText,
          img: imgURL,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post created succesfully", "success");
      if(username === user.username) {
        setPosts([data, ...posts]);
      }
      onClose();
      setPostText("");
      setImgURL("");
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={10}
        leftIcon={<AddIcon />}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
      >
        Post
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="Post content goes here.."
                onChange={handleTextChange}
              />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign={"right"}
                m={"1"}
                color={"gray.800"}
              >
                {remainingChar}/(MAX_CHAR)
              </Text>

              <Input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImageChange}
              />

              <BsFillImageFill
                style={{ marginLeft: "5px", cursor: "pointer" }}
                size={16}
                onClick={() => imageRef.current.click()}
              />
            </FormControl>
            {imgURL && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imgURL} alt="Selected img" />
                <CloseButton
                  onClick={() => {
                    setImgURL("");
                  }}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={loading}
              onClick={handleCreatePost}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
