import {Event} from "../models/event.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createEvent =  asyncHandler(async (req,res) => {
    const {description,title,date,location} = req.body
    if(!(title || description || date || location)){
        throw new ApiError(402,"Missing required fields")
    }
    const event = await Event.create({
    title,
    description,
    date,
    location,
    createdBy: req.user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event created successfully"));
})

const fetchEvents = asyncHandler(async (req, res) => {
  let { page, limit, search, sort } = req.query;

  const query = {};
  if (search) {
    query.title = { $regex: search, $options: "i" }; // case-insensitive
  }

  // Default sort is ascending (oldest to newest)
  const sortOrder = sort === "desc" ? -1 : 1;

  if (page && limit) {
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ date: sortOrder }) // sort by date based on query
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          events,
        },
        "Paginated events fetched with search and sort"
      )
    );
  }

  // If no pagination, return all events with search and sort
  const events = await Event.find(query).sort({ date: sortOrder });

  return res
    .status(200)
    .json(
      new ApiResponse(200, events, "All events fetched with search and sort")
    );
});



const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("createdBy", "name email") // populate creator
    .populate("attendees", "name email"); // populate attendees

  if (!event) {
    return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event fetched successfully"));
});

const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (!event.attendees.includes(req.user.id)) {
    event.attendees.push(req.user.id);
  }

  const updatedEvent = await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Registered successfully"));
});

const getAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "attendees",
    "name email"
  );
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  return res
    .status(200)
    .json(200, event.attendees, "Attendees fetched successfully");
});

export {
  createEvent,
  fetchEvents,
  registerForEvent,
  getAttendees,
  getEventById,
};