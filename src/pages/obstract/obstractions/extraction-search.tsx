import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    TablePagination,
    Select,
    MenuItem,
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ObstractsObject, Post, scoSearch, TeamFeed } from '../../../services/obstract.ts';
import { useAlert } from '../../../contexts/alert-context.tsx';
import { URLS } from '../../../services/urls.ts';
import { TeamRouteContext } from '../../team-layout.tsx/index.tsx';
import { getScoValue, updateURLWithParams } from '../../../services/utils.ts';
import { observable_types } from './object-types.js'

const PAGE_SIZE = 50

interface PostWithFeed extends Post {
    feed: TeamFeed
}


const ObservableSearchPage: React.FC = () => {
    const { teamId } = useContext(TeamRouteContext)
    const [reportData, setReportData] = useState<ObstractsObject[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState('');
    const [type, setType] = useState('');
    const [selectedType, setSelectType] = useState<{ field_name: string }>();
    const [pageData, setPageData] = useState({
        resultsCount: 0,
        page: 1,
    })
    const [initialDataLoaded, setInitialDataLoaded] = useState(false)
    const location = useLocation();
    const alert = useAlert()


    useEffect(() => {
        const query = new URLSearchParams(location.search);
        setValue(query.get('value') || '')
        setType(query.get('type') || '')
        setInitialDataLoaded(true)
    }, [location])

    useEffect(() => {
        loadReports(1)
    }, [initialDataLoaded])

    useEffect(() => {
        updateURLWithParams({
            type, value, teamId
        })
    }, [type, value])

    const loadReports = async (page: number) => {
        if(!initialDataLoaded) return
        setLoading(true)
        const res = await scoSearch(type, value, page)
        setReportData(res.data.objects)
        setPageData({
            page: res.data.page_number - 1,
            resultsCount: res.data.total_results_count,
        })
        setLoading(false)
    }

    const handlePageChange = async (event, page: number) => {
        loadReports(page + 1)
    }
    useEffect(() => {
        document.title = 'Intel Search | Obstracts Web'
    }, [])

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Intel Search
            </Typography>
            <Typography>Search for intelligence in blog posts.</Typography>
            <Box mb={5} sx={{ display: 'flex' }}>
                <Select
                    sx={{ minWidth: '30rem' }}
                    label="Type"
                    name="type"
                    value={type}
                    onChange={(ev) => { setType(ev.target.value) }}
                >
                    {observable_types.map((object) => (
                        <MenuItem onClick={() => setSelectType(object)} key={object.value} value={object.value}>{object.label}</MenuItem>
                    ))}
                </Select>
                <TextField
                    sx={{ marginLeft: '1rem', marginRight: '1rem' }}
                    type="value"
                    value={value}
                    onChange={(ev) => { setValue(ev.target.value) }}
                    placeholder={selectedType?.field_name || "value"}
                    className="email-input"
                    label={selectedType?.field_name || "value"}
                />
                <Button variant='contained' onClick={() => loadReports(1)}>filter</Button>
            </Box>
            {loading ? (
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <>
                    <TableContainer>
                        <Typography variant='h5'>Extractions (TTPs)</Typography>
                        <Typography>List of extractiotion objects for this filter</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((sco) => (
                                    <TableRow key={sco.id}>
                                        <TableCell>{sco.type}</TableCell>
                                        <TableCell>{getScoValue(sco)}</TableCell>
                                        <TableCell><Link to={teamId ? URLS.teamObservablePosts(sco.id, sco.type, getScoValue(sco)) : URLS.staffObservablePosts(sco.id, sco.type, getScoValue(sco))}>
                                            <Button variant='contained'> View Posts</Button>
                                        </Link></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[]}
                            component="div"
                            count={pageData.resultsCount}
                            rowsPerPage={PAGE_SIZE}
                            page={pageData.page}
                            onPageChange={handlePageChange}
                            labelRowsPerPage={""} // Hide the rows per page label
                            style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
                        />
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default ObservableSearchPage;