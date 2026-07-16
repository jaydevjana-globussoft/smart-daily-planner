import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Drawer, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const expandedWidth = 252;
const collapsedWidth = 76;

function MainLayout({ children }) {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("plannerDarkMode") === "true");
  const drawerWidth = collapsed ? collapsedWidth : expandedWidth;

  useEffect(() => { localStorage.setItem("plannerDarkMode", String(darkMode)); }, [darkMode]);

  const handleMenuClick = () => {
    if (isMobile) setMobileOpen((previous) => !previous);
    else setCollapsed((previous) => !previous);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: darkMode ? "#0b1120" : "#f5f7fb", color: darkMode ? "#e5e7eb" : "text.primary" }}>
      <Header darkMode={darkMode} onMenuClick={handleMenuClick} onThemeToggle={() => setDarkMode((previous) => !previous)} />
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: "width 220ms ease" }}>
        <Drawer variant={isMobile ? "temporary" : "permanent"} open={isMobile ? mobileOpen : true} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ "& .MuiDrawer-paper": { width: isMobile ? expandedWidth : drawerWidth, boxSizing: "border-box", border: 0, transition: "width 220ms ease", overflowX: "hidden" } }}>
          <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} />
          <Sidebar collapsed={isMobile ? false : collapsed} darkMode={darkMode} onItemClick={() => isMobile && setMobileOpen(false)} />
        </Drawer>
      </Box>
      <Box component={motion.main} key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" }} sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, lg: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, transition: "width 220ms ease", bgcolor: darkMode ? "#0b1120" : "#f5f7fb", minHeight: "100vh" }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} />
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;
