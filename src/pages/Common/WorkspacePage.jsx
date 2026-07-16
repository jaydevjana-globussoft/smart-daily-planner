import { motion } from "framer-motion";
import { Box, Card, CardContent, Typography } from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";

function WorkspacePage({ title, description }) {
  return <MainLayout><Box><Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{title}</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>{description}</Typography><Card component={motion.div} whileHover={{ y: -3 }} sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}><CardContent sx={{ py: 5 }}><Typography variant="h6" fontWeight={700}>Your {title.toLowerCase()} workspace</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>This section is ready for your planner data.</Typography></CardContent></Card></Box></MainLayout>;
}

export default WorkspacePage;
