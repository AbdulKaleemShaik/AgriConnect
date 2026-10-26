import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Pagination,
} from '@mui/material';
import styles from './MSP.module.css';
import Navbar from '../NavBar/NavBar'

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json`;


const App = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    commodity: '',
  });
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10; // Number of records to show per page

  const fetchData = async () => {
    const queryParams = new URLSearchParams();
    const offset = (page - 1) * recordsPerPage;

    // Filter parameters
    if (filters.state) queryParams.append('filters[state.keyword]', filters.state);
    if (filters.district) queryParams.append('filters[district]', filters.district);
    if (filters.market) queryParams.append('filters[market]', filters.market);
    if (filters.commodity) queryParams.append('filters[commodity]', filters.commodity);
    
    // Pagination parameters
    queryParams.append('offset', offset);
    queryParams.append('limit', recordsPerPage);

    try {
      const result = await axios.get(`${API_URL}&${queryParams.toString()}`);
      setData(result.data.records);
      setTotalRecords(result.data.total); // Assuming the total number of records is returned in the response
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, page]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <>
    <Navbar />
    <div className={styles.container}>
      <h1>Commodity Prices</h1>

      <div className={styles.filterContainer}>
        <TextField
          label="State"
          name="state"
          variant="outlined"
          value={filters.state}
          onChange={handleInputChange}
          className={styles.filterItem}
        />
        <TextField
          label="District"
          name="district"
          variant="outlined"
          value={filters.district}
          onChange={handleInputChange}
          className={styles.filterItem}
        />
        <TextField
          label="Market"
          name="market"
          variant="outlined"
          value={filters.market}
          onChange={handleInputChange}
          className={styles.filterItem}
        />
        <TextField
          label="Commodity"
          name="commodity"
          variant="outlined"
          value={filters.commodity}
          onChange={handleInputChange}
          className={styles.filterItem}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          className={styles.searchButton}
        >
          Search
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>State</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Market</TableCell>
              <TableCell>Commodity</TableCell>
              <TableCell>Variety</TableCell>
              <TableCell>Min Price</TableCell>
              <TableCell>Max Price</TableCell>
              <TableCell>Modal Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.state}</TableCell>
                <TableCell>{row.district}</TableCell>
                <TableCell>{row.market}</TableCell>
                <TableCell>{row.commodity}</TableCell>
                <TableCell>{row.variety}</TableCell>
                <TableCell>{row.min_price}</TableCell>
                <TableCell>{row.max_price}</TableCell>
                <TableCell>{row.modal_price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Component */}
      <Pagination
        count={Math.ceil(totalRecords / recordsPerPage)}
        page={page}
        onChange={handleChangePage}
        variant="outlined"
        shape="rounded"
        className={styles.pagination}
      />
    </div>
    </>
  );
};

export default App;
