import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Link from 'next/link';

const pages = [
    {
        title: 'Missing Numbers',
        url: ''
    },
    {
        title: 'Find Numbers',
        url: 'find-number'
    }
];
const NavBar: React.FC = () => {
    return (
        <AppBar position="static" style={{marginBottom: '0.5rem'}}>
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    {pages.map((page) => (
                    <Link
                        key={page.title}
                        href={`/${page.url}`}
                        style={{ 
                            color: 'white', 
                            marginRight: '1rem',
                        }}
                    >
                        {page.title}
                    </Link>
                    ))}
                </Box>

            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
