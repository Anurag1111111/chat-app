import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";
import { setUser } from "../../utils/auth";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (form, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/login", form);
      setUser(data.token, data.user);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk for register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (form, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/register", form);
      setUser(data.token, data.user);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutUser(state) {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setUserFromStorage(state, action) {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutUser, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
