import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';

type MyNumber = {
    value: number;
    isBold: boolean;
    top: number;
    left: number;
};

const RandomNumbers = () => {
    const [numbers, setNumbers] = useState<any>([]);
    const maxAttempts = 500; // Limit the number of placement attempts

    useEffect(() => {
        let placedNumbers: MyNumber[] = [];

        for (let i = 1; i <= 200; i++) {
            let overlap, newNumber, attempts = 0;

            do {
                newNumber  = {
                    value: i,
                    isBold: Math.random() > 0.5,
                    top: Math.random() * 90, // Adjusted for potential size
                    left: Math.random() * 90, // Adjusted for potential size
                };
                overlap = checkOverlap(newNumber, placedNumbers);
                attempts++;
            } while (overlap && attempts < maxAttempts);

            if (attempts < maxAttempts) {
                placedNumbers.push(newNumber);
            }
        }

        setNumbers(placedNumbers);
    }, []);

    // Check if the new number overlaps with any existing numbers
    const checkOverlap = (newNumber: MyNumber, placedNumbers: MyNumber[]) => {
        const buffer = 2; // Pixels to add as buffer to each element
        const maxDimension = 2; // Max width/height of a number

        for (let num of placedNumbers) {
            if (
                newNumber.left < num.left + maxDimension + buffer &&
                newNumber.left + maxDimension + buffer > num.left &&
                newNumber.top < num.top + maxDimension + buffer &&
                newNumber.top + maxDimension + buffer > num.top
            ) {
                return true; // Overlap detected
            }
        }
        return false; // No overlap
    };

    return (
        <>
        <NavBar />
        <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#eee7d7' }}> {/* Updated background color */}
            {numbers.map((num:any) => (
                <span
                    key={num.value}
                    style={{
                        position: 'absolute',
                        top: `${num.top}vh`,
                        left: `${num.left}vw`,
                        fontWeight: num.isBold ? 'bold' : 'normal',
                        fontSize: '18px',
                    }}
                >
                    {num.value}
                </span>
            ))}
        </div>
        </>
    );
};

export default RandomNumbers;
