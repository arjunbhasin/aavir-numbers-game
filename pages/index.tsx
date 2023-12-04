import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';

import { useForm, Controller } from 'react-hook-form';
import { Button, Grid, Paper, Typography } from '@mui/material';
import confetti from 'canvas-confetti';

const shuffleArray = (array:number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const IndexPage = () => {
  const { control } = useForm();
  const [rows, setRows] = useState<any>([]);
  const [choices, setChoices] = useState<any>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState<any>([]); // Store correct answers
  
  // Function to trigger confetti
  const triggerConfetti = () => {
    confetti({
      zIndex: 999,
      particleCount: 100,
      spread: 70,
      angle: 60,
      origin: { x: 0 },
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'], // Rainbow colors
    });
    confetti({
      zIndex: 999,
      particleCount: 100,
      spread: 70,
      angle: 120,
      origin: { x: 1 },
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'], // Rainbow colors
    });

    // Refresh the page after 5 seconds
    setTimeout(() => {
      window.location.reload();
    }, 4000);
  };

  useEffect(() => {
    const generateGrid = () => {
      let grid = [];
      let missingNumbers = [];
      let correctAnswersTemp = [];
      for (let i = 1; i <= 20; i += 5) {
        let row = [];
        for (let j = i; j < i + 5; j++) {
          row.push(j);
        }

        const missingIndex = Math.floor(Math.random() * 5);
        correctAnswersTemp.push(row[missingIndex]);
        missingNumbers.push(row[missingIndex]);
        row[missingIndex] = null;

        grid.push(row);
      }
      setRows(grid);
      shuffleArray(missingNumbers);
      setChoices(missingNumbers);
      setCorrectAnswers(correctAnswersTemp); // Set correct answers
    };

    generateGrid();
  }, []);

  const handleChoice = (choice:number) => {
    if (currentRow >= rows.length) return;

    // Check if the choice is correct
    if (choice === correctAnswers[currentRow]) {
      let newRows = [...rows];
      newRows[currentRow] = newRows[currentRow].map((item:any) =>
        item === null ? choice : item
      );
      setRows(newRows);

      const newChoices = choices.filter((item:any) => item !== choice);
      shuffleArray(newChoices);
      setChoices(newChoices);

      setCurrentRow(currentRow + 1);
      // Check if game is completed
      if (newChoices.length === 0) {
        triggerConfetti();
      }
    }
  };

  return (
    <>
      <NavBar />
      <Typography variant="h3" gutterBottom>
        Missing Numbers 
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
                    borderColor: rowIndex === currentRow && number === null ? '#39e75f' : 'grey',
                    borderWidth: rowIndex === currentRow && number === null ? 2: 1,
                    borderStyle: 'solid',
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
                          disabled={rowIndex !== currentRow}
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
        {choices.map((choice:number, index:number) => (
          <Grid item key={index}>
            <Button
              variant="contained"
              color="secondary"
              style={{ fontSize: 36, width: 100, height: 100 }}
              onClick={() => handleChoice(choice)}
            >
              {choice}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default IndexPage;