import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import { Feed, fetchObstractFeeds } from '../../../services/obstract.ts';
import { Link } from 'react-router-dom';
import { URLS } from '../../../services/urls.ts';

const PAGE_SIZE = 10;

const TeamFeeds: React.FC = () => {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
    const [formData, setFormData] = useState<Partial<Feed>>({});

    // Filter and sorting states
    const [filter, setFilter] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<string>('latest_item_pubdate');

    const loadFeeds = async (pageNumber: number) => {
        setLoading(true);
        const response = await fetchObstractFeeds(pageNumber + 1, filter, sortField, sortOrder);
        setFeeds(response.data.results);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        setLoading(false);
    };

    useEffect(() => {
        loadFeeds(page);
    }, [page, filter, sortField, sortOrder]);

    const handleModalOpen = (feed?: Feed) => {
        setSelectedFeed(feed || null);
        setFormData(feed || {});
        setOpenModal(true);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleSortChange = (field: string) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
        setPage(0); // Reset to first page on sort change
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Feed Management
            </Typography>
            <Typography></Typography>
            <Button variant="contained" color="primary" onClick={() => handleModalOpen()} style={{ marginBottom: '16px' }}>
                Manage the feeds available to Obstracts users.
            </Button>

            {/* Filters */}
            <Box display="flex" alignItems="center" marginBottom={2}>
                <TextField
                    label="Filter by Title"
                    variant="outlined"
                    value={filter}
                    onChange={handleFilterChange}
                    style={{ marginRight: '16px', width: '300px' }}
                />
            </Box>

            {loading ? (
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell onClick={() => handleSortChange('title')} style={{ cursor: 'pointer' }}>
                                    Title {sortField === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSortChange('description')} style={{ cursor: 'pointer' }}>
                                    Description {sortField === 'description' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSortChange('url')} style={{ cursor: 'pointer' }}>
                                    URL {sortField === 'url' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSortChange('earliest_item_pubdate')} style={{ cursor: 'pointer' }}>
                                    First Post Date {sortField === 'earliest_item_pubdate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSortChange('latest_item_pubdate')} style={{ cursor: 'pointer' }}>
                                    Last Post Date {sortField === 'latest_item_pubdate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSortChange('count_of_posts')} style={{ cursor: 'pointer' }}>
                                    Post Count {sortField === 'count_of_posts' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell>
                                    State
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feeds.map((feed) => (
                                <TableRow key={feed.id}>
                                    <TableCell>
                                        <Link to={URLS.staffObstractFeed(feed.id)}>
                                            {feed.obstract_feed_metadata.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{feed.obstract_feed_metadata.description}</TableCell>
                                    <TableCell>{feed.obstract_feed_metadata.url}</TableCell>
                                    <TableCell>{feed.obstract_feed_metadata.earliest_item_pubdate}</TableCell>
                                    <TableCell>{new Date(feed.obstract_feed_metadata.latest_item_pubdate || '').toLocaleString()}</TableCell>
                                    <TableCell>{new Date(feed.obstract_feed_metadata.count_of_posts || '').toLocaleString()}</TableCell>
                                    <TableCell>{feed.is_public ? 'Public' : 'Private'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TablePagination
                rowsPerPageOptions={[]}
                component="div"
                count={totalPages * PAGE_SIZE}
                rowsPerPage={PAGE_SIZE}
                page={page}
                onPageChange={handlePageChange}
                labelRowsPerPage={""} // Hide the rows per page label
                style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default TeamFeeds;