import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
  title: { type: String, required:[true, "Name is required"], },
  description: String,
  date: { type: Date, required: [true, "Date is required"], },
  location: {
    type:String,
    required: [true, "Location is required"],
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const Event = mongoose.model("Event",eventSchema)