import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Container, Grid, Paper, Typography } from '@mui/material';

const shuffleArray = (array:number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};


const IndexPage = () => {
  const { control, setValue } = useForm();
  const [rows, setRows] = useState<any>([]);
  const [choices, setChoices] = useState<any>([]);

useEffect(() => {
  const generateGrid = () => {
    let grid = [];
    let missingNumbers = [];
    for (let i = 1; i <= 20; i += 5) {
      let row = [];
      for (let j = i; j < i + 5; j++) {
        row.push(j);
      }

      const missingIndex = Math.floor(Math.random() * 5);
      missingNumbers.push(row[missingIndex]);
      row[missingIndex] = null;

      grid.push(row);
    }
    setRows(grid);
    shuffleArray(missingNumbers);
    setChoices(missingNumbers);
  };

  generateGrid();
}, []);

const handleChoice = (rowIndex:number, choice:number) => {
  let newRows = [...rows];
  //@ts-ignore
  newRows[rowIndex] = newRows[rowIndex]?.map((item) =>
    item === null ? choice : item
  );
  setRows(newRows);

  const newChoices = choices.filter((item:any) => item !== choice);
  setChoices(newChoices);
};

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Number Game
      </Typography>
      <Grid container spacing={4}>
        {rows.map((row:any, rowIndex:number) => (
          <Grid container item key={rowIndex} spacing={2}>
            {row.map((number:number, index:number) => (
              <Grid item key={index}>
                <Paper
                  style={{
                    width: 100,
                    height: 100,
                    fontSize: 36,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {number !== null ? (
                    number
                  ) : (
                    <Controller
                      name={`missingNumber_${rowIndex}`}
                      control={control}
                      render={({ field }) => (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() =>
                            setValue(
                              `missingNumber_${rowIndex}`,
                              'Select a number',
                              {
                                shouldValidate: true,
                              }
                            )
                          }
                        >
                          ?
                        </Button>
                      )}
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      <Typography variant="h4" gutterBottom>
        Choices
      </Typography>
      <Grid container spacing={2}>
        {choices.map((choice:any, index:number) => (
          <Grid item key={index}>
            <Button
              variant="contained"
              color="secondary"
              style={{ fontSize: 36, width: 100, height: 100 }}
              onClick={() => {
                const rowIndex = rows.findIndex((row:any) => row.includes(null));
                if (rowIndex !== -1) {
                  handleChoice(rowIndex, choice);
                }
              }}
            >
              {choice}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default IndexPage;