// src/services/features/retailer/feedbackSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../API/api";

// GET all feedback
export const fetchFeedbacks = createAsyncThunk(
  "feedback/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/api/feedback");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch feedback");
    }
  }
);

// CREATE new feedback
export const createFeedback = createAsyncThunk(
  "feedback/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await API.post("/api/feedback", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit feedback");
    }
  }
);

// UPDATE feedback status
export const updateFeedbackStatus = createAsyncThunk(
  "feedback/update",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/api/feedback/${id}`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

// DELETE feedback
export const deleteFeedback = createAsyncThunk(
  "feedback/delete",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/api/feedback/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete feedback");
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // UPDATE
      .addCase(updateFeedbackStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // DELETE
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f._id !== action.payload);
      });
  },
});

export default feedbackSlice.reducer;