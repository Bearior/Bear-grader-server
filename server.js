const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;  // Make sure to use process.env.PORT for Render

// In-memory storage for submissions (can be replaced by a database)
let submissions = [];
let submissionCounter = 1;  // To track unique submission IDs

app.use(cors());
app.use(bodyParser.json());

const problems = [
  {
    id: 1,
    title: 'Sum of Two Numbers',
    description: 'Write a program to add two numbers.',
    file: 'https://drive.google.com/file/d/13CVDGk9Np_EsYR15R1ZNJPvccFzHwhUm/view?usp=sharing',
    testCases: [
      { input: '2 3', output: '5' },
      { input: '10 20', output: '30' },
      { input: '100 200', output: '300' }
    ]
  },
  {
    id: 2,
    title: 'Factorial',
    description: 'Write a program to calculate the factorial of a number.',
    file: 'https://drive.google.com/file/d/1Xe0IVlGywtMQACPkBI7hrCuV8UGEfj95/view?usp=sharing',
    testCases: [
      { input: '3', output: '6' },
      { input: '4', output: '24' },
      { input: '5', output: '120' }
    ]
  },
  {
    id: 3,
    title: 'Pretest1_Flowchart',
    description: 'Click link for details',
    file: 'https://drive.google.com/file/d/1vz3gzhlgONB_5ef65UtY_XVXkv6NgmRj/view?usp=sharing',
    testCases: [
        { input: '30 50 40', output: '4130 50 41' },
        { input: '1 4 2', output: '65 4 4' },
        { input: '1 2 4', output: '1 2 4' },
        { input: '9 4 3', output: '34 4 3' },
        { input: '50 40 30', output: '100 104 12' },
        { input: '51 20 42', output: '71 213 255' },
        { input: '51 41 36', output: '25 82 -57' },
        { input: '60 75 5', output: '375 187 194' },
        { input: '60 72 4', output: '64 69 128' },
        { input: '60 82 91', output: '59 173 169' }
    ]
  },
];

// Get all problems
app.get('/api/problems', (req, res) => {
  res.json(problems);
});

// Get problem by ID
app.get('/api/problems/:id', (req, res) => {
  console.log(`Received request for problem ID: ${req.params.id}`);
  const problem = problems.find(p => p.id == req.params.id);
  if (problem) {
    res.json(problem);
  } else {
    res.status(404).send('Problem not found');
  }
});

// Handle code submission and test cases
app.post('/api/submit', (req, res) => {
  const { code, problemId, username} = req.body;

  const problem = problems.find(p => p.id == problemId);
  if (!problem) {
    return res.status(404).send('Problem not found');
  }

  // Save the user's code to a file
  const filePath = path.join(__dirname, 'user_code.cpp');
  fs.writeFileSync(filePath, code);

  // Compile the user's C++ code using g++ (without .exe)
  exec(`g++ ${filePath} -o output`, (error, stdout, stderr) => {
    if (error) {
      return res.json({ success: false, message: `Compilation Error: ${stderr}` });
    }

    // Initialize score and result array
    let passed = 0;
    const totalTestCases = problem.testCases.length;
    const results = [];

    // Run the compiled code for each test case
    problem.testCases.forEach((testCase, index) => {
      const inputFilePath = path.join(__dirname, `input${index}.txt`);
      const outputFilePath = path.join(__dirname, `output${index}.txt`);

      // Write the input to a file
      fs.writeFileSync(inputFilePath, testCase.input);

      // Execute the program with input redirection (./output for Linux)
      exec(`./output < ${inputFilePath} > ${outputFilePath}`, (runError, runStdout, runStderr) => {
        if (runError) {
          results.push({ success: false, message: `Runtime Error: ${runStderr}` });
          return;
        }

        const userOutput = fs.readFileSync(outputFilePath, 'utf8').trim();
        const expectedOutput = testCase.output.trim();

        if (userOutput === expectedOutput) {
          passed += 1;
          results.push({ success: true, message: `Test case ${index + 1}: Passed` });
        } else {
          results.push({ success: false, message: `Test case ${index + 1}: Failed` });
        }

        // After processing all test cases, save the submission and return the results
        if (results.length === totalTestCases) {
          const score = (passed / totalTestCases) * 100;

          // Generate a unique submission ID
          const submissionId = submissionCounter++;

          // Save the submission
          const newSubmission = {
            submissionId,
            problemId,
            code,
            score,
            username,
            results,
            timestamp: new Date()
          };
          submissions.push(newSubmission);

          // Return the submission with a unique ID
          res.json({ success: true, submissionId, score, results });
        }
      });
    });
  });
});

// Retrieve previous submissions by problem ID
app.get('/api/submissions/:problemId', (req, res) => {
  const problemId = parseInt(req.params.problemId);
  const problemSubmissions = submissions.filter(sub => sub.problemId === problemId);
  res.json(problemSubmissions);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
