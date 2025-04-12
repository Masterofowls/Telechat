import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  currentModal: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  modalOpen: false,
  currentModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modalOpen = true;
      state.currentModal = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.currentModal = null;
    },
  },
});

export const { toggleSidebar, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
