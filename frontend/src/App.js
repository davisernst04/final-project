import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChannelsPage from "./pages/ChannelsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/channels" element={<ChannelsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
