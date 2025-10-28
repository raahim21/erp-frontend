import { configureStore } from "@reduxjs/toolkit";
import inventoryReducer from "./src/Slices/InventorySlice.jsx";
import issueOrdersReducer from "./src/Slices/IssueOrderSlice.jsx";
import purchasesReducer from "./src/Slices/PurchaseSlice.jsx";
import usersReducer from "./src/Slices/UserSlice.jsx";
import logSlice from "./src/Slices/LogsSlice.jsx";
import scheduleReducer from "./src/Slices/ScheduleSlice.jsx";
import vendorReducer from "./src/Slices/VendorSlice.jsx";
import customerReducer from './src/Slices/CustomerSlice.jsx'
import leaveSlice from './src/Slices/LeaveSlice.jsx'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    inventory: inventoryReducer,
    issueOrders: issueOrdersReducer,
    purchases: purchasesReducer,
    schedule: scheduleReducer,
    vendors: vendorReducer,
    logs: logSlice,
    leave:leaveSlice,
    customers:customerReducer
  },
});
