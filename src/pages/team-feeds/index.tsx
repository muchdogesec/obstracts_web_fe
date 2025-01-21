import React, { useState, useEffect, useContext } from 'react';
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
    Checkbox,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { TeamFeed, fetchTeamObstractFeeds, subscribeTeamObstractFeeds, unsubscribeTeamObstractFeeds } from '../../services/obstract.ts';
import { useAlert } from '../../contexts/alert-context.tsx';
import { URLS } from '../../services/urls.ts';
import { TeamRouteContext } from '../team-layout.tsx/index.tsx';
import { TeamContext } from '../../contexts/team-context.tsx';
import { updateURLWithParams } from '../../services/utils.ts';

const PAGE_SIZE = 10;
const REACT_APP_SUGGEST_NEW_FEED_FORM_URL = process.env.REACT_APP_SUGGEST_NEW_FEED_FORM_URL


const TeamFeeds: React.FC = () => {
    const [feeds, setFeeds] = useState<TeamFeed[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const { teamId } = useContext(TeamRouteContext)
    const { activeTeam } = useContext(TeamContext)
    const [showMyFeeds, setShowMyFeeds] = useState(false)

    // Filter and sorting states
    const [filter, setFilter] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<string>('latest_item_pubdate');
    const [initialDataLoaded, setInitialDataLoaded] = useState(false)
    const location = useLocation();
    const alert = useAlert()

    useEffect(() => {
        updateURLWithParams({
            showMyFeeds, sortOrder, page, filter, sortField
        })
    }, [showMyFeeds, sortOrder, page, filter, sortField])

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        setShowMyFeeds(query.get('setShowMyFeeds') === 'false' ? false : true)
        setSortOrder(query.get('sortOrder') === 'asc' ? 'asc' : 'desc')
        setPage(Number(query.get('page') || 0))
        setFilter(query.get('filter') || '')
        setSortField(query.get('sortField') || 'latest_item_pubdate')
        setInitialDataLoaded(true)
    }, [location])

    useEffect(() => {loadFeeds(page)}, [initialDataLoaded])

    useEffect(() => {
        loadFeeds(page);
    }, [teamId, page, filter, showMyFeeds, sortField, sortOrder]);
    // if (!teamId) return <></>

    const loadFeeds = async (pageNumber: number) => {
        if(!initialDataLoaded) return
        if (!teamId) return
        setLoading(true);
        const response = await fetchTeamObstractFeeds(teamId, pageNumber + 1, filter, showMyFeeds, sortField, sortOrder);
        setFeeds(response.data.results);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
        setLoading(false);
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

    const unsubscribe = async (feed_id: string) => {
        if (!teamId) return
        try {
            await unsubscribeTeamObstractFeeds(teamId, feed_id)
            loadFeeds(1)
        } catch (err) {
            if (err.response.status === 400 && err.response.data.code === "E01") {
                alert.showAlert(err.response.data.message, 'error')
            }
        }
    }

    const subscribe = async (feed_id: string) => {
        if (!teamId) return
        try {
            await subscribeTeamObstractFeeds(teamId, feed_id)
            loadFeeds(1)
        } catch (err) {
            if (err.response.status === 400 && err.response.data.code === "E01") {
                alert.showAlert(err.response.data.message, 'error')
            }
        }
    }

    const handleShowMyFeedOnlyFilterChanged = (value: string) => {
        setShowMyFeeds(!showMyFeeds)
    }

    useEffect(() => {
        document.title = 'Feeds List | Obstracts Web'
    }, [])

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Feeds
                <a href={REACT_APP_SUGGEST_NEW_FEED_FORM_URL} target='blank'><Button sx={{ marginLeft: '2rem' }} variant='contained'>Suggest a new feed</Button></a>

            </Typography>
            <Typography>
                Here is a list of all the feeds your team is currently subscribe to and those available to your team you are not currently subscribed to.
            </Typography>

            {/* Filters */}
            <Box display="flex" alignItems="center" marginBottom={2} marginTop={2}>
                <TextField
                    label="Filter by Title"
                    variant="outlined"
                    value={filter}
                    onChange={handleFilterChange}
                    style={{ marginRight: '16px', width: '300px' }}
                />
                <Checkbox checked={showMyFeeds} value={showMyFeeds} onChange={(ev) => handleShowMyFeedOnlyFilterChanged(ev.target.value)}></Checkbox>
                <Typography>Show only feeds I'm subscribed to</Typography>
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feeds.map((feed) => (
                                <TableRow key={feed.id}>
                                    <TableCell>
                                        <Link to={URLS.teamFeed(teamId, feed.id)}>
                                            {feed.obstract_feed_metadata.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{feed.obstract_feed_metadata.description}</TableCell>
                                    <TableCell>{feed.obstract_feed_metadata.url}</TableCell>
                                    <TableCell>{new Date(feed.obstract_feed_metadata.earliest_item_pubdate || '').toLocaleString()}</TableCell>
                                    <TableCell>{new Date(feed.obstract_feed_metadata.latest_item_pubdate || '').toLocaleString()}</TableCell>
                                    <TableCell>{feed.obstract_feed_metadata.count_of_posts}</TableCell>
                                    <TableCell>
                                        <Box sx={{ marginLeft: '1rem', display: 'inline' }}>
                                            {feed.is_subscribed ? (
                                                <Button disabled={!activeTeam?.has_active_subscription} color='error' variant='contained' sx={{ textTransform: 'uppercase' }} onClick={() => unsubscribe(feed.id)}>Unsubscribe</Button>
                                            ) : (
                                                <Button disabled={!activeTeam?.has_active_subscription} variant='contained' sx={{ textTransform: 'uppercase' }} onClick={() => subscribe(feed.id)}>Subscribe</Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )
            }

            <TablePagination
                rowsPerPageOptions={[]}
                component="div"
                count={totalPages * PAGE_SIZE}
                rowsPerPage={PAGE_SIZE}
                page={page}
                onPageChange={handlePageChange}
                labelRowsPerPage={""}
                style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
            />
        </Box >
    );
};

export default TeamFeeds;