const mongoose = require("mongoose");

const parseModelSchema = new mongoose.Schema({
  aadhaarNumber: {
    type: String,
    required: true,
  },
  nameOnAadhaar: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  ageBand: {
    type: String,
    required: true,
  },
  maskedMobileNumber: {
    type: String,
    required: true,
  },
  uidStatus: {
    type: String,
    required: true,
  },
  apiResponse: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const ParseModel = mongoose.model("ParseModel", parseModelSchema);

module.exports = ParseModel;
