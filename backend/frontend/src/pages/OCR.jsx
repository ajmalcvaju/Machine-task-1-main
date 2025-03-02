import React, { useState } from "react";
import axios from "axios";
import Tesseract from "tesseract.js";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Camera } from "lucide-react";

const OCR = () => {
  const [apiResponse, setApiResponse] = useState(
    "Start Performing OCR by inputting your Aadhaar front and back"
  );
  const [parsedData, setParsedData] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPincode] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [parsed, setParsed] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      type === "front" ? setFrontImage(imageUrl) : setBackImage(imageUrl);
    }
  };

  const calculateAgeBand = (dob) => {
    if (!dob) return "Unknown";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 0) return "Invalid Age";
    if (age >= 120) return "120+";

    const min = Math.floor(age / 5) * 5;
    const max = min + 4;
    return `${min}-${max}`;
  };

  const handleDOBChange = (dob) => {
    const band = calculateAgeBand(dob);
    setAgeBand(band);
  };

  const parseAadhaar = async () => {
    if (!frontImage && !backImage) {
      setApiResponse("Please upload Aadhaar images first!");
      return;
    }

    setLoading(true);
    setApiResponse("Extracting text... Please wait.");

    try {
      let frontText = "";
      let backText = "";

      if (frontImage) {
        const { data } = await Tesseract.recognize(frontImage, "eng");
        frontText = data.text;
        console.log("Extracted Front Text:", frontText); // Debugging
      }

      if (backImage) {
        const { data } = await Tesseract.recognize(backImage, "eng");
        backText = data.text;
        console.log("Extracted Back Text:", backText); // Debugging
      }

      // Aadhaar Number
      const aadhaarMatch = frontText.match(/\b\d{4} \d{4} \d{4}\b/);

      // Extract Name (Improved)
      let nameMatch = frontText.split("\n").find((line) => {
        return line.match(/\b[A-Z][a-z]+\s[A-Z]\s[A-Z]\b/);
      });

      // Fallback: Extract First Two Lines Below "GOVERNMENT OF INDIA"
      if (!nameMatch) {
        const lines = frontText.split("\n").map((line) => line.trim());
        const govIndex = lines.findIndex((line) =>
          line.includes("GOVERNMENT OF INDIA")
        );

        if (govIndex !== -1 && lines.length > govIndex + 2) {
          nameMatch = lines[govIndex + 1].replace(/[^A-Za-z .]/g, "").trim();
        }
      }

      // DOB, Gender
      const dobMatch = frontText.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
      const genderMatch = frontText.match(/\b(Male|Female)\b/);

      // Pincode Extraction - Improved Logic
      const pincodeMatch = backText.match(/\b\d{6}\b/g); // Find all 6-digit numbers

      let extractedPincode = "Not Found";
      if (pincodeMatch) {
        // Prioritize pincodes starting with '67' (Kerala region)
        extractedPincode =
          pincodeMatch.find((pin) => pin.startsWith("67")) || pincodeMatch[0];
      }

      // Extract Address from Back Text
      const addressMatch = backText.match(/Address:(.*?)(\d{6})/s);

      let extractedAddress = "Not Found";
      let firstLine;
      let secondLine;
      let thirdLine;
      if (addressMatch) {
        extractedAddress = addressMatch[1] 
          .replace(/[^A-Za-z0-9\s,.-]/g, "")
          .replace(/\s+/g, " ")
          .trim();
          const maxLength = Math.ceil(extractedAddress.length / 3); 
          firstLine = extractedAddress.substring(0, maxLength);
          secondLine = extractedAddress.substring(maxLength,2*maxLength);
          thirdLine=extractedAddress.substring(2*maxLength);
      }

      const formattedResponse = {
        status: true,
        data: {
          AadhaarNumber: aadhaarMatch ? aadhaarMatch[0] : "Not Found",
          NameOnAadhaar: nameMatch ? nameMatch.trim() : "Not Found",
          DOB: dobMatch ? dobMatch[0] : "Not Found",
          Gender: genderMatch ? genderMatch[0] : "Not Found",
          Address: [firstLine, secondLine,thirdLine],
          Pincode: pincodeMatch ? pincodeMatch[0] : "Not Found",
          AgeBand: ageBand? ageBand: "Not Found",
          MaskedMobileNumber: "******295",
          UidStatus: "Back UID Not Found",
        },
        message: "Parsing Successful",
      };
       
      setAadhaarNumber(aadhaarMatch?.[0] ?? "Not Found");
      setName(nameMatch ? nameMatch.trim() : "Not Found");
      setDob(dobMatch ? dobMatch[0] : "Not Found");
      setGender(genderMatch ? genderMatch[0] : "Not Found");
      setAddress(extractedAddress);
      setPincode(pincodeMatch ? pincodeMatch[0] : "Not Found");
      setAgeBand(dob ? handleDOBChange(dob) : "Not Found");
      setApiResponse(JSON.stringify(formattedResponse, null, 2));
      setParsed(true);
      
      const parsedData = {
        aadhaarNumber: aadhaarMatch?.[0] ?? "Not Found",
        nameOnAadhaar: nameMatch ? nameMatch.trim() : "Not Found",
        dob: dobMatch ? dobMatch[0] : "Not Found",
        gender: genderMatch ? genderMatch[0] : "Not Found",
        address: extractedAddress,
        pincode: pincodeMatch ? pincodeMatch[0] : "Not Found",
        ageBand: dob ? handleDOBChange(dob) : "20-30",
        maskedMobileNumber: "******295",
        uidStatus:"Back UID Not Found",
        apiResponse: JSON.stringify(formattedResponse, null, 2),
      };
      const response = await axios.post("http://localhost:5000/api/parsed-data", parsedData);
      console.log("Data saved successfully:", response.data);
      alert("Data parsed successfully!");
    } catch (error) {
      setApiResponse("Error extracting text. Please try again.");
      console.error("OCR Error:", error);
      alert("Data parsing failed!");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-100 p-6">
        {/* Left Section: Aadhaar Upload */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Aadhaar Front */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center w-full">
            <p className="text-gray-600 font-semibold mb-2">Aadhaar Front</p>
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-blue-500">
              {frontImage ? (
                <>
                  <img
                    src={frontImage}
                    alt="Aadhaar Front"
                    className="w-60 h-40 object-cover rounded-lg"
                  />
                  <span className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-full mt-4">
                    <Camera size={20} />
                    <span>Press to Re-capture/Upload</span>
                  </span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-blue-500 text-4xl mb-2" />
                  <p className="text-gray-500 text-sm">
                    Click here to Upload/Capture
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "front")}
              />
            </label>
          </div>

          {/* Aadhaar Back */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center w-full">
            <p className="text-gray-600 font-semibold mb-2">Aadhaar Back</p>
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-blue-500">
              {backImage ? (
                <>
                  <img
                    src={backImage}
                    alt="Aadhaar Back"
                    className="w-60 h-40 object-cover rounded-lg"
                  />
                  <span className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-full mt-4">
                    <Camera size={20} />
                    <span>Press to Re-capture/Upload</span>
                  </span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-blue-500 text-4xl mb-2" />
                  <p className="text-gray-500 text-sm">
                    Click here to Upload/Capture
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "back")}
              />
            </label>
          </div>

          {/* Parse Aadhaar Button */}
          <div
            onClick={parseAadhaar}
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-semibold py-3 rounded-4xl shadow-md transition duration-300"
          >
            {loading ? "Extracting..." : "PARSE AADHAAR"}
          </div>
        </div>

        {/* Right Section: API Response */}
        <div className="container mx-auto p-6 w-2/3">
          {parsed ? (
            // Show Parsed Data & API Response when parsed is true
            <div className="bg-gray-100 min-h-screen">
              {/* Parsed Data Section */}
              <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-bold mb-4">Parsed Data</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-semibold text-left">
                      Aadhaar Number
                    </p>
                    <p className="text-black bg-gray-200 p-2 rounded text-left">
                      {aadhaarNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-left">
                      Name on Aadhaar
                    </p>
                    <p className="text-black bg-gray-200 p-2 rounded text-left">
                      {name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 font-semibold text-left">Date of Birth</p>
                    <p className="text-black bg-gray-200 p-2 rounded text-left">{dob}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-left">
                      Gender
                    </p>
                    <p className="text-black bg-gray-200 p-2 rounded text-left">
                      {gender}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-gray-600 font-semibold text-left">
                      Address
                    </p>
                    <p className="text-black bg-gray-200 p-2 rounded text-left">
                      {address}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 font-semibold text-left">
                      Pincode
                    </p>
                    <p className="text-black bg-gray-200 p-2 rounded text-left">
                      {pinCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* API Response Section */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">API Response</h2>
                <pre className="bg-gray-200 p-4 rounded-lg text-sm text-gray-900">
                  {apiResponse}
                </pre>
              </div>
            </div>
          ) : (
            // Show Only API Response when parsed is false
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0 lg:pl-12">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                API Response
              </h2>
              <div className="bg-gray-200 p-6 rounded-lg shadow-md">
              <p className="text-gray-600 whitespace-pre-wrap">{apiResponse}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OCR;
