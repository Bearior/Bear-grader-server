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
        { input: '60 82 91', output: '59 173 169' },
        { input: '17 12 24', output: '17 12 24' },
        { input: '40 -6 6', output: '40 -6 6' },
        { input: '-17 17 2', output: '629 18 4' },
        { input: '22 -15 19', output: '22 -15 19' },
        { input: '42 8 -3', output: '115 8 -2' },
        { input: '842 33 338', output: '1684 1688 12' },
        { input: '131 720 684', output: '815 717 1630' },
        { input: '163 757 491', output: '3785 1892 1899' },
        { input: '847 577 184', output: '423 1154 -731' },
        { input: '519 514 30', output: '259 1028 -769' },
    ]
  },
  {
    id: 4,
    title: 'Pretest2_Expression',
    description: 'Click link for details',
    file: 'https://drive.google.com/file/d/1aYvqAd1n3cZwZhyZwSDF43Jr66SQzBd0/view?usp=sharing',
    testCases: [
      { "input": "-1", "output": "2.9"},
      { "input": "-2", "output": "13.6"},
      { "input": "3", "output": "20.8" },
      { "input": "4", "output": "32.2" },
      { "input": "5", "output": "40.7" },
      { "input": "6", "output": "46.4" },
      { "input": "7", "output": "50.0" },
      { "input": "8", "output": "52.3" }
    ]
  },
  {
    id: 5,
    title: 'Pretest3_VendingMachine',
    description: 'Click link for details',
    file: 'https://drive.google.com/file/d/1KOa-R2oF3wtTsVMICq-kTpJJSS_Y6q8x/view?usp=sharing',
    testCases: [
      { "input": "17\nF18 Q12 U18 F19 K15 Y12 V13 R19 Y12 F19 Z17 M13 L18 G15", "output": "3740" },
      { "input": "17\nU17 Q13 P19 B11 L12 D16 R15 C11 W17 N13 E14", "output": "2686" },
      { "input": "106\nW2032 H2003 D2020 M2031 Q2003 K2020 X2058 V2076 U2034 O2079 M2074 V2042 T2071 Y2079 N2070 Q2023 M2071 J2018 Q2099 G2021 G2024 W2058 U2071 Y2060 M2051 E2003 P2001 F2080 W2074 V2013 W2025 E2083 O2017 Y2050 E2095 B2011 C2066 W2093 X2065 C2042 Z2052 F2041 I2000 T2027 T2087 S2025 P2017 U2042 T2074 Z2073 O2011 V2054 N2029 J2089 E2056 C2060 A2092 A2016 A2067 W2039 M2001 Z2016 T2071 S2071 H2045 K2040 S2053 N2050 N2063 E2033 B2027 T2031 K2016 G2015 G2001 L2061 F2024 S2036 L2015 M2016 F2073 H2020 B2069 J2027 K2028 P2084 F2049 S2046 Q2066 V2020", "output": "19506544" },
      { "input": "184\nC2058 R2044 M2018 I2025 Z2089 I2014 X2018 K2029 O2027 A2054 O2096 D2083 C2065 V2052 I2076 T2075 X2010 P2092 K2047 J2099 H2015 B2079 T2064 P2001 T2089 O2033 A2089 S2017 G2038 V2038 I2021 X2096 V2088 B2087 T2035 A2084 L2084 E2067 Z2015 B2076 H2025 R2031 B2098 K2039 Q2003 R2065 Z2007 M2065 V2054 O2050 H2032 K2041 O2077 N2000 J2065 P2022 P2017 C2048 K2029 Z2008 R2057 L2052 Q2021 R2096 D2030 G2055 T2012 Z2027 E2044 Z2098 E2056 I2003 X2014 L2066 H2021 J2052 S2019 Q2010 N2069 J2043 X2031 Y2016 H2071 V2070 U2091 P2033 K2077 Q2083 S2089 T2034 X2004", "output": "34298888" },
      { "input": "126\nM2022 W2090 S2013 T2027 Z2084 L2070 B2081 J2002 M2032 U2059 P2077 Q2010 R2050 F2041 G2020 L2012 J2056 W2052 O2014 O2018 S2001 V2021 V2001 Z2061 B2010 I2005 H2037 D2096 B2021 X2018 G2089 G2054 D2043 Z2050 H2015 G2094 F2058 U2092 M2014 O2060 O2068 Z2047 W2087 P2034 I2071 U2075 D2071 N2093 B2071 M2064 J2030 S2080 B2042 O2082 O2028 D2075 C2000 U2047 K2087 F2033 U2061 O2000 A2078 H2023 C2014 V2062 L2010 Z2018 A2055 P2055 P2034 L2021 T2026 J2059 P2014 N2079 S2000 F2085 I2084 W2015 U2067 E2007 U2028 C2063 B2090 N2078 H2061 U2040 M2000 I2007 M2051", "output": "23453640" },
      { "input": "148\nD760641871 N926562293 B614973471 M475725764 J461142630 S545688080 B912863342 O728248382 O655698828 D607863575 C489109000 U523005947 K453266087 F763952733 U622490261 O826554400 A518370778 H875373423 C871567014 V686261662 L707726610 Z740709218 A738775055 P769518555 P587606534 L814877321 T709921226 J753694459 P480316714 N838337879 S665914100 F718094285 I667918284 W761164915 U882063067 E625810707 U743320728 C927466363 B559242890 N517222278 H740245761 U812834840 M933646000 I784734507 M880166551 K656993431 Y569880739 M638507584 W494374108 G947991454 T751783028 N608592370 D665867947 U857424543 Y579306008 V717780552 U715768163 T944411019 D478195356 D558408487 Z729743899 S805794244 M674582466 L739665274 O864318909 J490621834 D868069684 Z573289549 M495747467 A747619589 V867097773 D830889295 A598637874 R644558231 K899983028", "output": "7799095659364" },
      { "input": "178\nV577446722 B921340605 R793638691 L629617774 M767469862 G876671283 Y539916419 H792194330 G558452375 A734101462 Z585046736 K488808308 U556086947 Y875188411 P876556000 E580361896 R894695645 V917514962 X811813754 L927694286 G458200010 K832578173 T885106635 I561284571 M452804821 R651098413 I905889957 A850258743 X844832768 H887900415 Q484519891 L684254369 E655024134 Y477195143 B514510906 U853425807 N625535203 F495927447 M461351949 C628767759 Y567778550 B820352186 S766959685 M526697922 J597229181 W862233251 U487635495 K752933454 I471446980 V580220830 T646566714 A629612136 F611122009 J574842919 X835869610 W781211609 N927532867 H798811266 B828444520 X809242577 M566197142 M666335881 H710910030 J641812436 M827343945 A530923233 M617963456 U504676517 B492708781 G864362805 W453574160 T666616201 K501953944 X805207555 C700057443", "output": "9138959815216" }
    ]
  },

  {
    id: 6,
    title: 'Pretest4_Thief',
    description: 'Click link for details',
    file: 'https://drive.google.com/file/d/1XSdlYFlNO0Tok86Bc4z86LZDVgCT1gZw/view?usp=sharing',
    testCases: [
      { "input": "10 383\n23 71 27 81 68 58 52 27 96 34", "output": "5 58\n8 96" },
      { "input": "10 424\n85 92 50 100 86 15 68 48 11 47", "output": "1 92\n4 86" },
      { "input": "10 459\n46 71 29 36 8 14 98 13 99 67", "output": "4 8\n5 14" },
      { "input": "10 437\n79 18 76 24 59 40 50 97 11 98", "output": "1 18\n7 97" },
      { "input": "10 418\n98 30 59 63 60 74 45 8 64 41", "output": "4 60\n8 64" },
      { "input": "31 6406\n44 333 111 35 305 318 85 244 9 209 171 237 288 254 278 162 48 26 367 375 119 313 104 226 358 246 160 377 441 15 437", "output": "3 35\n13 254" },
      { "input": "49 11674\n422 379 196 442 278 5 39 253 113 68 316 255 383 403 121 147 66 367 76 201 320 111 307 64 429 23 490 496 229 154 206 467 498 379 34 19 236 392 21 466 334 111 139 216 430 355 351 306 76", "output": "27 496\n35 19" },
      { "input": "43 9641\n39 33 180 255 351 243 149 308 34 151 412 339 439 324 116 112 158 424 344 174 423 309 83 36 141 379 479 460 220 191 164 147 493 268 386 9 394 257 222 68 316 91 201", "output": "17 424\n37 257" },
      { "input": "48 11924\n53 202 373 270 390 342 354 387 471 156 126 447 6 94 390 459 36 215 467 399 271 428 428 497 497 236 409 10 321 80 117 203 68 492 239 51 94 213 226 40 358 275 296 118 274 63 332 102", "output": "17 215\n25 236" },
      { "input": "31 6914\n24 250 393 202 5 448 101 105 354 402 404 332 316 146 290 286 77 150 199 275 163 413 36 383 163 160 499 252 311 303 22", "output": "10 404\n13 146" },
      { "input": "50 9758\n14 202 85 271 35 351 452 2 329 102 135 183 72 215 42 208 125 6 119 431 62 353 487 143 16 491 159 209 231 334 371 139 179 153 114 387 239 117 283 424 129 272 253 252 203 72 70 22 197 137", "output": "7 2\n37 117" },
      { "input": "50 12170\n197 265 154 215 392 360 186 132 204 435 473 148 476 431 197 236 414 389 269 291 407 413 454 447 171 328 167 27 276 417 31 142 63 368 119 96 284 9 233 263 14 467 315 211 300 120 93 181 451 142", "output": "15 236\n41 467" },
      { "input": "50 13055\n60 385 480 299 342 124 192 252 487 31 330 317 431 406 293 277 287 434 162 189 489 186 105 365 443 219 5 332 36 161 173 266 298 79 420 182 434 147 480 169 379 140 453 75 276 240 466 443 174 479", "output": "12 431\n13 406" },
      { "input": "50 11482\n119 174 201 444 155 64 378 151 341 4 455 188 307 400 279 496 457 146 359 70 229 29 370 465 435 151 83 110 31 176 184 27 84 307 312 421 308 27 304 205 412 337 337 354 161 264 31 108 326 400", "output": "20 229\n23 465" },
    ]
    
  },

  {
    id: 7,
    title: 'Pretest5_Magical_Subarray',
    description: 'Click link for details',
    file: 'https://drive.google.com/file/d/1AzqGpC6ewT_aogSFp5uvZlEOtrr4QDby/view?usp=sharing',
    testCases: [
      { "input": "12\n3 1 2 3 1 2 3 1 2 3 1 2", "output": "18" },
      { "input": "10\n2 2 2 2 2 2 2 2 2 2", "output": "0" },
      { "input": "7\n6 5 4 3 1 2 2", "output": "6" },
      { "input": "10\n1 1 1 1 1 1 1 1 1 1", "output": "10" },
      { "input": "20\n1 2 3 4 5 6 7 8 9 10 10 9 8 7 6 5 4 3 2 1", "output": "20" },
      { "input": "10\n-1 4 2 3 6 -3 4 1 2 8", "output": "2" },
      { "input": "100\n-1 -2 2 4 3 3 5 1 3 -2 5 1 3 2 4 4 5 5 -1 1 3 2 5 3 4 1 1 5 5 2 5 2 1 2 1 3 2 1 4 2 1 4 2 3 4 3 -2 -3 4 -2 4 3 4 2 2 2 4 -3 5 5 3 2 5 1 1 3 3 -4 4 1 1 5 3 3 1 4 2 2 2 3 3 2 2 1 2 3 -4 5 2 5 -5 2 1 2 3 3 3 5 2 4", "output": "38" },
      { "input": "100\n2 4 4 2 1 1 4 3 1 2 1 1 3 4 1 4 4 3 2 2 2 4 1 2 1 4 5 1 5 3 2 3 5 5 5 -4 5 5 5 1 1 2 4 4 2 4 -4 4 2 1 3 4 5 1 4 2 4 3 2 3 4 3 -3 2 3 4 5 4 4 4 2 3 2 1 3 2 1 5 4 1 2 3 2 1 4 2 -2 1 1 4 1 1 2 2 5 4 2 5 1 3", "output": "51" },
      { "input": "100\n-2 5 2 4 -3 4 5 2 4 -3 4 3 4 2 1 4 5 4 4 4 5 2 3 2 5 1 5 1 5 3 -1 1 5 2 -3 -1 4 5 4 1 1 4 4 1 3 5 -2 -2 5 1 2 1 1 2 -2 5 1 1 1 3 5 5 5 4 1 3 3 3 1 4 2 3 5 -4 2 1 5 4 3 2 4 3 4 5 5 3 3 3 4 3 2 3 2 5 1 3 1 3 2 2", "output": "30" },
      { "input": "100\n2 1 -1 5 1 4 4 3 1 1 4 1 5 3 4 2 1 4 4 4 4 3 5 4 5 -1 3 5 3 1 3 3 2 1 4 5 1 3 1 5 3 4 2 4 -4 1 2 1 4 1 1 2 5 4 5 4 4 4 4 5 3 2 2 1 4 3 4 -2 4 3 2 5 -2 1 2 1 1 1 3 1 1 2 4 5 2 5 1 1 1 3 2 4 2 4 5 2 4 1 5 1", "output": "46" },
      { "input": "200\n2 -1 -5 -6 3 2 -1 1 2 5 3 5 2 -2 -5 3 8 -9 -7 3 -8 -5 -3 -1 8 -2 -9 -10 -8 9 8 3 -5 -8 7 9 5 -5 6 7 14 4 13 3 2 5 8 9 15 11 6 8 7 10 14 4 13 12 16 3 17 5 18 2 1 7 1 6 10 6 14 10 11 12 15 13 9 16 6 8 18 4 17 7 14 10 4 18 13 2 5 6 3 12 1 16 8 11 9 15 5 20 3 10 12 9 5 6 8 7 16 13 2 1 18 11 4 19 17 14 15 5 10 4 6 8 3 -4 8 -3 1 2 0 0 -7 -4 7 1 4 -3 -10 6 -8 -5 -2 0 -7 -7 -1 -7 -2 -8 3 4 -2 3 -2 -4 7 -7 2 -5 5 -9 5 8 -5 1 -3 7 6 -3 0 8 2 8 -3 3 10 4 7 -3 6 4 1 8 10 3 1 9 5 4 7 2 6 9 -10 -9 -3 -3", "output": "19" },
      { "input": "200\n4 0 -9 -4 6 10 -1 8 -7 -7 9 -9 4 -5 5 2 2 -2 1 -5 -1 -6 -4 -4 -10 3 9 2 10 2 0 3 -9 -1 9 5 -2 -4 1 15 3 8 10 4 12 7 13 6 16 2 1 5 2 9 7 6 4 1 3 8 5 11 10 1 5 12 8 14 7 10 2 15 7 17 8 14 10 16 1 2 13 9 6 7 3 10 14 13 18 17 1 2 9 10 8 15 7 1 4 6 3 7 9 16 4 1 17 2 11 6 18 8 5 2 7 3 8 7 -5 -10 2 10 8 -2 4 1 5 9 3 6 2 9 7 3 11 4 6 13 10 12 15 17 18 2 1 4 7 9 1 14 12 15 16 5 17 10 16 5 4 18 14 17 6 8 10 5 6 11 4 14 7 12 3 15 13 18 11 17 2 5 3 7 18 1", "output": "14" }
    ]    
  },

  {
    "id": 8,
    "title": "OldMidterm1_Flowchart",
    "description": "Click link for details *** testcases of Oldmidterm are GPT Generated, might not be entirely accurate ****",
    "file": "https://drive.google.com/file/d/1oHQu6MDpjvIsMA9ybVFvDbc7cPHJaToW/view?usp=sharing",
    "testCases": [
      { "input": "15\n3\n18", "output": "2229 7 15" },
      { "input": "19\n10\n18", "output": "1675 12 17" },
      { "input": "16\n1\n9", "output": "479 4 5" },
      { "input": "120\n450\n317", "output": "240 690 1007" },
      { "input": "389\n105\n158", "output": "153 48 144" },
      { "input": "22\n7\n8", "output": "135 7 7" },
      { "input": "45\n20\n35", "output": "17901 26 30" },
      { "input": "30\n15\n10", "output": "30 15 10" },
      { "input": "55\n23\n12", "output": "55 23 12" },
    ]
  },

  {
    "id": 9,
    "title": "OldMidterm2_Expression_Projectile",
    "description": "Click link for details *** testcases of Oldmidterm are GPT Generated, might not be entirely accurate ****",
    "file": "https://drive.google.com/file/d/1Kox5NnazTaTFpvc1Ioq92LpPNYbXkzPy/view?usp=sharing",
    "testCases": [
      { "input": "10 0 10", "output": "500 100" },
      { "input": "10 45 10", "output": "431.8 70.7" }
    ]
  },

  {
    "id": 10,
    "title": "OldMidterm3_GPA_Calculator ",
    "description": "Click link for details *** testcases of Oldmidterm are GPT Generated, might not be entirely accurate ****",
    "file": "https://drive.google.com/file/d/1qHXR9c59TUPcOLeGqf3WjNmtW3UEpfut/view?usp=sharing",
    "testCases": [
     { "input": "3\nC 4\nA 1\nB+ 3", "output": "2.81" },
    { "input": "3\nA 1\nA 2\nA 3", "output": "4" }
    ]
  },

  {
    "id": 11,
    "title": "OldMidterm4_RLE_Prime",
    "description": "Click link for details *** testcases of Oldmidterm are GPT Generated, might not be entirely accurate ****",
    "file": "https://drive.google.com/file/d/1vFUu_aItYJ6lqJe7_cvk98JSXCUg3u4E/view?usp=sharing",
    "testCases": [
      { "input": "2\n1 1 3 1\n3 1 1 1", "output": "YES\nYES" },
      { "input": "4\n1 2 3 1\n3 1 1 2\n3 2 2 1\n1 16 9 1", "output": "YES\nYES\nNO\nYES" },
      { "input": "1\n7 1 3 3", "output": "YES" },
      { "input": "3\n5 1 7 1\n2 2 3 1\n4 1 5 1", "output": "YES\nYES\nYES" },
      { "input": "5\n3 2 5 2\n7 1 9 1\n2 1 3 1\n4 1 7 1\n8 1 9 1", "output": "YES\nNO\nYES\nYES\nNO" },
    ]
  },

  {
    "id": 12,
    "title": "OldMidterm5_Max_Overlap",
    "description": "Click link for details *** testcases of Oldmidterm are GPT Generated, might not be entirely accurate ****",
    "file": "https://drive.google.com/file/d/1gYpOd4zfp5LP3d6ZgSRuEmAPJ06iZrdj/view?usp=sharing",
    "testCases": [
      { "input": "2\n1 3\n4 5", "output": "1" },
      { "input": "3\n1 2\n2 3\n3 5", "output": "1" },
      { "input": "5\n1 5\n1 4\n3 4\n4 6\n5 7", "output": "3" },
      { "input": "3\n1 4\n1 4\n1 4", "output": "3" },
      { "input": "1\n10 20", "output": "1" },
    ]
  }
  
  

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
            submissions.push({
              submissionId,
              problemId,
              code,
              score,
              username,
              results,
              timestamp: new Date()
            });

            res.json({ score, results });
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