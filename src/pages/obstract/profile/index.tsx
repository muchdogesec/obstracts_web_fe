import React, { useEffect, useState } from 'react';
import { Button, Grid, CircularProgress, Pagination, Box, Dialog, Typography, TableHead, Tab, TableCell, Table, TableBody, TableRow, TablePagination } from '@mui/material';
import DeleteDialog from './delete_dialog.tsx';
import AddEntryDialog from './add_dialog.tsx';
import { deleteObstractProfile, fetchObstractProfiles, Profile } from '../../../services/obstract.ts';
import ProfileCard from './profile-card.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../../../contexts/alert-context.tsx';

const PAGE_SIZE = 50

const ObstractProfile: React.FC = () => {
  const [data, setData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [page, setPage] = useState<number>(0); // Current page
  const [pageSize, setPageSize] = useState<number>(10); // Profiles per page
  const [dataCount, setDataCount] = useState<number>(0); // Total number of pages
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Profile | null>();
  const navigate = useNavigate()
  const alert = useAlert()


  const loadData = async (pageNumber: number) => {
    setLoading(true);
    const res = await fetchObstractProfiles(pageNumber + 1); // Pass page number and size
    setData(res.data.profiles);
    setDataCount(res.data.total_results_count);
    setPageSize(res.data.page_size)
    setLoading(false);
  };

  // Load data on initial render and when the page changes
  useEffect(() => { loadData(page); }, [page]);

  const handleAddEntry = () => {
    loadData(page);
    setOpenAddDialog(false);
  };

  const handleEdit = (profile: Profile) => {
    setSelectedEntry(profile);
    setOpenAddDialog(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteObstractProfile(deleteId);
      } catch (err) {
        if (err?.response?.status === 403) {
          return alert.showAlert(err?.response?.data?.message)
        }
      }
      await loadData(page);
      setOpenDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const initAddModal = () => {
    // setSelectedEntry(null);
    // setOpenAddDialog(true);
    navigate('add')
  };

  const handlePageChange = (event: unknown, value: number) => {
    setPage(value); // Set new page number
  };


  useEffect(() => {
    document.title = 'Extraction Profiles List | Obstracts Web'
  }, [])


  return (
    <div>
      <Box sx={{ display: 'flex' }}>
        <Typography variant='h4'>Extraction Profiles</Typography>

        <Button sx={{ marginLeft: '5rem', textTransform: 'uppercase' }} variant="contained" color="primary" onClick={initAddModal}>
          Add Profile
        </Button>
      </Box>
      <Typography>Define the extractions used for feeds and posts</Typography>

      <Table>
        <TableHead>
          <TableCell>Name</TableCell>
          <TableCell>Relationship Mode</TableCell>
          <TableCell>Extractions</TableCell>
          <TableCell>AI relationship settings </TableCell>
          <TableCell>AI Summary Provider </TableCell>
          <TableCell>AI extractions settings</TableCell>
          <TableCell>Ignore Image Refs</TableCell>
          <TableCell>Ignore Link Refs</TableCell>
          <TableCell>Defang </TableCell>
          <TableCell>Actions</TableCell>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
              </TableCell>
            </TableRow>
          ) : (<>
            {data.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.name}</TableCell>
                <TableCell>{profile.relationship_mode}</TableCell>
                <TableCell>{profile.extractions.join(', ')}</TableCell>
                <TableCell>{profile.ai_settings_relationships}</TableCell>
                <TableCell>{profile.ai_summary_provider}</TableCell>
                <TableCell>{profile.ai_settings_extractions?.join(',')}</TableCell>
                <TableCell>{profile.ignore_image_refs ? 'True' : 'False'}</TableCell>
                <TableCell>{profile.ignore_link_refs ? 'True' : 'False'}</TableCell>
                <TableCell>{profile.defang ? 'True' : 'False'}</TableCell>
                <TableCell>
                  <Link to={profile.id}>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginRight: '8px' }}
                    >
                      Details
                    </Button>
                  </Link>
                  <ProfileCard profile={profile} onDelete={handleDelete} onEdit={handleEdit} />
                </TableCell>
              </TableRow>
            ))}
          </>
          )}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <TablePagination
        component="div"
        count={dataCount}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
        color="primary"
        rowsPerPageOptions={[]}
        labelRowsPerPage={""} // Hide the rows per page label
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
      />

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth={false}>
        <AddEntryDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          onAddEntry={handleAddEntry}
          entryData={selectedEntry}
        >
        </AddEntryDialog>
      </Dialog>
    </div>
  );
};

export default ObstractProfile;
