import { useState } from "react";
import useShowToast from "./useShowToast";
const usePreviewImg = () => {
  const [imgURL, setImgURL] = useState(null);
  const showToast = useShowToast();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgURL(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Invalid file type", "Please select an image file", 'error');
      setImgURL(null);
    }
  };
  console.log(imgURL);
  return { handleImageChange, imgURL };
};

export default usePreviewImg;
