const mongoose = require("mongoose");
const ParseModel = require("../models/ParseModel");
const { createError } = require("../utils/errorUtils");

const  postData= async (req, res, next) => {
  try {
    const {aadhaarNumber,nameOnAadhaar,dob,gender,address,pincode,ageBand,maskedMobileNumber,uidStatus,apiResponse}=req.body
    console.log("hi",aadhaarNumber,nameOnAadhaar,dob,gender,address,pincode,ageBand,maskedMobileNumber,uidStatus,apiResponse)
    const existingRecord = await ParseModel.findOne({ aadhaarNumber });
    if (existingRecord) {
      return res.status(200).json({
        status: "success",
        data: existingRecord
      });
    }
    const newParsedData = new ParseModel({aadhaarNumber,nameOnAadhaar,dob,gender,address,pincode,ageBand,maskedMobileNumber,uidStatus,apiResponse});

    // Save to database
    await newParsedData.save();
    res.status(200).json({
      status: "success",
      data: newParsedData
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  postData
};
