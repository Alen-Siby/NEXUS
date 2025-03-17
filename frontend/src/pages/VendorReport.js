import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, Typography, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress, IconButton,
  Select, MenuItem, FormControl, InputLabel,
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Menu
} from '@mui/material';
import { motion } from 'framer-motion';
import { Line, Pie } from 'react-chartjs-2';
import CountUp from 'react-countup';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  ShoppingCart, 
  People, 
  AttachMoney, 
  LocalShipping,
  Download,
  DateRange
} from '@mui/icons-material';
import SummaryApi from '../common';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const VendorReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [expandedCells, setExpandedCells] = useState({});
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Fetch current user's email
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const userData = await response.json();
      console.log('Current user data:', userData);
      setUserEmail(userData.data.email);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to fetch user information');
    }
  };

  // Fetch orders for the current vendor
  const fetchOrders = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);
      const response = await fetch(SummaryApi.orderDetails.url, {
        method: SummaryApi.orderDetails.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataResponse = await response.json();
      console.log('All orders:', dataResponse);

      if (Array.isArray(dataResponse?.data)) {
        // Filter orders where any product has the current user as vendor
        const filteredOrders = dataResponse.data.filter(order => {
          // Check if any product in the order belongs to the current vendor
          return order.products?.some(product => product.vendor === userEmail);
        });

        console.log('Filtered orders:', filteredOrders);
        setOrders(filteredOrders);
      } else {
        console.error('Invalid orders data format:', dataResponse);
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // First fetch user data, then fetch orders
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchOrders();
    }
  }, [userEmail]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCellClick = (id, field) => {
    setExpandedCells(prev => ({
      ...prev,
      [`${id}-${field}`]: !prev[`${id}-${field}`]
    }));
  };

  const calculateFilteredRevenue = (filter) => {
    const currentDate = new Date();
    
    const filterOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch(filter) {
        case 'today':
          return orderDate.toDateString() === currentDate.toDateString();
        case 'week':
          const weekAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });

    const revenue = filterOrders.reduce((sum, order) => 
      sum + order.products
        .filter(product => product.vendor === userEmail)
        .reduce((pSum, product) => pSum + (product.price * product.quantity), 0)
    , 0);

    setFilteredRevenue(revenue);
  };

  useEffect(() => {
    calculateFilteredRevenue(timeFilter);
  }, [timeFilter, orders, userEmail]);

  const DashboardCard = ({ title, value, icon, color }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            p: 2,
            background: isDarkMode 
              ? `linear-gradient(135deg, ${color}40, ${color}20)`
              : `linear-gradient(135deg, ${color}15, ${color}05)`,
            border: `1px solid ${isDarkMode ? color + '50' : color + '30'}`,
            borderRadius: 2,
            height: '100%',
            backdropFilter: 'blur(4px)',
            bgcolor: isDarkMode ? 'grey.900' : 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              sx={{
                backgroundColor: `${color}20`,
                color: color,
                '&:hover': { backgroundColor: `${color}30` }
              }}
            >
              {icon}
            </IconButton>
            <Box>
              <Typography 
                color={isDarkMode ? 'grey.300' : 'text.secondary'} 
                variant="body2"
              >
                {title}
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold"
                sx={{ color: isDarkMode ? 'white' : 'text.primary' }}
              >
                <CountUp 
                  end={value} 
                  duration={2} 
                  prefix={title.includes('Revenue') ? '$' : ''}
                  decimals={title.includes('Revenue') ? 2 : 0}
                />
              </Typography>
            </Box>
          </Box>
        </Card>
      </motion.div>
    );
  };

  const processRevenueData = () => {
    const monthlyData = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const orderRevenue = order.products
        .filter(product => product.vendor === userEmail)
        .reduce((sum, product) => sum + (product.price * product.quantity), 0);

      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + orderRevenue;
    });

    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    return {
      labels: sortedMonths,
      data: sortedMonths.map(month => monthlyData[month])
    };
  };

  const generateReport = (orders, timeFilter) => {
    let filteredOrders;
    const currentDate = new Date();
    
    switch(timeFilter) {
      case 'today':
        filteredOrders = orders.filter(order => 
          new Date(order.createdAt).toDateString() === currentDate.toDateString()
        );
        break;
      case 'week':
        const weekAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
        filteredOrders = orders.filter(order => 
          new Date(order.createdAt) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        filteredOrders = orders.filter(order => 
          new Date(order.createdAt) >= monthAgo
        );
        break;
      default:
        filteredOrders = orders;
    }

    return formatReportData(filteredOrders);
  };

  const generateDateRangeReport = (orders, start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    return formatReportData(filteredOrders);
  };

  const formatReportData = (orders) => {
    let totalRevenue = 0;
    
    const reportData = orders.map(order => {
      const vendorProducts = order.products.filter(product => 
        product.vendor === userEmail
      );
      
      const totalAmount = vendorProducts.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
      );

      totalRevenue += totalAmount;

      return {
        orderId: order._id,
        invoiceNumber: order.invoiceNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        deliveryDate: new Date(order.deliveryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        customerName: order.userName,
        products: vendorProducts.map(product => ({
          name: product.productName,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity
        })),
        totalAmount,
        status: order.status
      };
    });

    return { reportData, totalRevenue };
  };

  const downloadCSV = (reportData, totalRevenue, reportType) => {
    let csv = 'Order ID,Invoice Number,Order Date,Delivery Date,Customer Name,Product Name,Quantity,Price,Total\n';
    
    reportData.forEach(order => {
      order.products.forEach(product => {
        csv += `${order.orderId},${order.invoiceNumber},${order.orderDate},${order.deliveryDate},${order.customerName},${product.name},${product.quantity},$${product.price},$${product.total}\n`;
      });
    });
    
    csv += `\nTotal Revenue,$${totalRevenue.toFixed(2)}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${reportType}-${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadExcel = (reportData, totalRevenue, reportType) => {
    const worksheet = XLSX.utils.json_to_sheet(
      reportData.flatMap(order => 
        order.products.map(product => ({
          'Order ID': order.orderId,
          'Invoice Number': order.invoiceNumber,
          'Order Date': order.orderDate,
          'Delivery Date': order.deliveryDate,
          'Customer Name': order.customerName,
          'Product Name': product.name,
          'Quantity': product.quantity,
          'Price': `$${product.price}`,
          'Total': `$${product.total}`,
          'Status': order.status
        }))
      )
    );

    // Add total revenue at the bottom
    XLSX.utils.sheet_add_aoa(worksheet, 
      [[`Total Revenue: $${totalRevenue.toFixed(2)}`]], 
      { origin: -1 }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
    XLSX.writeFile(workbook, `sales-report-${reportType}-${new Date().toLocaleDateString()}.xlsx`);
  };

  const downloadPDF = (reportData, totalRevenue, reportType) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Sales Report', 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    const tableData = reportData.flatMap(order => 
      order.products.map(product => [
        order.orderId,
        order.invoiceNumber,
        order.orderDate,
        order.deliveryDate,
        order.customerName,
        product.name,
        product.quantity,
        `$${product.price}`,
        `$${product.total}`,
        order.status
      ])
    );

    doc.autoTable({
      head: [['Order ID', 'Invoice', 'Order Date', 'Delivery Date', 'Customer', 'Product', 'Qty', 'Price', 'Total', 'Status']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] }
    });

    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save(`sales-report-${reportType}-${new Date().toLocaleDateString()}.pdf`);
  };

  // Inside the component, before rendering the table
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <Helmet>
        <title>Your New Title Here</title>
        <link rel="icon" href="%PUBLIC_URL%/my-icon.ico" />
      </Helmet>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Vendor Dashboard
        </Typography>

        {/* Time Filter Dropdown */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ color: '#1976d2' }} />
              <Typography variant="subtitle1">Revenue Filter:</Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  label="Select Time Period"
                  onChange={(e) => setTimeFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d230'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d260'
                    }
                  }}
                >
                  <MenuItem value="all">All Time Revenue</MenuItem>
                  <MenuItem value="today">Today's Revenue</MenuItem>
                  <MenuItem value="week">Past Week Revenue</MenuItem>
                  <MenuItem value="month">Past Month Revenue</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Card>
        </motion.div>

        {/* Download Report Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                }
              }}
            >
              Download Current Filter Report
            </Button>
          </motion.div>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              variant="outlined"
              startIcon={<DateRange />}
              onClick={() => setOpenDatePicker(true)}
              sx={{
                borderWidth: 2,
                borderColor: '#1976d2',
                color: '#1976d2',
                padding: '10px 20px',
                borderRadius: '25px',
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                }
              }}
            >
              Custom Date Range Report
            </Button>
          </motion.div>

          {/* Download Format Menu */}
          <Menu
            anchorEl={downloadMenuAnchor}
            open={Boolean(downloadMenuAnchor)}
            onClose={() => setDownloadMenuAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1
              }
            }}
          >
            <MenuItem onClick={() => {
              const { reportData, totalRevenue } = generateReport(orders, timeFilter);
              downloadCSV(reportData, totalRevenue, timeFilter);
              setDownloadMenuAnchor(null);
            }}>
              Download as CSV
            </MenuItem>
            <MenuItem onClick={() => {
              const { reportData, totalRevenue } = generateReport(orders, timeFilter);
              downloadExcel(reportData, totalRevenue, timeFilter);
              setDownloadMenuAnchor(null);
            }}>
              Download as Excel
            </MenuItem>
            <MenuItem onClick={() => {
              const { reportData, totalRevenue } = generateReport(orders, timeFilter);
              downloadPDF(reportData, totalRevenue, timeFilter);
              setDownloadMenuAnchor(null);
            }}>
              Download as PDF
            </MenuItem>
          </Menu>
        </Box>

        {/* Enhanced Date Range Picker Dialog */}
        <Dialog 
          open={openDatePicker} 
          onClose={() => setOpenDatePicker(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 350
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
            color: 'white',
            borderRadius: '12px 12px 0 0'
          }}>
            Select Date Range for Report
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              p: 2 
            }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenDatePicker(false)}
              sx={{ 
                color: '#666',
                borderRadius: '20px'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                if (startDate && endDate) {
                  setDownloadMenuAnchor(e.currentTarget);
                  setOpenDatePicker(false);
                }
              }}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                borderRadius: '20px'
              }}
            >
              Download Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total Orders"
              value={orders.length}
              icon={<ShoppingCart />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total Customers"
              value={[...new Set(orders.map(order => order.userName))].length}
              icon={<People />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title={
                timeFilter === 'all' ? 'Total Revenue' :
                timeFilter === 'today' ? 'Today\'s Revenue' :
                timeFilter === 'week' ? 'Past Week Revenue' :
                'Past Month Revenue'
              }
              value={filteredRevenue}
              icon={<AttachMoney />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Pending Deliveries"
              value={orders.filter(order => order.status === 'Processing').length}
              icon={<LocalShipping />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ 
                p: 3, 
                bgcolor: isDarkMode ? 'grey.900' : 'background.paper',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ color: isDarkMode ? 'white' : 'text.primary' }}
                >
                  Revenue Overview
                </Typography>
                <Line
                  data={{
                    labels: processRevenueData().labels,
                    datasets: [{
                      label: 'Revenue',
                      data: processRevenueData().data,
                      borderColor: '#1976d2',
                      tension: 0.4,
                      fill: true,
                      backgroundColor: isDarkMode 
                        ? 'rgba(25, 118, 210, 0.2)'
                        : 'rgba(25, 118, 210, 0.1)',
                      pointBackgroundColor: '#1976d2',
                      pointBorderColor: isDarkMode ? '#424242' : '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: isDarkMode ? 'white' : 'black'
                        }
                      },
                      tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(97, 97, 97, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#1976d2',
                        borderWidth: 1,
                        callbacks: {
                          label: (context) => `Revenue: $${context.parsed.y.toFixed(2)}`,
                        }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                          color: isDarkMode ? 'white' : 'black',
                          callback: (value) => `$${value}`
                        }
                      },
                      x: {
                        grid: {
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                          color: isDarkMode ? 'white' : 'black'
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                    },
                    animation: {
                      duration: 1000,
                    },
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ 
                p: 3, 
                bgcolor: isDarkMode ? 'grey.900' : 'background.paper',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ color: isDarkMode ? 'white' : 'text.primary' }}
                >
                  Order Status
                </Typography>
                <Pie
                  data={{
                    labels: ['Delivered', 'Processing', 'Cancelled'],
                    datasets: [{
                      data: [
                        orders.filter(order => order.status === 'Delivered').length,
                        orders.filter(order => order.status === 'Processing').length,
                        orders.filter(order => order.status === 'Cancelled').length,
                      ],
                      backgroundColor: [
                        '#2e7d32',
                        '#ed6c02',
                        '#d32f2f',
                      ],
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: isDarkMode ? 'white' : 'black',
                          padding: 20
                        }
                      },
                      tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(97, 97, 97, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                      }
                    },
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Orders Table Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{error}</Typography>
              </Box>
            ) : (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  bgcolor: isDarkMode ? 'grey.900' : 'background.paper',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Order ID
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Customer
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Ordered Date
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Delivery Date
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Products
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                        align="right"
                      >
                        Price
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: isDarkMode ? 'grey.800' : 'grey.100',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }}
                      >
                        Invoice Number
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedOrders.map((order) => (
                      <TableRow 
                        key={order._id}
                        sx={{ 
                          '&:hover': {
                            bgcolor: isDarkMode ? 'grey.800' : 'grey.50'
                          }
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          {order._id}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          {order.userName || 'N/A'}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {order.products
                              .filter(product => product.vendor === userEmail)
                              .map(product => (
                                <Box key={product._id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <img 
                                    src={product.image || (product.additionalDetails?.bakery?.configuration?.[0]?.image) || '/placeholder-image.jpg'} 
                                    alt={product.productName}
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      objectFit: 'cover',
                                      borderRadius: '4px'
                                    }}
                                  />
                                  <Box>
                                    <Typography fontWeight="medium">
                                      {product.productName} (Qty: {product.quantity})
                                    </Typography>
                                    
                                    {/* Display category */}
                                    <Typography variant="caption" color="text.secondary">
                                      Category: {product.category}
                                    </Typography>
                                    
                                    {/* Display additional details based on category */}
                                    {product.category === 'Catering' && product.additionalDetails?.catering && (
                                      <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid #1976d2' }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {product.additionalDetails.catering.courses?.length || 0} course(s)
                                        </Typography>
                                        {expandedCells[`${order._id}-${product._id}-details`] && (
                                          <Box sx={{ mt: 0.5 }}>
                                            {product.additionalDetails.catering.courses?.map((course, idx) => (
                                              <Box key={idx} sx={{ mb: 0.5 }}>
                                                <Typography variant="caption" fontWeight="medium">
                                                  {course.courseName} ({course.courseType})
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                  Items: {course.menuItems?.join(', ')}
                                                </Typography>
                                                {course.dietaryRestrictions?.length > 0 && (
                                                  <Typography variant="caption" display="block">
                                                    Dietary: {course.dietaryRestrictions.join(', ')}
                                                  </Typography>
                                                )}
                                              </Box>
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    )}
                                    
                                    {product.category === 'Rental' && product.additionalDetails?.rental && (
                                      <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid #ed6c02' }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {product.additionalDetails.rental.variantName}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                          Rental Period: {new Date(product.additionalDetails.rental.startDate).toLocaleDateString()} - 
                                          {new Date(product.additionalDetails.rental.endDate).toLocaleDateString()}
                                        </Typography>
                                        {expandedCells[`${order._id}-${product._id}-details`] && (
                                          <Box sx={{ mt: 0.5 }}>
                                            <Typography variant="caption" display="block">
                                              Variant Price: ${product.additionalDetails.rental.variantPrice?.toFixed(2) || '0.00'}
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                              Total Rental Price: ${product.additionalDetails.rental.totalPrice?.toFixed(2) || '0.00'}
                                            </Typography>
                                            {product.additionalDetails.rental.fine > 0 && (
                                              <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                                Fine: ${product.additionalDetails.rental.fine.toFixed(2)} 
                                                {product.additionalDetails.rental.finePerDay && ` (${product.additionalDetails.rental.finePerDay.toFixed(2)}/day)`}
                                              </Typography>
                                            )}
                                          </Box>
                                        )}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                          {product.additionalDetails.rental.isReturned ? (
                                            <Chip size="small" label="Returned" color="success" />
                                          ) : (
                                            <Chip size="small" label="Not Returned" color="warning" />
                                          )}
                                          <Button 
                                            size="small" 
                                            variant="text" 
                                            onClick={() => handleCellClick(order._id, `${product._id}-details`)}
                                            sx={{ p: 0, minWidth: 'auto' }}
                                          >
                                            {expandedCells[`${order._id}-${product._id}-details`] ? 'Hide Details' : 'Show Details'}
                                          </Button>
                                        </Box>
                                      </Box>
                                    )}
                                    
                                    {product.category === 'Bakery' && product.additionalDetails?.bakery && (
                                      <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid #9c27b0' }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {product.additionalDetails.bakery.configuration?.length || 0} configuration(s)
                                        </Typography>
                                        {expandedCells[`${order._id}-${product._id}-details`] && (
                                          <Box sx={{ mt: 0.5 }}>
                                            {product.additionalDetails.bakery.configuration?.map((item, idx) => (
                                              <Typography key={idx} variant="caption" display="block">
                                                {item.itemName} (${item.price}) x {item.quantity}
                                              </Typography>
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              ))}
                          </Box>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            textAlign: 'right'
                          }}
                          align="right"
                        >
                          {order.products
                            .filter(product => product.vendor === userEmail)
                            .map(product => (
                              <Box key={product._id} sx={{ mb: 1 }}>
                                ${(product.price * product.quantity).toFixed(2)}
                              </Box>
                            ))}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'text.primary',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                          }}
                        >
                          <Typography
                            onClick={() => handleCellClick(order._id, 'invoice')}
                            sx={{
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '150px',
                              ...(expandedCells[`${order._id}-invoice`] && {
                                whiteSpace: 'normal',
                                maxWidth: 'none'
                              })
                            }}
                          >
                            {order.invoiceNumber}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </motion.div>
      </Box>
    </>
  );
};

export default VendorReport;
