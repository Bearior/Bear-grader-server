const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;  // Make sure to use process.env.PORT for Render

// Timeout duration in milliseconds (e.g., 5 seconds)
const TIMEOUT_DURATION = 10000;

// In-memory storage for submissions (can be replaced by a database)
let submissions = [];
let submissionCounter = 1;  // To track unique submission IDs

app.use(cors());
app.use(bodyParser.json());

const problems = [
  {
    id: 1,
    title: 'Sum of Two Numbers (warmup)',
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
    title: 'Factorial (warmup)',
    description: 'Write a program to calculate the factorial of a number.',
    file: 'https://drive.google.com/file/d/1Xe0IVlGywtMQACPkBI7hrCuV8UGEfj95/view?usp=sharing',
    testCases: [
      { input: '3', output: '6' },
      { input: '4', output: '24' },
      { input: '5', output: '120' }
    ]
  },
    {
      "id": 20,
      "title": "Queens On Chessboard",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/13NhEDknzsINXjk1qg8m4A0blDbjmZ0gy/view?usp=sharing",
      "testCases": [
        { "input": "13\nQ-----------Q\n-------------\n-------------\n-------------\n---------Q---\n---Q---------\n-------------\n-------------\n-------------\n-------------\n-Q---------Q-\n-------------\n------Q------", "output": "-------------\n-------------\n-------------\n-------------\n---------Q---\n---Q---------\n-------------\n-------------\n-------------\n-------------\n-------------\n-------------\n------Q------" },
        { "input": "13\nQ------------\n----------Q--\n-------------\n-----Q-------\n-------------\n-------------\n------------Q\n-------------\n-------------\n----Q--------\n-------------\n----------Q--\nQ------------", "output": "-------------\n-------------\n-------------\n-----Q-------\n-------------\n-------------\n------------Q\n-------------\n-------------\n----Q--------\n-------------\n-------------\n-------------" },
        { "input": "15\nQ--------------\n-Q-------------\n---Q-----------\n-----Q---------\n------Q--------\n----------Q----\n-----------Q---\n--------------Q\n---------------\n---------------\n---------------\n---------------\n-------------Q-\n-------Q-------\n---------Q-----", "output": "---------------\n---------------\n---------------\n---------------\n---------------\n---------------\n---------------\n--------------Q\n---------------\n---------------\n---------------\n---------------\n---------------\n-------Q-------\n---------Q-----" },
        { "input": "15\n--------------Q\n-------------Q-\n-----------Q---\n---------Q-----\n--------Q------\n----Q----------\n---Q-----------\nQ--------------\n---------------\n---------------\n---------------\n---------------\n-Q-------------\n-------Q-------\n-----Q---------", "output": "---------------\n---------------\n---------------\n---------------\n---------------\n---------------\n---------------\nQ--------------\n---------------\n---------------\n---------------\n---------------\n---------------\n-------Q-------\n-----Q---------" },
        { "input": "20\n----------------Q---\n----------Q---------\n-------------Q------\n---------Q---------Q\n---Q----------------\n-----Q--------------\n-----------Q--------\n---------------Q----\n-Q------------------\n-------------------Q\n----Q---------------\n-------Q------------\n--------------Q-----\nQ-------------------\n------------------Q-\n--Q---Q-------------\n--------Q-----------\n------------Q-------\n--Q-----------------\n-----------------Q--", "output": "--------------------\n----------Q---------\n-------------Q------\n--------------------\n---Q----------------\n-----Q--------------\n--------------------\n--------------------\n-Q------------------\n--------------------\n----Q---------------\n-------Q------------\n--------------Q-----\n--------------------\n------------------Q-\n--------------------\n--------Q-----------\n------------Q-------\n--------------------\n-----------------Q--" },
      ]
    },
    {
      "id": 21,
      "title": "Final-Reveal one test case",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/19M7zB3I5J7tunuzN5UPxp1Nl6Ba5NkGW/view?usp=sharing",
      "testCases": [
        { "input": "5\nB 50\nA 10\nC 50\nA 100\nD 80\n2", "output": "100 A\n80 D" },
        { "input": "9\nD 50\nA 80\nC 50\nE 10\nK 20\nE 20\nA 10\nAA 50\nD 100\n3", "output": "100 D\n80 A\n50 AA C" },
        { "input": "5\nA 80\nF 90\nC 80\nD 80\nB 80\n3", "output": "90 F\n80 A B C D" },
        { "input": "8\nA 0\nD 50\nC 20\nA 50\nE 15\nC 50\nB 50\nA 100\n2", "output": "100 A\n50 B C D" },
        { "input": "6\nP 40\nQ 50\nR 30\nS 50\nT 40\nU 60\n3", "output": "60 U\n50 Q S\n40 P T" },
        { "input": "7\nX 70\nY 80\nZ 60\nX 90\nY 75\nZ 85\nW 100\n2", "output": "100 W\n90 X" },
        { "input": "4\nL 100\nM 90\nN 100\nO 95\n1", "output": "100 L N" },
        { "input": "10\nA 55\nB 65\nC 75\nD 85\nE 95\nF 65\nG 75\nH 85\nI 95\nJ 65\n5", "output": "95 E I\n85 D H\n75 C G\n65 B F J\n55 A" },
        { "input": "3\nAlice 90\nBob 80\nCharlie 90\n2", "output": "90 Alice Charlie\n80 Bob" },
        { "input": "6\nMark 50\nLuke 60\nJohn 70\nPaul 80\nPeter 60\nJames 70\n3", "output": "80 Paul\n70 James John\n60 Luke Peter" }
      ]
    },
    {
      "id": 22,
      "title": "Binary Clock",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1QC53fB3DHk_fQgU-0DotSHeoQy-shJ5r/view?usp=sharing",
      "testCases": [
        { "input": "00:00:00", "output": " 0 0 0\n 00000\n000000\n000000" },
        { "input": "01:23:45", "output": " 0 0 0\n 00011\n001100\n010101" },
        { "input": "02:07:30", "output": " 0 0 0\n 00100\n010110\n000110" },
        { "input": "03:44:19", "output": " 0 0 1\n 01100\n010000\n010011" },
        { "input": "04:59:28", "output": " 0 1 1\n 11000\n000010\n001100" },
        { "input": "05:34:56", "output": " 0 0 0\n 10111\n001001\n011010" },
        { "input": "11:18:48", "output": " 0 1 1\n 00010\n000000\n111000" },
        { "input": "22:00:01", "output": " 0 0 0\n 00000\n110000\n000001" },
        { "input": "22:00:00", "output": " 0 0 0\n 00000\n110000\n000000" },
        { "input": "23:59:59", "output": " 0 1 1\n 01010\n110000\n011111" }
      ]
    },
    {
      "id": 23,
      "title": "Recur_1",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1s1OHvDxO50OxWwoZzIybex7NAHwgXFZ-/view?usp=sharing",
      "testCases": [
        { "input": "F 0\nF 1\nF 10\nF 15\nF 40", "output": "F(0) = 0\nF(1) = 1\nF(10) = 55\nF(15) = 610\nF(40) = 102334155" },
        { "input": "M 0\nM 4\nM 6\nM 7\nM 8", "output": "M(0) = 1\nM(4) = 9\nM(6) = 51\nM(7) = 127\nM(8) = 323" },
        { "input": "S 1\nS 2\nS 5\nS 10", "output": "S(1) = 1\nS(2) = 1\nS(5) = 45\nS(10) = 103049" },
        { "input": "D 0\nD 3\nD 6\nD 10", "output": "D(0) = 1\nD(3) = 2\nD(6) = 265\nD(10) = 1334961" }
      ]
    },
    {
      "id": 24,
      "title": "Map : Dept selection",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1FkEsmYP9umU-2fK90Gda68kt37_1BCTf/view?usp=sharing",
      "testCases": [
        { "input": "5\nCP 1\nME 1\nEE 1\nIE 1\nENV 1\n5\n5930000001 2 ME CP IE ENV\n5930000010 10.2 ENV EE IE CP\n5930000011 3 CP IE ENV EE\n5930000100 5 IE CP ME EE\n5930000101 4.44 EE IE CP ENV", "output": "5930000001 ME\n5930000010 ENV\n5930000011 CP\n5930000100 IE\n5930000101 EE" },
        { "input": "5\nCP 1\nME 1\nEE 1\nIE 1\nENV 1\n5\n5930000001 2 CP ME ENV IE\n5930000010 10.2 CP EE IE ME\n5930000011 3 ENV ME CP IE\n5930000100 5 CP EE IE ME\n5930000101 4.44 EE CP ENV ME", "output": "5930000001 IE\n5930000010 CP\n5930000011 ME\n5930000100 EE\n5930000101 ENV" },
        { "input": "7\nIE 3\nEE 1\nCP 2\nCHE 1\nENV 1\nSV 2\nME 3\n10\n5930100000 9.9 SV IE CP CHE\n5930200000 8.88 EE ME CHE SV\n5930001000 7 IE ME EE CP\n5931000000 6.123 SV CP CHE ME\n5930003000 5 SV EE CP CHE\n5930000001 3 CHE SV CP IE\n5930110000 4 CHE ME CP IE\n5930002000 0.1 SV IE ENV EE\n5932000000 1 ENV CHE EE ME\n5930120000 2 ENV CP IE SV", "output": "5930000001 CP\n5930001000 IE\n5930002000 IE\n5930003000 CP\n5930100000 SV\n5930110000 CHE\n5930120000 ENV\n5930200000 EE\n5931000000 SV\n5932000000 ME" },
        { "input": "7\nIE 3\nEE 1\nCP 2\nCHE 1\nENV 1\nSV 2\nME 3\n10\n5930100000 9.9 ME CP SV ENV\n5930200000 8.88 EE IE CP CHE\n5930001000 7 EE ENV CHE IE\n5931000000 6.123 EE ME ENV CP\n5930003000 5 CP ME SV IE\n5930000001 3 CP SV ME EE\n5930110000 4 EE CHE IE CP\n5930002000 0.1 SV EE IE ME\n5932000000 1 ENV SV CHE CP\n5930120000 2 CP EE IE ME", "output": "5930000001 CP\n5930001000 ENV\n5930002000 SV\n5930003000 CP\n5930100000 ME\n5930110000 CHE\n5930120000 IE\n5930200000 EE\n5931000000 ME\n5932000000 SV" },
        { "input": "10\nCHE 2\nME 2\nCP 2\nEE 2\nIE 2\nENV 2\nSV 2\nMT 2\nPE 2\nCE 3\n15\n5930000001 7.59 CP CHE ME CE\n5930000003 15.8 CP CHE ME CE\n5930000013 4.00 CE CP CHE ME\n5930000002 16.2 CE CP CHE ME\n5930000014 0.12 ME EE IE CP\n5930000015 8.97 ME EE IE CP\n5930000012 8.98 IE SV ENV MT\n5930000005 8.89 IE SV ENV MT\n5930000006 2.55 MT ME CHE ENV\n5930000007 5.22 MT ME CHE ENV\n5930000004 10.0 ENV CP MT EE\n5930000011 1.23 ENV CP MT EE\n5930000008 3.21 CE CP CHE ME\n5930000010 7.77 CE CP CHE ME\n5930000009 13.6 PE EE IE ME", "output": "5930000001 CP\n5930000002 CE\n5930000003 CP\n5930000004 ENV\n5930000005 IE\n5930000006 MT\n5930000007 MT\n5930000008 CHE\n5930000009 PE\n5930000010 CE\n5930000011 ENV\n5930000012 IE\n5930000013 CE\n5930000014 ME\n5930000015 ME" },
        { "input": "10\nCHE 2\nME 2\nCP 2\nEE 2\nIE 2\nENV 2\nSV 2\nMT 2\nPE 2\nCE 3\n15\n5930000001 7.59 MT ENV CHE IE\n5930000003 15.8 PE IE ME CE\n5930000013 4.00 SV EE IE CE\n5930000002 16.2 CP ME IE PE\n5930000014 0.12 ME PE CP EE\n5930000015 8.97 MT IE EE PE\n5930000012 8.98 CP PE ME CE\n5930000005 8.89 CP PE ME CE\n5930000006 2.55 SV ENV EE CE\n5930000007 5.22 ME MT IE CP\n5930000004 10.0 CP IE SV CHE\n5930000011 1.23 ENV SV CP CE\n5930000008 3.21 CP MT SV ENV\n5930000010 7.77 PE MT ME EE\n5930000009 13.6 ME IE EE ENV", "output": "5930000001 ENV\n5930000002 CP\n5930000003 PE\n5930000004 CP\n5930000005 ME\n5930000006 ENV\n5930000007 IE\n5930000008 SV\n5930000009 ME\n5930000010 MT\n5930000011 CE\n5930000012 PE\n5930000013 SV\n5930000014 EE\n5930000015 MT" },
        { "input": "4\nME 3\nPE 1\nCE 2\nIE 1\n4\n5930000021 4 PE CE IE ME\n5930000022 2 PE CE IE ME\n5930000023 1 PE CE IE ME\n5930000024 3 PE CE IE ME", "output": "5930000021 PE\n5930000022 CE\n5930000023 IE\n5930000024 CE" },
        { "input": "4\nME 1\nPE 1\nCE 1\nIE 1\n4\n5930000021 3.0 ME PE CE IE\n5930000023 4.0 PE CE IE ME\n5930000024 1.0 CE IE ME PE\n5930000022 2.0 IE ME PE CE", "output": "5930000021 ME\n5930000022 IE\n5930000023 PE\n5930000024 CE" },
      ]
    },
    {
      "id": 25,
      "title": "Map : Sky train",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1BQk_bAtU5PTxPFy6oI5sd-7rp9g-gC-w/view?usp=sharing",
      "testCases": [
        {"input": "Siam", "output": "Siam"},
        {"input": "Siam ChitLom\nChitLom PhloenChit\nPhloenChit Nana\nSiam NationalStadium\nRatchadamri Siam\nSiam PhayaThai\nRatchadamri SalaDaeng\nThongLo Ekkamai\nEkkamai ThongLo\nNana", "output": "ChitLom\nNana\nPhloenChit"},
        {"input": "Siam ChitLom\nChitLom PhloenChit\nPhloenChit Nana\nSiam NationalStadium\nRatchadamri Siam\nSiam PhayaThai\nRatchadamri SalaDaeng\nThongLo Ekkamai\nEkkamai ThongLo\nNationalStadium", "output": "ChitLom\nNationalStadium\nPhayaThai\nRatchadamri\nSiam"},
        {"input": "Siam ChitLom\nChitLom PhloenChit\nPhloenChit Nana\nSiam NationalStadium\nRatchadamri Siam\nSiam PhayaThai\nRatchadamri SalaDaeng\nThongLo Ekkamai\nEkkamai ThongLo\nSalaDaeng", "output": "Ratchadamri\nSalaDaeng\nSiam"},
        {"input": "A B\nB C\nC A\nB A\nC B\nA C\nD E\nA X\nB Y\nC Z\nA", "output": "A\nB\nC\nX\nY\nZ"},
        {"input": "A B\nB C\nC A\nB A\nC B\nA C\nD E\nA X\nB Y\nC Z\nZ", "output": "A\nB\nC\nZ"},
        {"input": "A B\nB C\nC A\nB A\nC B\nA C\nD E\nA X\nB Y\nC Z\nE", "output": "D\nE"},
        {"input": "A B\nB C\nC A\nB A\nC B\nA C\nD E\nA X\nB Y\nC Z\nK", "output": "K"},
        {"input": "1 2\n2 3\n3 4\n4 5\n5 6\n6 7\n7 8\n8 9\n9 10\n5", "output": "3\n4\n5\n6\n7"},
      ]
    },

    {
      "id": 26,
      "title": "String : License Plate",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1VwupfgcGQdRCcwGixQXIUo29wtX83qlm/view?usp=sharing",
      "testCases": [
        {"input": "0AB-001\n9", "output": "0AB-010"},
        {"input": "2QB-098\n1", "output": "2QB-099"},
        {"input": "3EP-999\n2", "output": "3EQ-001"},
        {"input": "3KB-990\n10001", "output": "3KL-991"},
        {"input": "3KM-990\n26009", "output": "3LM-999"},
        {"input": "3DG-877\n200000", "output": "3KY-877"},
        {"input": "5LO-877\n234567", "output": "5UP-444"},
        {"input": "6UV-877\n1000000", "output": "8HH-877"},
        {"input": "3YW-877\n2000000", "output": "6XU-877"},
        {"input": "0AA-000\n6759777", "output": "9ZZ-777"},
      ]
    },

    {
      "id": 27,
      "title": "Recur_2",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1VwupfgcGQdRCcwGixQXIUo29wtX83qlm/view?usp=sharing",
      "testCases": [
        {"input": "H 0\nH 3\nH 10", "output": "H(0) = 0\nH(3) = 7\nH(10) = 1023"},
        {"input": "C 0\nC 1\nC 3\nC 5\nC 8", "output": "C(0) = 1\nC(1) = 1\nC(3) = 5\nC(5) = 42\nC(8) = 1430"},
        {"input": "F 0\nF 10\nF 20\nF 30\nF 40", "output": "F(0) = 1\nF(10) = 6\nF(20) = 13\nF(30) = 19\nF(40) = 25"},
        {"input": "M 0\nM 3\nM 13\nM 44\nM 78", "output": "M(0) = 0\nM(3) = 2\nM(13) = 8\nM(44) = 27\nM(78) = 48"},
      ]
    },
    {
      "id": 28,
      "title": "String Conan",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1VwupfgcGQdRCcwGixQXIUo29wtX83qlm/view?usp=sharing",
      "testCases": [
        {"input": "", "output": ""},
        {"input": "", "output": ""},
        {"input": "", "output": ""},
      ]
    },

    {
      "id": 30,
      "title": "Extra 1",
      "description": "Click link for details",
      "file": "https://drive.google.com/file/d/1Ta_i3Mf4R6LUndDbtJXqOvIm2KvXJQvH/view?usp=sharing",
      "testCases": [
        {"input": "3\ndog\ncat\ndog\n", "output": "3"},
        {"input": "4\na\nab\nabc\nabcd\n", "output": "10"},  
        {"input": "5\nxy\nx\ny\nx\nx\n", "output": "3"},  
        {"input": "1\nsingle\n", "output": "6"}, 
        {"input": "0\n", "output": "0"}
      ]
    },
    

];
// Get all problems
app.get('/api/problems', (req, res) => {
  console.log('Received request for all problems');
  res.json(problems);
});

// Get problem by ID
app.get('/api/problems/:id', (req, res) => {
  console.log(`Received request for problem ID: ${req.params.id}`);
  const problem = problems.find(p => p.id == req.params.id);
  if (problem) {
    res.json(problem);
  } else {
    console.error(`Problem ID: ${req.params.id} not found`);
    res.status(404).send('Problem not found');
  }
});

// Handle code submission and test cases
app.post('/api/submit', (req, res) => {
  const { code, problemId, username } = req.body;
  console.log(`Received submission for problem ID: ${problemId} by user: ${username}`);

  const problem = problems.find(p => p.id == problemId);
  if (!problem) {
    return res.status(404).send('Problem not found');
  }

  try {
    // Save the user's code to a file
    const filePath = path.join(__dirname, 'user_code.cpp');
    fs.writeFileSync(filePath, code);

    // Compile the user's C++ code
    exec(`g++ ${filePath} -o output`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Compilation Error: ${stderr}`);
        return res.json({ score: 0, results: Array(problem.testCases.length).fill('x') });
      }

      let passed = 0;
      const results = [];
      const totalTestCases = problem.testCases.length;

      problem.testCases.forEach((testCase, index) => {
        const inputFilePath = path.join(__dirname, `input${index}.txt`);
        const outputFilePath = path.join(__dirname, `output${index}.txt`);

        try {
          fs.writeFileSync(inputFilePath, testCase.input);
        } catch (err) {
          console.error(`Error writing input file: ${err}`);
        }

        exec(`./output < ${inputFilePath} > ${outputFilePath}`, { timeout: TIMEOUT_DURATION }, (runError, runStdout, runStderr) => {
          if (runError) {
            if (runError.killed) {
              console.warn(`Test case ${index + 1}: Timeout Error`);
              results[index] = 'T';  // Timeout
            } else {
              console.error(`Runtime Error: ${runStderr}`);
              results[index] = 'x';  // Compilation error
            }
          } else {
            try {
              const userOutput = fs.readFileSync(outputFilePath, 'utf8').trim();
              const expectedOutput = testCase.output.trim();

              if (userOutput === expectedOutput) {
                passed += 1;
                results[index] = 'P';  // Pass
              } else {
                results[index] = '-';  // Incorrect
              }
            } catch (err) {
              console.error(`Error reading output file: ${err}`);
              results[index] = '-';
            }
          }

          if (results.length === totalTestCases) {
            const score = (passed / totalTestCases) * 100;
            const submissionId = submissionCounter++;
            const statusString = `[${results.join('')}]`;
            submissions.push({
              submissionId,
              problemId,
              code,
              score,
              username,
              status: statusString,
              results,
              timestamp: new Date()
            });

            res.json({ score, results, status: statusString});
          }
        });
      });
    });
  } catch (err) {
    console.error(`Error during submission process: ${err}`);
    res.status(500).send(`Error processing submission: ${err}`);
  }
});

// Retrieve previous submissions by problem ID
app.get('/api/submissions/:problemId', (req, res) => {
  const problemId = parseInt(req.params.problemId);
  console.log(`Received request for submissions for problem ID: ${problemId}`);
  const problemSubmissions = submissions.filter(sub => sub.problemId === problemId);
  res.json(problemSubmissions);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});